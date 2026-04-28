#!/usr/bin/env node
/**
 * SkillVeda Hire — Fix Verification Suite
 *
 * Validates the three query-builder fixes by running real PDL searches
 * across multiple test scenarios:
 *
 *   1. Entry-level CS in Delhi (the broken case) — should now return >100
 *   2. Senior CS in Bangalore (the working case) — should still return 1000+
 *   3. Mid-level Account Manager (regression check) — should be unaffected
 *
 * Costs ~10 PDL credits total. Run after applying patches.
 *
 * Usage:
 *     npx tsx server/lib/verify-fix.ts
 */

import { buildPdlRequest, type SearchFilterState } from "./pdl-query-builder";

const PDL_API_KEY = process.env.PDL_API_KEY || "";
const PDL_BASE = process.env.PDL_SANDBOX === "true"
  ? "https://sandbox.api.peopledatalabs.com"
  : "https://api.peopledatalabs.com";

// ────────────────────────────────────────────────────────────────────
// Output helpers
// ────────────────────────────────────────────────────────────────────

const dline = "═".repeat(72);
const line = "─".repeat(72);

function header(title: string) {
  console.log("\n" + dline);
  console.log(" " + title);
  console.log(dline);
}

function pass(msg: string) { console.log(`  ✓ ${msg}`); }
function fail(msg: string) { console.log(`  ✗ ${msg}`); }
function info(msg: string) { console.log(`    ${msg}`); }

// ────────────────────────────────────────────────────────────────────
// Helper — run filters through the new builder + PDL
// ────────────────────────────────────────────────────────────────────

interface PdlResult {
  total: number;
  data: any[];
  error?: string;
}

async function runQuery(filters: SearchFilterState, size = 5): Promise<PdlResult> {
  const { body } = buildPdlRequest(filters, { size });
  try {
    const res = await fetch(`${PDL_BASE}/v5/person/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": PDL_API_KEY },
      body: JSON.stringify(body),
    });
    const data: any = await res.json();
    if (res.status >= 400 && res.status !== 404) {
      return { total: 0, data: [], error: `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}` };
    }
    return { total: data.total ?? 0, data: data.data ?? [] };
  } catch (e: any) {
    return { total: 0, data: [], error: e.message };
  }
}

// ────────────────────────────────────────────────────────────────────
// Test scenarios
// ────────────────────────────────────────────────────────────────────

interface Scenario {
  name: string;
  filters: SearchFilterState;
  expectedMin: number;
  rationale: string;
}

const SCENARIOS: Scenario[] = [
  {
    name: "Entry CS in Delhi (the previously broken case)",
    filters: {
      titleRole: "Customer Success",
      titleLevel: "Entry",
      minExp: 0,
      maxExp: 2,
      locationTags: ["Delhi"],
    },
    expectedMin: 100,
    rationale: "After fixes: should match CS+Support+Service titles, no level filter, no minExp:0 floor.",
  },
  {
    name: "Senior CS in Bangalore (regression check — must still work)",
    filters: {
      titleRole: "Customer Success",
      titleLevel: "Senior",
      minExp: 5,
      maxExp: 10,
      locationTags: ["Bangalore"],
    },
    expectedMin: 1000,
    rationale: "Senior queries should keep narrow CS-only matching + level filter. We confirmed 2,072 earlier.",
  },
  {
    name: "Manager-level CS in Mumbai (mid-band, no broadening expected)",
    filters: {
      titleRole: "Customer Success",
      titleLevel: "Manager",
      minExp: 3,
      maxExp: 8,
      locationTags: ["Mumbai"],
    },
    expectedMin: 200,
    rationale: "Manager level is densely tagged; should still filter cleanly.",
  },
  {
    name: "Entry Customer Support in Pune (entry level, different role)",
    filters: {
      titleRole: "Customer Support",
      titleLevel: "Entry",
      minExp: 0,
      maxExp: 3,
      locationTags: ["Pune"],
    },
    expectedMin: 50,
    rationale: "Entry-level Customer Support should benefit from the level-filter drop fix.",
  },
];

// ────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────

async function main() {
  header("SkillVeda Hire — Fix Verification");
  info(new Date().toISOString());
  info(`PDL endpoint: ${PDL_BASE}`);

  if (!PDL_API_KEY) {
    fail("PDL_API_KEY not set");
    process.exit(1);
  }

  const results: Array<{ scenario: Scenario; total: number; passed: boolean; error?: string }> = [];

  for (const scenario of SCENARIOS) {
    header("SCENARIO: " + scenario.name);
    info("Filters: " + JSON.stringify(scenario.filters));
    info("Rationale: " + scenario.rationale);
    info(`Expected min total: ${scenario.expectedMin}`);
    console.log();

    const result = await runQuery(scenario.filters, 3);
    if (result.error) {
      fail(`PDL error: ${result.error}`);
      results.push({ scenario, total: 0, passed: false, error: result.error });
      continue;
    }

    info(`Total matches: ${result.total}`);
    info(`Sample profiles returned: ${result.data.length}`);

    if (result.data.length > 0) {
      console.log();
      info("Sample (top 3):");
      result.data.slice(0, 3).forEach((p: any, i: number) => {
        console.log(`  ${i + 1}. ${p.full_name || "(no name)"}`);
        console.log(`     ${p.job_title || "(no title)"} @ ${p.job_company_name || "(no company)"}`);
        console.log(`     ${p.location_locality || "?"} · ${p.inferred_years_experience ?? "?"} yrs`);
      });
    }

    console.log();
    const passed = result.total >= scenario.expectedMin;
    if (passed) {
      pass(`Total ${result.total} >= ${scenario.expectedMin} expected`);
    } else {
      fail(`Total ${result.total} < ${scenario.expectedMin} expected — fix may not be working`);
    }
    results.push({ scenario, total: result.total, passed });
  }

  // Summary
  header("SUMMARY");
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  console.log();
  results.forEach(r => {
    const status = r.passed ? "✓ PASS" : "✗ FAIL";
    const pad = r.scenario.name.padEnd(60).slice(0, 60);
    console.log(`  ${status}  ${pad}  total=${r.total}`);
  });

  console.log();
  if (failedCount === 0) {
    console.log("  All scenarios pass. Fixes are working.");
    console.log("  Safe to deploy pdl-query-builder.ts to your Replit.");
  } else {
    console.log(`  ${passedCount}/${results.length} scenarios pass.`);
    console.log("  Review failures above before deploying.");
  }
  console.log();
}

main().catch(e => {
  console.error("Verification crashed:", e);
  process.exit(1);
});