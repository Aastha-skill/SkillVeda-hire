import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import SearchForm from "./components/SearchForm";

interface Company {
  id: number;
  companyName: string;
  email: string;
  contactName: string;
  credits: number;
  plan?: string;
  profilePhoto?: string;
}

interface ExperienceEntry {
  title: string;
  titleRole?: string | null;
  titleSubRole?: string | null;
  titleLevels?: string[];
  company: string;
  companyId?: string | null;
  companySize?: string | null;
  companyIndustry?: string | null;
  companyType?: string | null;
  companyWebsite?: string | null;
  companyLocation?: string | null;
  companyLinkedin?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isPrimary?: boolean;
  summary?: string | null;
  tenureMonths?: number;
  isCSRole?: boolean;
}

interface EducationEntry {
  school: string;
  schoolType?: string | null;
  schoolLocation?: string | null;
  schoolWebsite?: string | null;
  degrees?: string[];
  majors?: string[];
  minors?: string[];
  gpa?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  summary?: string | null;
}

interface CertificationEntry {
  name: string;
  organization?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface Candidate {
  id: string;
  pdlId?: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  headline?: string | null;
  jobTitle: string;
  jobTitleSubRole?: string | null;
  jobStartDate?: string | null;
  employer: string;
  employerIndustry?: string;
  employerSize?: string | null;
  employerEmployeeCount?: number | null;
  employerLocation?: string | null;
  employerLinkedinUrl?: string | null;
  location: string;
  experienceYears: string;
  inferredYearsExperience?: number;
  estimatedSalary: string;
  noticePeriod: string;
  matchScore: string;
  aiScore: number;
  tier: number;
  aiSummary: string;
  summary?: string | null;
  skills: string[];
  experienceTimeline?: ExperienceEntry[];
  education?: EducationEntry[];
  certifications?: CertificationEntry[];
  metrics?: {
    currentTenureMonths: number | null;
    averageTenureMonths: number | null;
    csYears: number;
    csRoleCount: number;
    hasCSExperience: boolean;
    isCurrentlyInCS: boolean;
    jobChangeCount: number;
    isJobHopper: boolean;
    trajectoryLevel: "ascending" | "lateral" | "descending" | "unclear";
    hasManagerialExperience: boolean;
    highestLevel: string | null;
  };
  linkedinUrl: string;
  linkedinConnections?: number | null;
}

interface SearchHistoryItem {
  id: number;
  companyId: number;
  searchTitle: string | null;
  jobDescription: string;
  searchParagraph?: string | null;
  resultsCount: number | null;
  createdAt: string;
  cachedUntil?: string | null;
  hasCachedResults?: boolean;
}

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const S = {
  bg: "#ffffff",
  pageBg: "#fafafa",
  sidebar: "#1a1a2e",
  sidebarActive: "#2d2b55",
  sidebarText: "#e2e2f0",
  sidebarMuted: "#8888aa",
  sidebarBorder: "#252540",
  accent: "#7c3aed",
  accentLight: "#f5f3ff",
  border: "#e8e8ee",
  borderLight: "#f0f0f6",
  text: "#111111",
  textSecondary: "#444",
  textMuted: "#888",
  muted: "#999999",
  muted2: "#cccccc",
  green: "#16a34a",
  greenBg: "#f0fdf4",
  greenBorder: "#bbf7d0",
  amber: "#d97706",
  amberBg: "#fffbeb",
  red: "#dc2626",
  redBg: "#fef2f2",
  inputBorder: "#dddde8",
  linkedin: "#0A66C2",
};

const T = {
  display: { fontSize: 20, fontWeight: 700 as const, letterSpacing: "-0.01em", lineHeight: 1.25 },
  body:    { fontSize: 13, fontWeight: 400 as const, lineHeight: 1.55 },
  caption: { fontSize: 12, fontWeight: 400 as const, lineHeight: 1.5 },
  label:   { fontSize: 10, fontWeight: 600 as const, letterSpacing: "0.06em", textTransform: "uppercase" as const },
};

// ─── Helpers ───────────────────────────────────────────────

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace(/\bIi\b/g, "II").replace(/\bIii\b/g, "III").replace(/\bIv\b/g, "IV")
    .replace(/\bUsa\b/g, "USA").replace(/\bUk\b/g, "UK").replace(/\bUae\b/g, "UAE")
    .replace(/\bAi\b/g, "AI").replace(/\bSaas\b/g, "SaaS").replace(/\bCsm\b/g, "CSM")
    .replace(/\bCx\b/g, "CX").replace(/\bMba\b/g, "MBA").replace(/\bCeo\b/g, "CEO")
    .replace(/\bCfo\b/g, "CFO").replace(/\bVp\b/g, "VP").replace(/\bIit\b/g, "IIT")
    .replace(/\bIim\b/g, "IIM");
}

function formatPdlDate(d: string | null | undefined, opts: { yearOnly?: boolean } = {}): string {
  if (!d) return "Present";
  const parts = String(d).split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (opts.yearOnly) return parts[0] || d;
  if (parts.length >= 2) {
    const m = parseInt(parts[1]);
    if (m >= 1 && m <= 12) return `${months[m - 1]} ${parts[0]}`;
  }
  return parts[0] || d;
}

function formatTenure(months: number | undefined | null): string {
  if (!months || months <= 0) return "—";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}mo`;
  if (m === 0) return `${y}y`;
  return `${y}y ${m}mo`;
}

function formatCompanySize(size: string | null | undefined): string {
  if (!size) return "";
  return `${size}`;
}

function realSalary(s: string | null | undefined): string | null {
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower.includes("<20,000") || lower === "not disclosed" || lower === "unknown") return null;
  return s;
}

function realNoticePeriod(s: string | null | undefined): string | null {
  if (!s) return null;
  const lower = s.toLowerCase().trim();
  if (lower === "unknown" || lower === "not disclosed" || lower === "") return null;
  return s;
}

function isEliteSchool(name: string): boolean {
  const n = name.toLowerCase();
  const elite = ["iit ", "indian institute of technology", "iim ", "indian institute of management",
    "isb ", "indian school of business", "bits pilani", "nit ", "harvard", "stanford", "mit",
    "oxford", "cambridge", "yale", "princeton", "wharton", "columbia", "berkeley"];
  return elite.some(e => n.includes(e));
}

function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// Count active hard filters (sent to PDL) — used for "Filters (N)" badge in query bar
function countActiveFilters(f: any): number {
  if (!f || typeof f !== "object") return 0;
  const keys = ["titleRole", "titleLevel", "minExp", "maxExp", "locationTags",
    "industries", "companySize", "companies", "excludedCompanies", "jobTitles",
    "pastJobTitles", "workArrangement"];
  let n = 0;
  for (const k of keys) {
    const v = f[k];
    if (v == null || v === "" || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    n++;
  }
  return n;
}

// Count active soft criteria (used for ranking) — used for "Criteria (N)" badge
function countActiveCriteria(c: any): number {
  if (!c || typeof c !== "object") return 0;
  const keys = ["relevantSkills", "compensationRangeLPA", "noticePeriodDays",
    "trajectoryDirection", "culturalNotes", "preferences"];
  let n = 0;
  for (const k of keys) {
    const v = c[k];
    if (v == null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === "object" && Object.keys(v).length === 0) continue;
    n++;
  }
  return n;
}

// ─── Icons ─────────────────────────────────────────────────

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function BookmarkIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PinIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: "middle" }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  );
}

function RefreshIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

// ─── Reusable bits ─────────────────────────────────────────

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid ${S.borderLight}`,
    }}>
      <div style={{ ...T.label, color: S.textMuted }}>{children}</div>
      {action}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", ...T.caption }}>
      <span style={{ color: S.textMuted }}>{label}</span>
      <span style={{ color: S.text, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function SourcingCopilot() {
  const [, navigate] = useLocation();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [activeNav, setActiveNav] = useState("sourcing");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<any[]>([]);
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [showAllCertifications, setShowAllCertifications] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Cache state
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null);
  const [currentFilters, setCurrentFilters] = useState<any | null>(null);
  const [currentParagraph, setCurrentParagraph] = useState<string | null>(null);
  const [currentCriteria, setCurrentCriteria] = useState<any | null>(null);
  const [resultsAreCached, setResultsAreCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Editing state — when set, the wizard opens directly to its review step
  // pre-populated with these filters, skipping the paragraph input.
  const [editingFilters, setEditingFilters] = useState<any | null>(null);

  // Modals (Juicebox-style)
  const [editQueryOpen, setEditQueryOpen] = useState(false);
  const [searchListOpen, setSearchListOpen] = useState(false);
  const [outOfCreditsModalOpen, setOutOfCreditsModalOpen] = useState(false);

  // Are search credits exhausted?
  const credits = company?.credits ?? 0;
  const outOfCredits = credits <= 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");
    const googleCompany = params.get("company");
    if (googleToken) {
      localStorage.setItem("hiring_token", googleToken);
      if (googleCompany) {
        localStorage.setItem("hiring_company", decodeURIComponent(googleCompany));
      }
      window.history.replaceState({}, "", "/hire/dashboard");
    }

    const t = localStorage.getItem("hiring_token");
    const stored = localStorage.getItem("hiring_company");
    if (!t || !stored) { navigate("/hire/login"); return; }
    try { setCompany(JSON.parse(stored)); } catch { navigate("/hire/login"); return; }
    fetchMe(t);
    fetchSearchHistory(t);
    fetchSaved(t);
  }, []);

  useEffect(() => {
    setShowAllExperience(false);
    setShowAllCertifications(false);
    setShowAllSkills(false);
  }, [selected?.id]);

  const tok = () => localStorage.getItem("hiring_token") || "";

  // Update local company state from server-side credit balance
  const syncCredits = (newCredits: number) => {
    if (!company) return;
    const updated = { ...company, credits: newCredits };
    setCompany(updated);
    localStorage.setItem("hiring_company", JSON.stringify(updated));
  };

  const fetchMe = async (t: string) => {
    try {
      const res = await fetch("/api/hiring/me", { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setCompany(data);
        localStorage.setItem("hiring_company", JSON.stringify(data));
      }
    } catch {}
  };

  const fetchSearchHistory = async (t: string) => {
    try {
      const res = await fetch("/api/hiring/searches", { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) setSearchHistory(await res.json());
    } catch {}
  };

  const fetchSaved = async (t: string) => {
    try {
      const res = await fetch("/api/hiring/saved", { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setSavedCandidates(data);
        setSavedIds(new Set(data.map((c: any) => c.candidateId)));
      }
    } catch {}
  };

  // ─── SMART SEARCH (with cache + credit support) ────────────
  const handleSmartSearch = async (
    filters: any,
    criteria: any,
    options: { paragraph?: string | null; forceRefresh?: boolean } = {}
  ) => {
    const { paragraph = null, forceRefresh = false } = options;

    console.log("[DEBUG] handleSmartSearch called");
    console.log("[DEBUG] filters:", filters);
    console.log("[DEBUG] criteria:", criteria);
    console.log("[DEBUG] paragraph:", paragraph);

    if (outOfCredits && !forceRefresh) {
      // Cache hits are still allowed at 0 credits — server arbitrates.
    }
    setLoading(true);
    setSearched(false);
    setCandidates([]);
    setSelected(null);
    if (!forceRefresh) {
      setCurrentSearchId(null);
      setResultsAreCached(false);
      setCachedAt(null);
    }
    try {
      const res = await fetch("/api/hiring/search-filters", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({
          filters,
          criteria,
          paragraph,
          size: 20,
          forceRefresh,
        }),
      });

      console.log("[DEBUG] response status:", res.status);

      if (res.status === 401) { navigate("/hire/login"); return; }
      if (res.status === 402) {
        const data = await res.json();
        console.log("[DEBUG] 402 response:", data);
        setOutOfCreditsModalOpen(true);
        if (data.creditsRemaining != null) syncCredits(data.creditsRemaining);
        return;
      }
      const data = await res.json();

      console.log("[DEBUG] full response body:", data);
      console.log("[DEBUG] candidates field:", data.candidates);
      console.log("[DEBUG] candidates count:", (data.candidates || []).length);
      console.log("[DEBUG] first candidate:", data.candidates?.[0]);
      console.log("[DEBUG] response total:", data.total);
      console.log("[DEBUG] response cached:", data.cached);

      if (!res.ok) {
        console.log("[DEBUG] response NOT ok, error:", data.error);
        alert(data.error || "Search failed");
        return;
      }
      const list: Candidate[] = data.candidates || [];

      console.log("[DEBUG] list length to set in state:", list.length);
      console.log("[DEBUG] about to call setCandidates and setSearched(true)");

      setCandidates(list);
      setSelected(list[0] || null);
      setCurrentSearchId(data.searchId || null);
      setCurrentFilters(data.filters || filters);
      setCurrentParagraph(data.paragraph ?? paragraph ?? null);
      setCurrentCriteria(data.criteria ?? criteria ?? null);
      setResultsAreCached(Boolean(data.cached));
      setCachedAt(data.cachedAt || null);
      setSearched(true);

      console.log("[DEBUG] state updates completed");

      if (data.creditsRemaining != null) syncCredits(data.creditsRemaining);
      fetchSearchHistory(tok());
    } catch (e) {
      console.error("[DEBUG] caught error:", e);
      alert("Search failed. Check console for details.");
    } finally {
      setLoading(false);
      console.log("[DEBUG] handleSmartSearch done");
    }
  };

  // ─── REFRESH (force fresh PDL — costs 1 credit) ────────────
  const handleRefresh = async () => {
    if (!currentFilters) return;
    if (outOfCredits) {
      setOutOfCreditsModalOpen(true);
      return;
    }
    setRefreshing(true);
    try {
      await handleSmartSearch(currentFilters, currentCriteria, {
        paragraph: currentParagraph,
        forceRefresh: true,
      });
    } finally {
      setRefreshing(false);
    }
  };

  // ─── LOAD CACHED SEARCH (FREE — no credit charge) ──────────
  const loadSavedSearch = async (s: SearchHistoryItem) => {
    setActiveNav("sourcing");
    setSearchListOpen(false);
    setLoading(true);
    setCandidates([]);
    setSelected(null);
    setSearched(false);
    try {
      const res = await fetch(`/api/hiring/searches/${s.id}/results`, {
        headers: { Authorization: `Bearer ${tok()}` },
      });
      if (res.status === 401) { navigate("/hire/login"); return; }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const fallbackFilters = data?.filters || null;
        setEditingFilters(fallbackFilters);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const list: Candidate[] = data.candidates || [];

      console.log("[DEBUG cached] candidates count:", list.length);

      const parsedFilters = data.filters || null;
      const paragraph = data.paragraph || null;
      const criteria = data.criteria || null;

      setCandidates(list);
      setSelected(list[0] || null);
      setCurrentSearchId(data.searchId || s.id);
      setCurrentFilters(parsedFilters);
      setCurrentParagraph(paragraph);
      setCurrentCriteria(criteria);
      setResultsAreCached(true);
      setCachedAt(data.cachedAt || s.createdAt);
      setSearched(true);
    } catch (e) {
      console.error(e);
      alert("Failed to load search");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (c: Candidate) => {
    const action = savedIds.has(c.id) ? "unsave" : "save";
    try {
      const res = await fetch("/api/hiring/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({ candidateId: c.id, candidateName: c.name, jobTitle: c.jobTitle, employer: c.employer, matchScore: c.matchScore, action }),
      });
      if (res.ok) {
        setSavedIds((prev) => { const next = new Set(prev); action === "save" ? next.add(c.id) : next.delete(c.id); return next; });
        fetchSaved(tok());
      }
    } catch {}
  };

  const handleRemove = async (candidateId: string) => {
    try {
      const res = await fetch(`/api/hiring/saved/${candidateId}`, { method: "DELETE", headers: { Authorization: `Bearer ${tok()}` } });
      if (res.ok) {
        setSavedIds((prev) => { const next = new Set(prev); next.delete(candidateId); return next; });
        fetchSaved(tok());
      }
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("hiring_token");
    localStorage.removeItem("hiring_company");
    navigate("/hire/login");
  };

  const tierStyle = (tier: number) => {
    if (tier === 1) return { bg: S.greenBg, color: S.green };
    if (tier === 2) return { bg: S.amberBg, color: S.amber };
    return { bg: S.redBg, color: S.red };
  };

  const matchStyle = (match: string) => {
    if (match === "High") return { bg: S.greenBg, color: S.green, border: S.greenBorder };
    if (match === "Medium") return { bg: S.amberBg, color: S.amber, border: "#fde68a" };
    return { bg: S.redBg, color: S.red, border: "#fecaca" };
  };

  const noticePeriodColor = (notice: string) => {
    const days = parseInt(notice);
    if (days <= 30) return S.green;
    if (days <= 60) return S.amber;
    return S.red;
  };

  const Badge = ({ label, bg, color, border }: any) => (
    <span style={{ background: bg, color, border: `1px solid ${border || bg}`, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 600 }}>
      {label}
    </span>
  );

  const Avatar = ({ size = 28 }: { size?: number }) => {
    if (company?.profilePhoto) {
      return (
        <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <img
            src={company.profilePhoto}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e: any) => {
              e.target.style.display = "none";
              e.target.parentElement.style.background = S.accent;
              e.target.parentElement.style.display = "flex";
              e.target.parentElement.style.alignItems = "center";
              e.target.parentElement.style.justifyContent = "center";
              e.target.parentElement.innerHTML = `<span style="color:#fff;font-weight:700;font-size:${Math.round(size * 0.45)}px">${company?.contactName?.[0]?.toUpperCase() || "U"}</span>`;
            }}
          />
        </div>
      );
    }
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: S.accent, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: Math.round(size * 0.45),
        color: "#fff", flexShrink: 0,
      }}>
        {company?.contactName?.[0]?.toUpperCase() || "U"}
      </div>
    );
  };

  const navItems = [
    { key: "sourcing", label: "Sourcing Copilot", icon: "🔍", link: "" },
    { key: "saved", label: "Saved Candidates", icon: "🔖", count: savedIds.size, link: "" },
    { key: "jobs", label: "Manage Jobs", icon: "💼", link: "" },
    { key: "email", label: "Email & WhatsApp", icon: "✉️", link: "/hire/email-setup" },
    { key: "analytics", label: "Analytics", icon: "📊", link: "" },
    { key: "contact", label: "Contact Us", icon: "📞", link: "" },
  ];

  const panel2Links = [
    { label: "Saved Candidates", count: savedIds.size, nav: "saved", link: "" },
    { label: "Email and WhatsApp setup", nav: "email", link: "/hire/email-setup" },
    { label: "Email Inbox", count: 0, nav: "", link: "" },
    { label: "Analytics", nav: "analytics", link: "" },
  ];

  // DEBUG: log render state
  console.log("[DEBUG render] searched:", searched, "candidates.length:", candidates.length, "loading:", loading, "activeNav:", activeNav);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: font, background: S.bg, overflow: "hidden" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, minWidth: 220, background: S.sidebar, display: "flex", flexDirection: "column" as const, justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ padding: "16px", borderBottom: `1px solid ${S.sidebarBorder}` }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
              SkillVeda <span style={{ color: "#a78bfa" }}>Hire</span>
            </span>
          </div>

          <div style={{ margin: "10px", background: "#12122a", borderRadius: 9, padding: "11px 12px" }}>
            <div style={{ fontSize: 10, color: S.sidebarMuted, fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.4px" }}>Searches Remaining</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: outOfCredits ? "#ff6b6b" : "#fff", margin: "2px 0 1px" }}>{credits}</div>
            <div style={{ fontSize: 10, color: "#555580" }}>{company?.plan || "Free"} plan</div>
            <button style={{ width: "100%", marginTop: 8, background: S.accent, color: "#fff", border: "none", borderRadius: 6, padding: "6px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              + Buy Credits
            </button>
          </div>

          {navItems.map((item) => (
            <div
              key={item.key}
              onClick={() => {
                if (item.link) window.location.href = item.link;
                else setActiveNav(item.key);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", margin: "2px 7px", borderRadius: 7,
                fontSize: 12,
                background: activeNav === item.key ? S.sidebarActive : "transparent",
                color: activeNav === item.key ? S.sidebarText : S.sidebarMuted,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.count ? (
                <span style={{ marginLeft: "auto", background: S.accent, color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 8 }}>
                  {item.count}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 14px", borderTop: `1px solid ${S.sidebarBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size={28} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: S.sidebarText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
              {company?.contactName || "User"}
            </div>
            <div style={{ fontSize: 10, color: "#555580", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
              {company?.email || ""}
            </div>
          </div>
          <span onClick={() => window.location.href = "/hire/settings"} title="Settings" style={{ fontSize: 14, cursor: "pointer", color: S.sidebarMuted, marginRight: 2 }}>⚙</span>
          <span onClick={handleLogout} title="Logout" style={{ fontSize: 14, cursor: "pointer", color: S.sidebarMuted }}>⇥</span>
        </div>
      </div>

      {/* PANEL 2 */}
      <div style={{ width: 220, minWidth: 180, borderRight: `1px solid ${S.border}`, padding: 12, flexShrink: 0, overflowY: "auto" as const, background: S.bg }}>
        <div style={{ border: `1px solid ${S.border}`, borderRadius: 7, padding: "8px 10px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: S.muted2 }}>Job Folder</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: S.text, marginTop: 1 }}>First job folder</div>
          </div>
          <span style={{ color: S.muted2, fontSize: 11 }}>▾</span>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: S.text, marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            onClick={() => searchHistory.length > 0 && setSearchListOpen(true)}
            title={searchHistory.length > 5 ? `See all ${searchHistory.length} searches` : "Searches in this project"}
            style={{
              cursor: searchHistory.length > 0 ? "pointer" : "default",
              display: "inline-flex", alignItems: "center", gap: 4,
            }}
          >
            Searches
            {searchHistory.length > 0 && (
              <span style={{ fontSize: 9, color: S.muted2, fontWeight: 400 }}>({searchHistory.length})</span>
            )}
          </span>
          <span
            onClick={() => {
              setSearched(false); setCandidates([]); setSelected(null);
              setActiveNav("sourcing");
              setCurrentSearchId(null); setCurrentFilters(null);
              setCurrentParagraph(null); setCurrentCriteria(null);
              setResultsAreCached(false); setCachedAt(null);
              setEditingFilters(null);
            }}
            style={{ fontSize: 11, color: S.accent, cursor: "pointer", fontWeight: 500 }}
          >
            New Search +
          </span>
        </div>

        {searchHistory.length === 0 ? (
          <div style={{ padding: "8px 9px", border: `1px solid ${S.border}`, borderRadius: 6, background: S.accentLight }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#333" }}>Untitled</div>
            <div style={{ fontSize: 10, color: S.accent, marginTop: 2 }}>Start a new search</div>
          </div>
        ) : (
          searchHistory.slice().reverse().slice(0, 5).map((s) => {
            const isActive = currentSearchId === s.id;
            return (
              <div
                key={s.id}
                title="Click to load this search"
                onClick={() => loadSavedSearch(s)}
                style={{
                  padding: "8px 9px",
                  border: `1px solid ${isActive ? S.accent : "#c4b5fd"}`,
                  borderRadius: 6, marginBottom: 5, cursor: "pointer",
                  background: isActive ? "#ede9fe" : S.accentLight,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 500, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                  {(s.searchTitle || "Untitled").substring(0, 22)}{(s.searchTitle || "").length > 22 ? "…" : ""}
                </div>
                <div style={{ fontSize: 10, color: S.accent, marginTop: 2 }}>
                  {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            );
          })
        )}

        {searchHistory.length > 5 && (
          <div
            onClick={() => setSearchListOpen(true)}
            style={{
              padding: "6px 9px",
              fontSize: 11,
              color: S.accent,
              cursor: "pointer",
              textAlign: "center" as const,
              fontWeight: 500,
            }}
          >
            See all {searchHistory.length} searches →
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          {panel2Links.map((item) => (
            <div
              key={item.label}
              onClick={() => {
                if (item.link) window.location.href = item.link;
                else if (item.nav) setActiveNav(item.nav);
              }}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 9px", fontSize: 12, color: "#666", cursor: "pointer", borderRadius: 5 }}
            >
              {item.label}
              {item.count !== undefined && <span style={{ fontSize: 11, color: S.accent, fontWeight: 600 }}>{item.count}</span>}
            </div>
          ))}
        </div>

        {searched && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${S.borderLight}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: S.muted2, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 7, display: "flex", justifyContent: "space-between" }}>
              Filters <span style={{ color: S.muted2, cursor: "pointer", fontWeight: 400, fontSize: 11 }}>Clear All</span>
            </div>
            {["Match Score", "Average Tenure", "Past Company Stage", "Past Company Business", "Notice Period"].map((f) => (
              <div key={f} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderLight}`, fontSize: 12, color: "#555", cursor: "pointer" }}>
                {f} <span style={{ color: S.muted2 }}>+</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* SAVED VIEW — simplified (no email/phone columns) */}
        {activeNav === "saved" && (
          <div style={{ flex: 1, overflowY: "auto" as const, background: S.bg }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky" as const, top: 0, background: S.bg, zIndex: 5 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>Saved Candidates</div>
            </div>

            {savedCandidates.length === 0 ? (
              <div style={{ textAlign: "center" as const, padding: "80px 0", color: S.muted }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔖</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>No saved candidates yet</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Save candidates from your searches to keep them here</div>
                <button onClick={() => setActiveNav("sourcing")} style={{ marginTop: 16, background: S.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                  Start Searching
                </button>
              </div>
            ) : (
              <div>
                <div style={{ padding: "10px 20px", display: "flex", justifyContent: "flex-end", gap: 8, borderBottom: `1px solid ${S.border}` }}>
                  <button
                    onClick={() => {
                      const csv = [
                        ["Name", "Position", "Company", "Match Score"],
                        ...savedCandidates.map((c: any) => [c.candidateName, c.jobTitle, c.employer, c.matchScore]),
                      ].map((row) => row.join(",")).join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "saved-candidates.csv"; a.click();
                    }}
                    style={{ background: "#fff", border: `1px solid ${S.border}`, borderRadius: 7, padding: "6px 12px", fontSize: 12, color: "#444", cursor: "pointer", fontFamily: font }}
                  >
                    Download CSV
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2.5fr 2fr 1fr 1fr", padding: "10px 20px", borderBottom: `1px solid ${S.border}`, background: "#fafafa" }}>
                  {["Name", "Position", "Company", "Match", ""].map((h, i) => (
                    <div key={i} style={{ fontSize: 11, fontWeight: 600, color: S.muted }}>{h}</div>
                  ))}
                </div>

                {savedCandidates.map((c: any) => {
                  const ms = matchStyle(c.matchScore || "Medium");
                  return (
                    <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 2.5fr 2fr 1fr 1fr", padding: "13px 20px", borderBottom: `1px solid ${S.borderLight}`, alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: S.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: S.accent, flexShrink: 0 }}>
                          {(c.candidateName?.[0] || "?").toUpperCase()}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{titleCase(c.candidateName)}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "#555" }}>{c.jobTitle ? titleCase(c.jobTitle).substring(0, 28) + (c.jobTitle.length > 28 ? "..." : "") : ""}</div>
                      <div style={{ fontSize: 12, color: "#555" }}>{titleCase(c.employer || "")}</div>
                      <div>
                        {c.matchScore && <Badge label={c.matchScore} bg={ms.bg} color={ms.color} border={ms.border} />}
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 5 }}>
                        <button onClick={() => handleRemove(c.candidateId)} style={{ background: "#fff", border: `1px solid ${S.border}`, color: S.red, borderRadius: 6, padding: "4px 9px", fontSize: 11, cursor: "pointer", fontFamily: font }}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SEARCH VIEW with mode toggle */}
        {activeNav === "sourcing" && !searched && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, padding: "32px 24px", overflowY: "auto" as const }}>

            {/* Out-of-credits banner */}
            {outOfCredits && (
              <div style={{
                background: "#fef3c7", border: "1px solid #fcd34d",
                borderRadius: 9, padding: "12px 16px",
                marginBottom: 20, maxWidth: 620, marginLeft: "auto", marginRight: "auto",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>You've used all your free searches</div>
                  <div style={{ fontSize: 12, color: "#a16207", marginTop: 2 }}>Saved searches are still free to view. Buy credits to run new searches.</div>
                </div>
                <button style={{ background: S.accent, color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                  Buy Credits
                </button>
              </div>
            )}

            <SearchForm
              onSearch={(f, ctx) => {
                setEditingFilters(null);
                const criteria = ctx?.scoringContext || null;
                const paragraph = ctx?.rawInput || null;
                handleSmartSearch(f, criteria, { paragraph });
              }}
              loading={loading}
              outOfCredits={outOfCredits}
              initialFilters={editingFilters}
            />
          </div>
        )}

        {/* RESULTS VIEW */}
        {activeNav === "sourcing" && searched && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden" }}>

            {/* PERSISTENT QUERY BAR */}
            {(currentParagraph || currentFilters) && (
              <div style={{
                padding: "12px 18px",
                borderBottom: `1px solid ${S.border}`,
                background: S.bg,
                display: "flex", alignItems: "center", gap: 10,
                flexShrink: 0,
              }}>
                <div
                  onClick={() => setEditQueryOpen(true)}
                  title="Click to edit query"
                  style={{
                    flex: 1, minWidth: 0,
                    background: "#fafafa",
                    border: `1px solid ${S.border}`,
                    borderRadius: 24,
                    padding: "8px 16px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "all 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = S.accent;
                    e.currentTarget.style.background = S.accentLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = S.border;
                    e.currentTarget.style.background = "#fafafa";
                  }}
                >
                  <Avatar size={26} />
                  <div style={{
                    flex: 1, minWidth: 0,
                    fontSize: 13, color: S.textSecondary,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                  }}>
                    {currentParagraph || "Edit search filters"}
                  </div>
                </div>
                <button
                  onClick={() => setEditQueryOpen(true)}
                  style={{
                    background: "#fff",
                    border: `1px solid ${S.border}`,
                    borderRadius: 18,
                    padding: "7px 13px",
                    fontSize: 12, color: S.textSecondary,
                    cursor: "pointer", fontFamily: font, fontWeight: 500,
                    display: "inline-flex", alignItems: "center", gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 11 }}>⚙</span> Filters
                  {currentFilters && (
                    <span style={{
                      background: S.accentLight, color: S.accent,
                      borderRadius: 10, padding: "0 6px",
                      fontSize: 10, fontWeight: 600,
                    }}>
                      {countActiveFilters(currentFilters)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setEditQueryOpen(true)}
                  style={{
                    background: "#fff",
                    border: `1px solid ${S.border}`,
                    borderRadius: 18,
                    padding: "7px 13px",
                    fontSize: 12, color: S.textSecondary,
                    cursor: "pointer", fontFamily: font, fontWeight: 500,
                    display: "inline-flex", alignItems: "center", gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 11 }}>✦</span> Criteria
                  {currentCriteria && countActiveCriteria(currentCriteria) > 0 && (
                    <span style={{
                      background: S.accentLight, color: S.accent,
                      borderRadius: 10, padding: "0 6px",
                      fontSize: 10, fontWeight: 600,
                    }}>
                      {countActiveCriteria(currentCriteria)}
                    </span>
                  )}
                </button>
              </div>
            )}

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

            {/* CANDIDATE LIST (left) */}
            <div style={{ width: "clamp(300px, 40%, 420px)", borderRight: `1px solid ${S.border}`, overflowY: "auto" as const, flexShrink: 0, background: S.bg }}>
              <div style={{ padding: "13px 15px", borderBottom: `1px solid ${S.border}`, position: "sticky" as const, top: 0, background: S.bg, zIndex: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>Sourced Candidates</div>
                    <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>
                      {candidates.length} profiles · AI ranked
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {currentFilters && (
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing || loading || outOfCredits}
                        title={outOfCredits ? "Refresh costs 1 credit — none left" : "Re-run with fresh PDL data (costs 1 credit)"}
                        style={{
                          background: "#f5f5f8", border: `1px solid ${S.border}`,
                          borderRadius: 6, padding: "5px 9px",
                          fontSize: 11, color: outOfCredits ? S.muted2 : "#444",
                          cursor: (refreshing || outOfCredits) ? "not-allowed" : "pointer",
                          fontFamily: font, opacity: refreshing ? 0.6 : 1,
                          display: "flex", alignItems: "center", gap: 5,
                        }}
                      >
                        <span style={{ display: "inline-flex", animation: refreshing ? "spin 1s linear infinite" : "none" }}>
                          <RefreshIcon size={11} />
                        </span>
                        {refreshing ? "Refreshing…" : "Refresh"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSearched(false); setCandidates([]);
                        setCurrentSearchId(null); setCurrentFilters(null);
                        setCurrentParagraph(null); setCurrentCriteria(null);
                        setResultsAreCached(false); setCachedAt(null);
                        setEditingFilters(null);
                      }}
                      style={{ background: "#f5f5f8", border: `1px solid ${S.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#444", cursor: "pointer", fontFamily: font }}
                    >
                      New Search
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3].map((t) => {
                    const count = candidates.filter((c) => c.tier === t).length;
                    const ts = tierStyle(t);
                    return (
                      <div key={t} style={{ flex: 1, borderRadius: 7, padding: "6px 8px", textAlign: "center" as const, background: ts.bg }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: ts.color, textTransform: "uppercase" as const }}>Tier {t}</div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: ts.color, marginTop: 1 }}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {candidates.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center" as const, color: S.muted }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>No candidates returned</div>
                  <div style={{ fontSize: 12, color: S.muted }}>The search ran but returned 0 candidates.<br/>Check browser console (F12) for [DEBUG] logs.</div>
                </div>
              )}

              {candidates.map((c) => {
                const ts = tierStyle(c.tier);
                const ms = matchStyle(c.matchScore);
                const isSelected = selected?.id === c.id;
                const isSaved = savedIds.has(c.id);
                const salaryDisplay = realSalary(c.estimatedSalary);
                const noticeDisplay = realNoticePeriod(c.noticePeriod);

                return (
                  <div key={c.id} onClick={() => setSelected(c)} style={{ padding: "13px 15px", borderBottom: `1px solid ${S.borderLight}`, borderLeft: `3px solid ${isSelected ? S.accent : "transparent"}`, background: isSelected ? "#faf9ff" : S.bg, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                      <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: S.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: S.accent, flexShrink: 0 }}>
                          {(c.name && c.name[0]) ? c.name[0].toUpperCase() : "?"}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{titleCase(c.name)}</div>
                          <div style={{ fontSize: 11, color: S.muted, marginTop: 1 }}>{titleCase(c.jobTitle)}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, justifyContent: "flex-end" }}>
                        <Badge label={`Tier ${c.tier}`} bg={ts.bg} color={ts.color} />
                        <Badge label={c.matchScore} bg={ms.bg} color={ms.color} border={ms.border} />
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: S.muted, marginBottom: 5 }}>{titleCase(c.employer)} · {titleCase(c.location)} · Exp: {c.experienceYears}yrs</div>
                    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5, marginBottom: 8 }}>{(c.aiSummary || "").substring(0, 100)}...</div>
                    {(salaryDisplay || noticeDisplay) && (
                      <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
                        {salaryDisplay && <div style={{ background: "#f5f5f8", borderRadius: 5, padding: "3px 9px", fontSize: 11, color: "#666" }}>Salary: {salaryDisplay}</div>}
                        {noticeDisplay && <div style={{ background: "#f5f5f8", borderRadius: 5, padding: "3px 9px", fontSize: 11, color: noticePeriodColor(noticeDisplay) }}>Notice: {noticeDisplay}</div>}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button onClick={(e) => { e.stopPropagation(); handleSave(c); }} style={{ background: isSaved ? S.accentLight : S.bg, border: `1px solid ${isSaved ? "#c4b5fd" : S.border}`, color: isSaved ? S.accent : S.muted, borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: font, fontWeight: isSaved ? 500 : 400 }}>
                        {isSaved ? "Saved" : "Save"}
                      </button>
                      {c.linkedinUrl && (
                        <a
                          href={c.linkedinUrl}
                          target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: S.bg, border: `1px solid ${S.border}`,
                            borderRadius: 6, padding: "4px 10px",
                            fontSize: 11, color: S.linkedin,
                            fontFamily: font, fontWeight: 500,
                            textDecoration: "none",
                            display: "inline-flex", alignItems: "center", gap: 4,
                          }}
                        >
                          <LinkedInIcon size={11} /> View
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DETAIL PANEL */}
            {selected && (() => {
              const salaryDisplay = realSalary(selected.estimatedSalary);
              const noticeDisplay = realNoticePeriod(selected.noticePeriod);
              const isSaved = savedIds.has(selected.id);

              return (
                <div style={{ flex: 1, overflowY: "auto" as const, background: S.pageBg, minWidth: 0 }}>
                  {/* HERO CARD */}
                  <div style={{ background: S.bg, borderBottom: `1px solid ${S.border}`, padding: "20px 24px" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: S.accent,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 21, fontWeight: 700, color: "#fff", flexShrink: 0,
                      }}>
                        {(selected.name && selected.name[0]) ? selected.name[0].toUpperCase() : "?"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ ...T.display, color: S.text }}>{titleCase(selected.name)}</div>
                            {selected.headline && (
                              <div style={{ ...T.body, color: S.textSecondary, marginTop: 3 }}>{selected.headline}</div>
                            )}
                            {selected.jobTitle && selected.employer && (
                              <div style={{ ...T.caption, color: S.textMuted, marginTop: 5 }}>
                                {titleCase(selected.jobTitle)} <span style={{ color: S.muted2 }}>at</span> {titleCase(selected.employer)}
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 14, marginTop: 5, alignItems: "center", flexWrap: "wrap" as const }}>
                              {selected.location && (
                                <div style={{ ...T.caption, color: S.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                                  <PinIcon size={11} />{titleCase(selected.location)}
                                </div>
                              )}
                              {selected.linkedinConnections != null && selected.linkedinConnections > 0 && (
                                <div style={{ ...T.caption, color: S.textMuted }}>
                                  {selected.linkedinConnections >= 500 ? "500+" : selected.linkedinConnections} connections
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            {selected.linkedinUrl && (
                              <a
                                href={selected.linkedinUrl}
                                target="_blank" rel="noreferrer"
                                title="View LinkedIn profile"
                                style={{
                                  width: 34, height: 34, borderRadius: 9,
                                  background: S.bg, border: `1px solid ${S.border}`,
                                  color: S.linkedin,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  textDecoration: "none", flexShrink: 0,
                                  transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f6ff"; e.currentTarget.style.borderColor = S.linkedin; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = S.bg; e.currentTarget.style.borderColor = S.border; }}
                              >
                                <LinkedInIcon size={17} />
                              </a>
                            )}
                            <button
                              onClick={() => handleSave(selected)}
                              title={isSaved ? "Saved" : "Save candidate"}
                              style={{
                                width: 34, height: 34, borderRadius: 9,
                                background: isSaved ? S.accentLight : S.bg,
                                border: `1px solid ${isSaved ? "#c4b5fd" : S.border}`,
                                color: isSaved ? S.accent : S.muted,
                                cursor: "pointer", fontFamily: font,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <BookmarkIcon filled={isSaved} size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selected.metrics && (
                      <div style={{ display: "flex", gap: 28, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${S.borderLight}` }}>
                        <div>
                          <div style={{ ...T.label, color: S.textMuted, marginBottom: 2 }}>Total Exp</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{selected.experienceYears}y</div>
                        </div>
                        {selected.metrics.csYears > 0 && (
                          <div>
                            <div style={{ ...T.label, color: S.textMuted, marginBottom: 2 }}>CS Exp</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: S.accent }}>{selected.metrics.csYears}y</div>
                          </div>
                        )}
                        {selected.metrics.currentTenureMonths != null && selected.metrics.currentTenureMonths > 0 && (
                          <div>
                            <div style={{ ...T.label, color: S.textMuted, marginBottom: 2 }}>Current</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{formatTenure(selected.metrics.currentTenureMonths)}</div>
                          </div>
                        )}
                        {selected.metrics.averageTenureMonths != null && selected.metrics.averageTenureMonths > 0 && (
                          <div>
                            <div style={{ ...T.label, color: S.textMuted, marginBottom: 2 }}>Avg Tenure</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{formatTenure(selected.metrics.averageTenureMonths)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FLOWING CONTENT */}
                  <div style={{ padding: "20px 24px" }}>

                    {selected.aiSummary && (
                      <div style={{ marginBottom: 24 }}>
                        <SectionLabel>About</SectionLabel>
                        <div style={{ ...T.body, color: S.textSecondary }}>{selected.aiSummary}</div>
                      </div>
                    )}

                    {selected.experienceTimeline && selected.experienceTimeline.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <SectionLabel
                          action={
                            selected.experienceTimeline.length > 4 ? (
                              <span onClick={() => setShowAllExperience(!showAllExperience)} style={{ ...T.caption, color: S.accent, cursor: "pointer", fontWeight: 500 }}>
                                {showAllExperience ? "Show less" : `Show all ${selected.experienceTimeline.length}`}
                              </span>
                            ) : null
                          }
                        >Experience</SectionLabel>
                        <div>
                          {(showAllExperience ? selected.experienceTimeline : selected.experienceTimeline.slice(0, 4)).map((exp, idx, arr) => (
                            <div key={idx} style={{
                              padding: "12px 0",
                              borderBottom: idx < arr.length - 1 ? `1px solid ${S.borderLight}` : "none",
                              position: "relative" as const, paddingLeft: 22,
                            }}>
                              <div style={{
                                position: "absolute" as const, left: 4, top: 17,
                                width: 8, height: 8, borderRadius: "50%",
                                background: exp.isCSRole ? S.accent : "#d4d4dc",
                                border: `2px solid ${exp.isPrimary ? S.accent : "#fff"}`,
                                boxShadow: exp.isPrimary ? `0 0 0 2px ${S.accentLight}` : "none",
                              }} />
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ ...T.body, fontWeight: 600, color: S.text, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                                    {titleCase(exp.title)}
                                    {exp.isCSRole && (
                                      <span style={{ fontSize: 9, background: S.accentLight, color: S.accent, padding: "1px 6px", borderRadius: 8, fontWeight: 600, letterSpacing: "0.04em" }}>CS</span>
                                    )}
                                  </div>
                                  <div style={{ ...T.caption, color: S.textSecondary, marginTop: 2 }}>
                                    {titleCase(exp.company)}
                                    {exp.companySize && (
                                      <span style={{ color: S.textMuted, marginLeft: 6 }}>· {formatCompanySize(exp.companySize)} ppl</span>
                                    )}
                                  </div>
                                  {exp.companyIndustry && (
                                    <div style={{ ...T.caption, color: S.textMuted, marginTop: 2, fontSize: 11 }}>{titleCase(exp.companyIndustry)}</div>
                                  )}
                                </div>
                                <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                                  <div style={{ ...T.caption, color: S.textMuted, whiteSpace: "nowrap" as const, fontSize: 11 }}>
                                    {formatPdlDate(exp.startDate)} – {formatPdlDate(exp.endDate)}
                                  </div>
                                  {exp.tenureMonths && exp.tenureMonths > 0 && (
                                    <div style={{ fontSize: 10, color: S.muted2, marginTop: 2 }}>{formatTenure(exp.tenureMonths)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.education && selected.education.filter(ed => ed.school && ed.school.trim()).length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <SectionLabel>Education</SectionLabel>
                        <div>
                          {selected.education.filter(ed => ed.school && ed.school.trim()).slice(0, 4).map((ed, idx, arr) => (
                            <div key={idx} style={{ padding: "10px 0", borderBottom: idx < arr.length - 1 ? `1px solid ${S.borderLight}` : "none" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ ...T.body, fontWeight: 600, color: S.text, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                                    {titleCase(ed.school)}
                                    {isEliteSchool(ed.school) && (
                                      <span style={{ fontSize: 9, background: "#fef3c7", color: "#a16207", padding: "1px 6px", borderRadius: 8, fontWeight: 600, letterSpacing: "0.04em" }}>ELITE</span>
                                    )}
                                  </div>
                                  {((ed.degrees && ed.degrees.length > 0) || (ed.majors && ed.majors.length > 0)) && (
                                    <div style={{ ...T.caption, color: S.textSecondary, marginTop: 2 }}>
                                      {ed.degrees?.[0] ? titleCase(ed.degrees[0]) : ""}
                                      {ed.majors && ed.majors.length > 0 ? ` · ${titleCase(ed.majors[0])}` : ""}
                                    </div>
                                  )}
                                </div>
                                {(ed.startDate || ed.endDate) && (
                                  <div style={{ ...T.caption, color: S.textMuted, whiteSpace: "nowrap" as const, flexShrink: 0, fontSize: 11 }}>
                                    {ed.startDate ? formatPdlDate(ed.startDate, { yearOnly: true }) : ""}
                                    {ed.startDate && ed.endDate ? " – " : ""}
                                    {ed.endDate ? formatPdlDate(ed.endDate, { yearOnly: true }) : ""}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.certifications && selected.certifications.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <SectionLabel
                          action={
                            selected.certifications.length > 5 ? (
                              <span onClick={() => setShowAllCertifications(!showAllCertifications)} style={{ ...T.caption, color: S.accent, cursor: "pointer", fontWeight: 500 }}>
                                {showAllCertifications ? "Show less" : `Show all ${selected.certifications.length}`}
                              </span>
                            ) : null
                          }
                        >Certifications</SectionLabel>
                        <div>
                          {(showAllCertifications ? selected.certifications : selected.certifications.slice(0, 5)).map((cert, idx, arr) => (
                            <div key={idx} style={{
                              padding: "8px 0",
                              borderBottom: idx < arr.length - 1 ? `1px solid ${S.borderLight}` : "none",
                              display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10,
                            }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ ...T.body, color: S.text }}>{titleCase(cert.name)}</div>
                                {cert.organization && (
                                  <div style={{ ...T.caption, color: S.textMuted, marginTop: 1, fontSize: 11 }}>{titleCase(cert.organization)}</div>
                                )}
                              </div>
                              {cert.startDate && (
                                <div style={{ ...T.caption, color: S.textMuted, whiteSpace: "nowrap" as const, flexShrink: 0, fontSize: 11 }}>
                                  {formatPdlDate(cert.startDate, { yearOnly: true })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.skills && selected.skills.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <SectionLabel
                          action={
                            selected.skills.length > 12 ? (
                              <span onClick={() => setShowAllSkills(!showAllSkills)} style={{ ...T.caption, color: S.accent, cursor: "pointer", fontWeight: 500 }}>
                                {showAllSkills ? "Show less" : `Show all ${selected.skills.length}`}
                              </span>
                            ) : null
                          }
                        >Skills</SectionLabel>
                        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                          {(showAllSkills ? selected.skills : selected.skills.slice(0, 12)).map((s) => (
                            <span key={s} style={{
                              background: S.accentLight, color: S.accent,
                              borderRadius: 14, padding: "4px 10px",
                              fontSize: 11, fontWeight: 500,
                            }}>{titleCase(s)}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: 24 }}>
                      <SectionLabel>Match Quality</SectionLabel>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                        <span style={{ ...T.caption, color: S.textSecondary }}>Tier {selected.tier} — {selected.matchScore} fit</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: S.accent }}>{selected.aiScore}%</span>
                      </div>
                      <div style={{ background: "#f0f0f6", borderRadius: 4, height: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${selected.aiScore}%`, height: "100%",
                          background: selected.aiScore >= 80 ? S.green : selected.aiScore >= 60 ? S.amber : S.red,
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                    </div>

                    {(salaryDisplay || noticeDisplay || selected.location || selected.experienceYears || selected.employerSize || selected.employerIndustry) && (
                      <div style={{ marginBottom: 16 }}>
                        <SectionLabel>Details</SectionLabel>
                        <div>
                          {salaryDisplay && <FieldRow label="Salary range" value={salaryDisplay} />}
                          {noticeDisplay && <FieldRow label="Notice period" value={noticeDisplay} />}
                          <FieldRow label="Location" value={titleCase(selected.location)} />
                          <FieldRow label="Experience" value={`${selected.experienceYears} years`} />
                          {selected.employerSize && <FieldRow label="Company size" value={`${selected.employerSize} employees`} />}
                          {selected.employerIndustry && <FieldRow label="Industry" value={titleCase(selected.employerIndustry)} />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        )}

        {activeNav !== "sourcing" && activeNav !== "saved" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, color: S.muted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🚧</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#333" }}>Coming Soon</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>This feature is under development</div>
          </div>
        )}

      </div>

      {/* ─── EDIT QUERY MODAL ──────────────────── */}
      {editQueryOpen && (
        <ModalShell onClose={() => setEditQueryOpen(false)} maxWidth={720}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: S.text }}>Edit Query</div>
              <div style={{ fontSize: 12, color: S.muted, marginTop: 4 }}>
                Tweak filters and criteria, then re-run as a new search.
              </div>
            </div>
            <button
              onClick={() => setEditQueryOpen(false)}
              style={{ background: "transparent", border: "none", fontSize: 20, color: S.muted, cursor: "pointer", padding: 0, lineHeight: 1 }}
            >×</button>
          </div>

          {currentParagraph && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...T.label, color: S.textMuted, marginBottom: 6 }}>Original query</div>
              <div style={{
                background: "#fafafa", border: `1px solid ${S.borderLight}`,
                borderRadius: 8, padding: "10px 12px",
                fontSize: 13, color: S.textSecondary, lineHeight: 1.5,
              }}>
                {currentParagraph}
              </div>
              <div style={{ fontSize: 11, color: S.textMuted, marginTop: 5 }}>
                Paragraph is locked. Edit chips below to refine the search.
              </div>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${S.borderLight}`, paddingTop: 14, marginTop: 6 }}>
            <SearchForm
              onSearch={(f, ctx) => {
                setEditQueryOpen(false);
                const criteria = ctx?.scoringContext || null;
                handleSmartSearch(f, criteria, { paragraph: currentParagraph });
              }}
              loading={loading}
              outOfCredits={outOfCredits}
              initialFilters={currentFilters}
            />
          </div>
        </ModalShell>
      )}

      {/* ─── SEARCHES LIST MODAL ──────────────── */}
      {searchListOpen && (
        <ModalShell onClose={() => setSearchListOpen(false)} maxWidth={620}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: S.text }}>All Searches</div>
              <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>
                Click any search to load its results
              </div>
            </div>
            <button
              onClick={() => setSearchListOpen(false)}
              style={{ background: "transparent", border: "none", fontSize: 20, color: S.muted, cursor: "pointer", padding: 0, lineHeight: 1 }}
            >×</button>
          </div>

          <div style={{ marginTop: 16, maxHeight: "60vh", overflowY: "auto" as const }}>
            {searchHistory.length === 0 ? (
              <div style={{ padding: "30px 0", textAlign: "center" as const, color: S.muted, fontSize: 13 }}>
                No searches yet. Start a new search to see it here.
              </div>
            ) : (
              searchHistory.slice().reverse().map((s) => {
                const isActive = currentSearchId === s.id;
                const preview = s.searchParagraph
                  || (s.jobDescription && !s.jobDescription.startsWith("{") ? s.jobDescription : "")
                  || "No paragraph saved";
                return (
                  <div
                    key={s.id}
                    onClick={() => loadSavedSearch(s)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 8,
                      marginBottom: 6,
                      cursor: "pointer",
                      border: `1px solid ${isActive ? S.accent : S.borderLight}`,
                      background: isActive ? S.accentLight : "#fff",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#fafafa"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "#fff"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: S.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                        🔍 {s.searchTitle || "Untitled"}
                      </div>
                      <div style={{ fontSize: 11, color: S.muted, flexShrink: 0 }}>
                        {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: S.muted, marginTop: 4, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                      {preview}
                    </div>
                    <div style={{ fontSize: 11, color: S.textMuted, marginTop: 5 }}>
                      {s.resultsCount ?? 0} {(s.resultsCount ?? 0) === 1 ? "result" : "results"}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${S.borderLight}` }}>
            <button
              onClick={() => {
                setSearchListOpen(false);
                setSearched(false); setCandidates([]); setSelected(null);
                setActiveNav("sourcing");
                setCurrentSearchId(null); setCurrentFilters(null);
                setCurrentParagraph(null); setCurrentCriteria(null);
                setResultsAreCached(false); setCachedAt(null);
                setEditingFilters(null);
              }}
              style={{ background: S.accent, color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              + New Search
            </button>
          </div>
        </ModalShell>
      )}

      {/* ─── OUT-OF-CREDITS MODAL ──────────────────────────────── */}
      {outOfCreditsModalOpen && (
        <ModalShell onClose={() => setOutOfCreditsModalOpen(false)} maxWidth={420}>
          <div style={{ textAlign: "center" as const, padding: "8px 4px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💳</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 8 }}>
              You've used all your free searches
            </div>
            <div style={{ fontSize: 13, color: S.textSecondary, marginBottom: 20, lineHeight: 1.5 }}>
              Please upgrade to a paid plan for unlimited search access. Saved searches remain free to view.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={() => setOutOfCreditsModalOpen(false)}
                style={{ background: "#fff", border: `1px solid ${S.border}`, color: S.textSecondary, borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: font }}
              >
                Close
              </button>
              <button
                onClick={() => { setOutOfCreditsModalOpen(false); }}
                style={{ background: S.accent, color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}
              >
                Buy Credits
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Modal Shell ─────────────────────────────────────────────
function ModalShell({ onClose, maxWidth = 600, children }: { onClose: () => void; maxWidth?: number; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.42)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 16,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12,
          maxWidth, width: "100%", maxHeight: "85vh",
          overflowY: "auto" as const,
          padding: "20px 22px",
          boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {children}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}