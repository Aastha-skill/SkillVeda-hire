// server/pdl/test-pipeline.ts
// Quick smoke test for the PDL search pipeline.
// Run with: npx tsx server/pdl/test-pipeline.ts
//
// Set these env vars before running:
//   - ANTHROPIC_API_KEY
//   - PDL_API_KEY
//
// Tests three things:
//   1. Form-only path (no LLM)
//   2. JD path (Haiku extractor + query builder)
//   3. Query builder edge cases (region groups, spelling variants)

import { runPdlSearch } from "./search";
import { buildPdlQuery } from "./query-builder";
import { extractSearchSpec } from "./extractor";
import type { SearchSpec } from "./types";

async function testQueryBuilderOnly() {
  console.log("\n=== TEST 1: Query builder with structured spec ===");

  const spec: SearchSpec = {
    current_role: {
      role: null,
      sub_role: "customer_success",
      levels: ["entry", "manager"],
    },
    current_company: {
      industries: ["software development", "it services and it consulting"],
      sizes: [],
      funding_stages: [],
    },
    past_experience: {
      industries: [], sub_roles: [], company_names: [],
    },
    location: {
      country: "india",
      region: null,
      locality: "bangalore",
    },
    years_experience: { min: 1, max: 3 },
    education: { degrees: [] },
  };

  const query = buildPdlQuery(spec, { size: 25 });
  console.log("Generated query:");
  console.log(JSON.stringify(query, null, 2));
}

async function testRegionGroups() {
  console.log("\n=== TEST 2: Region group expansion ===");

  const ncrSpec: SearchSpec = {
    current_role: { role: null, sub_role: "account_executive", levels: ["senior"] },
    current_company: { industries: [], sizes: [], funding_stages: [] },
    past_experience: { industries: [], sub_roles: [], company_names: [] },
    location: { country: "india", region: null, locality: "ncr" },
    years_experience: { min: null, max: null },
    education: { degrees: [] },
  };

  const query = buildPdlQuery(ncrSpec);
  console.log("NCR query should expand to 8 cities:");
  console.log(JSON.stringify(query.query.bool.filter, null, 2));
}

async function testExtractorOnly() {
  console.log("\n=== TEST 3: Extractor with a JD ===");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("SKIPPED: ANTHROPIC_API_KEY not set");
    return;
  }

  const jd = `
    We're looking for a Senior Customer Success Manager to join our SaaS startup
    in Bangalore. The ideal candidate has 4-6 years of experience in customer
    success or account management at a B2B SaaS company. MBA preferred. Has
    previously worked at companies like Freshworks, Zoho, or Razorpay would
    be a plus.
  `;

  const result = await extractSearchSpec(jd);
  console.log(`Extractor latency: ${result.latencyMs}ms`);
  console.log(`Tokens: ${JSON.stringify(result.usage)}`);
  console.log("Parsed spec:");
  console.log(JSON.stringify(result.spec, null, 2));
}

async function testFullPipeline() {
  console.log("\n=== TEST 4: Full pipeline (JD → spec → query → PDL) ===");

  if (!process.env.ANTHROPIC_API_KEY || !process.env.PDL_API_KEY) {
    console.log("SKIPPED: ANTHROPIC_API_KEY or PDL_API_KEY not set");
    return;
  }

  const result = await runPdlSearch({
    jd_text: "Customer Success Associate in Bangalore, 1-2 years experience",
    size: 5, // Use 5 to save credits during testing
  });

  console.log(`Total time: extractor ${result.trace.extractorLatencyMs}ms + PDL ${result.trace.pdlLatencyMs}ms`);
  console.log(`Found ${result.total} candidates, returning ${result.candidates.length}`);
  console.log(`Credits used: ${result.trace.pdlCreditsUsed}`);

  for (const c of result.candidates.slice(0, 3)) {
    console.log(
      `- ${c.full_name} | ${c.job_title} @ ${c.job_company_name} | ${c.location_locality}`
    );
  }

  if (result.trace.warnings.length > 0) {
    console.log("Warnings:", result.trace.warnings);
  }
}

async function main() {
  try {
    await testQueryBuilderOnly();
    await testRegionGroups();
    await testExtractorOnly();
    await testFullPipeline();
    console.log("\n✓ All tests passed");
  } catch (err) {
    console.error("\n✗ Test failed:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
