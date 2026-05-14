// server/pdl/canonical-prompt.ts
// Loads canonical-reference.md once at module init and provides the sliced
// sections needed for the extractor's system prompt.
//
// The full doc is ~30K tokens — way too much to send on every request.
// We extract just the sections the extractor needs (§1, §2, §3, §6, §7,
// §8, §9, §11, §12, §18) and use Anthropic prompt caching so the vocabulary
// only costs full price on the first call within a 5-minute window.

import { readFileSync } from "fs";
import { join } from "path";

/** Sections the extractor needs in its system prompt. */
const EXTRACTOR_SECTIONS = [
  "§1.", // job_title_role
  "§2.", // job_title_sub_role
  "§3.", // job_title_levels
  "§6.", // location_region (India states)
  "§7.", // location_locality (India cities + region groups)
  "§8.", // job_company_industry_v2
  "§9.", // job_company_size
  "§11.", // job_company_funding_stages
  "§12.", // education.degrees
  "§18.", // extractor prompt template
];

let cachedVocabulary: string | null = null;

/**
 * Reads canonical-reference.md from disk and extracts the sections the
 * extractor needs. Called once at first use; result is memoized.
 *
 * The doc lives at server/pdl/canonical-reference.md relative to your
 * project root. Adjust the path if your repo layout differs.
 */
export function loadExtractorVocabulary(): string {
  if (cachedVocabulary) return cachedVocabulary;

  const docPath =
    process.env.PDL_CANONICAL_DOC_PATH ||
    join(process.cwd(), "server", "pdl", "canonical-reference.md");

  let fullDoc: string;
  try {
    fullDoc = readFileSync(docPath, "utf-8");
  } catch (err) {
    throw new Error(
      `Failed to load canonical reference doc at ${docPath}. ` +
      `Set PDL_CANONICAL_DOC_PATH env var or place the file at server/pdl/canonical-reference.md. ` +
      `Original error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Split by H2 headers ("## §N. ...")
  const sections = fullDoc.split(/^## /gm);

  const wanted: string[] = [];
  for (const section of sections) {
    const firstLine = section.split("\n")[0];
    for (const prefix of EXTRACTOR_SECTIONS) {
      if (firstLine.startsWith(prefix)) {
        wanted.push("## " + section);
        break;
      }
    }
  }

  if (wanted.length === 0) {
    throw new Error(
      `Could not find any of ${EXTRACTOR_SECTIONS.join(", ")} sections in canonical-reference.md. ` +
      `Check the doc structure.`
    );
  }

  cachedVocabulary = wanted.join("\n\n");
  return cachedVocabulary;
}

/**
 * Clear the cache. Useful for tests or when hot-reloading the doc.
 */
export function clearVocabularyCache(): void {
  cachedVocabulary = null;
}

/**
 * Returns the system-prompt header that explains the extractor's task.
 * Concatenated with the vocabulary to form the full system prompt.
 */
export const EXTRACTOR_SYSTEM_HEADER = `You are a PDL search query extractor for SkillVeda Hire, a revenue-team hiring platform (CS, Sales, RevOps roles in India).

Your job: convert a recruiter's job description or natural-language search into a structured JSON spec. The spec is consumed by a downstream query builder that converts it into a PDL Elasticsearch query.

CRITICAL RULES:
- Use ONLY canonical values from the vocabulary below.
- If you're not sure about a value, set the field to null (or [] for arrays). Never guess.
- For Customer Success roles, use role="support" and sub_role="customer_success". The value "customer_service" does NOT exist in PDL's taxonomy.
- For Indian cities, use the city's primary canonical name only (e.g., "bangalore" not "bangalore/bengaluru"). The query builder handles spelling variant expansion.
- For region groups like "NCR" / "Delhi NCR", set locality to "ncr" — the query builder expands this.
- Widen years_experience by ±1 from what the JD says (PDL's inferred years is noisy).
- Lowercase everything except where the canonical value is case-sensitive (e.g., revenue ranges like "$10M-$25M").
- Output strict JSON only. No prose, no markdown, no explanations.

OUTPUT SCHEMA (this exact structure):
{
  "current_role": {
    "role": <canonical from §1 or null>,
    "sub_role": <canonical from §2 or null>,
    "levels": [<canonical from §3>]
  },
  "current_company": {
    "industries": [<canonical from §8>],
    "sizes": [<canonical from §9>],
    "funding_stages": [<canonical from §11>]
  },
  "past_experience": {
    "industries": [<canonical from §8>],
    "sub_roles": [<canonical from §2>],
    "company_names": [<lowercase strings>]
  },
  "location": {
    "country": "india",
    "region": <canonical from §6 or null>,
    "locality": <canonical from §7 or region group key or null>
  },
  "years_experience": {
    "min": <int or null>,
    "max": <int or null>
  },
  "education": {
    "degrees": [<canonical from §12>]
  }
}

CANONICAL VOCABULARY (use only these values):
`;
