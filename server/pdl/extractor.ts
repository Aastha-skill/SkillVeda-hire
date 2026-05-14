// server/pdl/extractor.ts
// JD → SearchSpec extractor. Uses Claude Haiku for speed + prompt caching
// for cost efficiency. Target latency: under 1.5 seconds.

import Anthropic from "@anthropic-ai/sdk";
import type { SearchSpec } from "./types";
import {
  loadExtractorVocabulary,
  EXTRACTOR_SYSTEM_HEADER,
} from "./canonical-prompt";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.warn(
    "[pdl] ANTHROPIC_API_KEY not set. Extractor will fail at runtime."
  );
}

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

/** Claude Haiku — fastest model for structured extraction. */
const EXTRACTOR_MODEL = "claude-haiku-4-5-20251001";

/** Default empty spec, used when the JD is too vague to parse anything. */
const EMPTY_SPEC: SearchSpec = {
  current_role: { role: null, sub_role: null, levels: [] },
  current_company: { industries: [], sizes: [], funding_stages: [] },
  past_experience: { industries: [], sub_roles: [], company_names: [] },
  location: { country: "india", region: null, locality: null },
  years_experience: { min: null, max: null },
  education: { degrees: [] },
};

export interface ExtractResult {
  spec: SearchSpec;
  /** Latency in ms for the LLM call. */
  latencyMs: number;
  /** Token usage. Useful for cost tracking. */
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
  /** Raw model output (before parsing). Kept for debugging. */
  rawOutput: string;
}

/**
 * Extract a SearchSpec from a recruiter's free-form JD or natural-language search.
 *
 * Uses Anthropic prompt caching: the ~12K-token vocabulary block is marked
 * with cache_control. First call writes to cache; subsequent calls within
 * 5 minutes read from cache at 10% of the normal input price and run faster.
 *
 * @param jdText - The recruiter's input (JD, natural-language query, etc.)
 * @returns ExtractResult with the parsed spec, latency, and usage info.
 */
export async function extractSearchSpec(jdText: string): Promise<ExtractResult> {
  const startTime = Date.now();
  const vocabulary = loadExtractorVocabulary();

  if (!jdText || jdText.trim().length === 0) {
    return {
      spec: EMPTY_SPEC,
      latencyMs: 0,
      usage: { input_tokens: 0, output_tokens: 0 },
      rawOutput: "",
    };
  }

  const response = await client.messages.create({
    model: EXTRACTOR_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: EXTRACTOR_SYSTEM_HEADER,
      },
      {
        type: "text",
        text: vocabulary,
        // Mark the bulky vocabulary block as cached.
        // Anthropic caches it for ~5 minutes; subsequent calls cost ~10%.
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Parse this recruiter input into the JSON spec:\n\n${jdText}\n\nOutput JSON only.`,
      },
    ],
  });

  const latencyMs = Date.now() - startTime;

  // Anthropic returns content as an array of blocks. We expect one text block.
  const textBlocks = response.content.filter((b) => b.type === "text");
  const rawOutput = textBlocks.map((b) => (b as { text: string }).text).join("");

  let spec: SearchSpec;
  try {
    spec = parseExtractorOutput(rawOutput);
  } catch (err) {
    console.error(
      `[pdl] Failed to parse extractor output. JD: ${jdText.slice(0, 200)}\n` +
      `Raw output: ${rawOutput.slice(0, 500)}\n` +
      `Error: ${err instanceof Error ? err.message : String(err)}`
    );
    spec = EMPTY_SPEC;
  }

  return {
    spec,
    latencyMs,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
      cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
    },
    rawOutput,
  };
}

/**
 * Parse the LLM output into a SearchSpec.
 * Tolerates wrapping in code fences (```json ... ```) just in case.
 * Backfills missing keys with defaults from EMPTY_SPEC.
 */
function parseExtractorOutput(raw: string): SearchSpec {
  // Strip code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  }

  const parsed = JSON.parse(cleaned) as Partial<SearchSpec>;

  // Backfill missing keys so the query builder never crashes on null structure.
  return {
    current_role: {
      role: parsed.current_role?.role ?? null,
      sub_role: parsed.current_role?.sub_role ?? null,
      levels: Array.isArray(parsed.current_role?.levels)
        ? parsed.current_role!.levels
        : [],
    },
    current_company: {
      industries: Array.isArray(parsed.current_company?.industries)
        ? parsed.current_company!.industries
        : [],
      sizes: Array.isArray(parsed.current_company?.sizes)
        ? parsed.current_company!.sizes
        : [],
      funding_stages: Array.isArray(parsed.current_company?.funding_stages)
        ? parsed.current_company!.funding_stages
        : [],
    },
    past_experience: {
      industries: Array.isArray(parsed.past_experience?.industries)
        ? parsed.past_experience!.industries
        : [],
      sub_roles: Array.isArray(parsed.past_experience?.sub_roles)
        ? parsed.past_experience!.sub_roles
        : [],
      company_names: Array.isArray(parsed.past_experience?.company_names)
        ? parsed.past_experience!.company_names
        : [],
    },
    location: {
      country: "india",
      region: parsed.location?.region ?? null,
      locality: parsed.location?.locality ?? null,
    },
    years_experience: {
      min: typeof parsed.years_experience?.min === "number"
        ? parsed.years_experience.min
        : null,
      max: typeof parsed.years_experience?.max === "number"
        ? parsed.years_experience.max
        : null,
    },
    education: {
      degrees: Array.isArray(parsed.education?.degrees)
        ? parsed.education!.degrees
        : [],
    },
  };
}
