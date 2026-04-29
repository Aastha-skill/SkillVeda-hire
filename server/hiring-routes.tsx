import {
  hiringCompanies,
  unlockedContacts,
  hiringCreditTransactions,
  hiringSavedCandidates,
  hiringSearchHistory,
  hiringEmailSettings,
  hiringEmailLogs,
} from "../shared/schema";
import type { Express } from "express";
import { db } from "./db";
import { eq, and, gt, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createHash } from "crypto";
import { parseRequirement } from "./lib/parse-requirement";
import { buildPdlRequest, type SearchFilterState } from "./lib/pdl-query-builder";

const HIRING_JWT_SECRET =
  process.env.JWT_SECRET || "skilveda-hire-secret-2024";

const PDL_API_KEY = process.env.PDL_API_KEY || "";
const PDL_BASE = process.env.PDL_SANDBOX === "true"
  ? "https://sandbox.api.peopledatalabs.com"
  : "https://api.peopledatalabs.com";

// Cache lifetime — 7 days from search time.
const CACHE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

// New companies get 5 free searches. Each fresh PDL search burns 1.
// Cache hits are free.
const SIGNUP_FREE_SEARCHES = 2;

// ─── Middleware ───────────────────────────────────────────────
export function authenticateCompany(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, HIRING_JWT_SECRET) as {
      companyId: number;
      email: string;
    };
    req.companyId = decoded.companyId;
    req.companyEmail = decoded.email;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── Helper: build company response object ────────────────────
function companyResponse(company: any) {
  return {
    id: company.id,
    companyName: company.companyName,
    email: company.email,
    contactName: company.contactName,
    credits: company.credits,
    plan: "free",
    profilePhoto: company.profilePhoto || null,
  };
}

// ─── Helper: call PDL person search ───────────────────────────
async function pdlPersonSearch(body: any): Promise<any> {
  const res = await fetch(`${PDL_BASE}/v5/person/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": PDL_API_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok && res.status !== 404) {
    console.error("[PDL] Error:", res.status, data);
    const err: any = new Error(`PDL API error: ${res.status}`);
    err.pdlStatus = res.status;
    err.pdlBody = data;
    throw err;
  }
  return data;
}

// ─── Filter normalization for cache hash ──────────────────────
function normalizeFilterValue(v: any): any {
  if (v == null || v === "") return undefined;
  if (Array.isArray(v)) {
    const cleaned = v
      .filter((x) => x != null && x !== "")
      .map((x) => typeof x === "string" ? x.toLowerCase().trim() : x);
    if (cleaned.length === 0) return undefined;
    return cleaned.slice().sort();
  }
  if (typeof v === "string") return v.toLowerCase().trim();
  return v;
}

function hashFilters(filters: SearchFilterState): string {
  const normalized: Record<string, any> = {};
  const keys = Object.keys(filters).sort();
  for (const k of keys) {
    if (k === "size" || k === "searchTitle") continue;
    const v = normalizeFilterValue((filters as any)[k]);
    if (v !== undefined) normalized[k] = v;
  }
  // v8.2: include query version in hash so caches invalidate when
  // query logic changes. Bumped from implicit v6 → v8.2.0.
  const stable = JSON.stringify({ ...normalized, _qv: "v8.2.0" });
  return createHash("sha1").update(stable).digest("hex");
}

// ─── Auto-generated search titles ────────────────────────────
// Build a short, readable title from the active filters so saved searches
// show what they actually contain (e.g., "Bangalore CSM 3-5y SaaS").
// Falls back to a date-based title when filters are sparse.
function generateSearchTitle(f: SearchFilterState): string {
  const parts: string[] = [];

  // 1. Location prefix: city names or "Remote" or "All India"
  const wa = (f as any).workArrangement;
  const cities = Array.isArray(f.locationTags) ? f.locationTags.filter(Boolean) : [];
  if (wa === "remote") {
    parts.push("Remote");
  } else if (cities.length === 1) {
    parts.push(toTitleCase(String(cities[0])));
  } else if (cities.length === 2) {
    parts.push(`${toTitleCase(String(cities[0]))}/${toTitleCase(String(cities[1]))}`);
  } else if (cities.length >= 3) {
    parts.push(`${toTitleCase(String(cities[0]))} +${cities.length - 1}`);
  }

  // 2. Role — abbreviate common ones
  const roleAbbrevs: Record<string, string> = {
    "customer success":     "CSM",
    "customer support":     "Support",
    "customer service":     "CS Rep",
    "customer experience":  "CX",
    "customer engagement":  "CE",
    "customer retention":   "Retention",
    "implementation":       "Implementation",
    "onboarding":           "Onboarding",
    "renewals":             "Renewals",
    "account management":   "AM",
    "client services":      "Client Svc",
    "partner success":      "Partner Success",
    "inside sales":         "SDR",
    "customer operations":  "CS Ops",
  };
  if (f.titleRole) {
    const lcRole = String(f.titleRole).toLowerCase().trim();
    parts.push(roleAbbrevs[lcRole] || toTitleCase(f.titleRole));
  }

  // 3. Experience — "3-5y", "5+y", or "<3y"
  const minE = typeof f.minExp === "number" ? f.minExp : (f.minExp ? Number(f.minExp) : null);
  const maxE = typeof f.maxExp === "number" ? f.maxExp : (f.maxExp ? Number(f.maxExp) : null);
  if (minE != null && maxE != null) parts.push(`${minE}-${maxE}y`);
  else if (minE != null) parts.push(`${minE}+y`);
  else if (maxE != null) parts.push(`<${maxE}y`);

  // 4. Industry — only if 1 or 2 (otherwise too long)
  const industries = Array.isArray(f.industries) ? f.industries.filter(Boolean) : [];
  if (industries.length === 1) {
    parts.push(toTitleCase(String(industries[0])));
  } else if (industries.length === 2) {
    parts.push(`${toTitleCase(String(industries[0]))}/${toTitleCase(String(industries[1]))}`);
  }

  if (parts.length === 0) {
    return `Search ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  }
  return parts.join(" ").substring(0, 60);
}

function toTitleCase(s: string): string {
  return String(s)
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((w) => w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace(/\bSaas\b/g, "SaaS")
    .replace(/\bIt\b/g, "IT");
}

// ═══════════════════════════════════════════════════════════════════
// PDL → Candidate mapping (unchanged)
// ═══════════════════════════════════════════════════════════════════

const CS_SUB_ROLES = new Set([
  "customer_success",
  "customer_support",
  "account_management",
  "implementation",
]);

const CS_TITLE_KEYWORDS = [
  "customer success", "client success", "csm",
  "customer support", "customer service", "customer experience",
  "account manager", "implementation", "onboarding", "renewal",
];

const LEVEL_RANK: Record<string, number> = {
  training: 0, unpaid: 0, entry: 1, senior: 2, manager: 3,
  director: 4, vp: 5, cxo: 6, owner: 6, partner: 6,
};

function parseDate(d: string | null | undefined): Date | null {
  if (!d) return null;
  const parts = String(d).split("-");
  if (parts.length === 1) return new Date(`${parts[0]}-01-01`);
  if (parts.length === 2) return new Date(`${parts[0]}-${parts[1]}-01`);
  return new Date(d);
}

function monthsBetween(start: Date | null, end: Date | null): number {
  if (!start) return 0;
  const e = end || new Date();
  return Math.max(0, Math.round((e.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
}

function isCSExperience(exp: any): boolean {
  if (exp?.title?.sub_role && CS_SUB_ROLES.has(exp.title.sub_role)) return true;
  const t = String(exp?.title?.name || "").toLowerCase();
  return CS_TITLE_KEYWORDS.some(k => t.includes(k));
}

function computeMetrics(p: any) {
  const experiences = Array.isArray(p.experience) ? p.experience : [];

  const sorted = [...experiences].sort((a: any, b: any) => {
    const da = parseDate(a.start_date)?.getTime() || 0;
    const db = parseDate(b.start_date)?.getTime() || 0;
    return db - da;
  });

  const currentJob = sorted.find((e: any) => !e.end_date || e.is_primary);
  const currentTenureMonths = currentJob
    ? monthsBetween(parseDate(currentJob.start_date), parseDate(currentJob.end_date))
    : null;

  const tenures: number[] = experiences
    .map((e: any) => monthsBetween(parseDate(e.start_date), parseDate(e.end_date)))
    .filter((m: number) => m > 0);
  const averageTenureMonths = tenures.length > 0
    ? Math.round(tenures.reduce((a: number, b: number) => a + b, 0) / tenures.length)
    : null;
  const totalExperienceMonths = tenures.reduce((a: number, b: number) => a + b, 0);

  const csExperiences = experiences.filter(isCSExperience);
  const csTenureMonths = csExperiences.reduce(
    (acc: number, e: any) => acc + monthsBetween(parseDate(e.start_date), parseDate(e.end_date)),
    0
  );
  const csYears = Math.round(csTenureMonths / 12 * 10) / 10;

  const allLevels: string[] = experiences.flatMap((e: any) =>
    Array.isArray(e?.title?.levels) ? e.title.levels : []
  );
  const highestLevel = allLevels.length > 0
    ? allLevels.reduce((best, cur) => (LEVEL_RANK[cur] || 0) > (LEVEL_RANK[best] || 0) ? cur : best, allLevels[0])
    : null;
  const hasManagerialExperience = allLevels.some(l => ["manager", "director", "vp", "cxo"].includes(l));

  let trajectoryLevel: "ascending" | "lateral" | "descending" | "unclear" = "unclear";
  if (sorted.length >= 2) {
    const oldestLevels = sorted[sorted.length - 1]?.title?.levels || [];
    const newestLevels = sorted[0]?.title?.levels || [];
    const oldestRank = Math.max(0, ...oldestLevels.map((l: string) => LEVEL_RANK[l] || 0));
    const newestRank = Math.max(0, ...newestLevels.map((l: string) => LEVEL_RANK[l] || 0));
    if (newestRank > oldestRank) trajectoryLevel = "ascending";
    else if (newestRank === oldestRank) trajectoryLevel = "lateral";
    else trajectoryLevel = "descending";
  }

  return {
    currentTenureMonths,
    averageTenureMonths,
    totalExperienceMonths,
    csYears,
    csRoleCount: csExperiences.length,
    hasCSExperience: csExperiences.length > 0,
    isCurrentlyInCS: currentJob ? isCSExperience(currentJob) : false,
    jobChangeCount: experiences.length,
    hasShortStint: tenures.filter((m: number) => m < 12).length > 0,
    isJobHopper: tenures.filter((m: number) => m < 18).length >= 3,
    trajectoryLevel,
    hasManagerialExperience,
    highestLevel,
  };
}

function mapPdlToCandidate(p: any): any {
  const expYears = p.inferred_years_experience ?? 0;
  const tier = expYears >= 7 ? 1 : expYears >= 3 ? 2 : 3;
  const matchScore = tier === 1 ? "High" : tier === 2 ? "Medium" : "Low";

  const metrics = computeMetrics(p);

  const summary = [
    p.headline || "",
    p.job_title && p.job_company_name ? `Currently ${p.job_title} at ${p.job_company_name}.` : "",
    (p.summary || "").substring(0, 300),
  ].filter(Boolean).join(" ");

  const experienceTimeline = (Array.isArray(p.experience) ? p.experience : [])
    .map((e: any) => ({
      title:           e?.title?.name || "",
      titleRole:       e?.title?.role || null,
      titleSubRole:    e?.title?.sub_role || null,
      titleLevels:     Array.isArray(e?.title?.levels) ? e.title.levels : [],
      company:         e?.company?.name || "",
      companyId:       e?.company?.id || null,
      companySize:     e?.company?.size || null,
      companyIndustry: e?.company?.industry || null,
      companyType:     e?.company?.type || null,
      companyWebsite:  e?.company?.website || null,
      companyLocation: e?.company?.location?.name || null,
      companyLinkedin: e?.company?.linkedin_url ? `https://${e.company.linkedin_url}` : null,
      startDate:       e?.start_date || null,
      endDate:         e?.end_date || null,
      isPrimary:       Boolean(e?.is_primary),
      summary:         e?.summary || null,
      tenureMonths:    monthsBetween(parseDate(e?.start_date), parseDate(e?.end_date)),
      isCSRole:        isCSExperience(e),
    }))
    .sort((a: any, b: any) => {
      const da = parseDate(a.startDate)?.getTime() || 0;
      const db = parseDate(b.startDate)?.getTime() || 0;
      return db - da;
    });

  const educationHistory = (Array.isArray(p.education) ? p.education : []).map((ed: any) => ({
    school:         ed?.school?.name || "",
    schoolType:     ed?.school?.type || null,
    schoolLocation: ed?.school?.location?.name || null,
    schoolWebsite:  ed?.school?.website || null,
    degrees:        Array.isArray(ed?.degrees) ? ed.degrees : [],
    majors:         Array.isArray(ed?.majors) ? ed.majors : [],
    minors:         Array.isArray(ed?.minors) ? ed.minors : [],
    gpa:            ed?.gpa || null,
    startDate:      ed?.start_date || null,
    endDate:        ed?.end_date || null,
    summary:        ed?.summary || null,
  }));

  const certifications = (Array.isArray(p.certifications) ? p.certifications : []).map((c: any) => ({
    name:         c?.name || "",
    organization: c?.organization || null,
    startDate:    c?.start_date || null,
    endDate:      c?.end_date || null,
  }));

  return {
    id: p.id,
    pdlId: p.id,
    name: p.full_name || "Unknown",
    firstName: p.first_name || null,
    lastName: p.last_name || null,
    headline: p.headline || null,
    profilePhoto: "",
    linkedinUrl: p.linkedin_url ? `https://${p.linkedin_url}` : "",
    linkedinUsername: p.linkedin_username || null,
    githubUrl: p.github_url ? `https://${p.github_url}` : null,
    twitterUrl: p.twitter_url ? `https://${p.twitter_url}` : null,
    facebookUrl: p.facebook_url ? `https://${p.facebook_url}` : null,
    linkedinConnections: p.linkedin_connections ?? null,
    jobTitle: p.job_title || "",
    jobTitleRole: p.job_title_role || null,
    jobTitleSubRole: p.job_title_sub_role || null,
    jobTitleLevels: Array.isArray(p.job_title_levels) ? p.job_title_levels : [],
    jobStartDate: p.job_start_date || null,
    jobLastChanged: p.job_last_changed || null,
    jobLastVerified: p.job_last_verified || null,
    jobSummary: p.job_summary || null,
    employer: p.job_company_name || "",
    employerWebsite: p.job_company_website || null,
    employerIndustry: p.job_company_industry || "",
    employerSize: p.job_company_size || null,
    employerType: p.job_company_type || null,
    employerEmployeeCount: p.job_company_employee_count ?? null,
    employerLocation: p.job_company_location_name || null,
    employerFunding: p.job_company_total_funding_raised ?? null,
    employerRevenue: p.job_company_inferred_revenue || null,
    employerGrowthRate: p.job_company_12mo_employee_growth_rate ?? null,
    employerLinkedinUrl: p.job_company_linkedin_url ? `https://${p.job_company_linkedin_url}` : null,
    employerFounded: p.job_company_founded ?? null,
    location: p.location_name
      || p.location_locality
      || (p.location_region ? `${p.location_region}, India` : "India"),
    locationLocality: p.location_locality || null,
    locationRegion: p.location_region || null,
    locationCountry: p.location_country || null,
    experienceYears: String(expYears),
    inferredYearsExperience: expYears,
    experienceTimeline,
    education: educationHistory,
    certifications,
    skills: Array.isArray(p.skills) ? p.skills : [],
    languages: Array.isArray(p.languages) ? p.languages.map((l: any) => ({
      name: l?.name || "",
      proficiency: l?.proficiency || null,
    })) : [],
    metrics,
    summary: p.summary || null,
    aiSummary: summary,
    industry: p.job_company_industry || "",
    noticePeriod: "Unknown",
    estimatedSalary: p.inferred_salary || "Not disclosed",
    matchScore,
    aiScore: tier === 1 ? 85 : tier === 2 ? 65 : 45,
    tier,
    breakdown: {},
    strengths: [],
    gaps: [],
    hiringRecommendation: "Maybe",
    standoutSignal: "",
    dealBreakerTriggered: false,
    isPreviewOnly: true,
  };
}

// ─── Register all hiring routes ───────────────────────────────
export function registerHiringRoutes(app: Express) {

  // ── SIGNUP — gets 5 free searches ───────────────────────────
  app.post("/api/hiring/signup", async (req, res) => {
    try {
      const schema = z.object({
        companyName: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        contactName: z.string().min(2),
        phone: z.string().optional(),
      });
      const { companyName, email, password, contactName, phone } =
        schema.parse(req.body);

      const existing = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.email, email))
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({
          error: "A company with this email already exists",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const [company] = await db
        .insert(hiringCompanies)
        .values({
          companyName,
          email,
          passwordHash,
          contactName,
          phone,
          credits: SIGNUP_FREE_SEARCHES,
        })
        .returning();

      const token = jwt.sign(
        { companyId: company.id, email: company.email },
        HIRING_JWT_SECRET,
        { expiresIn: "30d" }
      );

      await db.insert(hiringCreditTransactions).values({
        companyId: company.id,
        transactionType: "signup_bonus",
        amount: SIGNUP_FREE_SEARCHES,
        description: `${SIGNUP_FREE_SEARCHES} free searches on signup`,
      });

      res.status(201).json({
        token,
        company: companyResponse(company),
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // ── LOGIN ───────────────────────────────────────────────────
  app.post("/api/hiring/login", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
      });
      const { email, password } = schema.parse(req.body);

      const [company] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.email, email))
        .limit(1);

      if (!company) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, company.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      await db
        .update(hiringCompanies)
        .set({ lastLoginAt: new Date() })
        .where(eq(hiringCompanies.id, company.id));

      const token = jwt.sign(
        { companyId: company.id, email: company.email },
        HIRING_JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({
        token,
        company: companyResponse(company),
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ── GET CURRENT COMPANY PROFILE ─────────────────────────────
  app.get("/api/hiring/me", authenticateCompany, async (req: any, res) => {
    try {
      const [company] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.id, req.companyId))
        .limit(1);

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json({
        ...companyResponse(company),
        phone: company.phone,
        createdAt: company.createdAt,
        lastLoginAt: company.lastLoginAt,
      });
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // ── UPDATE DISPLAY NAME ─────────────────────────────────────
  app.put("/api/hiring/me/name", authenticateCompany, async (req: any, res) => {
    try {
      const { contactName } = req.body;
      if (!contactName || !contactName.trim()) {
        return res.status(400).json({ error: "Name is required" });
      }

      await db
        .update(hiringCompanies)
        .set({ contactName: contactName.trim() })
        .where(eq(hiringCompanies.id, req.companyId));

      const [updated] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.id, req.companyId))
        .limit(1);

      res.json(companyResponse(updated));
    } catch (error) {
      console.error("Update name error:", error);
      res.status(500).json({ error: "Failed to update name" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // PARSE PARAGRAPH → STRUCTURED FILTERS
  // ═══════════════════════════════════════════════════════════════════
  app.post("/api/hiring/parse-requirement", authenticateCompany, async (req: any, res) => {
    try {
      const schema = z.object({
        paragraph: z.string().min(10).max(5000),
      });
      const { paragraph } = schema.parse(req.body);

      const result = await parseRequirement(paragraph);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Paragraph must be 10-5000 characters" });
      }
      console.error("Parse requirement error:", error);
      res.status(500).json({ error: error.message || "Parsing failed" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // SEARCH BY FILTERS — credit-gated, 7-day per-company cache
  //
  // v8.2 CHANGE: paragraph is now passed through to buildPdlRequest so
  // technical/engineering exclusions can be conditionally applied based
  // on what the user actually asked for. See pdl-query-builder.ts.
  // ═══════════════════════════════════════════════════════════════════
  app.post("/api/hiring/search-filters", authenticateCompany, async (req: any, res) => {
    try {
      if (!PDL_API_KEY) {
        return res.status(500).json({ error: "PDL_API_KEY not configured" });
      }

      const body = req.body || {};
      const {
        size = 20,
        searchTitle,
        forceRefresh = false,
        paragraph: rawParagraph,
        filters: explicitFilters,
        criteria: explicitCriteria,
        ...legacyTopLevel
      } = body;

      const filterState: SearchFilterState =
        explicitFilters && typeof explicitFilters === "object"
          ? (explicitFilters as SearchFilterState)
          : (legacyTopLevel as SearchFilterState);
      const criteriaState: any = explicitCriteria || null;
      const paragraphText: string | null =
        typeof rawParagraph === "string" && rawParagraph.trim().length > 0
          ? rawParagraph
          : null;

      const filterHash = hashFilters(filterState);

      console.log("[search-filters] filterHash:", filterHash, forceRefresh ? "(force refresh)" : "");

      // ── CACHE LOOKUP ──────────────────────────────────────
      if (!forceRefresh) {
        const now = new Date();
        const cached = await db
          .select()
          .from(hiringSearchHistory)
          .where(
            and(
              eq(hiringSearchHistory.companyId, req.companyId),
              eq(hiringSearchHistory.filterHash, filterHash),
              gt(hiringSearchHistory.cachedUntil, now)
            )
          )
          .orderBy(desc(hiringSearchHistory.createdAt))
          .limit(1);

        if (cached.length > 0 && cached[0].cachedCandidates) {
          const cachedRecord = cached[0];
          const cachedList = cachedRecord.cachedCandidates as any[];
          console.log(`[search-filters] CACHE HIT — searchId=${cachedRecord.id}, candidates=${cachedList.length}, no credit charged`);

          const [company] = await db
            .select()
            .from(hiringCompanies)
            .where(eq(hiringCompanies.id, req.companyId))
            .limit(1);

          return res.json({
            candidates: cachedList,
            total: cachedList.length,
            searchId: cachedRecord.id,
            searchTitle: cachedRecord.searchTitle,
            paragraph: cachedRecord.searchParagraph,
            filters: cachedRecord.searchFilters,
            criteria: cachedRecord.searchCriteria,
            cached: true,
            cachedAt: cachedRecord.createdAt,
            cachedUntil: cachedRecord.cachedUntil,
            creditsRemaining: company?.credits ?? 0,
            warnings: [],
          });
        }
      }

      // ── CREDIT GATE ───────────────────────────────────────
      const [company] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.id, req.companyId))
        .limit(1);

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      if ((company.credits ?? 0) <= 0) {
        console.log(`[search-filters] BLOCKED — companyId=${req.companyId} has 0 credits`);
        return res.status(402).json({
          error: "No search credits remaining. Please purchase more to continue searching.",
          creditsRemaining: 0,
        });
      }

      // ── CACHE MISS — call PDL ─────────────────────────────
      // v8.2: paragraph passed through so technical exclusions can be
      // dynamically dropped when user asks for technical/engineering roles.
      const { body: pdlBody, warnings, diagnostics } = buildPdlRequest(filterState, {
        size: 10,
        paragraph: paragraphText || undefined,
      });

      console.log(`[search-filters] CACHE MISS — calling PDL (${company.credits} credits before)`);
      console.log("[PDL DIAGNOSTICS]", JSON.stringify(diagnostics, null, 2));
      console.log("[PDL REQUEST filterState]", JSON.stringify(filterState, null, 2));
      console.log("[PDL REQUEST]", JSON.stringify(pdlBody, null, 2));

      const pdlResponse = await pdlPersonSearch(pdlBody);
      const total = pdlResponse.total ?? 0;
      const data = pdlResponse.data ?? [];

      console.log("[PDL FIRST 3 RESULTS]", (data).slice(0, 3).map((p: any) => ({
        name: p.full_name,
        inferred_years: p.inferred_years_experience,
        job_title: p.job_title,
        company: p.job_company_name,
        industry: p.job_company_industry,
      })));

      const candidates = data.map(mapPdlToCandidate);

      // ── ZERO-RESULT EARLY RETURN ──────────────────────────
      if (candidates.length === 0) {
        const [emptyRecord] = await db
          .insert(hiringSearchHistory)
          .values({
            companyId: req.companyId,
            searchTitle: searchTitle || generateSearchTitle(filterState),
            jobDescription: paragraphText || JSON.stringify(filterState),
            searchParagraph: paragraphText,
            searchFilters: filterState as any,
            searchCriteria: criteriaState,
            resultsCount: 0,
          })
          .returning();

        console.log(`[search-filters] ZERO RESULTS — searchId=${emptyRecord.id}, no credit charged, no cache saved`);

        return res.json({
          candidates: [],
          total: 0,
          searchId: emptyRecord.id,
          searchTitle: emptyRecord.searchTitle,
          paragraph: emptyRecord.searchParagraph,
          filters: emptyRecord.searchFilters,
          criteria: emptyRecord.searchCriteria,
          cached: false,
          cachedAt: emptyRecord.createdAt,
          cachedUntil: null,
          creditsRemaining: company.credits ?? 0,
          warnings: [
            ...warnings,
            "No candidates matched these filters. Try broadening location, experience, or skills. (No credit charged.)",
          ],
        });
      }

      // ── DEDUCT CREDIT ─────────────────────────────────────
      const newCredits = (company.credits ?? 0) - 1;
      await db
        .update(hiringCompanies)
        .set({ credits: newCredits })
        .where(eq(hiringCompanies.id, req.companyId));

      await db.insert(hiringCreditTransactions).values({
        companyId: req.companyId,
        transactionType: "search",
        amount: -1,
        description: `Search: ${searchTitle || filterState.titleRole || "candidates"}`,
      });

      // ── SAVE TO CACHE ─────────────────────────────────────
      const cachedUntil = new Date(Date.now() + CACHE_LIFETIME_MS);
      const [searchRecord] = await db
        .insert(hiringSearchHistory)
        .values({
          companyId: req.companyId,
          searchTitle: searchTitle || generateSearchTitle(filterState),
          jobDescription: paragraphText || JSON.stringify(filterState),
          searchParagraph: paragraphText,
          searchFilters: filterState as any,
          searchCriteria: criteriaState,
          resultsCount: data.length,
          filterHash,
          cachedCandidates: candidates,
          cachedUntil,
        })
        .returning();

      console.log(`[search-filters] DONE — searchId=${searchRecord.id}, candidates=${candidates.length}, credits=${newCredits}`);

      res.json({
        candidates,
        total,
        searchId: searchRecord.id,
        searchTitle: searchRecord.searchTitle,
        paragraph: searchRecord.searchParagraph,
        filters: searchRecord.searchFilters,
        criteria: searchRecord.searchCriteria,
        cached: false,
        cachedAt: searchRecord.createdAt,
        cachedUntil,
        creditsRemaining: newCredits,
        warnings,
      });
    } catch (error: any) {
      console.error("Filter search error:", error);
      if (error.pdlStatus === 402) {
        return res.status(402).json({
          error: "PDL search quota exhausted. Please update your PDL API key.",
          creditsRemaining: 0,
        });
      }
      res.status(500).json({ error: error.message || "Search failed" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // LOAD CACHED RESULTS BY SEARCH ID — always free
  // ═══════════════════════════════════════════════════════════════════
  app.get("/api/hiring/searches/:id/results", authenticateCompany, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ error: "Invalid search id" });
      }

      const [record] = await db
        .select()
        .from(hiringSearchHistory)
        .where(
          and(
            eq(hiringSearchHistory.id, id),
            eq(hiringSearchHistory.companyId, req.companyId)
          )
        )
        .limit(1);

      if (!record) {
        return res.status(404).json({ error: "Search not found" });
      }

      if (!record.cachedCandidates) {
        return res.status(404).json({
          error: "No cached results — please re-run this search",
          jobDescription: record.jobDescription,
          paragraph: record.searchParagraph,
          filters: record.searchFilters,
          criteria: record.searchCriteria,
        });
      }

      const candidates = record.cachedCandidates as any[];
      const isExpired = record.cachedUntil ? new Date(record.cachedUntil) < new Date() : true;

      let filters: any = record.searchFilters;
      if (!filters) {
        try {
          filters = JSON.parse(record.jobDescription || "{}");
        } catch {
          filters = {};
        }
      }

      res.json({
        candidates,
        total: candidates.length,
        searchId: record.id,
        searchTitle: record.searchTitle,
        jobDescription: record.jobDescription,
        paragraph: record.searchParagraph,
        filters,
        criteria: record.searchCriteria,
        cached: true,
        cachedAt: record.createdAt,
        cachedUntil: record.cachedUntil,
        isExpired,
      });
    } catch (error: any) {
      console.error("Load cached search error:", error);
      res.status(500).json({ error: "Failed to load search" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // COUNT MATCHING CANDIDATES (cheap PDL probe — does NOT cost a credit)
  // ═══════════════════════════════════════════════════════════════════
  app.post("/api/hiring/search-filters/count", authenticateCompany, async (req: any, res) => {
    try {
      if (!PDL_API_KEY) {
        return res.status(500).json({ error: "PDL_API_KEY not configured" });
      }

      // Count probe doesn't have a paragraph available so it falls back to
      // legacy behavior (all default exclusions apply). Safe default.
      const filters = req.body as SearchFilterState;
      const { body: pdlBody } = buildPdlRequest(filters, { size: 1 });
      const pdlResponse = await pdlPersonSearch(pdlBody);

      res.json({ total: pdlResponse.total ?? 0 });
    } catch (error: any) {
      console.error("Count error:", error);
      res.status(500).json({ error: "Count failed" });
    }
  });

  // ── SAVE / UNSAVE CANDIDATE (free — bookmark only) ──────────
  app.post("/api/hiring/save", authenticateCompany, async (req: any, res) => {
    try {
      const schema = z.object({
        candidateId: z.string(),
        candidateName: z.string().optional(),
        jobTitle: z.string().optional(),
        employer: z.string().optional(),
        matchScore: z.string().optional(),
        action: z.enum(["save", "unsave"]),
      });
      const body = schema.parse(req.body);

      if (body.action === "unsave") {
        await db
          .delete(hiringSavedCandidates)
          .where(
            and(
              eq(hiringSavedCandidates.companyId, req.companyId),
              eq(hiringSavedCandidates.candidateId, body.candidateId)
            )
          );
        return res.json({ saved: false });
      }

      const existing = await db
        .select()
        .from(hiringSavedCandidates)
        .where(
          and(
            eq(hiringSavedCandidates.companyId, req.companyId),
            eq(hiringSavedCandidates.candidateId, body.candidateId)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(hiringSavedCandidates).values({
          companyId: req.companyId,
          candidateId: body.candidateId,
          candidateName: body.candidateName,
          jobTitle: body.jobTitle,
          employer: body.employer,
          matchScore: body.matchScore,
        });
      }

      res.json({ saved: true });
    } catch (error: any) {
      console.error("Save error:", error);
      res.status(500).json({ error: "Save failed" });
    }
  });

  // ── REMOVE SAVED CANDIDATE ──────────────────────────────────
  app.delete("/api/hiring/saved/:candidateId", authenticateCompany, async (req: any, res) => {
    try {
      await db
        .delete(hiringSavedCandidates)
        .where(
          and(
            eq(hiringSavedCandidates.companyId, req.companyId),
            eq(hiringSavedCandidates.candidateId, req.params.candidateId)
          )
        );
      res.json({ success: true });
    } catch (error) {
      console.error("Remove error:", error);
      res.status(500).json({ error: "Remove failed" });
    }
  });

  // ── GET SAVED CANDIDATES ────────────────────────────────────
  app.get("/api/hiring/saved", authenticateCompany, async (req: any, res) => {
    try {
      const saved = await db
        .select()
        .from(hiringSavedCandidates)
        .where(eq(hiringSavedCandidates.companyId, req.companyId))
        .orderBy(hiringSavedCandidates.savedAt);
      res.json(saved);
    } catch (error) {
      console.error("Error fetching saved:", error);
      res.status(500).json({ error: "Failed to fetch saved candidates" });
    }
  });

  // ── GET CREDIT TRANSACTIONS ─────────────────────────────────
  app.get("/api/hiring/credits/history", authenticateCompany, async (req: any, res) => {
    try {
      const transactions = await db
        .select()
        .from(hiringCreditTransactions)
        .where(eq(hiringCreditTransactions.companyId, req.companyId))
        .orderBy(hiringCreditTransactions.createdAt);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching credit history:", error);
      res.status(500).json({ error: "Failed to fetch credit history" });
    }
  });

  // ── GET SEARCH HISTORY (with hasCachedResults flag) ─────────
  app.get("/api/hiring/searches", authenticateCompany, async (req: any, res) => {
    try {
      const rows = await db
        .select({
          id: hiringSearchHistory.id,
          companyId: hiringSearchHistory.companyId,
          searchTitle: hiringSearchHistory.searchTitle,
          jobDescription: hiringSearchHistory.jobDescription,
          searchParagraph: hiringSearchHistory.searchParagraph,
          resultsCount: hiringSearchHistory.resultsCount,
          createdAt: hiringSearchHistory.createdAt,
          cachedUntil: hiringSearchHistory.cachedUntil,
        })
        .from(hiringSearchHistory)
        .where(eq(hiringSearchHistory.companyId, req.companyId))
        .orderBy(hiringSearchHistory.createdAt);

      const now = new Date();
      const enriched = rows.map((r) => ({
        ...r,
        hasCachedResults: r.cachedUntil ? new Date(r.cachedUntil) > now : false,
      }));

      res.json(enriched);
    } catch (error) {
      console.error("Error fetching searches:", error);
      res.status(500).json({ error: "Failed to fetch search history" });
    }
  });

  // ════════════════════════════════════════════════════════════
  // UNLOCK / EMAIL ROUTES — REMOVED FROM ACTIVE USE
  // ════════════════════════════════════════════════════════════

  // ── GET EMAIL SETTINGS (kept for /hire/email-setup page) ────
  app.get("/api/hiring/email-settings", authenticateCompany, async (req: any, res) => {
    try {
      const [settings] = await db
        .select()
        .from(hiringEmailSettings)
        .where(eq(hiringEmailSettings.companyId, req.companyId))
        .limit(1);

      if (!settings) {
        const [company] = await db
          .select()
          .from(hiringCompanies)
          .where(eq(hiringCompanies.id, req.companyId))
          .limit(1);

        return res.json({
          senderEmail: company?.email || "",
          senderName: company?.companyName || "",
          reachout1Subject: "Interested in your profile",
          reachout1Body: "",
          reachout2Subject: "Following up",
          reachout2Body: "",
          reachout3Subject: "Last follow up",
          reachout3Body: "",
        });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error fetching email settings:", error);
      res.status(500).json({ error: "Failed to fetch email settings" });
    }
  });

  // ── FORGOT PASSWORD ─────────────────────────────────────────
  app.post("/api/hiring/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.json({ success: true });

      const [company] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.email, email.toLowerCase().trim()))
        .limit(1);

      if (!company) return res.json({ success: true });

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiry = new Date(Date.now() + 15 * 60 * 1000);

      await db
        .update(hiringCompanies)
        .set({ resetCode: code, resetCodeExpiry: expiry })
        .where(eq(hiringCompanies.id, company.id));

      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY || "",
        },
        body: JSON.stringify({
          sender: { name: "SkillVeda Hire", email: "Hello@skillveda.ai" },
          to: [{ email: company.email, name: company.contactName }],
          subject: "Reset your SkillVeda Hire password",
          textContent: `Your reset code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, ignore this email.`,
          htmlContent: `<p>Your reset code is: <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p>This code expires in 15 minutes.</p>`,
        }),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.json({ success: true });
    }
  });

  // ── RESET PASSWORD ──────────────────────────────────────────
  app.post("/api/hiring/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const [company] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.email, email.toLowerCase().trim()))
        .limit(1);

      if (!company || company.resetCode !== code) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }

      if (!company.resetCodeExpiry || new Date() > company.resetCodeExpiry) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await db
        .update(hiringCompanies)
        .set({ passwordHash, resetCode: null, resetCodeExpiry: null })
        .where(eq(hiringCompanies.id, company.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // ── GOOGLE OAUTH — TOKEN EXCHANGE (popup flow) ──────────────
  app.post("/api/hiring/auth/google-token", async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken) return res.status(400).json({ error: "Missing access token" });

      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userRes.ok) return res.status(401).json({ error: "Invalid Google token" });

      const userInfo = await userRes.json();
      if (!userInfo.email) return res.status(401).json({ error: "Could not get email" });

      let [company] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.email, userInfo.email))
        .limit(1);

      if (!company) {
        [company] = await db
          .insert(hiringCompanies)
          .values({
            companyName: userInfo.name || userInfo.email,
            contactName: userInfo.name || userInfo.email,
            email: userInfo.email,
            passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
            googleId: userInfo.sub,
            profilePhoto: userInfo.picture || null,
            credits: SIGNUP_FREE_SEARCHES,
          })
          .returning();

        await db.insert(hiringCreditTransactions).values({
          companyId: company.id,
          transactionType: "signup_bonus",
          amount: SIGNUP_FREE_SEARCHES,
          description: `${SIGNUP_FREE_SEARCHES} free searches on Google signup`,
        });
      } else {
        await db
          .update(hiringCompanies)
          .set({
            googleId: userInfo.sub,
            profilePhoto: userInfo.picture || company.profilePhoto,
            lastLoginAt: new Date(),
          })
          .where(eq(hiringCompanies.id, company.id));

        [company] = await db
          .select()
          .from(hiringCompanies)
          .where(eq(hiringCompanies.id, company.id))
          .limit(1);
      }

      const token = jwt.sign(
        { companyId: company.id, email: company.email },
        HIRING_JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({
        token,
        company: companyResponse(company),
      });
    } catch (error) {
      console.error("Google token exchange error:", error);
      res.status(500).json({ error: "Google authentication failed" });
    }
  });

  // ── GOOGLE OAUTH — REDIRECT FLOW ────────────────────────────
  app.get("/api/hiring/auth/google", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
      `${req.protocol}://${req.get("host")}/api/hiring/auth/google/callback`;
    if (!clientId) return res.status(500).json({ error: "Google OAuth not configured" });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "email profile",
      access_type: "offline",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  app.get("/api/hiring/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) return res.redirect("/hire/login?error=google_failed");

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
        `${req.protocol}://${req.get("host")}/api/hiring/auth/google/callback`;

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: String(code),
          client_id: clientId || "",
          client_secret: clientSecret || "",
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return res.redirect("/hire/login?error=google_failed");

      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo = await userRes.json();
      if (!userInfo.email) return res.redirect("/hire/login?error=google_failed");

      let [company] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.email, userInfo.email))
        .limit(1);

      if (!company) {
        [company] = await db
          .insert(hiringCompanies)
          .values({
            companyName: userInfo.name || userInfo.email,
            contactName: userInfo.name || userInfo.email,
            email: userInfo.email,
            passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
            googleId: userInfo.id,
            profilePhoto: userInfo.picture || null,
            credits: SIGNUP_FREE_SEARCHES,
          })
          .returning();

        await db.insert(hiringCreditTransactions).values({
          companyId: company.id,
          transactionType: "signup_bonus",
          amount: SIGNUP_FREE_SEARCHES,
          description: `${SIGNUP_FREE_SEARCHES} free searches on Google signup`,
        });
      } else {
        await db
          .update(hiringCompanies)
          .set({
            googleId: userInfo.id,
            profilePhoto: userInfo.picture || company.profilePhoto,
            lastLoginAt: new Date(),
          })
          .where(eq(hiringCompanies.id, company.id));

        [company] = await db
          .select()
          .from(hiringCompanies)
          .where(eq(hiringCompanies.id, company.id))
          .limit(1);
      }

      const token = jwt.sign(
        { companyId: company.id, email: company.email },
        HIRING_JWT_SECRET,
        { expiresIn: "30d" }
      );

      const companyJson = encodeURIComponent(
        JSON.stringify(companyResponse(company))
      );

      res.redirect(`/hire/dashboard?token=${token}&company=${companyJson}`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect("/hire/login?error=google_failed");
    }
  });

  // ── ADMIN — LIST COMPANIES ───────────────────────────────────
  app.get("/api/hiring/admin/companies", async (req, res) => {
    try {
      const key = req.headers["x-admin-key"];
      const expected = process.env.ADMIN_SECRET || "skillveda-admin-2024";
      if (key !== expected) return res.status(401).json({ error: "Unauthorized" });

      const rows = await db
        .select({
          id: hiringCompanies.id,
          companyName: hiringCompanies.companyName,
          contactName: hiringCompanies.contactName,
          email: hiringCompanies.email,
          credits: hiringCompanies.credits,
          isActive: hiringCompanies.isActive,
          createdAt: hiringCompanies.createdAt,
          lastLoginAt: hiringCompanies.lastLoginAt,
        })
        .from(hiringCompanies)
        .orderBy(hiringCompanies.createdAt);

      res.json(rows);
    } catch (error) {
      console.error("Admin companies error:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // ── ADMIN — UPDATE CREDITS ───────────────────────────────────
  app.post("/api/hiring/admin/credits", async (req, res) => {
    try {
      const key = req.headers["x-admin-key"];
      const expected = process.env.ADMIN_SECRET || "skillveda-admin-2024";
      if (key !== expected) return res.status(401).json({ error: "Unauthorized" });

      const { companyId, amount, action } = req.body;
      if (!companyId || amount == null || !action) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const [company] = await db
        .select()
        .from(hiringCompanies)
        .where(eq(hiringCompanies.id, companyId))
        .limit(1);

      if (!company) return res.status(404).json({ error: "Company not found" });

      let newCredits = company.credits ?? 0;
      if (action === "add") newCredits = newCredits + amount;
      else if (action === "subtract") newCredits = Math.max(0, newCredits - amount);
      else if (action === "set") newCredits = amount;

      await db
        .update(hiringCompanies)
        .set({ credits: newCredits })
        .where(eq(hiringCompanies.id, companyId));

      await db.insert(hiringCreditTransactions).values({
        companyId,
        transactionType: "admin_adjustment",
        amount: newCredits - (company.credits ?? 0),
        description: `Admin ${action}: ${amount} credits`,
      });

      res.json({ success: true, newCredits });
    } catch (error) {
      console.error("Admin credits error:", error);
      res.status(500).json({ error: "Failed to update credits" });
    }
  });

  // ── ADMIN — DEACTIVATE COMPANY ───────────────────────────────
  app.patch("/api/admin/hiring-companies/:id/deactivate", async (req, res) => {
    try {
      const adminPassword = req.headers["admin-password"] || req.query.admin_key;
      const expectedPassword = process.env.ADMIN_PASSWORD || "skillveda2024";
      if (adminPassword !== expectedPassword) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await db
        .update(hiringCompanies)
        .set({ isActive: false })
        .where(eq(hiringCompanies.id, parseInt(req.params.id)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating company:", error);
      res.status(500).json({ error: "Failed to deactivate company" });
    }
  });
}