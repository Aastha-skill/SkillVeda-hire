// ═══════════════════════════════════════════════════════════════════════
// CS Scoring Engine — v2
//
// Replaces the previous free-form-JSON scorer. Key changes:
//
//   ★ FULL CANDIDATE DATA — sends every relevant PDL field to Claude
//     (experience timeline, education, certifications, skills, metrics,
//     employer details, job summary, headline, full summary). Previously
//     only ~6 fields were sent; now Claude sees the entire profile.
//
//   ★ TOOL_USE SCHEMA — Claude is forced to return structured JSON via
//     Anthropic's tool_use mechanism. Eliminates the silent-batch-failure
//     mode where one malformed JSON char dropped 10 candidates to T3.
//
//   ★ PROMPT CACHING — rubric + JD + dimension definitions are cached
//     across batches via cache_control. Cuts input token cost ~80% on
//     batches 2..N.
//
//   ★ PARALLEL BATCHES — up to 3 batches run concurrently. 50 candidates
//     scored in ~10s instead of ~25s.
//
//   ★ RETRIES — transient 429/5xx errors retry with exponential backoff.
//     A single network blip no longer drops a batch.
//
//   ★ STABLE BREAKDOWN SHAPE — breakdown is now an array (not a record),
//     so UI can render it reliably regardless of dimension names.
//
//   ★ CALIBRATED TIER THRESHOLDS — T1 ≥ 80, T2 ≥ 55, T3 < 55. T3 is no
//     longer a dumping ground; very-low-fit candidates still appear but
//     are clearly marked.
//
//   ★ DEAL-BREAKER ENFORCEMENT — capped at score 25, forced to T3.
// ═══════════════════════════════════════════════════════════════════════

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.SCORING_MODEL || "claude-sonnet-4-20250514";

// Tunables
const BATCH_SIZE = 8;             // candidates per Claude call
const MAX_PARALLEL = 3;           // concurrent batches
const BATCH_INTERVAL_MS = 200;    // small jitter between dispatches
const MAX_RETRIES = 2;            // per-call retry budget
const RETRY_BASE_MS = 800;        // exponential backoff base

// Tier thresholds (calibrated for v2)
const TIER_1_MIN = 80;
const TIER_2_MIN = 55;
const DEAL_BREAKER_CAP = 25;

// ═══════════════════════════════════════════════════════════════════════
// Tool schemas — what Claude is forced to return
// ═══════════════════════════════════════════════════════════════════════

const RUBRIC_TOOL = {
  name: "build_rubric",
  description:
    "Build a custom scoring rubric for the given JD. The rubric defines 5-7 dimensions with weights summing to 100, plus critical requirements and deal-breakers.",
  input_schema: {
    type: "object",
    properties: {
      roleType: {
        type: "string",
        description: "What kind of CS role this actually is, in one sentence.",
      },
      criticalRequirements: {
        type: "array",
        items: { type: "string" },
        description: "2-5 must-have requirements without which the candidate cannot fit.",
      },
      dealBreakers: {
        type: "array",
        items: { type: "string" },
        description: "0-3 things that should auto-disqualify a candidate (e.g. 'currently a software engineer', 'less than 1y CS experience').",
      },
      dimensions: {
        type: "array",
        minItems: 5,
        maxItems: 7,
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Short dimension name, 2-4 words" },
            weight: { type: "number", description: "Point weight, sum of all weights = 100" },
            whatToLookFor: { type: "string", description: "Specific signals to look for in candidate profile" },
            fullScore: { type: "string", description: "What full-marks looks like for this role" },
            zeroScore: { type: "string", description: "What a zero looks like" },
          },
          required: ["name", "weight", "whatToLookFor", "fullScore", "zeroScore"],
        },
      },
    },
    required: ["roleType", "criticalRequirements", "dealBreakers", "dimensions"],
  },
};

const SCORING_TOOL = {
  name: "score_candidates",
  description:
    "Score each candidate against the rubric. Return one entry per candidate, in the same order as input.",
  input_schema: {
    type: "object",
    properties: {
      scores: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Exact candidate ID from input" },
            totalScore: { type: "number", description: "0-100 overall score" },
            tier: { type: "number", enum: [1, 2, 3] },
            matchScore: { type: "string", enum: ["High", "Medium", "Low"] },
            dealBreakerTriggered: { type: "boolean" },
            breakdown: {
              type: "array",
              description: "Score per rubric dimension, in rubric order",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  score: { type: "number" },
                  maxScore: { type: "number" },
                  reason: { type: "string", description: "One-sentence justification" },
                },
                required: ["name", "score", "maxScore", "reason"],
              },
            },
            strengths: {
              type: "array",
              items: { type: "string" },
              description: "2-4 specific strengths with evidence from profile",
            },
            gaps: {
              type: "array",
              items: { type: "string" },
              description: "1-3 specific gaps vs the JD",
            },
            aiSummary: {
              type: "string",
              description: "Exactly 3 sentences: (1) why strong with evidence, (2) what's missing, (3) recommendation",
            },
            hiringRecommendation: {
              type: "string",
              enum: ["Strong Yes", "Yes", "Maybe", "No"],
            },
            standoutSignal: {
              type: "string",
              description: "Most impressive signal in under 12 words",
            },
          },
          required: [
            "id", "totalScore", "tier", "matchScore", "dealBreakerTriggered",
            "breakdown", "strengths", "gaps", "aiSummary",
            "hiringRecommendation", "standoutSignal",
          ],
        },
      },
    },
    required: ["scores"],
  },
};

// ═══════════════════════════════════════════════════════════════════════
// Anthropic API call with retry
// ═══════════════════════════════════════════════════════════════════════

async function callAnthropic(
  apiKey: string,
  body: any,
  attempt = 0
): Promise<any> {
  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify(body),
    });

    // Retry on rate-limit and 5xx
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const wait = RETRY_BASE_MS * Math.pow(2, attempt);
      console.warn(`[Scoring] HTTP ${res.status}, retrying in ${wait}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, wait));
      return callAnthropic(apiKey, body, attempt + 1);
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (err: any) {
    // Network error — retry
    if (attempt < MAX_RETRIES) {
      const wait = RETRY_BASE_MS * Math.pow(2, attempt);
      console.warn(`[Scoring] Network error, retrying in ${wait}ms:`, err.message);
      await new Promise(r => setTimeout(r, wait));
      return callAnthropic(apiKey, body, attempt + 1);
    }
    throw err;
  }
}

// Extract tool_use input from Claude's response
function extractToolInput(response: any, toolName: string): any | null {
  if (!response?.content || !Array.isArray(response.content)) return null;
  const toolBlock = response.content.find(
    (b: any) => b.type === "tool_use" && b.name === toolName
  );
  return toolBlock?.input || null;
}

// ═══════════════════════════════════════════════════════════════════════
// BUILD RUBRIC
// ═══════════════════════════════════════════════════════════════════════

async function buildRubric(
  jd: string,
  companyContext: string,
  apiKey: string
): Promise<any> {
  const prompt = `You are a world-class Customer Success hiring expert.

A company wants to hire. Read their job description carefully and build a CUSTOM scoring rubric specifically for this role.

${companyContext}

JOB DESCRIPTION:
${jd}

Build 5-7 scoring dimensions based ONLY on what this JD emphasizes.
- All weights must sum to exactly 100
- Give higher weight to dimensions the JD mentions most
- Be specific in whatToLookFor — name actual signals (e.g. "past role at SaaS company with API integrations" not "technical experience")
- Deal-breakers should be rare and clear (e.g. "currently a software engineer with no CS experience")

Use the build_rubric tool to return your answer.`;

  const response = await callAnthropic(apiKey, {
    model: MODEL,
    max_tokens: 2000,
    tools: [RUBRIC_TOOL],
    tool_choice: { type: "tool", name: "build_rubric" },
    messages: [{ role: "user", content: prompt }],
  });

  const rubric = extractToolInput(response, "build_rubric");
  if (!rubric) {
    console.error("[Scoring] Rubric tool_use failed, response:", JSON.stringify(response).slice(0, 500));
    return null;
  }

  // Sanity check: weights should sum to 100
  const totalWeight = rubric.dimensions.reduce((s: number, d: any) => s + d.weight, 0);
  console.log(
    `[Scoring] Rubric built: ${rubric.dimensions.length} dimensions (weight sum=${totalWeight})`,
    rubric.dimensions.map((d: any) => `${d.name}(${d.weight})`).join(", ")
  );

  return rubric;
}

// ═══════════════════════════════════════════════════════════════════════
// CANDIDATE SERIALIZATION — send everything relevant to Claude
// ═══════════════════════════════════════════════════════════════════════

function serializeCandidate(c: any, idx: number): string {
  const lines: string[] = [];
  lines.push(`CANDIDATE ${idx + 1}`);
  lines.push(`ID: ${c.id}`);
  lines.push(`Name: ${c.name}`);

  if (c.headline)        lines.push(`Headline: ${c.headline}`);
  if (c.linkedinUrl)     lines.push(`LinkedIn: ${c.linkedinUrl}`);

  // Current job
  lines.push(``);
  lines.push(`CURRENT JOB:`);
  lines.push(`  Title: ${c.jobTitle || "—"}`);
  if (c.jobTitleSubRole) lines.push(`  Sub-role: ${c.jobTitleSubRole}`);
  if (c.jobTitleLevels?.length) lines.push(`  Levels: ${c.jobTitleLevels.join(", ")}`);
  lines.push(`  Company: ${c.employer || "—"}`);
  if (c.employerIndustry)        lines.push(`  Company industry: ${c.employerIndustry}`);
  if (c.employerSize)            lines.push(`  Company size: ${c.employerSize}`);
  if (c.employerEmployeeCount)   lines.push(`  Employee count: ${c.employerEmployeeCount}`);
  if (c.employerFunding)         lines.push(`  Total funding raised: $${c.employerFunding}`);
  if (c.employerFounded)         lines.push(`  Company founded: ${c.employerFounded}`);
  if (c.employerType)            lines.push(`  Company type: ${c.employerType}`);
  if (c.jobStartDate)            lines.push(`  Started: ${c.jobStartDate}`);
  if (c.jobSummary)              lines.push(`  Job summary: ${c.jobSummary.slice(0, 500)}`);

  // Location
  lines.push(``);
  lines.push(`LOCATION: ${c.location || "—"}`);

  // Experience metrics
  const m = c.metrics || {};
  lines.push(``);
  lines.push(`EXPERIENCE METRICS:`);
  lines.push(`  Total years: ${c.experienceYears || "—"}`);
  if (m.csYears != null)              lines.push(`  CS years: ${m.csYears}`);
  if (m.csRoleCount != null)          lines.push(`  CS roles held: ${m.csRoleCount}`);
  if (m.isCurrentlyInCS != null)      lines.push(`  Currently in CS: ${m.isCurrentlyInCS}`);
  if (m.currentTenureMonths != null)  lines.push(`  Current tenure: ${m.currentTenureMonths}mo`);
  if (m.averageTenureMonths != null)  lines.push(`  Average tenure: ${m.averageTenureMonths}mo`);
  if (m.trajectoryLevel)              lines.push(`  Trajectory: ${m.trajectoryLevel}`);
  if (m.hasManagerialExperience != null) lines.push(`  Managerial experience: ${m.hasManagerialExperience}`);
  if (m.highestLevel)                 lines.push(`  Highest level reached: ${m.highestLevel}`);
  if (m.isJobHopper)                  lines.push(`  Job hopper signal: true`);
  if (m.hasShortStint)                lines.push(`  Has short stint(s): true`);

  // Past experience timeline (top 5)
  if (Array.isArray(c.experienceTimeline) && c.experienceTimeline.length > 0) {
    lines.push(``);
    lines.push(`PAST EXPERIENCE (most recent first):`);
    c.experienceTimeline.slice(0, 5).forEach((exp: any, i: number) => {
      const tenure = exp.tenureMonths ? `${exp.tenureMonths}mo` : "?";
      const dates = `${exp.startDate || "?"} → ${exp.endDate || "present"}`;
      lines.push(`  ${i + 1}. ${exp.title} at ${exp.company} (${tenure}, ${dates})`);
      if (exp.companyIndustry) lines.push(`     Industry: ${exp.companyIndustry}`);
      if (exp.companySize)     lines.push(`     Size: ${exp.companySize}`);
      if (exp.titleSubRole)    lines.push(`     Sub-role: ${exp.titleSubRole}`);
      if (exp.summary)         lines.push(`     Summary: ${String(exp.summary).slice(0, 250)}`);
    });
  }

  // Education
  if (Array.isArray(c.education) && c.education.length > 0) {
    lines.push(``);
    lines.push(`EDUCATION:`);
    c.education.slice(0, 3).forEach((ed: any) => {
      const degrees = Array.isArray(ed.degrees) ? ed.degrees.join(", ") : "";
      const majors = Array.isArray(ed.majors) ? ed.majors.join(", ") : "";
      const dates = `${ed.startDate || "?"} → ${ed.endDate || "?"}`;
      lines.push(`  - ${ed.school || "?"}: ${degrees}${majors ? ` (${majors})` : ""} [${dates}]`);
    });
  }

  // Certifications (relevant ones often)
  if (Array.isArray(c.certifications) && c.certifications.length > 0) {
    const certs = c.certifications.slice(0, 5).map((c: any) => c.name).filter(Boolean);
    if (certs.length) {
      lines.push(``);
      lines.push(`CERTIFICATIONS: ${certs.join(", ")}`);
    }
  }

  // Skills
  if (Array.isArray(c.skills) && c.skills.length > 0) {
    lines.push(``);
    lines.push(`SKILLS: ${c.skills.slice(0, 30).join(", ")}`);
  }

  // Languages
  if (Array.isArray(c.languages) && c.languages.length > 0) {
    const langs = c.languages.map((l: any) => l.name).filter(Boolean);
    if (langs.length) {
      lines.push(`LANGUAGES: ${langs.join(", ")}`);
    }
  }

  // Full summary
  if (c.summary) {
    lines.push(``);
    lines.push(`SUMMARY:`);
    lines.push(String(c.summary).slice(0, 1500));
  }

  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════════════════════
// SCORE BATCH
// ═══════════════════════════════════════════════════════════════════════

async function scoreBatch(
  candidates: any[],
  rubric: any,
  jd: string,
  apiKey: string,
  batchNum: number,
  totalBatches: number
): Promise<any[]> {
  const dimensionsList = rubric.dimensions
    .map((d: any, i: number) =>
      `${i + 1}. ${d.name.toUpperCase()} — ${d.weight} points
   Look for: ${d.whatToLookFor}
   Full marks: ${d.fullScore}
   Zero: ${d.zeroScore}`
    )
    .join("\n\n");

  // ── Cached system context (rubric + JD + tier rules) ──
  // This block is identical across all batches → cache it.
  const cachedContext = `You are a precise CS hiring evaluator.

ROLE CONTEXT: ${rubric.roleType}

CRITICAL REQUIREMENTS:
${rubric.criticalRequirements.map((r: string) => `- ${r}`).join("\n")}

DEAL BREAKERS (if found, set dealBreakerTriggered=true and cap totalScore at 25):
${rubric.dealBreakers.length > 0 ? rubric.dealBreakers.map((d: string) => `- ${d}`).join("\n") : "(none)"}

ORIGINAL JOB DESCRIPTION:
${jd}

SCORING RUBRIC (total ${rubric.dimensions.reduce((s: number, d: any) => s + d.weight, 0)} points):
${dimensionsList}

TIER RULES:
- Tier 1 = 80-100 (hire immediately, very strong fit)
- Tier 2 = 55-79 (good candidate, worth interviewing)
- Tier 3 = below 55 (significant gaps, only if pipeline is thin)

EVALUATION INSTRUCTIONS:
- Score each rubric dimension separately based on candidate profile evidence.
- Be strict. Only give 80+ when there is CLEAR evidence across multiple dimensions.
- If profile is sparse (no past experience, no summary), score conservatively (30-45).
- breakdown[].score must not exceed breakdown[].maxScore (the dimension's weight).
- breakdown[].name must match the rubric dimension name exactly.
- aiSummary is exactly 3 sentences:
  1. What makes them strong for THIS role with specific evidence from their profile
  2. What is specifically missing vs this JD
  3. Clear recommendation in plain language
- strengths must reference actual things in candidate's profile, not generic praise.
- gaps must be specific to this JD, not generic.
- standoutSignal: under 12 words, the single most impressive thing about them.

Use the score_candidates tool to return your answer.`;

  // ── Per-batch user message: candidates ──
  const candidateBlock = candidates.map(serializeCandidate).join("\n\n=========================================\n\n");

  const userMessage = `CANDIDATES TO SCORE (batch ${batchNum}/${totalBatches}, ${candidates.length} candidates):

${candidateBlock}

Score each candidate using the score_candidates tool. Return one entry per candidate.`;

  const response = await callAnthropic(apiKey, {
    model: MODEL,
    max_tokens: 8000,
    tools: [SCORING_TOOL],
    tool_choice: { type: "tool", name: "score_candidates" },
    system: [
      {
        type: "text",
        text: cachedContext,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const scoringInput = extractToolInput(response, "score_candidates");
  if (!scoringInput || !Array.isArray(scoringInput.scores)) {
    console.error(
      `[Scoring] Batch ${batchNum} tool_use failed. Stop reason: ${response?.stop_reason}. Raw:`,
      JSON.stringify(response).slice(0, 500)
    );
    return [];
  }

  // Log cache stats if present
  const usage = response?.usage || {};
  if (usage.cache_read_input_tokens || usage.cache_creation_input_tokens) {
    console.log(
      `[Scoring] Batch ${batchNum} cache stats: read=${usage.cache_read_input_tokens || 0}, created=${usage.cache_creation_input_tokens || 0}, input=${usage.input_tokens || 0}, output=${usage.output_tokens || 0}`
    );
  }

  return scoringInput.scores;
}

// ═══════════════════════════════════════════════════════════════════════
// PARALLEL BATCH RUNNER
// ═══════════════════════════════════════════════════════════════════════

async function runBatchesInParallel<T>(
  tasks: Array<() => Promise<T>>,
  maxParallel: number
): Promise<T[]> {
  const results: T[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const idx = cursor++;
      try {
        results[idx] = await tasks[idx]();
      } catch (err) {
        console.error(`[Scoring] Task ${idx} failed:`, err);
        results[idx] = [] as any;
      }
    }
  }

  const workers = Array.from({ length: Math.min(maxParallel, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

export async function scoreAllCandidates(
  candidates: any[],
  jd: string,
  companyProfile: {
    companyName: string;
    industry?: string;
    stage?: string;
    accountType?: string;
  },
  apiKey: string
): Promise<any[]> {
  if (!apiKey) {
    console.error("[Scoring] No API key provided — returning unscored");
    return candidates.map(c => unscoredFallback(c, "No API key"));
  }

  if (candidates.length === 0) return [];

  console.log(`[Scoring] Starting for ${candidates.length} candidates...`);
  const startTime = Date.now();

  const companyContext = `COMPANY CONTEXT:
Hiring Company: ${companyProfile.companyName}
Industry: ${companyProfile.industry || "Unknown"}
Stage: ${companyProfile.stage || "Unknown"}
Account Type: ${companyProfile.accountType || "Mixed"}`;

  // ── Step 1: Build rubric ───────────────────────────
  let rubric: any;
  try {
    rubric = await buildRubric(jd, companyContext, apiKey);
  } catch (err) {
    console.error("[Scoring] Rubric build threw:", err);
    rubric = null;
  }

  if (!rubric) {
    console.error("[Scoring] No rubric — returning unscored");
    return candidates.map(c => unscoredFallback(c, "Rubric build failed"));
  }

  // ── Step 2: Score in parallel batches ──────────────
  const batches: any[][] = [];
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    batches.push(candidates.slice(i, i + BATCH_SIZE));
  }
  const totalBatches = batches.length;

  console.log(`[Scoring] ${totalBatches} batches × max ${BATCH_SIZE} candidates, parallelism=${MAX_PARALLEL}`);

  const tasks = batches.map((batch, idx) => async () => {
    // Small staggered start so we don't slam Anthropic at t=0
    await new Promise(r => setTimeout(r, idx * BATCH_INTERVAL_MS));
    const batchStart = Date.now();
    const result = await scoreBatch(batch, rubric, jd, apiKey, idx + 1, totalBatches);
    console.log(
      `[Scoring] Batch ${idx + 1}/${totalBatches} done in ${Date.now() - batchStart}ms, ${result.length}/${batch.length} scored`
    );
    return result;
  });

  const batchResults = await runBatchesInParallel(tasks, MAX_PARALLEL);
  const allScores = batchResults.flat();

  // ── Step 3: Merge scores into candidates ───────────
  const scored = candidates.map(c => {
    const s = allScores.find((x: any) => x.id === c.id);

    if (!s) {
      return unscoredFallback(c, "Not in scored set");
    }

    // Enforce deal-breaker cap
    let score = Math.min(100, Math.max(0, s.totalScore));
    if (s.dealBreakerTriggered) {
      score = Math.min(score, DEAL_BREAKER_CAP);
    }

    // Authoritative tier from score (don't trust Claude's tier field)
    const tier: 1 | 2 | 3 =
      score >= TIER_1_MIN ? 1 : score >= TIER_2_MIN ? 2 : 3;
    const matchScore: "High" | "Medium" | "Low" =
      tier === 1 ? "High" : tier === 2 ? "Medium" : "Low";

    return {
      ...c,
      aiScore: score,
      tier,
      matchScore,
      breakdown: Array.isArray(s.breakdown) ? s.breakdown : [],
      strengths: Array.isArray(s.strengths) ? s.strengths : [],
      gaps: Array.isArray(s.gaps) ? s.gaps : [],
      hiringRecommendation: s.hiringRecommendation || "Maybe",
      standoutSignal: s.standoutSignal || "",
      aiSummary: s.aiSummary || c.aiSummary,
      dealBreakerTriggered: Boolean(s.dealBreakerTriggered),
      isPreviewOnly: false,
    };
  });

  // Sort: tier asc (1 first), then score desc
  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return b.aiScore - a.aiScore;
  });

  const t1 = scored.filter(c => c.tier === 1).length;
  const t2 = scored.filter(c => c.tier === 2).length;
  const t3 = scored.filter(c => c.tier === 3).length;
  const elapsed = Date.now() - startTime;

  console.log(
    `[Scoring] Done in ${elapsed}ms — Tier 1: ${t1} | Tier 2: ${t2} | Tier 3: ${t3}`
  );

  return scored;
}

// ═══════════════════════════════════════════════════════════════════════
// FALLBACK
// ═══════════════════════════════════════════════════════════════════════

function unscoredFallback(c: any, reason: string): any {
  return {
    ...c,
    aiScore: 40,
    tier: 3 as const,
    matchScore: "Low" as const,
    breakdown: [],
    strengths: ["Could not evaluate"],
    gaps: [`Scoring unavailable: ${reason}`],
    hiringRecommendation: "Maybe" as const,
    standoutSignal: "",
    aiSummary: c.aiSummary || `Unable to score: ${reason}`,
    dealBreakerTriggered: false,
    isPreviewOnly: true,
  };
}