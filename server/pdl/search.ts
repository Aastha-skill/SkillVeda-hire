// server/pdl/search.ts
// Main entry point for SkillVeda Hire's PDL search pipeline.
//
// Routes input:
//   - Free-text JD → extractor (Haiku) → query builder → PDL
//   - Structured form → query builder → PDL (no LLM)
//
// Logs every step for the eval set.

import type { RecruiterInput, SearchSpec, PdlSearchRequest } from "./types";
import { extractSearchSpec } from "./extractor";
import { buildPdlQuery, isQueryTooBroad } from "./query-builder";

const PDL_API_KEY = process.env.PDL_API_KEY;
if (!PDL_API_KEY) {
  console.warn("[pdl] PDL_API_KEY not set. Search will fail at runtime.");
}

const PDL_SEARCH_URL = "https://api.peopledatalabs.com/v5/person/search";

export interface SearchResult {
  /** The candidates PDL returned (raw records). */
  candidates: PdlPersonRecord[];
  /** Total matches in PDL for this query (may be larger than candidates.length). */
  total: number;
  /** Trace info for logging / debugging / eval. */
  trace: SearchTrace;
}

export interface SearchTrace {
  inputType: "form" | "jd_text";
  inputText: string | null;
  spec: SearchSpec;
  query: PdlSearchRequest;
  extractorLatencyMs: number;
  extractorTokens: {
    input: number;
    output: number;
    cache_read: number;
    cache_creation: number;
  };
  pdlLatencyMs: number;
  pdlCreditsUsed: number;
  warnings: string[];
}

/** Shape of a PDL person record (only the fields we care about for scoring). */
export interface PdlPersonRecord {
  id: string;
  full_name: string | null;
  job_title: string | null;
  job_company_name: string | null;
  job_title_role: string | null;
  job_title_sub_role: string | null;
  job_title_levels: string[] | null;
  job_company_industry_v2: string | null;
  job_company_size: string | null;
  location_country: string | null;
  location_locality: string | null;
  location_region: string | null;
  inferred_years_experience: number | null;
  linkedin_url: string | null;
  linkedin_connections: number | null;
  headline: string | null;
  summary: string | null;
  job_summary: string | null;
  skills: string[] | null;
  experience: Array<{
    title?: { name: string | null; role: string | null; sub_role: string | null; levels: string[] | null };
    company?: { name: string | null; industry_v2: string | null; size: string | null };
    start_date: string | null;
    end_date: string | null;
    summary: string | null;
    is_primary: boolean | null;
  }> | null;
  education: Array<{
    school: { name: string | null; type: string | null } | null;
    degrees: string[] | null;
    majors: string[] | null;
    start_date: string | null;
    end_date: string | null;
  }> | null;
  // ...additional fields can be added as needed; PDL returns ~150 fields
}

/**
 * Main search function. Call this from your API route.
 *
 * Example:
 *   const result = await runPdlSearch({ jd_text: "Customer Success Manager in Bangalore, 1-2 yrs" });
 *   // result.candidates → array of 25 PDL records
 *   // result.trace → full audit trail for logging
 */
export async function runPdlSearch(
  input: RecruiterInput
): Promise<SearchResult> {
  const warnings: string[] = [];

  // Step 1: Get the SearchSpec — either from form fields or via the extractor
  let spec: SearchSpec;
  let extractorLatencyMs = 0;
  let extractorTokens = {
    input: 0, output: 0, cache_read: 0, cache_creation: 0,
  };

  if (input.form) {
    // Form path — no LLM call
    spec = mergeWithDefaults(input.form);
  } else if (input.jd_text) {
    // JD path — extract via Haiku
    const result = await extractSearchSpec(input.jd_text);
    spec = result.spec;
    extractorLatencyMs = result.latencyMs;
    extractorTokens = {
      input: result.usage.input_tokens,
      output: result.usage.output_tokens,
      cache_read: result.usage.cache_read_input_tokens ?? 0,
      cache_creation: result.usage.cache_creation_input_tokens ?? 0,
    };
  } else {
    throw new Error(
      "[pdl] Either input.jd_text or input.form must be provided"
    );
  }

  // Step 2: Build the PDL query
  const query = buildPdlQuery(spec, {
    size: input.size ?? 25,
    from: input.from,
  });

  if (isQueryTooBroad(query)) {
    warnings.push(
      "Query has no role/industry/experience filters — only location. Will return very broad results."
    );
  }

  // Step 3: Call PDL Person Search
  const pdlStart = Date.now();
  const pdlResponse = await fetch(PDL_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": PDL_API_KEY ?? "",
    },
    body: JSON.stringify(query),
  });
  const pdlLatencyMs = Date.now() - pdlStart;

  if (!pdlResponse.ok) {
    const errBody = await pdlResponse.text();
    throw new Error(
      `[pdl] PDL Person Search failed: ${pdlResponse.status} ${pdlResponse.statusText}. Body: ${errBody.slice(0, 500)}`
    );
  }

  const pdlData = await pdlResponse.json() as {
    status: number;
    data: PdlPersonRecord[];
    total?: number;
    error?: { message: string };
  };

  if (pdlData.error) {
    throw new Error(`[pdl] PDL returned error: ${pdlData.error.message}`);
  }

  const candidates = pdlData.data || [];

  // Step 4: Build the trace and return
  const trace: SearchTrace = {
    inputType: input.form ? "form" : "jd_text",
    inputText: input.jd_text ?? null,
    spec,
    query,
    extractorLatencyMs,
    extractorTokens,
    pdlLatencyMs,
    pdlCreditsUsed: candidates.length, // PDL charges 1 credit per returned record
    warnings,
  };

  // Log the full trace for the eval set
  await logSearchTrace(trace, candidates);

  return {
    candidates,
    total: pdlData.total ?? candidates.length,
    trace,
  };
}

/**
 * Merge a partial form spec with defaults so the query builder never sees
 * missing keys.
 */
function mergeWithDefaults(partial: Partial<SearchSpec>): SearchSpec {
  return {
    current_role: {
      role: partial.current_role?.role ?? null,
      sub_role: partial.current_role?.sub_role ?? null,
      levels: partial.current_role?.levels ?? [],
    },
    current_company: {
      industries: partial.current_company?.industries ?? [],
      sizes: partial.current_company?.sizes ?? [],
      funding_stages: partial.current_company?.funding_stages ?? [],
    },
    past_experience: {
      industries: partial.past_experience?.industries ?? [],
      sub_roles: partial.past_experience?.sub_roles ?? [],
      company_names: partial.past_experience?.company_names ?? [],
    },
    location: {
      country: "india",
      region: partial.location?.region ?? null,
      locality: partial.location?.locality ?? null,
    },
    years_experience: {
      min: partial.years_experience?.min ?? null,
      max: partial.years_experience?.max ?? null,
    },
    education: {
      degrees: partial.education?.degrees ?? [],
    },
  };
}

/**
 * Log the search trace. By default writes to console as JSON. Replace with
 * your DB / log service of choice (Supabase, Datadog, etc.).
 *
 * Each log entry is one search; the eval set is the union of all entries
 * with the recruiter's eventual feedback (hire/reject) joined later.
 */
async function logSearchTrace(
  trace: SearchTrace,
  candidates: PdlPersonRecord[]
): Promise<void> {
  // TODO: replace with Supabase insert. For now, just console.log structured.
  console.log(JSON.stringify({
    event: "pdl_search",
    timestamp: new Date().toISOString(),
    trace,
    candidate_ids: candidates.map(c => c.id),
    candidate_count: candidates.length,
  }));
}
