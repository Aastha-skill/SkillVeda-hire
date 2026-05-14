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

  // ─── §8 Current company industries ────────────────────────────────────
  // No runtime validation (~420 values) — trust the extractor's prompt.
  const industries = (spec.current_company?.industries || [])
    .map(s => String(s).toLowerCase().trim())
    .filter(Boolean);
  if (industries.length === 1) {
    filters.push({ term: { job_company_industry_v2: industries[0] } });
  } else if (industries.length > 1) {
    filters.push({ terms: { job_company_industry_v2: industries } });
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

  // ─── §13 Past experience (only added when explicitly required) ────────
  const pastSubRoles = filterCanonical(
    spec.past_experience?.sub_roles, SUB_ROLES, "experience.title.sub_role"
  );
  if (pastSubRoles.length === 1) {
    filters.push({ term: { "experience.title.sub_role": pastSubRoles[0] } });
  } else if (pastSubRoles.length > 1) {
    filters.push({ terms: { "experience.title.sub_role": pastSubRoles } });
  }

  const pastIndustries = (spec.past_experience?.industries || [])
    .map(s => String(s).toLowerCase().trim())
    .filter(Boolean);
  if (pastIndustries.length === 1) {
    filters.push({ term: { "experience.company.industry_v2": pastIndustries[0] } });
  } else if (pastIndustries.length > 1) {
    filters.push({ terms: { "experience.company.industry_v2": pastIndustries } });
  }

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

  // ─── Assemble final request ──────────────────────────────────────────
  return {
    dataset: options.dataset || "all",
    size: options.size || 25,
    ...(options.from != null && { from: options.from }),
    updated_title_roles: true, // required for v28.0+ taxonomy
    query: {
      bool: {
        filter: filters,
      },
    },
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
