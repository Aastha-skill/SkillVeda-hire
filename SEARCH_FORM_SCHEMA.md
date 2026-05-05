# SkillVeda Hire — Search Form Schema v1

**Status:** DRAFT for Aastha review — Block A of search-form rebuild
**Last updated:** 2026-05-05
**Scope:** Phase 1 — search input + filtering + scoring. No outreach, no candidate-pool save, no team features (those are Phase 2).
**Replaces:** the current `RequirementWizard.tsx` two-step flow (paragraph → review).

---

## How to read this doc

- **§1–4** are the design contract — read carefully.
- **§5** is curated content drafts — your domain expertise needed; redline freely.
- **§6** is the parser/scoring schema — backend-facing, less critical to review now (but flag anything weird).
- **§7** is the explicit open-question list — I need your call before I write code.

When you're done: send me the redlines + answer §7 questions, then I start Block B.

---

## 1. Form structure (top to bottom)

```
┌─────────────────────────────────────────────────┐
│ ▸ Paste a description (AI fill)   [collapsible] │ ← shortcut entry
├─────────────────────────────────────────────────┤
│ ROLE CONTEXT                                    │
│   Company model:  ◉ B2B SaaS  ○ B2C  ○ ...     │ ← Picker 1
│   Role function:  ◉ Renewals  ○ Onboarding ... │ ← Picker 2
├─────────────────────────────────────────────────┤
│ WHERE & WHEN                                    │
│   Locations:   [Bangalore ×] [+ city]           │
│   Experience:  3 yrs ──────●─────── 8 yrs       │
├─────────────────────────────────────────────────┤
│ THE ROLE                                        │
│   Sub-roles:   [CSM ×] [Account Mgr ×] [+]      │
│   Level:       [Senior ×] [Manager ×] [+]       │
│   Title contains (optional): ____________       │
├─────────────────────────────────────────────────┤
│ COMPANY FIT                                     │
│   Target industries:  [SaaS ×] [Fintech ×] [+]  │
│   Avoid industries:   [Banking ×] [+]           │
│   Company size:       [51-200 ×] [201-500 ×]    │
│   Past companies (must): [Freshworks ×] [+]     │
│   Past companies (avoid): [+]                   │
├─────────────────────────────────────────────────┤
│ SKILLS & TOOLS                                  │
│   Must-have (max 3): [Gainsight ×] [+]          │
│   Nice-to-have:      [Salesforce ×] [+]         │
├─────────────────────────────────────────────────┤
│ ▸ EDUCATION                       [collapsed]   │
│   Degree: [Bachelors] [Masters]                 │
│   Top schools (boost): [IIT ×] [IIM ×]          │
│   Majors: [+]                                   │
├─────────────────────────────────────────────────┤
│ CS-SPECIFIC SIGNALS                 [conditional] │
│   ↑ fields here appear based on picker choices  │
│   Account scope: ○ SMB ◉ Mid-market ○ Ent       │
│   Voice/non-voice: (only for Support)           │
│   Hiring archetype: ○ Builder ○ Operator        │
│   ...                                           │
├─────────────────────────────────────────────────┤
│ ▸ OTHER CONTEXT                  [collapsed]    │
│   Compensation: 12 – 24 LPA                     │
│   Working model: [Hybrid]                       │
│   Notice period: ≤ 60 days                      │
│   Anything else important: __________           │
├─────────────────────────────────────────────────┤
│                  [ Search candidates → ]        │
└─────────────────────────────────────────────────┘
```

**Behavior notes:**
- Every field is always editable, regardless of whether AI filled it.
- Conditional fields (account scope, voice/non-voice, etc.) appear/disappear based on picker selections — but once shown, they don't disappear if the user has typed in them.
- Confidence indicators (⚠) appear next to AI-extracted fields where the parser was uncertain — does not block anything.
- "Search" button always enabled once Country + at least one of (sub-role OR company OR title) is set.
- Re-running search uses the current form state — no re-parse step.

---

## 2. The two pickers

### Picker 1: Company model

| Value | Microcopy under chip | Influences |
|---|---|---|
| **B2B SaaS** | "Software product sold to other businesses" | Industry shortlist (computer software, internet) + size 51-5000; suggests B2B SaaS past cos; scoring weights enterprise-relationship signals |
| **B2C / D2C** | "Consumer-facing app, brand, or service" | Industry shortlist (consumer services, retail, food & bev, internet); suggests B2C past cos; scoring weights scale/efficiency signals |
| **B2B Services / Agency** | "Consulting, IT services, outsourced ops" | Industry: management consulting, IT services; suggests TCS/Accenture/Deloitte; scoring weights project-delivery signals |
| **Enterprise / Traditional** | "Bank, telecom, manufacturing, big traditional cos" | Industry: banking, insurance, telecom + size 5001+; scoring weights enterprise-AM signals |
| **Marketplace** | "Two-sided platform (sellers/buyers, drivers/riders)" | Industry: internet, retail; suggests Flipkart/Meesho/Urban Co; scoring weights provider/seller-success signals |
| **Other / Mixed** | "Doesn't quite fit one — that's OK" | No filter influence; scoring sees raw paragraph context |

**Default:** *open question — see §7.*

### Picker 2: Role function

| Value | Microcopy | PDL sub_role filter |
|---|---|---|
| **Renewals & Expansion** | "Owns retention + growth in existing accounts" | `customer_success`, `account_management` |
| **Onboarding & Adoption** | "Gets new customers live + driving usage" | `customer_success`, `implementation` |
| **Support & Resolution** | "Handles customer questions + issues" | `customer_support` + auto tech-support exclusions |
| **Implementation** | "Technical deployment + configuration" | `implementation`, `solutions_engineering` |
| **Account Management** | "Strategic ownership of key accounts" | `account_management`, `technical_account_management` |

**Default:** *open question — see §7.*

---

## 3. Complete field schema

Legend: **F** = used in PDL filter · **S** = used in Claude scoring · — = not used

| # | Field | Type | F | S | Default | Conditional on | Suggestions source |
|---|---|---|---|---|---|---|---|
| 1 | Country | Single-select | ✅ `location_country` | — | India | Always | Hardcoded India for v1 |
| 2 | Locations (cities) | Multi-chip | ✅ `location_locality` (alias-aware) | Light | None (= pan-India) | Always | Autocomplete from top 15 metros; alias expansion to PDL (bangalore+bengaluru, mumbai+bombay, gurgaon+gurugram) — see §5.7 |
| 3 | Experience range | Range slider | ✅ `inferred_years_experience` | Light | Per archetype | Always | 0–20 yrs |
| 4 | Sub-roles | Multi-chip | ✅ `job_title_sub_role` | ✅ | Per archetype | Always | §5.1 |
| 5 | Title contains | Text (optional) | ✅ `job_title` match | ✅ | None | Always | Free text |
| 6 | Levels | Multi-chip | ✅ `job_title_levels` | ✅ | Per archetype | Always | PDL canonical (entry/manager/senior/director/vp/cxo) |
| 7 | Target industries | Multi-chip + 4-tier | ✅ `job_company_industry` | ✅ | Per archetype | Always | §5.2 |
| 8 | Avoid industries | Multi-chip | ✅ `must_not job_company_industry` | — | None | Always | §5.2 |
| 9 | Company size | Multi-chip | ✅ `job_company_size` | ✅ | Per archetype | Always | PDL canonical (1-10, 11-50, ..., 10001+) |
| 10 | Past companies (must) | Multi-chip | ✅ `experience.company.name` | ✅ | Suggestions only | Always | §5.3 chips + autocomplete fuzzy match (§5.7); free entry allowed |
| 11 | Past companies (avoid) | Multi-chip | ✅ `must_not job_company_name` | — | None | Always | Same autocomplete + free entry (§5.7) |
| 12 | Must-have skills (max 3) | Multi-chip | ✅ Multi-field bool/should | ✅ | Per role function | Always | §5.4 |
| 13 | Nice-to-have skills | Multi-chip | — | ✅ | None | Always | §5.4 |
| 14 | Degree level | Multi-chip | ✅ `education.degrees` | ✅ | None | Education section | PDL canonical |
| 15 | Top schools (boost) | Multi-chip | — | ✅ | None | Education section | §5.5 chips + autocomplete (§5.7) |
| 16 | Majors | Multi-chip | ✅ `education.majors` | ✅ | None | Education section | Free entry; PDL `match` is tokenized so typos are partly tolerant |
| 17 | Account scope | Single-select | — | ✅ | None | function ∈ {Renewals, AM, Implementation} | SMB / Mid-market / Enterprise / Mixed |
| 18 | Voice vs non-voice | Single-select | Light (title) | ✅ | None | function = Support | Voice / Non-voice / Both |
| 19 | Support tier | Single-select | Light (title) | ✅ | None | function = Support | Tier 1 / Tier 2 / Tier 3 / Mixed |
| 20 | Hiring archetype | Single-select | — | ✅ | None | level ∈ {senior, lead, head, vp, cxo} | Builder / Operator / Scaler |
| 21 | Renewals vs expansion focus | Single-select | — | ✅ | None | function = Renewals | Retention / Expansion / Both |
| 22 | Languages | Multi-chip | Light `languages.name` (boost only) | ✅ | None | function = Support OR voice picked | Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Malayalam, Gujarati + free type |
| 23 | Compensation (LPA) | Range | — | ✅ | None | Other section | INR LPA |
| 24 | Working model | Multi-chip | — | ✅ | None | Other section | Remote / Hybrid / Onsite |
| 25 | Notice period (days) | Number | — | ✅ | None | Other section | Free number |
| 26 | "Anything else" free text | Long text | — | ✅ | None | Other section | Catchall for scoring rubric |

**Total: 26 fields.** ~12–18 visible at once depending on picker selections + collapsed sections.

---

## 4. Picker → defaults matrix

For each (company model × role function) combo, this is what auto-populates when picked. User can override anything.

> *Drafting the 6 most common combos in detail. Other combos fall back to per-picker defaults independently (e.g., Marketplace + Implementation = Marketplace industries + Implementation sub-roles).*

### B2B SaaS × Renewals & Expansion (the core CSM hire)
- **Sub-roles:** customer_success, account_management
- **Experience:** 3–8 yrs
- **Levels:** manager, senior
- **Industries (target):** computer software, internet (filtered to B2B SaaS via 4-tier)
- **Company size:** 51-200, 201-500, 501-1000
- **Past companies suggested:** Freshworks, Zoho, Razorpay, Postman, Chargebee, BrowserStack, Whatfix, Mindtickle, Druva, MoEngage, CleverTap, LeadSquared, Atlan, Hasura, Salesforce India, HubSpot India
- **Past companies auto-avoid:** Swiggy, Zomato, Flipkart, Meesho, Myntra (B2C contamination)
- **Must-have skills suggested:** Gainsight, Totango, Catalyst
- **Nice-to-have suggested:** Salesforce, ChurnZero, Outreach, MEDDIC
- **Conditional fields shown:** Account scope, Hiring archetype, Renewals vs expansion focus

### B2C × Support & Resolution (the customer-support agent)
- **Sub-roles:** customer_support
- **Experience:** 0–4 yrs
- **Levels:** entry, training, manager
- **Industries (target):** retail, consumer services, food & beverages, leisure travel & tourism, internet (filtered to B2C)
- **Company size:** any
- **Past companies suggested:** Swiggy, Zomato, Flipkart, Meesho, Myntra, Nykaa, Urban Company, BookMyShow, MakeMyTrip, OYO, BlinkIt, Zepto, Dunzo, Lenskart
- **Past companies auto-avoid:** Freshworks, Zoho (B2B SaaS contamination)
- **Auto exclusions (must_not match):** "technical support", "tech support", "support engineer", "technical advisor"
- **Must-have skills suggested:** Zendesk, Freshdesk, Intercom
- **Nice-to-have suggested:** Salesforce Service Cloud, HelpScout, ServiceNow
- **Conditional fields shown:** Voice vs non-voice, Support tier, Languages

### B2B SaaS × Onboarding & Adoption
- **Sub-roles:** customer_success, implementation
- **Experience:** 2–6 yrs
- **Levels:** manager, senior
- **Industries (target):** computer software, internet (B2B SaaS)
- **Company size:** 51-200, 201-500
- **Past companies suggested:** Whatfix, Mindtickle, Pendo (India), BrowserStack, Freshworks, MoEngage, CleverTap, Hasura, Postman, Druva
- **Auto exclusions:** none specific
- **Must-have skills suggested:** Pendo, WalkMe, Mixpanel
- **Nice-to-have suggested:** Amplitude, Looker, SQL, Whatfix
- **Conditional fields shown:** Account scope

### B2B SaaS × Account Management
- **Sub-roles:** account_management, technical_account_management
- **Experience:** 4–10 yrs
- **Levels:** manager, senior, director
- **Industries:** B2B SaaS shortlist
- **Company size:** 201-500, 501-1000, 1001-5000
- **Past companies suggested:** Salesforce, HubSpot, Zoho, Freshworks, AWS India, Atlassian India, Adobe India, Razorpay
- **Must-have skills suggested:** Salesforce, MEDDIC
- **Nice-to-have suggested:** Outreach, ZoomInfo, LinkedIn Sales Navigator, Gainsight
- **Conditional fields shown:** Account scope, Hiring archetype

### Enterprise × Account Management
- **Sub-roles:** account_management, technical_account_management
- **Experience:** 5–12 yrs
- **Levels:** senior, director, vp
- **Industries (target):** banking, insurance, telecom, computer software (enterprise tier)
- **Company size:** 5001-10000, 10001+
- **Past companies suggested:** TCS, Infosys, Wipro, Accenture, IBM, SAP, Oracle, Salesforce India, ServiceNow, Cognizant, HCL
- **Must-have skills suggested:** Salesforce, MEDDIC
- **Nice-to-have suggested:** Outreach, contract negotiation, vertical knowledge (banking/insurance/etc.)
- **Conditional fields shown:** Account scope (defaulted to Enterprise), Hiring archetype

### Marketplace × Account Management (seller/provider success)
- **Sub-roles:** account_management
- **Experience:** 2–6 yrs
- **Levels:** manager, senior
- **Industries (target):** internet, retail
- **Company size:** 1001-5000, 5001+
- **Past companies suggested:** Flipkart (Seller Hub), Amazon India seller success, Meesho, Myntra brand team, Urban Company (provider), OYO (hotel partners), BlinkIt (rider/store ops), Zepto
- **Must-have skills suggested:** Excel, SQL
- **Nice-to-have suggested:** Tableau, account growth playbooks
- **Conditional fields shown:** Account scope, Hiring archetype

### Fallback for un-detailed combos
For combos not detailed above (e.g., "B2B Services × Onboarding"), apply each picker's defaults independently:
- Sub-roles + tech-support exclusions from role function
- Industry shortlist + suggested past companies from company model
- Experience range = role function default (Renewals: 3-8, Onboarding: 2-6, Support: 0-4, Implementation: 2-6, AM: 4-10)

---

## 5. Curated content drafts

> All lists below are **DRAFTS — Aastha review needed**. Add/remove/reorder freely.

> **Important framing:** These curated lists power **autocomplete suggestions and one-click chips**, not the search universe. Users can always type any value (any company, any city, any school, any skill) and the system will use it. The lists exist to (a) save typing for obvious cases, (b) surface high-value options the user might forget, (c) auto-apply contamination exclusions per archetype. They do NOT constrain what the search can find. See §5.7 for how typos and unknown values are handled.

### 5.1 CS sub-role chip library

The full chip set (user can multi-select). Maps to PDL `job_title_sub_role` canonical values.

| Display chip | PDL sub_role value | When to suggest |
|---|---|---|
| CSM (Customer Success) | `customer_success` | All B2B SaaS functions |
| Customer Support | `customer_support` | All B2C; Support function |
| Account Management | `account_management` | AM function; Renewals (B2B SaaS) |
| Technical Account Mgmt | `technical_account_management` | AM (Enterprise/Tech) |
| Implementation | `implementation` | Implementation function; Onboarding |
| Solutions Engineering | `solutions_engineering` | Implementation (technical) |
| Client Services | `client_services` | B2B Services |
| Customer Operations | `customer_operations`* | Renewals (scaled CS) |
| Customer Experience | `customer_experience` | Rare; B2C/Marketplace |
| Customer Education | `customer_education` | Rare; Onboarding |

*`customer_operations` may not be a canonical PDL value — verify before shipping.

### 5.2 CS-relevant industries shortlist

Curated subset of PDL's 147 industries — these are the ones that actually matter for CS hiring in India. Full list in your `industry-knowledge.ts`.

**Always-show (top 12):**
- Computer Software
- Internet
- Financial Services
- Banking
- Insurance
- E-Learning
- Hospital & Health Care
- Telecommunications
- Retail
- Consumer Services
- Food & Beverages
- Logistics & Supply Chain

**Show on "more":**
- Real Estate, Media Production, Entertainment, Government Administration, Management Consulting, Information Technology and Services, Computer & Network Security, Marketing & Advertising, Hospitality, Education Management, Pharmaceuticals, Automotive

**Industry profiles to add to `industry-knowledge.ts`** (per briefing TODO):
- bpo, foodtech, logistics, banking (split from fintech), insurance, telecom, realestate, media, consulting

### 5.3 Past-company quick-add chips per archetype (NOT the search universe)

These are the ~15-25 names that surface as one-click chips when a user picks a company-model archetype. They're shortcuts — a hiring manager can always type any other company by hand and the search will use it. The lists also seed the autocomplete dropdown (see §5.7). Drafts above in §4; the broader pool below is what I pulled the §4 lists from — flag wrong-bucket placements or obvious missing names.

**B2B SaaS (Indian):** Freshworks, Zoho, Razorpay, Postman, Chargebee, BrowserStack, Whatfix, Mindtickle, Druva, MoEngage, CleverTap, LeadSquared, Atlan, Hasura, Capillary, Innovaccer, Icertis, Eka, Highradius, Yellow.ai, Exotel, Knowlarity, Locus, Vymo, Browserstack, Hippo Video, Rocketlane, Notion Press

**B2B SaaS (US/global with India presence):** Salesforce, HubSpot, Atlassian, Adobe, AWS, Microsoft, Google Cloud, Oracle (cloud), ServiceNow, Workday, Zendesk, Intercom, Slack, Notion, Asana, Monday, Pendo, Gainsight, Totango

**B2C / D2C:** Swiggy, Zomato, Flipkart, Meesho, Myntra, Nykaa, Urban Company, BookMyShow, MakeMyTrip, OYO, BlinkIt, Zepto, Dunzo, Lenskart, Mamaearth, Boat, Sugar Cosmetics, Wakefit, Licious, Bigbasket, FirstCry, PharmEasy, 1mg, Cult.fit, CRED (consumer side)

**Enterprise / Traditional:** TCS, Infosys, Wipro, HCL, Accenture, Cognizant, IBM India, SAP Labs, Oracle India, Microsoft India, Capgemini, LTI, Mphasis, Tech Mahindra, Mindtree, Birlasoft, Persistent

**Marketplace:** Flipkart, Amazon India, Meesho, Myntra, Urban Company, OYO, BlinkIt, Zepto, Dunzo, Swiggy Genie

**B2B Services / Agency:** TCS, Infosys, Accenture, Deloitte, KPMG, EY, McKinsey India, BCG India, Bain India, ZS Associates, Mu Sigma

**Indian fintech (subset of B2B SaaS for fintech-specific):** Razorpay, PhonePe, Paytm, CRED, Groww, Zerodha, Upstox, Niyo, Jupiter, Slice, Khatabook, OkCredit, BharatPe, Pine Labs, Mswipe, Zeta, Setu, M2P, Fi Money, Lendingkart, KreditBee

### 5.4 Suggested skills per role function

Hard rule per PDL doc: **NEVER send soft skills to PDL** ("communication", "leadership", "teamwork", "problem-solving", "interpersonal", "english", "hindi"). Those go in scoring rubric only.

**Renewals & Expansion:** Gainsight, Totango, Catalyst, ChurnZero, Salesforce, Outreach, Mixpanel, Amplitude, MEDDIC, Forecasting, NPS

**Onboarding & Adoption:** Pendo, WalkMe, Whatfix, Mixpanel, Amplitude, Looker, SQL, Tableau, Project management, JIRA, Confluence

**Support & Resolution:** Zendesk, Freshdesk, Intercom, HelpScout, ServiceNow, Salesforce Service Cloud, Kustomer, Front, JIRA Service Management, ITIL

**Implementation:** Salesforce, SQL, REST APIs, Postman, JIRA, Confluence, Python, JavaScript, AWS, Azure, GCP, Snowflake, Looker

**Account Management:** Salesforce, HubSpot, Outreach, MEDDIC, ZoomInfo, LinkedIn Sales Navigator, Apollo, Gong, Clari, Salesloft

**Cross-function tools (suggest to all):** Slack, Notion, Excel, Google Workspace

### 5.5 Top schools shortlist (for "boost" picker)

**Tier 1 (always show):** IIT (any), IIM (any), IISc, ISB, XLRI, FMS Delhi, MDI Gurgaon

**Tier 2 (show on "more"):** SP Jain, NMIMS Mumbai, Symbiosis Pune, BITS Pilani, NIT (top 10), DTU, NSIT, VIT, Manipal, IIIT (top), IIFT

**Top consumer/general universities:** Delhi University (St. Stephens, Hindu, SRCC, LSR), Mumbai University, JNU, Christ Bangalore, Loyola Chennai, Presidency Kolkata

### 5.6 Soft-skills exclusion list (NEVER send to PDL)

When parsing a paragraph, if these terms appear as "skills," route to `scoringContext.softSkills` not to PDL filter:
- communication, verbal communication, written communication
- leadership, teamwork, collaboration
- problem-solving, critical thinking, analytical
- time management, organization, prioritization
- interpersonal, empathy, active listening
- english, hindi, tamil, etc. (these are languages → field 22, not skills)
- adaptability, resilience, ownership

### 5.7 Typo handling and free-text input validation

**The core problem:** PDL's `experience.company.name` and `job_company_name` are **exact-match keyword fields**. PDL lowercases everything but otherwise matches strings literally. So:

| User types | PDL behavior |
|---|---|
| `Freshworks` → `freshworks` | ✅ matches |
| `Freshwroks` (typo) | ❌ zero matches |
| `Fresh Works` (extra space) | ❌ zero matches |
| `freshwork` (singular) | ❌ zero matches |

Without protection, a single typo = empty search results = wasted credit + bad UX. We solve this in three layers.

#### Layer 1 — Autocomplete with fuzzy match at INPUT time (must build for v1)

Past-company, location, school, and skill chip inputs are **autocomplete dropdowns**, not raw text fields. As the user types:
- Match against the relevant curated list (§5.3 for companies, top 15 metros for cities, §5.5 for schools, §5.4 for skills) using fuzzy match (Levenshtein distance ≤ 2 or similar)
- Suggestions ranked by archetype relevance (e.g., B2B SaaS picker → B2B SaaS companies surface first in past-company input)
- Click suggestion → canonical name added as chip
- Suggestions visually highlight the typo region (e.g., "Fresh**w**orks" when user typed "Freshwroks")

Catches the common case of "I knew the name but spelled it wrong" before it reaches PDL.

#### Layer 2 — Free entry allowed for unknown values (must build for v1)

Some companies/cities/schools aren't in our curated lists. User can still type anything and add as chip — we just store it as-is.

For these unknowns:
- We don't try to validate (we can't tell typo vs unknown company)
- After search, if a specific chip contributes zero PDL matches, surface a soft warning: *"No candidates found from 'Freshwroks' — did you mean: Freshworks?"* with a one-click swap
- "Did you mean" uses fuzzy match against our curated list

This is post-search recovery; less ideal than Layer 1, but covers the long tail.

#### Layer 3 — Smart aliases for known abbreviations (DEFER to v1.1)

Some companies have widely-used aliases that PDL might index either way:
- TCS / Tata Consultancy Services
- BSNL / Bharat Sanchar Nigam Limited
- HDFC / Housing Development Finance Corporation
- HUL / Hindustan Unilever
- L&T / Larsen & Toubro

When user types "TCS" → send PDL both `"tcs"` and `"tata consultancy services"` in a `terms` query.

For v1, this is a tiny alias map (~20 entries) — we can either ship it or defer. **My lean: defer to v1.1**, since Layer 1+2 already cover most pain.

#### Per-field summary

| Field | Layer 1 (autocomplete) | Layer 2 (free entry) | Layer 3 (aliases) | Other |
|---|---|---|---|---|
| Past companies (must / avoid) | ✅ from §5.3 + global Indian co. dictionary | ✅ free type allowed | Defer | — |
| Locations | ✅ from top 15 metros | ✅ free type allowed | ✅ MUST send aliases to PDL (bangalore+bengaluru, etc.) — non-negotiable per PDL doc | — |
| Top schools | ✅ from §5.5 | ✅ free type allowed | Defer | — |
| Skills | ✅ from §5.4 | ✅ free type allowed | — | PDL query uses `fuzziness: AUTO` natively — no alias work needed |
| Industries | N/A — chip-only picker, no typing | — | — | 4-tier knowledge file handles synonyms |
| Majors | ✅ light suggest | ✅ free type allowed | — | PDL `match` is tokenized so partial tolerance built in |

#### Source for the autocomplete dictionary

For v1 the autocomplete pulls from:
- **Companies:** §5.3 curated list (~200-400 names across all archetypes)
- **Cities:** Top 15 Indian metros + states
- **Schools:** §5.5 curated list (~50 names)
- **Skills:** §5.4 curated list (~80 names)

For v2 we could expand companies via PDL's `/v5/company/search` endpoint (look up unknown company names live as user types) but that adds latency and PDL cost — not worth it for v1.

---

## 6. Schema for parser & scoring

### Parser output shape (`parse-requirement.ts` returns this)

```ts
{
  // Picker selections (parser may infer or leave null)
  companyModel: "b2b_saas" | "b2c" | "b2b_services" | "enterprise" | "marketplace" | "other" | null,
  roleFunction: "renewals" | "onboarding" | "support" | "implementation" | "account_management" | null,

  // Filter fields (sent to PDL)
  filters: {
    locationCountry: "india",
    locationLocalities: string[],   // with aliases applied
    minExp: number | null,
    maxExp: number | null,
    subRoles: string[],              // PDL canonical values
    titleKeywords: string | null,
    levels: string[],                // PDL canonical
    targetIndustries: string[],      // resolved through 4-tier knowledge
    avoidIndustries: string[],
    companySizes: string[],
    pastCompaniesMust: string[],
    pastCompaniesAvoid: string[],
    mustHaveSkills: string[],        // max 3, multi-field PDL search
    degreeLevels: string[],
    majors: string[],
  },

  // Scoring fields (sent to Claude scoring engine, NOT PDL)
  scoringContext: {
    niceToHaveSkills: string[],
    softSkills: string[],            // routed from parsed paragraph
    topSchools: string[],
    accountScope: "smb" | "mid_market" | "enterprise" | "mixed" | null,
    voiceMode: "voice" | "non_voice" | "both" | null,
    supportTier: "tier_1" | "tier_2" | "tier_3" | "mixed" | null,
    hiringArchetype: "builder" | "operator" | "scaler" | null,
    renewalsExpansionFocus: "retention" | "expansion" | "both" | null,
    languages: string[],
    compensationLPA: [number | null, number | null] | null,
    workingModel: ("remote" | "hybrid" | "onsite")[],
    noticePeriodDays: number | null,
    freeText: string | null,         // "anything else important" + parts of paragraph not extracted
    rawParagraph: string,
  },

  // Per-field confidence
  confidence: Record<string, "high" | "medium" | "low">,

  // For "you might want to add..." prompts
  unfilledHighValueFields: string[],
}
```

### Scoring engine input

The scoring engine (`cs-scoring-engine.ts`) receives:
- The full `filters` + `scoringContext` above
- The picker selections (`companyModel`, `roleFunction`)
- The candidate's full PDL profile

It uses picker + scoringContext to build a CS-specific rubric. Example:
- `companyModel = "b2b_saas"` + `roleFunction = "renewals"` → judge candidate against B2B SaaS CSM rubric (renewals discipline, account ownership, expansion track record, Gainsight depth, etc.)
- `companyModel = "b2c"` + `roleFunction = "support"` + `voiceMode = "voice"` → judge against voice-support rubric (call handling, multilingual, ticket resolution, BPO experience).

The rubric contents themselves are **out of scope for Block A** — that's a Block C item. This doc only locks the inputs.

---

## 7. Open questions — I need your call before coding

| # | Question | My lean |
|---|---|---|
| 1 | Default value for **Company model** picker: blank (force pick) or pre-select "B2B SaaS"? | Pre-select B2B SaaS — most common case, lowers friction |
| 2 | Default value for **Role function** picker: blank or pre-select "Renewals"? | Force pick — these aren't equivalent and shouldn't have a "default" |
| 3 | Should **"Other / Mixed"** company model exist? Or force a category? | Keep it. Real-world hybrids (Paytm, OYO) need it. |
| 4 | Add **Customer Operations + Customer Education** as role function options? | Skip for v1. Add if real searches need them. |
| 5 | For **B2C searches**, auto-exclude Freshworks/Zoho/etc. by default? | Yes (auto-applied, user can remove) |
| 6 | Past-company curated lists: include **US-headquartered cos with India presence** (Salesforce, HubSpot, Atlassian)? | Yes — Indian CS folks often cycle through these |
| 7 | **Languages** field — assume English by default and not list it, or include it? | Skip English (assumed). List Indian languages only. |
| 8 | **Education degree filter** — minimum bachelors as default, or all unselected? | All unselected. Don't accidentally exclude self-taught CS support folks. |
| 9 | "**Saved searches → start from this**" quick-start option in the UI? | Yes for v1.1 — defer to Block D polish. Not Block A. |
| 10 | **Past companies (must)**: Should it be `must` filter or `should` boost? Strict-must risks zero results. | Default to `should` boost (rank up, don't exclude). Add a "strict" toggle. |
| 11 | **Title contains** field — useful or noise? Parser can fill it from paragraph. | Keep it — power users will want it. |
| 12 | Conditional **Account scope**: shown for Renewals/AM/Implementation. Should it ALSO show for senior+ Support roles? | No. Account scope is a B2B/Enterprise concept; B2C support is volume-based. |

---

## 8. Out of scope for v1 (explicit)

- Boolean string entry for power users
- Saved candidate notes / tags / shortlists
- Outreach send / response tracking (Phase 2)
- Candidate-pool save (separate roadmap item)
- Multi-search comparison
- Team collaboration (multiple users on one search)
- Export to CSV / ATS integration
- Custom scoring rubric per company
- Saved-search quick-start menu (defer to v1.1 polish)

---

## 9. What I'm NOT changing in this rebuild

- The results UI (tier 1/2/3 cards) — stays as-is
- The 30-day cache logic
- The credit-charge logic
- The `customers.search_history` storage shape (we'll add new keys to `cached_candidates` JSON, but won't migrate existing rows)
- Auth, payments, email, blog
- Production deployment plumbing
- The 4-tier industry mapping system (`industry-knowledge.ts`) — we EXTEND it, not rewrite it

---

**End of schema doc.** Read, redline, answer §7, send back. I'll start Block B (form UI build) once we're aligned.
