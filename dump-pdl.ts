import { parseRequirement } from "./server/lib/parse-requirement";
import { buildPdlRequest } from "./server/lib/pdl-query-builder";
import * as fs from "fs";

const PARAGRAPH = "I am hiring a customer support associate with 0-1 years of experience in Fintech industry with exceptional communication skills and location would be Bengaluru.";

const PDL_API_KEY = process.env.PDL_API_KEY!;
const PDL_BASE = process.env.PDL_SANDBOX === "true"
  ? "https://sandbox.api.peopledatalabs.com"
  : "https://api.peopledatalabs.com";

(async () => {
  console.log("1. Parsing paragraph...");
  const parsed = await parseRequirement(PARAGRAPH);
  console.log("   Filters:", JSON.stringify(parsed.filters, null, 2));

  console.log("2. Building PDL query...");
  const { body: pdlBody } = buildPdlRequest(parsed.filters, { size: 75 });

  console.log("3. Calling PDL...");
  const res = await fetch(`${PDL_BASE}/v5/person/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": PDL_API_KEY },
    body: JSON.stringify(pdlBody),
  });
  const data = await res.json();

  const dump = {
    paragraph: PARAGRAPH,
    parsedFilters: parsed.filters,
    parsedScoringContext: parsed.scoringContext,
    pdlQuery: pdlBody,
    pdlStatus: res.status,
    pdlTotal: data.total,
    pdlReturned: (data.data || []).length,
    candidates: data.data || [],
  };

  fs.writeFileSync("pdl-dump.json", JSON.stringify(dump, null, 2));
  console.log(`\n✓ Done. Wrote pdl-dump.json — ${dump.pdlReturned} candidates, ${dump.pdlTotal} total matches.`);
})();