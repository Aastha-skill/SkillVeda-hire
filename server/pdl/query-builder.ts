// server/pdl/query-builder.ts
// Pure deterministic query builder. No LLM calls, no I/O.
// Takes a SearchSpec (from the extractor or the form) and emits a PDL ES query.
//
// Latency target: <10ms. Treat as a hot-path function.

import type { SearchSpec, PdlSearchRequest, EsClause } from "./types";
import { resolveLocality } from "./india-locations";
import {
  ROLES, SUB_ROLES, LEVELS, COMPANY_SIZES, FUNDING_STAGES,
  filterCanonical, validateCanonical,
} from "./canonical-values";

/**
 * Keywords that signal a technical role. Matched as match_phrase against
 * job_title and headline. Substring match — "tech support" hits "Tech
 * Support Specialist", "Software Tech Support", "Junior Tech Support",
 * etc.
 *
 * Applied only when:
 *   - spec.current_role.sub_role is "customer_support" or "customer_success"
 *   - spec.include_technical_support is false
 *
 * We exclude technical roles from CS searches by default because PDL's
 * customer_support / customer_success sub_role tags are loose and catch
 * product/technical/L2/help-desk support roles. The keyword signal on
 * job_title and headline is a more reliable filter than relying on
 * sub_role alone.
 *
 * We deliberately do NOT match against summary or job_summary fields —
 * legitimate customer support people often mention "troubleshoot" in
 * their summary even though they're customer-facing.
 */
const TECHNICAL_SIGNAL_KEYWORDS = [
  // Support-domain technical
  "tech support",
  "technical support",
  "product support",
  "application support",
  "system support",
  "systems support",
  "network support",
  "desktop support",
  "infrastructure support",
  "engineering support",
  "developer support",
  "support engineer",
  "support architect",
  "helpdesk",
  "help desk",
  "service desk",
  // Tier / level
  "l1 support",
  "l2 support",
  "l3 support",
  "tier 1 support",
  "tier 2 support",
  "tier 3 support",
  // Engineering roles
  "software engineer",
  "software developer",
  "devops engineer",
  "cloud engineer",
  "data engineer",
  "test engineer",
  "qa engineer",
  "sre",
  "site reliability",
];

/**
 * Options for building a query.
 */
export interface BuildOptions {
  /** Number of candidates to fetch (default 25). PDL charges per record. */
  size?: number;
  /** Pagination offset */
  from?: number;
  /** Force dataset (default "all") */
  dataset?: string;
}

/**
 * Build a PDL Person Search request from a structured spec.
 *
 * Applies all rules from §17 of canonical-reference.md:
 *  - dataset always "all" (unless overridden)
 *  - size set explicitly
 *  - filter clauses, not must (faster, no scoring)
 *  - terms for arrays, term for single values
 *  - region groups expanded into city lists
 *  - city names expanded to spelling variants
 *  - inferred_years_experience widened ±1 from spec
 *  - no location_metro (US-only)
 */
export function buildPdlQuery(
  spec: SearchSpec,
  options: BuildOptions = {}
): PdlSearchRequest {
  const filters: EsClause[] = [];

  // ─── §5 Location: country (always India in current scope) ──────────────
  filters.push({ term: { location_country: "india" } });

  // ─── §6/§7 Location: region or locality ───────────────────────────────
  // Locality (city or region group) takes precedence over region (state)
  // because it's more specific. If both are set, prefer locality.
  if (spec.location?.locality) {
    const resolved = resolveLocality(spec.location.locality);
    if (resolved) {
      if (resolved.localities && resolved.localities.length > 0) {
        filters.push({
          terms: { location_locality: resolved.localities },
        });
      }
      if (resolved.regions && resolved.regions.length > 0) {
        filters.push({
          terms: { location_region: resolved.regions },
        });
      }
    }
  } else if (spec.location?.region) {
    // No city specified — fall back to state filter
    filters.push({ term: { location_region: spec.location.region } });
  }

  // ─── §1 Current role ──────────────────────────────────────────────────
  // Prefer sub_role (more precise) over role (broader).
  // If both are set, use only sub_role to keep the pool wider.
  const subRole = validateCanonical(
    spec.current_role?.sub_role, SUB_ROLES, "job_title_sub_role"
  );
  const role = validateCanonical(
    spec.current_role?.role, ROLES, "job_title_role"
  );

  if (subRole) {
    filters.push({ term: { job_title_sub_role: subRole } });
  } else if (role) {
    filters.push({ term: { job_title_role: role } });
  }

  // ─── §3 Current levels ────────────────────────────────────────────────
  const levels = filterCanonical(
    spec.current_role?.levels, LEVELS, "job_title_levels"
  );
  if (levels.length === 1) {
    filters.push({ term: { job_title_levels: levels[0] } });
  } else if (levels.length > 1) {
    filters.push({ terms: { job_title_levels: levels } });
  }

  // ─── §4 Years of experience (with ±1 noise tolerance) ────────────────
  const minYears = spec.years_experience?.min;
  const maxYears = spec.years_experience?.max;
  if (minYears != null || maxYears != null) {
    const range: { gte?: number; lte?: number } = {};
    if (typeof minYears === "number") {
      range.gte = Math.max(0, minYears - 1); // widen lower bound by 1
    }
    if (typeof maxYears === "number") {
      range.lte = maxYears + 1; // widen upper bound by 1
    }
    filters.push({ range: { inferred_years_experience: range } });
  }

  // ─── §8 Industries (current OR past) ──────────────────────────────────
  // Per §13 of canonical doc: experience.company.industry_v2 matches BOTH
  // current and past employers (PDL flattens the experience array and
  // treats the current job as the most recent entry). One filter covers
  // both "currently in X" and "ever worked in X" intent.
  // Merge spec.current_company.industries and spec.past_experience.industries.
  // No runtime validation (~420 values) — trust the extractor's prompt.
  const combinedIndustries = Array.from(new Set(
    [
      ...(spec.current_company?.industries || []),
      ...(spec.past_experience?.industries || []),
    ]
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean)
  ));
  if (combinedIndustries.length === 1) {
    filters.push({ term: { "experience.company.industry_v2": combinedIndustries[0] } });
  } else if (combinedIndustries.length > 1) {
    filters.push({ terms: { "experience.company.industry_v2": combinedIndustries } });
  }

  // ─── §9 Current company sizes ─────────────────────────────────────────
  const sizes = filterCanonical(
    spec.current_company?.sizes, COMPANY_SIZES, "job_company_size"
  );
  if (sizes.length === 1) {
    filters.push({ term: { job_company_size: sizes[0] } });
  } else if (sizes.length > 1) {
    filters.push({ terms: { job_company_size: sizes } });
  }

  // ─── §11 Current company funding stages ───────────────────────────────
  const fundingStages = filterCanonical(
    spec.current_company?.funding_stages, FUNDING_STAGES, "job_company_funding_stages"
  );
  if (fundingStages.length === 1) {
    filters.push({ term: { job_company_funding_stages: fundingStages[0] } });
  } else if (fundingStages.length > 1) {
    filters.push({ terms: { job_company_funding_stages: fundingStages } });
  }

  // ─── §13 Past experience — company names only ─────────────────────────
  // Past sub_roles intentionally NOT filtered: experience.title.sub_role
  // is redundant when job_title_sub_role is already gated (per §17 RULE 5)
  // and over-restrictive for entry-level candidates with only one job.
  // Past industries are merged into the combined industries filter above.
  const pastCompanyNames = (spec.past_experience?.company_names || [])
    .map(s => String(s).toLowerCase().trim())
    .filter(Boolean);
  if (pastCompanyNames.length === 1) {
    filters.push({ term: { "experience.company.name": pastCompanyNames[0] } });
  } else if (pastCompanyNames.length > 1) {
    filters.push({ terms: { "experience.company.name": pastCompanyNames } });
  }

  // ─── §12 Education degrees ────────────────────────────────────────────
  // No runtime validation (~161 values) — trust the extractor's prompt.
  const degrees = (spec.education?.degrees || [])
    .map(s => String(s).toLowerCase().trim())
    .filter(Boolean);
  if (degrees.length === 1) {
    filters.push({ term: { "education.degrees": degrees[0] } });
  } else if (degrees.length > 1) {
    filters.push({ terms: { "education.degrees": degrees } });
  }

  // ─── Target companies (must have worked at, current OR past) ─────────
  // Uses a nested bool with should clauses so either current job OR any
  // past job matching the company name qualifies.
  const targetCompanies = (spec.target_companies || [])
    .map(s => String(s).toLowerCase().trim())
    .filter(Boolean);
  if (targetCompanies.length > 0) {
    filters.push({
      bool: {
        should: [
          { terms: { "job_company_name": targetCompanies } },
          { terms: { "experience.company.name": targetCompanies } },
        ],
        minimum_should_match: 1,
      },
    } as EsClause);
  }

  // ─── Skills (free-form keyword match, no canonical enum) ─────────────
  const skills = (spec.skills || [])
    .map(s => String(s).toLowerCase().trim())
    .filter(Boolean);
  if (skills.length === 1) {
    filters.push({ term: { skills: skills[0] } });
  } else if (skills.length > 1) {
    filters.push({ terms: { skills: skills } });
  }

  // ─── Technical-support exclusion (customer-facing searches only) ─────
  // When the JD doesn't ask for technical support, exclude candidates whose
  // job_title or headline contains technical-signal keywords. Only applies
  // to customer_support / customer_success sub_role searches; ignored for
  // every other sub_role.
  const boolQuery: { filter: EsClause[]; must_not?: EsClause[] } = { filter: filters };

  const isCustomerFacingSearch =
    spec.current_role?.sub_role === "customer_support" ||
    spec.current_role?.sub_role === "customer_success";

  if (isCustomerFacingSearch && !spec.include_technical_support) {
    const mustNot: EsClause[] = [];
    for (const keyword of TECHNICAL_SIGNAL_KEYWORDS) {
      // job_title is a keyword field in PDL; match_phrase requires the .text
      // sub-field for tokenized/substring matching. Without .text, "technical
      // support" only matches if the whole title is literally "technical support",
      // missing "junior technical support specialist" and similar variants.
      // Verified via PDL ES mapping doc + live debug query.
      mustNot.push({ match_phrase: { "job_title.text": keyword } });
      mustNot.push({ match_phrase: { headline: keyword } });
    }
    boolQuery.must_not = mustNot;
  }

  // ─── Assemble final request ──────────────────────────────────────────
  return {
    dataset: options.dataset || "all",
    size: options.size || 25,
    ...(options.from != null && { from: options.from }),
    updated_title_roles: true, // required for v28.0+ taxonomy
    query: { bool: boolQuery },
  };
}

/**
 * Quick estimate of how many "must-match" conditions are in the query.
 * Useful for telling whether a query is too narrow before firing it.
 */
export function countFilters(req: PdlSearchRequest): number {
  return req.query.bool.filter?.length || 0;
}

/**
 * Returns true if a query has zero non-location filters — i.e., it's so
 * broad that PDL will return whoever lives in India regardless of role.
 * Use this as a sanity check before sending.
 */
export function isQueryTooBroad(req: PdlSearchRequest): boolean {
  const nonLocationFilterCount = (req.query.bool.filter || []).filter(c => {
    const key = Object.keys(c)[0] as keyof typeof c;
    const field = Object.keys((c as Record<string, Record<string, unknown>>)[key])[0];
    return !field.startsWith("location_");
  }).length;
  return nonLocationFilterCount === 0;
}
