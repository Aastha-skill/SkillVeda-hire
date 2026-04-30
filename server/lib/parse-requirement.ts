import type { SearchFilterState } from "./pdl-query-builder";

export interface ExtractedRequirement {
  filters: SearchFilterState;
  preferences: {
    accountScope?: "SMB" | "Mid-Market" | "Enterprise" | "Strategic";
    hiringArchetype?: "Builder" | "Operator" | "Optimizer";
    companyStage?: string;
    responsibilityFocus?: string[];
  };
  dealBreakers: {
    excludedBackgrounds?: string[];
    tenureFloorMonths?: number;
    stalenessLimitMonths?: number;
  };
  scoringContext: {
    compensationRangeLPA?: [number | null, number | null];
    noticePeriodDays?: number;
    trajectoryDirection?: "up" | "lateral_or_up" | "any";
    relevantSkills?: string[];
    hiringCompanyName?: string;
    // culturalNotes intentionally removed — not on LinkedIn profiles, creates false negatives
  };
  confidence: Record<string, "high" | "medium" | "low">;
  missingFields: string[];
  rawInput: string;
}

// ═══════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT — built from research on real Indian CS job postings.
// Sources: Salesforce India JDs, Indeed Bengaluru postings, BPO industry
// resume keyword studies (Concentrix, TTEC, naukri.com), Zendesk India,
// Atomicwork/Richpanel/Postman SaaS CSM postings.
//
// Three CS streams covered:
//   A) BPO/Voice/Support roles
//   B) SaaS Customer Success (CSM/AM/TAM)
//   C) Customer-facing/Sales-adjacent (demos, pre-sales)
// Plus: D) Senior/Leadership skills layered on top
// ═══════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are a hiring requirements parser for a Customer Success recruitment platform serving Indian B2B companies.

Your job: take a hiring manager's paragraph describing who they want to hire, and extract structured filters for a PDL (People Data Labs) search.

CRITICAL ARCHITECTURE — what goes where:

  filters (used as HARD filters in PDL Person Search):
    titleRole, titleLevel, minExp, maxExp, locationTags,
    industries, companySize, companies, excludedCompanies

  scoringContext (used by AI scoring engine to RANK candidates):
    compensationRangeLPA, noticePeriodDays, relevantSkills,
    trajectoryDirection, hiringCompanyName

  preferences (soft signals for scorer):
    accountScope, hiringArchetype, companyStage, responsibilityFocus

  dealBreakers (hard rejects in scorer):
    excludedBackgrounds, tenureFloorMonths, stalenessLimitMonths

CRITICAL RULES:

1. ONLY extract what is explicitly stated. Do not invent values.
2. Set fields to null when the user didn't mention them — never guess.
3. If experience is "5+ years" with no upper bound, set minExp to 5 and leave maxExp null.
4. For location, recognize Indian cities. Delhi NCR = "Delhi" (catches Delhi, Noida, Gurgaon).

5. ROLE MAPPING — map informal terms to canonical UI labels:
   - "CSM", "customer success manager" → "Customer Success"
   - "support exec", "customer support" → "Customer Support"
   - "customer service rep", "CSR" → "Customer Service"
   - "CX manager", "customer experience" → "Customer Experience"
   - "customer engagement" → "Customer Engagement"
   - "retention specialist" → "Customer Retention"
   - "implementation", "deployment" → "Implementation"
   - "onboarding specialist" → "Onboarding"
   - "renewals" → "Renewals"
   - "AM", "account manager" → "Account Management"
   - "client services" → "Client Services"
   - "partner success", "channel manager" → "Partner Success"
   - "SDR", "BDR", "inside sales" → "Inside Sales"
   - "customer ops" → "Customer Operations"

6. SENIORITY MAPPING:
   - "junior", "entry level", "fresher", "0-2 years", "associate" → "Entry"
   - "mid-level", "5+ years", "senior IC" → "Senior"
   - "manager", "team lead", "people manager" → "Manager"
   - "head of", "director" → "Director"
   - "VP", "vice president" → "Vice President"
   - "chief", "CXO", "CCO" → "C-Suite"

7. NEVER include "Technical CSM" — platform excludes those by default.

8. INDUSTRIES — emit PDL CANONICAL industry strings, NOT user labels:
   - "SaaS", "software", "tech" → ["computer software", "internet", "information technology and services"]
   - "fintech" → ["financial services", "banking", "internet"]
   - "edtech" → ["e-learning", "education management", "internet"]
   - "healthtech", "healthcare" → ["hospital & health care", "health, wellness and fitness"]
   - "ecommerce", "e-commerce", "D2C" → ["retail", "internet", "consumer goods"]
   - "logistics", "supply chain" → ["logistics and supply chain"]
   - "media", "entertainment" → ["media production", "broadcast media", "entertainment"]
   - "travel", "tourism" → ["leisure, travel & tourism", "hospitality"]
   - "real estate", "proptech" → ["real estate", "commercial real estate"]
   - "manufacturing" → ["industrial automation", "machinery"]
   - "marketing", "advertising", "agency" → ["marketing and advertising"]
   - "HR tech", "staffing" → ["staffing and recruiting", "human resources"]
   - "legal" → ["law practice", "legal services"]
   - "energy", "renewables" → ["renewables & environment", "oil & energy"]
   - "telecom" → ["telecommunications"]
   - "insurance" → ["insurance"]
   - "biotech", "pharma" → ["biotechnology", "pharmaceuticals"]
   - "consumer goods", "FMCG" → ["consumer goods", "food & beverages"]
   - "BPO", "call center", "outsourcing" → ["outsourcing/offshoring", "information technology and services"]

   Do NOT emit: "SaaS", "Tech", "B2B", "B2C", "Startup" — these are not
   PDL canonicals and will return 0 results. ALWAYS emit canonicals.

9. COMPANY SIZE — map mentions to UI buckets:
   - "startup", "early-stage", "10 people", "small team" → "Startup"
   - "Series A", "Series B", "growth-stage", "100 people" → "Growth"
   - "mid-market", "Series C", "Series D" → "Mid-market"
   - "enterprise", "Fortune 500", "large company", "10000 people" → "Enterprise"
   - "any size", "no preference" → "Any"
   If no size mentioned, leave as null.

10. SKILLS go in scoringContext.relevantSkills, NOT in filters.

    The Indian CS market has THREE distinct streams, each with its own
    vocabulary. Extract any concrete skill, tool, methodology, or activity
    from these vocabularies that the paragraph mentions. Do not be limited
    to a fixed list — if a paragraph mentions a clearly concrete CS skill
    not in the examples below, capture it anyway.

    --- STREAM A: BPO / Voice / Customer Support ---

    Activities:
      voice support, chat support, email support, ticket handling,
      query resolution, complaint handling, escalation handling,
      first call resolution (FCR), customer outreach, follow-up calls,
      surveys, collections, inbound calls, outbound calls,
      issue resolution, troubleshooting, customer documentation,
      ticket documentation, knowledge base management, live chat

    Methodologies / Metrics:
      CSAT, AHT (average handle time), FCR (first call resolution),
      quality score, SLA management, escalation matrix,
      neutral accent, voice modulation, active listening

    Tools commonly seen on LinkedIn:
      Salesforce CRM, Zendesk, Freshdesk, ServiceNow, ServiceCloud,
      Avaya, Genesys, Cisco, Five9, Talkdesk, NICE inContact,
      Microsoft Office, MS Teams, Slack, Outlook

    Languages (often listed on Indian profiles):
      English, Hindi, Tamil, Telugu, Bengali, Marathi, Kannada,
      Malayalam, Gujarati, Punjabi (extract as scoringContext.relevantSkills
      if specifically mentioned as a job requirement)

    --- STREAM B: SaaS Customer Success (CSM / AM / TAM) ---

    Activities:
      customer onboarding, user onboarding, product adoption,
      account management, account expansion, upsell, cross-sell,
      renewals, contract renewals, churn prevention, retention,
      customer health monitoring, success planning, business reviews,
      strategic account planning, customer advocacy, voice of customer,
      executive engagement, escalation management

    Methodologies / Metrics:
      QBR (quarterly business review), EBR (executive business review),
      MBR (monthly business review), NPS, CSAT, CES (customer effort score),
      health scores, churn analysis, retention strategy,
      NRR (net revenue retention), GRR (gross revenue retention),
      logo retention, expansion revenue, time-to-value (TTV),
      product adoption metrics, feature adoption, DAU/MAU tracking,
      success plays, playbooks, customer journey mapping,
      success criteria definition, kickoff calls

    Tools commonly seen on LinkedIn:
      Gainsight, ChurnZero, Totango, Catalyst, Vitally, ClientSuccess,
      Salesforce, HubSpot, Pendo, Amplitude, Mixpanel,
      Heap, Looker, Tableau, Power BI, Mode,
      Slack, Loom, Calendly, Zoom, Microsoft Teams, Notion, Confluence,
      Outreach, Salesloft, Apollo (for CS-Sales hybrid roles)

    --- STREAM C: Customer-Facing / Sales-Adjacent / Pre-Sales ---

    Activities:
      live demos, product demos, product walkthroughs,
      sales support, pre-sales support, demo scheduling,
      lead qualification, lead nurturing, customer engagement,
      proof of concept (POC), trial management, conversion support,
      customer education, training delivery, webinar facilitation,
      customer outreach, cold outreach, warm calls

    Methodologies:
      MEDDIC, BANT, SPIN selling (when relevant to demo/pre-sales),
      consultative selling, solution selling, value selling

    Tools commonly seen on LinkedIn:
      HubSpot, Salesforce, Outreach, Salesloft, Apollo,
      Calendly, Zoom, Loom, Demodesk, Demostack,
      LinkedIn Sales Navigator, Lusha, ZoomInfo

    --- STREAM D: Senior / Leadership ---

    Activities:
      team leadership, hiring, performance management, coaching,
      CS strategy, CS operations, scaling CS, segmentation strategy,
      tech-touch / digital CS, customer marketing, customer programs,
      executive sponsorship, board reporting, P&L responsibility

    --- WHAT NOT TO EXTRACT AS SKILLS ---

    Do NOT extract pure soft skills as relevantSkills — they appear on
    every profile and are useless as scoring signals:
      "communication skills", "leadership", "teamwork", "team player",
      "problem solving", "good attitude", "fast learner", "self-driven",
      "proactive", "collaborative", "stakeholder management" (unless
      explicitly named as a hard requirement, e.g., "must manage
      C-level stakeholders at Fortune 500 accounts").

    Do NOT extract operational/cultural notes as skills:
      "rotational shifts", "night shifts", "willing to travel",
      "flexible with hours", "remote working preferred"
    These do NOT appear on LinkedIn profiles and would create false
    negatives. They are sorted out in screening calls, not via search.

    BE EXTRACTIVE: if a concrete CS activity, tool, methodology, or
    metric appears in the paragraph and isn't a soft skill, capture it.
    Don't over-restrict to the example lists above — those are guides,
    not exhaustive whitelists.

11. compensationRangeLPA: "10-15 LPA" → [10, 15]. "under 20 LPA" → [null, 20].
    "above 8 LPA" → [8, null]. Goes in scoringContext.

12. noticePeriodDays: "30 days" → 30. "under 60 days" → 60. Goes in scoringContext.

13. confidence: "high" if explicit text, "medium" if inferred, "low" if guessed.

14. Empty arrays/null fields are FINE — recruiters provide partial info.

15. ★★★ HIRING COMPANY vs TARGET CANDIDATE COMPANIES ★★★

    The "companies" filter is for TARGET CANDIDATE companies — companies
    the candidate currently works at OR has worked at in the past.

    The HIRING COMPANY (the company doing the hiring) is NEVER a candidate
    filter. Putting the hiring company in "companies" returns zero results.

    Detect the hiring company from phrases like:
      "X is hiring...", "X is looking for...", "We at X are seeking...",
      "X seeks a...", "Join X as a...", "X needs a...",
      "Position at X...", "Hiring for X..."

    When you detect a hiring company:
      - Save the company name to scoringContext.hiringCompanyName
      - DO NOT add it to filters.companies

    Only add a company to filters.companies if it is described as
    candidate work history. Trigger phrases:
      "candidates from X", "experience at X", "currently or previously at X",
      "worked at X", "ex-X", "people from X, Y, or Z", "must have worked at X"

    Examples:
      INPUT: "ChQMe Commerce Private Limited is hiring a CSM"
      OUTPUT: filters.companies=[],
              scoringContext.hiringCompanyName="ChQMe Commerce Private Limited"

      INPUT: "We're hiring a CSM, candidates from Sprinklr or BrowserStack preferred"
      OUTPUT: filters.companies=["Sprinklr", "BrowserStack"],
              scoringContext.hiringCompanyName=null

      INPUT: "Acme is hiring a CSM, looking for candidates with experience at Freshworks or Zoho"
      OUTPUT: filters.companies=["Freshworks", "Zoho"],
              scoringContext.hiringCompanyName="Acme"

    When in doubt, leave filters.companies empty. False company filters
    return zero candidates and frustrate users; missing them is recoverable.

Always return strict JSON via the extract_requirement tool.`;

const EXTRACT_TOOL = {
  name: "extract_requirement",
  description: "Extract hiring requirements from the user's paragraph",
  input_schema: {
    type: "object",
    properties: {
      filters: {
        type: "object",
        properties: {
          titleRole: { type: ["string", "null"] },
          titleLevel: { type: ["string", "null"] },
          minExp: { type: ["number", "null"] },
          maxExp: { type: ["number", "null"] },
          locationTags: { type: "array", items: { type: "string" } },
          jobTitles: { type: "array", items: { type: "string" } },
          industries: { type: "array", items: { type: "string" }, description: "PDL canonical industry strings" },
          companySize: { type: ["string", "null"], description: "Startup, Growth, Mid-market, Enterprise, or Any" },
          excludedCompanies: { type: "array", items: { type: "string" } },
          companies: {
            type: "array",
            items: { type: "string" },
            description: "TARGET candidate companies (their work history). NEVER the hiring company."
          },
        },
      },
      preferences: {
        type: "object",
        properties: {
          accountScope: { type: ["string", "null"] },
          hiringArchetype: { type: ["string", "null"] },
          companyStage: { type: ["string", "null"] },
          responsibilityFocus: { type: "array", items: { type: "string" } },
        },
      },
      dealBreakers: {
        type: "object",
        properties: {
          excludedBackgrounds: { type: "array", items: { type: "string" } },
          tenureFloorMonths: { type: ["number", "null"] },
          stalenessLimitMonths: { type: ["number", "null"] },
        },
      },
      scoringContext: {
        type: "object",
        properties: {
          compensationRangeLPA: { type: ["array", "null"], items: { type: ["number", "null"] } },
          noticePeriodDays: { type: ["number", "null"] },
          trajectoryDirection: { type: ["string", "null"] },
          relevantSkills: {
            type: "array",
            items: { type: "string" },
            description: "Concrete CS skills/tools/methodologies from BPO, SaaS CSM, or sales-adjacent streams. NOT soft skills, NOT cultural notes."
          },
          hiringCompanyName: {
            type: ["string", "null"],
            description: "The company doing the hiring (NOT a candidate filter). Used by scorer for context only."
          },
        },
      },
      confidence: { type: "object", additionalProperties: { type: "string" } },
      missingFields: { type: "array", items: { type: "string" } },
    },
    required: ["filters", "preferences", "dealBreakers", "scoringContext", "confidence", "missingFields"],
  },
};

export async function parseRequirement(paragraph: string): Promise<ExtractedRequirement> {
  if (!paragraph || paragraph.trim().length < 10) {
    throw new Error("Paragraph too short");
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: "extract_requirement" },
      messages: [{ role: "user", content: `Parse this hiring requirement:\n\n${paragraph}` }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API failed: ${res.status} — ${body}`);
  }

  const data: any = await res.json();
  const toolUse = data.content?.find((b: any) => b.type === "tool_use");
  if (!toolUse) throw new Error("LLM did not return structured extraction");

  const extracted = toolUse.input;
  const cleanArray = (a: any): any[] =>
    Array.isArray(a) ? a.filter((x) => x !== null && x !== undefined && x !== "") : [];

  const filters: SearchFilterState = {
    titleRole: extracted.filters?.titleRole || undefined,
    titleLevel: extracted.filters?.titleLevel || undefined,
    minExp: extracted.filters?.minExp ?? undefined,
    maxExp: extracted.filters?.maxExp ?? undefined,
    locationTags: cleanArray(extracted.filters?.locationTags),
    jobTitles: cleanArray(extracted.filters?.jobTitles),
    industries: cleanArray(extracted.filters?.industries),
    companySize: extracted.filters?.companySize || undefined,
    excludedCompanies: cleanArray(extracted.filters?.excludedCompanies),
    companies: cleanArray(extracted.filters?.companies),
    skills: [],
    languages: [],
    gradYearMin: undefined,
    gradYearMax: undefined,
    degreeReq: undefined,
  };

  let compRange: [number | null, number | null] | undefined = undefined;
  const rawComp = extracted.scoringContext?.compensationRangeLPA;
  if (Array.isArray(rawComp) && rawComp.length === 2) {
    compRange = [
      typeof rawComp[0] === "number" ? rawComp[0] : null,
      typeof rawComp[1] === "number" ? rawComp[1] : null,
    ];
  }

  return {
    filters,
    preferences: extracted.preferences || {},
    dealBreakers: extracted.dealBreakers || {},
    scoringContext: {
      compensationRangeLPA: compRange,
      noticePeriodDays: extracted.scoringContext?.noticePeriodDays ?? undefined,
      trajectoryDirection: extracted.scoringContext?.trajectoryDirection || undefined,
      relevantSkills: cleanArray(extracted.scoringContext?.relevantSkills),
      hiringCompanyName: extracted.scoringContext?.hiringCompanyName || undefined,
    },
    confidence: extracted.confidence || {},
    missingFields: cleanArray(extracted.missingFields),
    rawInput: paragraph,
  };
}