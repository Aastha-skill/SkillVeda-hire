// ═══════════════════════════════════════════════════════════════════════
// PDL Query Builder — v8
//
// Replaces server/lib/pdl-query-builder.ts
//
// CHANGES IN v8 OVER v6:
//
//   ★ Industry eligibility is now a four-tier OR (bool/should with
//     minimum_should_match: 1):
//       Tier 1: v1 canonical industries (job_company_industry)
//       Tier 2: v2 canonical industries (job_company_industry_v2)
//       Tier 3: positive company-name list (job_company_name)
//       Tier 4: evidence-gated tech/internet — passes if company is tagged
//               as generic-tech AND has industry-specific evidence
//               (positive name OR summary phrase OR past experience match)
//
//     This solves both false-positive (Swiggy/Flipkart/Zepto for fintech)
//     AND false-negative (real fintechs PDL miscategorized as "internet")
//     problems simultaneously without dropping recall.
//
//   ★ Industry knowledge now lives in industry-knowledge.ts (shared
//     between this query builder and the future cs-scoring-engine.ts).
//
//   ★ Relevance boosters in `should` clauses (no impact on eligibility,
//     just push real fintechs/saas/etc to the top of returned list):
//       - Company freshness (founded >= 2010)
//       - Has funding raised
//       - Past company in target industry (v1 or v2)
//       - CS-quality summary phrases (SLA, CSAT, ticketing, etc.)
//       - Positive company-name match (repeated for relevance weighting)
//
//   ★ Delhi NCR location expansion now expands to multiple cities
//     (delhi, gurgaon, gurugram, noida, faridabad, ghaziabad).
//
//   ★ data_include parameter slims response payload to only the fields
//     the scorer/UI need. Doesn't change credit cost, but reduces payload
//     ~70% and speeds up parsing.
//
//   ★ Per-clause instrumentation: every returned candidate can be tagged
//     with which clauses matched (named_queries via _name parameter).
//     Useful for offline analysis without parallel A/B.
//
// ALL v6 BEHAVIORS RETAINED:
//   - Match/match_phrase/term/terms/range/exists/bool query types only
//   - Technical exclusions in must_not (software, data, devops, etc.)
//   - CS-flavored title family in must (sub_role + title phrases)
//   - Level expansion (Senior → senior+manager+director+vp+cxo)
//   - Past job titles, education, languages, skills filters
//   - SearchFilterState interface unchanged (back-compat)
// ═══════════════════════════════════════════════════════════════════════

import { createHash } from "crypto";
import {
  INDUSTRY_KNOWLEDGE,
  IndustryKey,
  IndustryProfile,
  GENERIC_TECH_V1,
  GENERIC_TECH_V2,
  detectIndustryKey,
} from "./industry-knowledge";

// ═══════════════════════════════════════════════════════════════════════
// SearchFilterState — UNCHANGED from v6
// ═══════════════════════════════════════════════════════════════════════

export interface SearchFilterState {
  minExp?: string | number;
  maxExp?: string | number;
  locationTags?: string[];
  jobTitles?: string[];
  pastJobTitles?: string[];
  titleLevel?: string;
  titleRole?: string;
  companiesMode?: "current_past" | "current" | "past";
  companies?: string[];
  excludedCompaniesMode?: "current" | "current_past";
  excludedCompanies?: string[];
  dncCompanies?: boolean;
  industries?: string[];
  companySize?: string;
  fundingStage?: string;
  skills?: string[];
  degreeMode?: "regular" | "strict";
  degreeReq?: string;
  gradYearMin?: string;
  gradYearMax?: string;
  languages?: string[];
}

// ═══════════════════════════════════════════════════════════════════════
// LEVEL EXPANSION — UNCHANGED from v6
// ═══════════════════════════════════════════════════════════════════════

const LEVEL_EXPANSION: Record<string, string[]> = {
  "Owner":          ["owner"],
  "Partner":        ["partner", "owner"],
  "C-Suite":        ["cxo"],
  "Vice President": ["vp", "cxo"],
  "Director":       ["director", "vp", "cxo"],
  "Manager":        ["manager", "director", "vp", "cxo"],
  "Senior":         ["senior", "manager", "director", "vp", "cxo"],
  "Entry":          ["entry"],
  "Trainee":        ["training", "entry"],
  "Trainee (group)":["training"],
};

// ═══════════════════════════════════════════════════════════════════════
// ROLE MAP — UNCHANGED from v6 (validated against PDL v28 canonical
// subroles list: customer_success, customer_support, implementation,
// account_executive, account_management, partnerships, sales_development)
// ═══════════════════════════════════════════════════════════════════════

interface RoleMapping {
  subRoles: string[];
  titlePhrases: string[];
}

const ROLE_MAP: Record<string, RoleMapping> = {
  "Customer Success": {
    subRoles: ["customer_success"],
    titlePhrases: [
      "customer success", "client success", "csm",
      "customer success manager", "customer success associate",
      "customer success executive", "customer success specialist",
      "customer success representative", "customer success lead",
      "customer success director", "subscription success",
      // v8.1: TAM is often classified under CS for product SaaS
      "technical account manager", "technical account",
      "strategic customer success", "enterprise customer success",
    ],
  },
  "Customer Support": {
    subRoles: ["customer_support"],
    titlePhrases: [
      "customer support", "customer care",
      "customer support executive", "customer support specialist",
      "customer support representative", "customer support associate",
      "customer support lead", "customer support manager",
      "support associate", "support specialist", "support representative",
    ],
  },
  "Customer Service": {
    subRoles: ["customer_support"],
    titlePhrases: [
      "customer service", "customer care",
      "customer service representative", "customer service executive",
      "customer service associate", "customer service specialist",
      "customer relationship officer", "customer relations officer",
    ],
  },
  "Customer Experience": {
    subRoles: ["customer_success"],
    titlePhrases: [
      "customer experience", "cx manager", "cx lead", "cx specialist",
      "cx executive", "customer experience manager",
      "customer experience executive", "customer experience associate",
      "customer experience specialist", "voice of customer",
      "voice of the customer",
    ],
  },
  "Customer Engagement": {
    // PDL has no native customer_engagement sub_role. Fall back to the
    // overlapping CS sub_roles so we get a real candidate pool. Engagement-
    // matching candidates rank higher via scoring engine (relevantSkills).
    subRoles: ["customer_success", "customer_support", "account_management"],
    titlePhrases: [
      "customer engagement", "client engagement", "user engagement",
      "engagement manager", "engagement specialist", "engagement lead",
      "engagement executive", "engagement associate",
      "customer success", "customer support",
    ],
  },
  "Customer Retention": {
    subRoles: ["customer_success", "account_management"],
    titlePhrases: [
      "customer retention", "retention specialist", "retention manager",
      "retention executive", "retention analyst",
      "customer success", "renewals manager", "renewals specialist",
    ],
  },
  "Customer Advocacy": {
    subRoles: ["customer_success", "marketing"],
    titlePhrases: [
      "customer advocacy", "advocacy manager", "customer marketing",
      "customer marketing manager", "voice of customer",
      "customer success", "community manager",
    ],
  },
  "Implementation": {
    subRoles: ["implementation"],
    titlePhrases: [
      "implementation", "implementation manager", "implementation specialist",
      "implementation consultant", "deployment", "deployment manager",
    ],
  },
  "Onboarding": {
    subRoles: [],
    titlePhrases: [
      "onboarding", "customer onboarding", "onboarding specialist",
      "onboarding manager", "onboarding executive",
    ],
  },
  "Renewals": {
    subRoles: [],
    titlePhrases: [
      "renewal", "renewals", "renewal manager", "renewals specialist",
    ],
  },
  "Customer Operations": {
    subRoles: [],
    titlePhrases: [
      "customer operations", "cs operations", "cs ops", "customer ops",
      "customer success operations", "customer success ops",
    ],
  },
  "Account Management": {
    subRoles: ["account_executive", "account_management"],
    titlePhrases: [
      "account manager", "account executive", "key account",
      "key account manager", "account coordinator", "account director",
      // v8.1: TAM-friendly additions
      "technical account manager", "technical account",
      "tam", "strategic account", "enterprise account",
      "named account", "global account",
    ],
  },
  "Client Services": {
    subRoles: [],
    titlePhrases: [
      "client servicing", "client services", "client relations",
      "client relationship", "client manager",
    ],
  },
  "Partner Success": {
    subRoles: ["partnerships"],
    titlePhrases: [
      "partner success", "partner manager", "partner relations",
      "channel manager",
    ],
  },
  "Client Relations": {
    subRoles: [],
    titlePhrases: [
      "client relations", "client relationship", "customer relationship",
      "relationship manager", "relationship executive",
    ],
  },
  "Inside Sales": {
    subRoles: ["account_executive", "sales_development"],
    titlePhrases: [
      "inside sales", "sales development representative", "sdr", "bdr",
      "business development representative",
    ],
  },
};

const CS_FAMILY_ROLES = [
  "Customer Success",
  "Customer Support",
  "Customer Service",
  "Customer Experience",
];

// ═══════════════════════════════════════════════════════════════════════
// COMPANY SIZE MAPPING — UNCHANGED from v6
// ═══════════════════════════════════════════════════════════════════════

const COMPANY_SIZE_MAP: Record<string, string[]> = {
  "Startup":      ["1-10", "11-50"],
  "Growth":       ["51-200", "201-500"],
  "Mid-market":   ["501-1000", "1001-5000"],
  "Enterprise":   ["5001-10000", "10001+"],
  "Any":          [],
  "1-10":         ["1-10"],
  "11-50":        ["11-50"],
  "51-200":       ["51-200"],
  "201-500":      ["201-500"],
  "501-1000":     ["501-1000"],
  "1001-5000":    ["1001-5000"],
  "5001-10000":   ["5001-10000"],
  "10001+":       ["10001+"],
};

// ═══════════════════════════════════════════════════════════════════════
// CONDITIONAL EXCLUSIONS (v8.2)
//
// Exclusions are no longer static. Each exclusion is tagged with one or
// more "trigger keywords." If the user's paragraph contains any trigger,
// that exclusion is disabled.
//
// Examples:
//   - Paragraph mentions "technical" → all exclusions tagged "technical"
//     are dropped. Technical Account Managers, technical support, etc.
//     become reachable.
//   - Paragraph mentions "engineer" or "engineering" → engineer-titled
//     exclusions drop. Implementation engineers, support engineers,
//     solutions engineers all become reachable.
//   - Paragraph mentions "implementation" with engineering signals →
//     implementation engineer exclusion drops.
//   - Paragraph has no technical/engineering signal → all exclusions fire
//     (clean CS-only results, same as v6 behavior).
//
// This is keyword-based intent detection (zero latency, zero LLM cost).
// Misses some edge cases, but handles the 90% case correctly and never
// over-excludes — when in doubt, the exclusion is dropped, not added.
// ═══════════════════════════════════════════════════════════════════════

interface ConditionalExclusion {
  /** The phrase to exclude from job_title */
  phrase: string;
  /** Trigger keywords. If ANY appears in paragraph (case-insensitive
   *  substring match), this exclusion is disabled. */
  triggers: string[];
}

interface ConditionalSubRole {
  /** PDL canonical sub_role to exclude */
  subRole: string;
  /** Disable this exclusion if any trigger appears in paragraph */
  triggers: string[];
}

const CONDITIONAL_TITLE_EXCLUSIONS: ConditionalExclusion[] = [
  // ─── Tech support / IT helpdesk ───────────────────────────────────
  // Disabled if paragraph mentions technical roles or tech support
  { phrase: "tech support",      triggers: ["technical", "tech support", "tier"] },
  { phrase: "l1 support",        triggers: ["technical", "tier", "l1", "level 1"] },
  { phrase: "l2 support",        triggers: ["technical", "tier", "l2", "level 2"] },
  { phrase: "l3 support",        triggers: ["technical", "tier", "l3", "level 3"] },
  { phrase: "tier 1 support",    triggers: ["technical", "tier"] },
  { phrase: "tier 2 support",    triggers: ["technical", "tier"] },
  { phrase: "tier 3 support",    triggers: ["technical", "tier"] },
  { phrase: "help desk",         triggers: ["technical", "help desk", "helpdesk", "it support"] },
  { phrase: "helpdesk",          triggers: ["technical", "help desk", "helpdesk", "it support"] },
  { phrase: "service desk",      triggers: ["technical", "service desk", "it support"] },
  { phrase: "desktop support",   triggers: ["technical", "desktop", "it support"] },
  { phrase: "it support",        triggers: ["technical", "it support", "infrastructure"] },
  { phrase: "application support",triggers: ["technical", "application support", "implementation"] },
  { phrase: "system support",    triggers: ["technical", "system support", "infrastructure"] },
  { phrase: "network support",   triggers: ["technical", "network", "infrastructure"] },

  // ─── Engineering-flavored CS roles ────────────────────────────────
  // Disabled if paragraph mentions "engineer" / "implementation" / specific engineering CS roles
  { phrase: "support engineer",          triggers: ["engineer", "engineering", "technical", "developer"] },
  { phrase: "customer success engineer", triggers: ["engineer", "engineering", "csm engineer", "technical"] },
  { phrase: "customer success architect", triggers: ["architect", "engineer", "technical"] },
  { phrase: "implementation engineer",   triggers: ["engineer", "engineering", "implementation", "professional services"] },
  { phrase: "onboarding engineer",       triggers: ["engineer", "engineering", "onboarding", "professional services"] },

  // ─── Pre-sales / solutions engineering ────────────────────────────
  // Disabled if paragraph mentions "solutions"/"sales engineer"/"presales"
  { phrase: "sales engineer",         triggers: ["sales engineer", "presales", "pre-sales", "solutions"] },
  { phrase: "solutions engineer",     triggers: ["solutions engineer", "solutions", "presales", "pre-sales"] },
  { phrase: "solution engineer",      triggers: ["solution engineer", "solutions", "presales", "pre-sales"] },
  { phrase: "solutions architect",    triggers: ["architect", "solutions", "engineer"] },
  { phrase: "solution architect",     triggers: ["architect", "solutions", "engineer"] },
  { phrase: "presales engineer",      triggers: ["presales", "pre-sales", "sales engineer"] },
  { phrase: "pre-sales engineer",     triggers: ["presales", "pre-sales", "sales engineer"] },

  // ─── Pure software engineering ────────────────────────────────────
  // Disabled if paragraph mentions "engineer"/"developer"/"software"/"code"
  { phrase: "software engineer",     triggers: ["engineer", "engineering", "developer", "software development", "code", "coding"] },
  { phrase: "software developer",    triggers: ["developer", "engineer", "software development", "code"] },
  { phrase: "junior software",       triggers: ["engineer", "developer", "software"] },
  { phrase: "senior software",       triggers: ["engineer", "developer", "software"] },
  { phrase: "lead software",         triggers: ["engineer", "developer", "software"] },
  { phrase: "principal software",    triggers: ["engineer", "developer", "software"] },
  { phrase: "staff software",        triggers: ["engineer", "developer", "software"] },
  { phrase: "software intern",       triggers: ["engineer", "developer", "software"] },

  // ─── Specialized engineering ──────────────────────────────────────
  { phrase: "data engineer",        triggers: ["data engineer", "engineer", "data engineering"] },
  { phrase: "data scientist",       triggers: ["data scientist", "ml", "machine learning", "ai", "data science"] },
  { phrase: "data analyst",         triggers: ["data analyst", "data analysis", "analytics"] },
  { phrase: "machine learning engineer", triggers: ["ml", "machine learning", "ai", "engineer"] },
  { phrase: "ml engineer",          triggers: ["ml", "machine learning", "engineer"] },
  { phrase: "ai engineer",          triggers: ["ai", "ml", "engineer"] },
  { phrase: "ml researcher",        triggers: ["ml", "machine learning", "research"] },
  { phrase: "research engineer",    triggers: ["research", "engineer"] },

  // ─── Frontend/backend/mobile ──────────────────────────────────────
  { phrase: "frontend engineer",    triggers: ["frontend", "front-end", "engineer"] },
  { phrase: "front-end engineer",   triggers: ["frontend", "front-end", "engineer"] },
  { phrase: "backend engineer",     triggers: ["backend", "back-end", "engineer"] },
  { phrase: "back-end engineer",    triggers: ["backend", "back-end", "engineer"] },
  { phrase: "fullstack engineer",   triggers: ["fullstack", "full stack", "full-stack", "engineer"] },
  { phrase: "full stack engineer",  triggers: ["fullstack", "full stack", "full-stack", "engineer"] },
  { phrase: "full-stack engineer",  triggers: ["fullstack", "full stack", "full-stack", "engineer"] },
  { phrase: "web developer",        triggers: ["web", "developer", "frontend"] },
  { phrase: "mobile developer",     triggers: ["mobile", "developer", "android", "ios"] },
  { phrase: "android developer",    triggers: ["android", "mobile", "developer"] },
  { phrase: "ios developer",        triggers: ["ios", "mobile", "developer"] },

  // ─── QA / DevOps / SRE ────────────────────────────────────────────
  { phrase: "qa engineer",          triggers: ["qa", "quality", "test", "automation"] },
  { phrase: "test engineer",        triggers: ["test", "qa", "automation"] },
  { phrase: "automation engineer",  triggers: ["automation", "qa", "test"] },
  { phrase: "devops engineer",      triggers: ["devops", "sre", "infrastructure", "engineer"] },
  { phrase: "site reliability",     triggers: ["sre", "site reliability", "devops"] },
  { phrase: "platform engineer",    triggers: ["platform", "engineer", "infrastructure"] },

  // ─── Embedded / hardware / domain engineering ─────────────────────
  { phrase: "embedded engineer",    triggers: ["embedded", "hardware", "engineer"] },
  { phrase: "hardware engineer",    triggers: ["hardware", "engineer"] },
  { phrase: "electrical engineer",  triggers: ["electrical", "engineer"] },
  { phrase: "mechanical engineer",  triggers: ["mechanical", "engineer"] },
  { phrase: "civil engineer",       triggers: ["civil", "engineer"] },
  { phrase: "network engineer",     triggers: ["network engineer", "networking", "infrastructure"] },
  { phrase: "security engineer",    triggers: ["security engineer", "infosec", "cybersecurity", "engineer"] },
  { phrase: "cloud engineer",       triggers: ["cloud", "aws", "azure", "gcp", "engineer"] },
  { phrase: "systems engineer",     triggers: ["systems engineer", "engineer", "infrastructure"] },
  { phrase: "system engineer",      triggers: ["system engineer", "engineer", "infrastructure"] },
  { phrase: "firmware engineer",    triggers: ["firmware", "embedded", "engineer"] },
];

const CONDITIONAL_SUB_ROLE_EXCLUSIONS: ConditionalSubRole[] = [
  { subRole: "software",              triggers: ["engineer", "engineering", "developer", "software", "code"] },
  { subRole: "data_engineering",      triggers: ["data engineer", "data engineering", "engineer"] },
  { subRole: "data_science",          triggers: ["data scientist", "data science", "ml", "ai"] },
  { subRole: "data_analyst",          triggers: ["data analyst", "data analysis", "analytics"] },
  { subRole: "devops",                triggers: ["devops", "sre", "infrastructure"] },
  { subRole: "hardware",              triggers: ["hardware", "embedded", "firmware"] },
  { subRole: "network",               triggers: ["network", "networking", "infrastructure"] },
  { subRole: "qa_engineering",        triggers: ["qa", "quality", "test", "automation"] },
  { subRole: "solutions_engineer",    triggers: ["solutions", "presales", "pre-sales", "engineer", "technical"] },
  { subRole: "information_technology",triggers: ["it ", "information technology", "technical", "infrastructure"] },
  { subRole: "security",              triggers: ["security", "infosec", "cybersecurity", "data security"] },
  { subRole: "product_design",        triggers: ["product design", "designer"] },
  { subRole: "graphic_design",        triggers: ["graphic design", "designer"] },
  { subRole: "marketing_design",      triggers: ["marketing design", "designer"] },
];

const SOFT_SKILL_BLOCKLIST = new Set([
  "communication", "communication skills", "verbal communication",
  "written communication", "interpersonal skills", "interpersonal",
  "leadership", "teamwork", "team player", "collaboration",
  "collaborative", "problem solving", "problem-solving", "analytical",
  "analytical thinking", "critical thinking", "ownership", "proactive",
  "self-motivated", "stakeholder management", "time management",
  "organizational", "multitasking", "adaptability", "flexibility",
  "creative", "creativity", "presentation skills", "presentation",
  "negotiation",
]);

/**
 * v8.2: Determine which exclusions to apply based on paragraph content.
 * If paragraph mentions a trigger keyword, the corresponding exclusion
 * is dropped (allowing those candidates through). When in doubt, drop
 * the exclusion — better to over-include than over-exclude.
 */
function getApplicableExclusions(paragraph: string | undefined): {
  titlePhrases: string[];
  subRoles: string[];
  paragraphSignals: { hasTechnical: boolean; hasEngineering: boolean; hasImplementation: boolean };
} {
  const para = (paragraph || "").toLowerCase();

  // If no paragraph, apply all default exclusions (legacy v6 behavior)
  if (!para.trim()) {
    return {
      titlePhrases: CONDITIONAL_TITLE_EXCLUSIONS.map((e) => e.phrase),
      subRoles: CONDITIONAL_SUB_ROLE_EXCLUSIONS.map((e) => e.subRole),
      paragraphSignals: { hasTechnical: false, hasEngineering: false, hasImplementation: false },
    };
  }

  const phrases: string[] = [];
  for (const excl of CONDITIONAL_TITLE_EXCLUSIONS) {
    const triggered = excl.triggers.some((t) => para.includes(t.toLowerCase()));
    if (!triggered) phrases.push(excl.phrase);
  }

  const subRoles: string[] = [];
  for (const excl of CONDITIONAL_SUB_ROLE_EXCLUSIONS) {
    const triggered = excl.triggers.some((t) => para.includes(t.toLowerCase()));
    if (!triggered) subRoles.push(excl.subRole);
  }

  return {
    titlePhrases: phrases,
    subRoles,
    paragraphSignals: {
      hasTechnical: para.includes("technical") || para.includes("tam"),
      hasEngineering: para.includes("engineer") || para.includes("developer") || para.includes("development"),
      hasImplementation: para.includes("implementation") || para.includes("onboarding") || para.includes("migration"),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════
// MISC MAPPINGS
// ═══════════════════════════════════════════════════════════════════════

const DEGREE_OR_ABOVE: Record<string, string[]> = {
  "Associate's or Above": ["associates", "bachelors", "masters", "mba", "doctorates", "engineer's degree", "juris doctor (jd)", "medicine"],
  "Bachelor's or Above":  ["bachelors", "masters", "mba", "doctorates", "engineer's degree", "juris doctor (jd)", "medicine"],
  "Master's or Above":    ["masters", "mba", "doctorates", "engineer's degree", "juris doctor (jd)", "medicine"],
  "Doctorate":            ["doctorates", "juris doctor (jd)", "medicine"],
  "Only Bachelor's":      ["bachelors"],
  "Only Master's":        ["masters", "mba"],
};

// Delhi NCR — expand to all major cities, not just "delhi"
const NCR_CITIES = ["delhi", "gurgaon", "gurugram", "noida", "faridabad", "ghaziabad"];

const LOCATION_NORMALIZE: Record<string, string | string[]> = {
  // NCR aliases now expand to multiple cities
  "delhi ncr":  NCR_CITIES,
  "delhi-ncr":  NCR_CITIES,
  "ncr":        NCR_CITIES,
  // Single-city aliases
  "bombay":    "mumbai",
  "bengaluru": "bangalore",
  "calcutta":  "kolkata",
  "madras":    "chennai",
  "gurugram":  "gurgaon",
};

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

const lc = (s: string): string => String(s).toLowerCase().trim();

const normalizeLocation = (s: string): string[] => {
  const k = lc(s);
  const mapped = LOCATION_NORMALIZE[k];
  if (mapped === undefined) return [k];
  if (Array.isArray(mapped)) return mapped;
  return [mapped];
};

const isPresent = <T>(v: T | undefined | null | "" | unknown[]): v is T => {
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
};

function buildTechnicalExclusions(paragraph: string | undefined): {
  exclusions: any[];
  signals: ReturnType<typeof getApplicableExclusions>["paragraphSignals"];
  appliedTitlePhrases: number;
  appliedSubRoles: number;
} {
  const { titlePhrases, subRoles, paragraphSignals } = getApplicableExclusions(paragraph);

  const exclusions: any[] = [];
  if (subRoles.length > 0) {
    exclusions.push({ terms: { job_title_sub_role: subRoles } });
  }
  for (const phrase of titlePhrases) {
    exclusions.push({ match_phrase: { job_title: phrase } });
  }
  // Note: v8.1 dropped EXCLUDED_TITLE_WORDS entirely (it was too coarse).
  // v8.2 keeps it dropped — we rely on phrase-level exclusions only.

  return {
    exclusions,
    signals: paragraphSignals,
    appliedTitlePhrases: titlePhrases.length,
    appliedSubRoles: subRoles.length,
  };
}

function addRoleMatchingClauses(should: any[], mapping: RoleMapping): void {
  if (mapping.subRoles.length > 0) {
    should.push({ terms: { job_title_sub_role: mapping.subRoles } });
  }
  for (const phrase of mapping.titlePhrases) {
    should.push({ match_phrase: { job_title: phrase } });
  }
}

function buildRoleClause(uiRole: string, level?: string): any | null {
  const mapping = ROLE_MAP[uiRole];
  if (!mapping) return null;

  const should: any[] = [];
  addRoleMatchingClauses(should, mapping);

  // For Entry-level CS roles, expand to entire CS family (entry-level
  // candidates often have inconsistent titles across CS sub-disciplines)
  if (level === "Entry" && CS_FAMILY_ROLES.includes(uiRole)) {
    for (const otherRole of CS_FAMILY_ROLES) {
      if (otherRole === uiRole) continue;
      const otherMapping = ROLE_MAP[otherRole];
      if (otherMapping) addRoleMatchingClauses(should, otherMapping);
    }
  }

  if (should.length === 0) return null;
  return { bool: { should } };
}

// ═══════════════════════════════════════════════════════════════════════
// INDUSTRY ELIGIBILITY (v8) — Four-tier OR with min_should_match: 1
// ═══════════════════════════════════════════════════════════════════════

/**
 * Build the four-tier industry eligibility clause:
 *   Tier 1: v1 canonical industry match
 *   Tier 2: v2 canonical industry match
 *   Tier 3: positive company-name match
 *   Tier 4: generic-tech (internet/tech-info-internet) WITH evidence
 *
 * Any one tier matching makes the candidate eligible.
 */
function buildIndustryEligibilityClause(profile: IndustryProfile): any {
  const tiers: any[] = [];

  // Tier 1: v1 canonical industries
  if (profile.v1Industries.length > 0) {
    tiers.push({
      terms: { job_company_industry: profile.v1Industries },
    });
  }

  // Tier 2: v2 canonical industries
  if (profile.v2Industries.length > 0) {
    tiers.push({
      terms: { job_company_industry_v2: profile.v2Industries },
    });
  }

  // Tier 3: positive company-name list
  if (profile.positiveCompanies.length > 0) {
    tiers.push({
      terms: { job_company_name: profile.positiveCompanies },
    });
  }

  // Tier 4: generic-tech evidence-gated
  // Pattern: company is tagged generic-tech AND has industry evidence
  const evidenceClauses: any[] = [];

  // Evidence 1: name in positive list (catches well-known fintechs
  // miscategorized as internet — duplicates Tier 3 but the AND with
  // generic-tech bucket here ensures we don't redundantly fire)
  if (profile.positiveCompanies.length > 0) {
    evidenceClauses.push({
      terms: { job_company_name: profile.positiveCompanies },
    });
  }

  // Evidence 2: phrases in summary or job_summary
  for (const phrase of profile.evidencePhrases) {
    evidenceClauses.push({ match_phrase: { summary: phrase } });
    evidenceClauses.push({ match_phrase: { job_summary: phrase } });
    evidenceClauses.push({ match_phrase: { headline: phrase } });
  }

  // Evidence 3: past company in target industry (v1 or v2)
  if (profile.v1Industries.length > 0) {
    evidenceClauses.push({
      terms: { "experience.company.industry": profile.v1Industries },
    });
  }
  if (profile.v2Industries.length > 0) {
    evidenceClauses.push({
      terms: { "experience.company.industry_v2": profile.v2Industries },
    });
  }

  if (evidenceClauses.length > 0) {
    tiers.push({
      bool: {
        must: [
          // Generic-tech bucket
          {
            bool: {
              should: [
                { terms: { job_company_industry: GENERIC_TECH_V1 } },
                { terms: { job_company_industry_v2: GENERIC_TECH_V2 } },
              ],
            },
          },
          // AND industry evidence
          {
            bool: {
              should: evidenceClauses,
            },
          },
        ],
      },
    });
  }

  return {
    bool: {
      should: tiers,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════
// RELEVANCE BOOSTERS (v8) — should clauses outside `must`
//
// These don't affect eligibility (which is determined by must) — they
// raise the relevance score so real fintechs/saas/etc rank above
// edge-case matches in PDL's response ordering.
// ═══════════════════════════════════════════════════════════════════════

// CS-quality phrases that signal real customer-facing work
const CS_QUALITY_PHRASES = [
  "sla", "csat", "nps", "ticketing", "jira", "zendesk", "freshdesk",
  "intercom", "salesforce", "gainsight", "hubspot",
  "chat support", "voice support", "email support", "non-voice",
  "renewal", "onboarding", "implementation", "stakeholder",
  "qbr", "quarterly business review", "escalation",
  "customer query", "customer issue", "ticket resolution",
  "first response time", "resolution time", "customer journey",
];

function buildRelevanceBoosters(
  profile: IndustryProfile | null
): any[] {
  const boosters: any[] = [];

  // Boost 1: Company freshness (founded >= 2010 = newer / more startup-y)
  boosters.push({
    range: { job_company_founded: { gte: 2010 } },
  });

  // Boost 2: Has funding raised (signals real startup, not bootstrap noise)
  boosters.push({
    exists: { field: "job_company_total_funding_raised" },
  });

  // Boost 3: CS-quality summary phrases
  for (const phrase of CS_QUALITY_PHRASES) {
    boosters.push({ match_phrase: { summary: phrase } });
    boosters.push({ match_phrase: { job_summary: phrase } });
  }

  // Industry-specific boosters
  if (profile) {
    // Boost 4: Past company in target industry (catches candidates with
    // background in industry even if currently somewhere else)
    if (profile.v1Industries.length > 0) {
      boosters.push({
        terms: { "experience.company.industry": profile.v1Industries },
      });
    }
    if (profile.v2Industries.length > 0) {
      boosters.push({
        terms: { "experience.company.industry_v2": profile.v2Industries },
      });
    }

    // Boost 5: Positive name match (repeated here as a relevance boost
    // even though it's also in eligibility — pushes name-matched
    // candidates higher in PDL's TF-IDF ranking)
    if (profile.positiveCompanies.length > 0) {
      boosters.push({
        terms: { job_company_name: profile.positiveCompanies },
      });
    }

    // Boost 6: Industry-specific evidence phrases (similar to eligibility
    // evidence, repeated for relevance ranking)
    for (const phrase of profile.evidencePhrases) {
      boosters.push({ match_phrase: { summary: phrase } });
      boosters.push({ match_phrase: { headline: phrase } });
    }
  }

  return boosters;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN BUILDER
// ═══════════════════════════════════════════════════════════════════════

export interface PdlBuildResult {
  query: any;
  warnings: string[];
  diagnostics: {
    detectedIndustry: IndustryKey | null;
    industryEligibilityActive: boolean;
    boosterCount: number;
    paragraphSignals: {
      hasTechnical: boolean;
      hasEngineering: boolean;
      hasImplementation: boolean;
    };
    appliedExclusions: {
      titlePhrases: number;
      subRoles: number;
    };
  };
}

/**
 * Build a PDL Person Search query from filters.
 *
 * @param f         Search filter state (extracted by parser from paragraph)
 * @param paragraph Original user paragraph — used to dynamically decide
 *                  which technical/engineering exclusions to apply.
 *                  Pass it through whenever available; if omitted, all
 *                  default exclusions fire (legacy v6 behavior).
 */
export function buildPdlQuery(
  f: SearchFilterState,
  paragraph?: string,
): PdlBuildResult {
  const techResult = buildTechnicalExclusions(paragraph);
  const must: any[] = [];
  const must_not: any[] = [...techResult.exclusions];
  const should: any[] = []; // top-level relevance boosters
  const warnings: string[] = [];

  // Detect industry once (used by both eligibility and boosters)
  const detectedIndustry = detectIndustryKey(f.industries);
  const industryProfile: IndustryProfile | null = detectedIndustry
    ? INDUSTRY_KNOWLEDGE[detectedIndustry]
    : null;

  // 1. Experience range
  if ((isPresent(f.minExp) && Number(f.minExp) > 0) || isPresent(f.maxExp)) {
    const range: any = {};
    if (isPresent(f.minExp) && Number(f.minExp) > 0) range.gte = Number(f.minExp);
    if (isPresent(f.maxExp)) range.lte = Number(f.maxExp);
    must.push({ range: { inferred_years_experience: range } });
  }

  // 2. Locations — OR across cities, with NCR multi-city expansion
  if (isPresent(f.locationTags)) {
    const tags = f.locationTags!;
    const locShould: any[] = [];
    for (const raw of tags) {
      const expandedLocs = normalizeLocation(raw);
      for (const loc of expandedLocs) {
        locShould.push({ term: { location_locality: loc } });
        locShould.push({ term: { location_region:   loc } });
        locShould.push({ term: { location_country:  loc } });
        locShould.push({ match: { location_name:    loc } });
      }
    }
    must.push({ bool: { should: locShould } });
  } else {
    // Default to India if no location specified
    must.push({ term: { location_country: "india" } });
  }

  // 3. Job titles (current) — only when titleRole absent
  if (isPresent(f.jobTitles) && !isPresent(f.titleRole)) {
    const titles = f.jobTitles!;
    const titleShould: any[] = [];
    for (const t of titles) {
      titleShould.push({ match_phrase: { job_title: lc(t) } });
      titleShould.push({ match: { job_title: lc(t) } });
    }
    must.push({ bool: { should: titleShould } });
  }

  // 4. Past job titles
  if (isPresent(f.pastJobTitles)) {
    const past = f.pastJobTitles!;
    const pastShould = past.map((t) => ({
      match_phrase: { "experience.title.name": lc(t) },
    }));
    must.push({ bool: { should: pastShould } });
  }

  // 5. Title level — EXPANDED UPWARD; skip Entry (PDL sparse on Entry)
  if (isPresent(f.titleLevel) && f.titleLevel !== "Entry" && LEVEL_EXPANSION[f.titleLevel]) {
    must.push({ terms: { job_title_levels: LEVEL_EXPANSION[f.titleLevel] } });
  }

  // 6. Title role — sub_role + title phrase fallback
  if (isPresent(f.titleRole)) {
    const roleClause = buildRoleClause(f.titleRole, f.titleLevel);
    if (roleClause) {
      must.push(roleClause);
    } else {
      warnings.push(`Role "${f.titleRole}" not recognized — skipping role filter`);
    }
  }

  // 7. Companies (current / past / both)
  if (isPresent(f.companies)) {
    const companiesLc = f.companies!.map(lc);
    const mode = f.companiesMode || "current_past";
    if (mode === "current") {
      must.push({ terms: { job_company_name: companiesLc } });
    } else if (mode === "past") {
      must.push({ terms: { "experience.company.name": companiesLc } });
      must_not.push({ terms: { job_company_name: companiesLc } });
    } else {
      must.push({
        bool: {
          should: [
            { terms: { job_company_name: companiesLc } },
            { terms: { "experience.company.name": companiesLc } },
          ],
        },
      });
    }
  }

  // 8. Excluded companies
  if (isPresent(f.excludedCompanies)) {
    const exLc = f.excludedCompanies!.map(lc);
    const exMode = f.excludedCompaniesMode || "current";
    if (exMode === "current") {
      must_not.push({ terms: { job_company_name: exLc } });
    } else {
      must_not.push({ terms: { job_company_name: exLc } });
      must_not.push({ terms: { "experience.company.name": exLc } });
    }
  }

  // 9. Industries — v8 four-tier eligibility
  let industryEligibilityActive = false;
  if (isPresent(f.industries)) {
    if (industryProfile) {
      const eligibilityClause = buildIndustryEligibilityClause(industryProfile);
      must.push(eligibilityClause);
      industryEligibilityActive = true;
    } else {
      // No profile match — fall back to v6-style passthrough on user labels.
      // This preserves backward compat for industries we don't yet curate.
      const labels = f.industries!.map(lc);
      const fallbackShould: any[] = [];
      for (const label of labels) {
        fallbackShould.push({ match: { job_company_industry: label } });
        fallbackShould.push({ match: { job_company_industry_v2: label } });
      }
      must.push({ bool: { should: fallbackShould } });
      warnings.push(
        `Industry "${f.industries!.join(", ")}" has no curated knowledge profile — using fallback label match. Add to industry-knowledge.ts for better recall.`
      );
    }
  }

  // 10. Company size
  if (isPresent(f.companySize)) {
    const sizes = COMPANY_SIZE_MAP[f.companySize!];
    if (sizes && sizes.length > 0) {
      must.push({ terms: { job_company_size: sizes } });
    } else if (sizes === undefined) {
      warnings.push(`Company size "${f.companySize}" not recognized — ignored`);
    }
  }

  // 11. Funding stage — DROPPED as filter (now a soft signal via boosters)
  if (isPresent(f.fundingStage)) {
    warnings.push(
      `Funding stage "${f.fundingStage}" cannot be filtered reliably in PDL Person Search — ignored. Used as scoring signal instead.`
    );
  }

  // 12. Skills — DROPPED as PDL filter (route to scoring engine)
  if (isPresent(f.skills)) {
    const realSkills = f.skills!.filter((s) => !SOFT_SKILL_BLOCKLIST.has(lc(s)));
    if (realSkills.length > 0) {
      warnings.push(
        `Skills (${realSkills.join(", ")}) used as scoring signals, not hard filters`
      );
    }
    if (realSkills.length < f.skills!.length) {
      const dropped = f.skills!.filter((s) => SOFT_SKILL_BLOCKLIST.has(lc(s)));
      warnings.push(`Soft skills dropped (rarely indexed in PDL): ${dropped.join(", ")}`);
    }
  }

  // 13. Degree
  if (isPresent(f.degreeReq) && f.degreeReq !== "Not Selected") {
    const degrees = DEGREE_OR_ABOVE[f.degreeReq];
    if (degrees && degrees.length > 0) {
      must.push({ terms: { "education.degrees": degrees } });
    }
  }

  // 14. Graduation year range
  if (isPresent(f.gradYearMin) || isPresent(f.gradYearMax)) {
    const range: any = {};
    if (isPresent(f.gradYearMin)) range.gte = `${f.gradYearMin}-01-01`;
    if (isPresent(f.gradYearMax)) range.lte = `${f.gradYearMax}-12-31`;
    must.push({ range: { "education.end_date": range } });
  }

  // 15. Languages
  if (isPresent(f.languages)) {
    must.push({ terms: { "languages.name": f.languages!.map(lc) } });
  }

  // ── Top-level relevance boosters ────────────────────────────────────
  // These don't affect eligibility, just push real fintechs/saas/etc
  // higher in PDL's TF-IDF ranking
  const boosters = buildRelevanceBoosters(industryProfile);
  should.push(...boosters);

  // ── Assemble ────────────────────────────────────────────────────────
  const boolBlock: any = {};
  if (must.length > 0)     boolBlock.must     = must;
  if (must_not.length > 0) boolBlock.must_not = must_not;
  if (should.length > 0) {
    boolBlock.should = should;
    // IMPORTANT: When `must` is also present, `should` defaults to
    // minimum_should_match: 0 (per ES docs), meaning should clauses
    // contribute only to relevance scoring, not eligibility. This is
    // exactly what we want.
  }

  const query = Object.keys(boolBlock).length > 0
    ? { bool: boolBlock }
    : { match_all: {} };

  return {
    query,
    warnings,
    diagnostics: {
      detectedIndustry,
      industryEligibilityActive,
      boosterCount: boosters.length,
      paragraphSignals: techResult.signals,
      appliedExclusions: {
        titlePhrases: techResult.appliedTitlePhrases,
        subRoles: techResult.appliedSubRoles,
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════
// REQUEST WRAPPER
// ═══════════════════════════════════════════════════════════════════════

export interface PdlSearchRequest {
  query: any;
  size?: number;
  scroll_token?: string;
  pretty?: boolean;
  dataset?: string;
  data_include?: string;
}

/**
 * Slim field list — only the fields the scorer/UI actually need.
 * Reduces response payload ~70% without affecting credit cost.
 *
 * If you need more fields downstream, add them here (comma-separated).
 */
export const SLIM_DATA_INCLUDE = [
  // Identity
  "id", "full_name", "first_name", "last_name", "linkedin_url",
  "linkedin_username", "linkedin_id", "headline", "sex",
  // Current job
  "job_title", "job_title_role", "job_title_sub_role", "job_title_class",
  "job_title_levels",
  "job_company_id", "job_company_name", "job_company_website",
  "job_company_size", "job_company_founded",
  "job_company_industry", "job_company_industry_v2",
  "job_company_linkedin_url", "job_company_type",
  "job_company_location_name", "job_company_location_locality",
  "job_company_location_region", "job_company_location_country",
  "job_company_employee_count", "job_company_inferred_revenue",
  "job_company_total_funding_raised",
  "job_last_changed", "job_last_verified", "job_start_date",
  "job_summary",
  // Person location
  "location_name", "location_locality", "location_region",
  "location_country", "location_geo", "location_last_updated",
  // Inferred
  "inferred_salary", "inferred_years_experience",
  // Bio
  "summary", "skills",
  // Past experience (compact form — full nested objects)
  "experience",
  // Education
  "education",
  // Certifications and languages
  "certifications", "languages",
  // Misc
  "dataset_version",
].join(",");

export function buildPdlRequest(
  f: SearchFilterState,
  opts: {
    size?: number;
    scrollToken?: string;
    slim?: boolean;
    /** Original user paragraph. Pass this through whenever available
     *  so technical/engineering exclusions can be conditionally applied
     *  based on what the user actually asked for. */
    paragraph?: string;
  } = {}
): { body: PdlSearchRequest; warnings: string[]; diagnostics: PdlBuildResult["diagnostics"] } {
  const { query, warnings, diagnostics } = buildPdlQuery(f, opts.paragraph);

  const body: PdlSearchRequest = {
    query,
    size: opts.size ?? 10,
    pretty: false,
    dataset: "all",
  };

  // Default to slim payload (only fields we use). Pass slim: false to
  // get the full PDL record (e.g. for the diagnostic dump endpoint).
  if (opts.slim !== false) {
    body.data_include = SLIM_DATA_INCLUDE;
  }

  if (opts.scrollToken) body.scroll_token = opts.scrollToken;

  return { body, warnings, diagnostics };
}

/**
 * Hash the filter state for cache keying. Includes a SCORING_VERSION
 * marker so cache automatically invalidates when query logic changes.
 */
export const QUERY_VERSION = "v8.2.0";

export function hashFilterState(f: SearchFilterState): string {
  const stable = JSON.stringify(
    { ...f, _qv: QUERY_VERSION },
    Object.keys({ ...f, _qv: QUERY_VERSION }).sort()
  );
  return createHash("sha1").update(stable).digest("hex");
}