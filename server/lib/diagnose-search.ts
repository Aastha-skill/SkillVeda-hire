// ═══════════════════════════════════════════════════════════════════════
// Diagnostic endpoint — dumps full PDL pipeline output to a JSON file.
//
// File location: server/lib/diagnose-search.ts
//
// Purpose: isolate parser / query-builder / PDL behavior for manual review.
// Does NOT cost a credit. Does NOT hit the cache. Does NOT save to history.
//
// Endpoints registered:
//   POST /api/hiring/diagnose-search          — run a diagnostic, write dump
//   GET  /api/hiring/diagnose-search/list     — list dumps for the user
//   GET  /api/hiring/diagnose-search/download/:filename — download a dump
//
// Body for POST:
//   { paragraph?: string, filters?: SearchFilterState, size?: number }
//
//   • paragraph alone → runs parser → builds query → hits PDL
//   • filters alone → skips parser, builds query directly, hits PDL
//   • both → uses paragraph for parser AND filters override for query
//
// Returns: { dumpPath, downloadUrl, summary, sampleResults }
// ═══════════════════════════════════════════════════════════════════════

import type { Express } from "express";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { authenticateCompany } from "../hiring-routes";
import { parseRequirement } from "./parse-requirement";
import { buildPdlRequest, type SearchFilterState } from "./pdl-query-builder";

const PDL_API_KEY = process.env.PDL_API_KEY || "";
const PDL_BASE = process.env.PDL_SANDBOX === "true"
  ? "https://sandbox.api.peopledatalabs.com"
  : "https://api.peopledatalabs.com";

// Where dumps live. Replit users can browse /tmp via shell, or use the
// download route to fetch via browser.
const DUMP_DIR = "/tmp/skillveda-dumps";

async function ensureDumpDir(): Promise<void> {
  try {
    await fs.mkdir(DUMP_DIR, { recursive: true });
  } catch {
    // ignore — directory probably exists
  }
}

async function pdlSearch(body: any): Promise<{ httpStatus: number; body: any }> {
  const res = await fetch(`${PDL_BASE}/v5/person/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": PDL_API_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { httpStatus: res.status, body: data };
}

export function registerDiagnosticRoutes(app: Express) {

  // ── POST /api/hiring/diagnose-search ─────────────────────────
  app.post("/api/hiring/diagnose-search", authenticateCompany, async (req: any, res) => {
    try {
      if (!PDL_API_KEY) {
        return res.status(500).json({ error: "PDL_API_KEY not configured" });
      }

      const schema = z.object({
        paragraph: z.string().optional(),
        filters: z.any().optional(),
        size: z.number().int().min(1).max(100).optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid body", details: parsed.error.errors });
      }
      const { paragraph, filters: explicitFilters, size = 75 } = parsed.data;

      if (!paragraph && !explicitFilters) {
        return res.status(400).json({ error: "Provide either 'paragraph' or 'filters'" });
      }

      // ── Step 1: parse paragraph if provided ───────────────────
      let parsedFilters: SearchFilterState | null = null;
      let parsedScoringContext: any = null;
      let parsedPreferences: any = null;
      let parsedDealBreakers: any = null;
      let parserWarning: string | null = null;
      let parserMs: number | null = null;
      if (paragraph && paragraph.trim().length > 0) {
        const t0 = Date.now();
        try {
          const parseResult = await parseRequirement(paragraph);
          parsedFilters = parseResult.filters;
          parsedScoringContext = parseResult.scoringContext;
          parsedPreferences = parseResult.preferences;
          parsedDealBreakers = parseResult.dealBreakers;
        } catch (e: any) {
          parserWarning = `Parser failed: ${e?.message || String(e)}`;
        }
        parserMs = Date.now() - t0;
      }

      // ── Step 2: choose effective filters ──────────────────────
      // If both paragraph and explicit filters provided, EXPLICIT wins
      // (lets user manually override what the parser produced).
      const effectiveFilters: SearchFilterState =
        (explicitFilters && typeof explicitFilters === "object")
          ? (explicitFilters as SearchFilterState)
          : (parsedFilters || {} as SearchFilterState);

      // ── Step 3: build PDL query ───────────────────────────────
      const { body: pdlBody, warnings: queryWarnings } = buildPdlRequest(
        effectiveFilters,
        { size }
      );

      // ── Step 4: hit PDL ───────────────────────────────────────
      const t1 = Date.now();
      const pdlResult = await pdlSearch(pdlBody);
      const pdlMs = Date.now() - t1;

      // ── Step 5: assemble dump ─────────────────────────────────
      const dump = {
        timestamp: new Date().toISOString(),
        companyId: req.companyId,
        companyEmail: req.companyEmail,
        timing: {
          parserMs,
          pdlMs,
        },
        input: {
          paragraph: paragraph || null,
          filtersOverride: explicitFilters || null,
          requestedSize: size,
        },
        parser: {
          ran: paragraph ? true : false,
          warning: parserWarning,
          parsedFilters: parsedFilters,
          parsedScoringContext: parsedScoringContext,
          parsedPreferences: parsedPreferences,
          parsedDealBreakers: parsedDealBreakers,
        },
        effectiveFilters,
        pdlQuery: pdlBody,
        queryBuilderWarnings: queryWarnings,
        pdlResponse: {
          httpStatus: pdlResult.httpStatus,
          total: pdlResult.body?.total ?? null,
          dataCount: Array.isArray(pdlResult.body?.data) ? pdlResult.body.data.length : 0,
          error: pdlResult.body?.error || null,
          // FULL candidate objects — everything PDL returned, no trimming
          data: pdlResult.body?.data || [],
        },
      };

      // ── Step 6: write to disk ─────────────────────────────────
      await ensureDumpDir();
      const safeStamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `dump-${req.companyId}-${safeStamp}.json`;
      const filepath = path.join(DUMP_DIR, filename);
      await fs.writeFile(filepath, JSON.stringify(dump, null, 2), "utf8");

      console.log(`[diagnose-search] wrote ${filepath} (${dump.pdlResponse.dataCount} candidates)`);

      // ── Step 7: build a readable summary for response ─────────
      const sample = (dump.pdlResponse.data as any[]).slice(0, 10).map((p: any) => ({
        name: p.full_name,
        job_title: p.job_title,
        company: p.job_company_name,
        industry: p.job_company_industry,
        location: p.location_locality || p.location_region || p.location_country,
        inferred_years: p.inferred_years_experience,
        skills_count: Array.isArray(p.skills) ? p.skills.length : 0,
        sub_role: p.job_title_sub_role,
        levels: p.job_title_levels,
      }));

      return res.json({
        success: true,
        dumpPath: filepath,
        downloadUrl: `/api/hiring/diagnose-search/download/${encodeURIComponent(filename)}`,
        summary: {
          paragraphProvided: Boolean(paragraph),
          filtersProvided: Boolean(explicitFilters),
          parserRan: dump.parser.ran,
          parserWarning,
          parserMs,
          pdlMs,
          effectiveFilters,
          queryBuilderWarnings: queryWarnings,
          pdlHttpStatus: pdlResult.httpStatus,
          pdlTotal: pdlResult.body?.total ?? null,
          pdlReturned: dump.pdlResponse.dataCount,
          pdlError: pdlResult.body?.error || null,
        },
        sampleResults: sample,
      });
    } catch (error: any) {
      console.error("[diagnose-search] error:", error);
      res.status(500).json({ error: error?.message || "Diagnose failed" });
    }
  });

  // ── GET /api/hiring/diagnose-search/download/:filename ───────
  // Lets you download the dump file via browser/curl. Filename is
  // restricted to dumps directory + must belong to requesting company
  // to prevent path traversal and cross-tenant access.
  app.get("/api/hiring/diagnose-search/download/:filename", authenticateCompany, async (req: any, res) => {
    try {
      const requested = String(req.params.filename || "");
      // Whitelist: must look like our generated filenames
      if (!/^dump-\d+-[\d\-T:Z.]+\.json$/.test(requested)) {
        return res.status(400).json({ error: "Invalid filename" });
      }

      // Verify file is owned by this company (filename starts with "dump-{companyId}-")
      const expectedPrefix = `dump-${req.companyId}-`;
      if (!requested.startsWith(expectedPrefix)) {
        return res.status(403).json({ error: "Not your dump" });
      }

      const filepath = path.join(DUMP_DIR, requested);
      const stat = await fs.stat(filepath).catch(() => null);
      if (!stat) return res.status(404).json({ error: "Dump not found" });

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${requested}"`);
      const content = await fs.readFile(filepath, "utf8");
      res.send(content);
    } catch (error: any) {
      console.error("[diagnose-search/download] error:", error);
      res.status(500).json({ error: error?.message || "Download failed" });
    }
  });

  // ── GET /api/hiring/diagnose-search/list ─────────────────────
  // List existing dumps for this company.
  app.get("/api/hiring/diagnose-search/list", authenticateCompany, async (req: any, res) => {
    try {
      await ensureDumpDir();
      const files = await fs.readdir(DUMP_DIR).catch(() => [] as string[]);
      const expectedPrefix = `dump-${req.companyId}-`;
      const mine = files
        .filter((f) => f.startsWith(expectedPrefix) && f.endsWith(".json"))
        .sort()
        .reverse(); // newest first

      const enriched = await Promise.all(mine.slice(0, 20).map(async (f) => {
        const stat = await fs.stat(path.join(DUMP_DIR, f)).catch(() => null);
        return {
          filename: f,
          downloadUrl: `/api/hiring/diagnose-search/download/${encodeURIComponent(f)}`,
          sizeBytes: stat?.size ?? null,
          createdAt: stat?.mtime ?? null,
        };
      }));

      res.json({ dumps: enriched });
    } catch (error: any) {
      console.error("[diagnose-search/list] error:", error);
      res.status(500).json({ error: error?.message || "List failed" });
    }
  });
}