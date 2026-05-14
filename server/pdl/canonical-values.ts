// server/pdl/canonical-values.ts
// Runtime validation lists. The extractor's output is checked against
// these sets before being passed to the query builder — anything that's
// not a valid canonical value gets dropped (with a warning logged).

/** §1 — all 24 PDL job_title_role values (v28.0+) */
export const ROLES = new Set([
  "advisory", "analyst", "creative", "education", "engineering", "finance",
  "fulfillment", "health", "hospitality", "human_resources", "legal",
  "manufacturing", "marketing", "operations", "partnerships", "product",
  "professional_service", "public_service", "research", "sales",
  "sales_engineering", "support", "trade", "unemployed",
]);

/** §2 — all 105 PDL job_title_sub_role values (v28.0+) */
export const SUB_ROLES = new Set([
  "academic", "account_executive", "account_management", "accounting",
  "accounting_services", "administrative", "advisor", "agriculture", "aides",
  "architecture", "artist", "board_member", "bookkeeping", "brand",
  "building_and_grounds", "business_analyst", "business_development",
  "chemical", "compliance", "construction", "consulting", "content",
  "corporate_development", "curation", "customer_success", "customer_support",
  "data_analyst", "data_engineering", "data_science", "dental", "devops",
  "doctor", "electric", "electrical", "emergency_services", "entertainment",
  "executive", "fashion", "financial", "fitness", "fraud", "graphic_design",
  "growth", "hair_stylist", "hardware", "health_and_safety", "human_resources",
  "implementation", "industrial", "information_technology", "insurance",
  "investment_banking", "investor", "investor_relations", "journalism",
  "judicial", "legal", "legal_services", "logistics", "machinist",
  "marketing_design", "marketing_services", "mechanic", "mechanical",
  "military", "network", "nursing", "partnerships", "pharmacy",
  "planning_and_analysis", "plumbing", "political", "primary_and_secondary",
  "procurement", "product_design", "product_management", "professor",
  "project_management", "protective_service", "qa_engineering",
  "quality_assurance", "realtor", "recruiting", "restaurants", "retail",
  "revenue_operations", "risk", "sales_development", "scientific", "security",
  "social_service", "software", "solutions_engineer", "strategy", "student",
  "talent_analytics", "therapy", "tour_and_travel", "training", "translation",
  "transport", "unemployed", "veterinarian", "warehouse", "web", "wellness",
]);

/** §3 — all 10 job_title_levels values */
export const LEVELS = new Set([
  "cxo", "director", "entry", "manager", "owner",
  "partner", "senior", "training", "unpaid", "vp",
]);

/** §9 — all 8 job_company_size buckets (exact strings, case-sensitive) */
export const COMPANY_SIZES = new Set([
  "1-10", "11-50", "51-200", "201-500",
  "501-1000", "1001-5000", "5001-10000", "10001+",
]);

/** §10 — all 10 job_company_inferred_revenue buckets */
export const REVENUE_RANGES = new Set([
  "$0", "$1M-$10M", "$10M-$25M", "$25M-$50M", "$50M-$100M",
  "$100M-$250M", "$250M-$500M", "$500M-$1B", "$1B-$10B", "$10B+",
]);

/** §11 — all 29 funding_stages values */
export const FUNDING_STAGES = new Set([
  "angel", "convertible_note", "corporate_round", "debt_financing",
  "equity_crowdfunding", "funding_round", "grant", "initial_coin_offering",
  "non_equity_assistance", "post_ipo_debt", "post_ipo_equity",
  "post_ipo_secondary", "pre_seed", "private_equity", "product_crowdfunding",
  "secondary_market", "seed", "series_a", "series_b", "series_c", "series_d",
  "series_e", "series_f", "series_g", "series_h", "series_i", "series_j",
  "series_unknown", "undisclosed",
]);

/**
 * Common suffixes Haiku adds to sub_role values by accident (copying recruiter
 * title text into the canonical slot). Strip these and re-check canonicality.
 */
const SUFFIX_PATTERNS = [
  "_manager",
  "_executive",
  "_specialist",
  "_associate",
  "_representative",
  "_rep",
  "_lead",
  "_analyst",
  "_consultant",
  "_engineer",
  "_director",
  "_coordinator",
  "_officer",
];

/**
 * If a value doesn't match a canonical set, try stripping common Haiku-added
 * suffixes and check again. Returns the cleaned canonical value if found,
 * else null.
 */
function tryCleanSuffix(
  value: string,
  validSet: Set<string>
): string | null {
  const normalized = value.toLowerCase().trim();
  for (const suffix of SUFFIX_PATTERNS) {
    if (normalized.endsWith(suffix)) {
      const cleaned = normalized.slice(0, -suffix.length);
      if (validSet.has(cleaned)) {
        return cleaned;
      }
    }
  }
  // Also try noun→action swaps: "account_manager" → "account_management",
  // "sales_developer" → "sales_development", etc.
  const noun_to_action: Record<string, string> = {
    "_manager": "_management",
    "_developer": "_development",
    "_engineer": "_engineering",
    "_analyst": "_analytics",
  };
  for (const [from, to] of Object.entries(noun_to_action)) {
    if (normalized.endsWith(from)) {
      const transformed = normalized.slice(0, -from.length) + to;
      if (validSet.has(transformed)) {
        return transformed;
      }
    }
  }
  return null;
}

/**
 * Filter an array to only canonical values from the given set.
 * Logs anything that gets dropped so we can audit extractor mistakes.
 */
export function filterCanonical(
  values: string[] | undefined,
  validSet: Set<string>,
  fieldName: string
): string[] {
  if (!values || !Array.isArray(values)) return [];
  const out: string[] = [];
  for (const v of values) {
    const normalized = String(v).toLowerCase().trim();
    if (validSet.has(normalized)) {
      out.push(normalized);
      continue;
    }
    const cleaned = tryCleanSuffix(normalized, validSet);
    if (cleaned) {
      // eslint-disable-next-line no-console
      console.warn(
        `[pdl] Auto-corrected non-canonical value for ${fieldName}: "${v}" → "${cleaned}"`
      );
      out.push(cleaned);
      continue;
    }
    // eslint-disable-next-line no-console
    console.warn(
      `[pdl] Dropped non-canonical value for ${fieldName}: "${v}"`
    );
  }
  return out;
}

/**
 * Validate a single canonical value (returns null if invalid).
 */
export function validateCanonical(
  value: string | null | undefined,
  validSet: Set<string>,
  fieldName: string
): string | null {
  if (!value) return null;
  const normalized = String(value).toLowerCase().trim();
  if (validSet.has(normalized)) return normalized;

  // Try to recover from common Haiku suffix mistakes
  const cleaned = tryCleanSuffix(normalized, validSet);
  if (cleaned) {
    // eslint-disable-next-line no-console
    console.warn(
      `[pdl] Auto-corrected non-canonical value for ${fieldName}: "${value}" → "${cleaned}"`
    );
    return cleaned;
  }

  // eslint-disable-next-line no-console
  console.warn(
    `[pdl] Dropped non-canonical value for ${fieldName}: "${value}"`
  );
  return null;
}

/**
 * Industries v2 has ~420 values — too many to enum here. We trust the
 * extractor to pick from canonical-reference.md §8 (which is in its prompt).
 * If you want strict validation, generate INDUSTRIES_V2 from the doc and
 * use filterCanonical the same way.
 *
 * Same for education.degrees — 161 values, leave to the prompt to enforce.
 */
