// server/pdl/types.ts
// Shared types for the SkillVeda Hire PDL search pipeline.

/**
 * Structured spec produced by the extractor from a recruiter's input.
 * Schema mirrors §18 of canonical-reference.md.
 * Every string field must hold a canonical PDL value (lowercase, exact).
 */
export interface SearchSpec {
  current_role: {
    /** §1 — pick one canonical role or null */
    role: string | null;
    /** §2 — pick one canonical sub_role or null (more specific than role) */
    sub_role: string | null;
    /** §3 — array of canonical levels (a person can match multiple) */
    levels: string[];
  };
  current_company: {
    /** §8 — array of canonical industries_v2 strings */
    industries: string[];
    /** §9 — array of canonical company size buckets */
    sizes: string[];
    /** §11 — array of canonical funding stage strings */
    funding_stages: string[];
  };
  past_experience: {
    /** §8 — past employer industries */
    industries: string[];
    /** §2 — past sub_roles ("has been a CSM before") */
    sub_roles: string[];
    /** Free-form, lowercase employer names ("worked at Salesforce") */
    company_names: string[];
  };
  location: {
    /** Always "india" in current scope */
    country: "india";
    /** §6 — Indian state/UT canonical name, or null */
    region: string | null;
    /** §7 — city canonical name OR region group key ("ncr", "tier_1", etc.) or null */
    locality: string | null;
  };
  years_experience: {
    min: number | null;
    max: number | null;
  };
  education: {
    /** §12 — array of canonical degree strings */
    degrees: string[];
  };
  /**
   * Companies the candidate must have worked at — either as current employer
   * OR as a past employer. Combined with `should` so any match qualifies.
   * Lowercase, free-form (e.g. ["razorpay", "freshworks", "zoho"]).
   */
  target_companies: string[];

  /**
   * Free-form skills the candidate should have (PDL's `skills` field is
   * free-text, no canonical enum). Lowercase (e.g. ["salesforce", "gainsight"]).
   */
  skills: string[];
}

/**
 * The shape of an Elasticsearch query clause PDL accepts.
 * PDL only supports these clause types: term, terms, exists, bool, match,
 * range, match_phrase, wildcard, prefix, match_all.
 */
export type EsClause =
  | { term: Record<string, string | number | boolean> }
  | { terms: Record<string, (string | number)[]> }
  | { exists: { field: string } }
  | { range: Record<string, { gte?: number | string; lte?: number | string; gt?: number | string; lt?: number | string }> }
  | { match: Record<string, string> }
  | { match_phrase: Record<string, string> }
  | { wildcard: Record<string, string> }
  | { prefix: Record<string, string> }
  | { match_all: object }
  | { bool: BoolClause };

export interface BoolClause {
  filter?: EsClause[];
  must?: EsClause[];
  should?: EsClause[];
  must_not?: EsClause[];
  minimum_should_match?: number;
}

/**
 * Full PDL Person Search API request body.
 * See https://docs.peopledatalabs.com/docs/input-parameters-person-search-api
 */
export interface PdlSearchRequest {
  /** Always "all" for max coverage — default of "resume" restricts the pool */
  dataset: string;
  /** 1-1000. Use 25 for normal searches; each returned record = 1 credit */
  size: number;
  query: { bool: BoolClause };
  /** Optional — only set if doing pagination */
  from?: number;
  /** Optional — pretty print (debugging only) */
  pretty?: boolean;
  /** Required for v28.0+ taxonomy with job_title_class */
  updated_title_roles?: boolean;
}

/**
 * Recruiter input — either structured form fields or a free-text JD.
 * The pipeline routes based on which one is populated.
 */
export interface RecruiterInput {
  /** Free-text JD / natural-language search. Goes through the LLM extractor. */
  jd_text?: string;
  /** Structured form. Skips the LLM and goes straight to query builder. */
  form?: Partial<SearchSpec>;
  /** Pagination */
  size?: number;
  from?: number;
}
