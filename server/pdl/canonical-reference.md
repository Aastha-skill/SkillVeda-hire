# PDL Complete Filter Reference — SkillVeda Hire

> All canonical values for every filter field PDL accepts. Fetched directly from PDL official docs (v28.0 / v29.1).
> Use this as Claude's vocabulary when generating PDL search queries.
> Scope: India-only locations. Revenue hiring (CS, Sales, RevOps).

---

## How to read this doc

PDL has two types of fields:

**1. Filter fields** — used in the ES query to narrow the pool. Must use exact canonical values from the lists below.

**2. Returned fields** — come back in the response. Claude reads these to score candidates but they're never used as filters (free text, no canonical list).

For every filter field on a person's current job (`job_*`), PDL also has a parallel field on past jobs (`experience.*`). These past-experience fields use the **same canonical values** as the current-job version. So you don't need to memorize them twice — the vocabulary below applies to both.

---

## Filter fields — quick reference

| # | Field | Canonical values | Section |
|---|---|---|---|
| 1 | `job_title_role` | 24 | §1 |
| 2 | `job_title_sub_role` | 105 | §2 |
| 3 | `job_title_levels` | 10 | §3 |
| 4 | `inferred_years_experience` | numeric range | §4 |
| 5 | `location_country` | "india" | §5 |
| 6 | `location_region` | 36 (India states/UTs) | §6 |
| 7 | `location_locality` | ~50 Indian cities | §7 |
| 8 | `job_company_industry_v2` | ~420 | §8 |
| 9 | `job_company_size` | 8 | §9 |
| 10 | `job_company_inferred_revenue` | 10 | §10 |
| 11 | `job_company_funding_stages` | 29 | §11 |
| 12 | `education.degrees` | 161 | §12 |
| 13 | `experience.title.role` | same as §1 | §13 |
| 14 | `experience.title.sub_role` | same as §2 | §13 |
| 15 | `experience.title.levels` | same as §3 | §13 |
| 16 | `experience.company.industry_v2` | same as §8 | §13 |
| 17 | `experience.company.size` | same as §9 | §13 |
| 18 | `experience.company.name` | free text | §13 |
| 19 | `dataset` param | 8 | §14 |

**Returned fields** (not filters, Claude reads for scoring) — §15

---

## §1. `job_title_role` — ALL 24 values

Primary role classification. Use with `term` or `terms`.

```
advisory
analyst
creative
education
engineering
finance
fulfillment
health
hospitality
human_resources
legal
manufacturing
marketing
operations
partnerships
product
professional_service
public_service
research
sales
sales_engineering
support
trade
unemployed
```

**Revenue hiring subset (the only ones you'll use):**

| Role | When to use |
|---|---|
| `sales` | AEs, BDRs, SDRs, AMs, sales managers, CROs |
| `support` | CSMs, Customer Success, Customer Support, Implementation |
| `sales_engineering` | Solutions Engineers, Pre-sales |
| `operations` | RevOps, Sales Ops, CS Ops |
| `marketing` | Marketing, Demand Gen, Growth Marketing |
| `partnerships` | Partnership Managers, Channel Managers, BD |

⚠️ **`customer_service` does NOT exist** in PDL's taxonomy. For CS roles, use `support` as the role.

---

## §2. Recruiter-Language Mapping for Revenue Sub-Roles (EXPANDED)

> **This is the most important section of the doc.** When Haiku sees a JD title, it uses these tables to map any title variation back to a canonical PDL sub-role.
> Research sources (May 2026): live Razorpay, Freshworks, BrowserStack, Chargebee, Postman, Zoho job postings; LinkedIn India job feed; Indian SaaS / IT services hiring conventions; Customer Success Collective; Winning by Design SaaS taxonomy.

---

## How to use this section

For each revenue-relevant sub-role:
1. **The canonical PDL value** (what goes into the query)
2. **Title variants** — every English form a JD might use
3. **Indian-specific variants** — what Indian SaaS / D2C / IT services actually write
4. **Abbreviations** — short forms that appear on resumes
5. **Disambiguation signals** — JD body language that distinguishes this from adjacent sub-roles
6. **What this is NOT** — titles that LOOK similar but map elsewhere

---

## 2.1 `customer_success`

**Title variants (English / Global):**
```
Customer Success Manager
Senior Customer Success Manager
Lead Customer Success Manager
Principal Customer Success Manager
Customer Success Executive
Customer Success Specialist
Customer Success Analyst
Customer Success Associate
Customer Success Coordinator
Customer Success Architect
Customer Success Engineer (non-technical post-sale)
Customer Success Director
Customer Success Lead
Customer Success Team Lead
Head of Customer Success
VP of Customer Success
VP Customer Success
SVP Customer Success
Chief Customer Officer (CCO)
Customer Success Partner
Strategic Customer Success Manager
Enterprise Customer Success Manager
Mid-Market Customer Success Manager
SMB Customer Success Manager
Named Account CSM
```

**Client-prefix variants (treat identically to CS):**
```
Client Success Manager
Client Success Specialist
Client Success Executive
Client Success Analyst
Client Success Associate
Senior Associate, Client / Customer Success     ← exact Razorpay title
Senior Associate - NIT Client Success           ← exact Razorpay title (NIT = New Industry Track)
Client Relationship Manager (B2B SaaS context only — see disambiguation)
Client Engagement Manager
Client Engagement Lead
Client Partner (when post-sale relationship, not strategic consulting)
```

**Relationship/outcomes language:**
```
Customer Relationship Manager (SaaS context only — see disambiguation)
Customer Relations Manager
Account Success Manager
Account Success Executive
Customer Outcomes Manager
Customer Retention Manager
Customer Lifecycle Manager
Customer Health Manager
Customer Advocacy Manager
Customer Experience Manager (SaaS post-sale only — NOT UX/CX research)
CX Manager (SaaS post-sale only)
Voice of Customer Manager
Renewal Manager
Renewals Manager
Renewals Specialist
Renewals Executive
Renewal Account Manager
```

**India-specific variants:**
```
CS Manager (common short form in Indian SaaS)
CS Executive
CSE — Customer Success Executive
Customer Success Champion
Customer Delight Manager           ← common at Indian D2C / SaaS startups
Customer Delight Executive
Client Success Champion
Customer Onboarding & Success Manager (when combined role)
```

**Abbreviations on resumes:** CSM, CSE, CSA, Sr. CSM, Lead CSM

**Disambiguation signals — JD body cues that confirm `customer_success`:**
- Mentions: QBRs, quarterly business reviews, renewals, NRR, GRR, churn, health scores, adoption, upsell, expansion, customer outcomes, time-to-value, advocacy
- Customer is a B2B SaaS company
- Role is post-sale, manages a book/portfolio of accounts
- Reports to: CCO, VP CS, Head of CS, CRO, Head of Revenue
- Owns: retention metric, NRR target

**What this is NOT:**
- ❌ "Customer Service Representative" → `customer_support` (reactive ticket-handling)
- ❌ "Customer Experience Researcher" → not in revenue (UX research function)
- ❌ "Customer Relationship Manager" at a bank → `account_management` or `account_executive` (banking RM is a sales/wealth role)
- ❌ "Client Partner" at a consulting firm → `consulting` sub-role (not in our scope)
- ❌ "Client Servicing" at an ad agency → ambiguous; usually closer to `account_management` than `customer_success`

---

## 2.2 `customer_support`

**Title variants (English / Global):**
```
Customer Support Representative
Customer Support Rep
Customer Support Specialist
Customer Support Executive
Customer Support Engineer       ← when troubleshooting product, not Solutions Engineer
Customer Support Analyst
Customer Support Manager
Senior Customer Support Manager
Head of Customer Support
Support Manager
Customer Support Team Lead
Customer Service Representative
Customer Service Executive
Customer Service Agent
Customer Service Associate
Customer Service Officer
Customer Service Specialist
Customer Care Executive
Customer Care Specialist
Customer Care Representative
Customer Care Manager
```

**Help desk / technical:**
```
Help Desk Specialist
Help Desk Analyst
Help Desk Technician
Help Desk Manager
Technical Support Engineer
Technical Support Specialist
Technical Support Representative
Tier 1 Support / L1 Support
Tier 2 Support / L2 Support
Tier 3 Support / L3 Support
Application Support Engineer
Production Support Engineer
Product Support Engineer
Desktop Support Engineer
IT Support Specialist (when customer-facing)
```

**Contact center / BPO (Indian context — heavy population):**
```
Contact Center Agent
Contact Center Executive
Call Center Agent
Call Center Executive
Call Center Representative
Voice Process Executive
Non-Voice Process Executive
Inbound Support Executive
Outbound Support Executive
Chat Support Executive
Email Support Executive
Process Associate (BPO)
Senior Process Associate (BPO)
Customer Support Officer (CSO — government / utilities context)
```

**India-specific variants:**
```
CSR — Customer Service Representative
Customer Support Engineer (Indian SaaS — usually L1/L2 product troubleshooting)
Service Engineer (when post-sale product troubleshooting)
Customer Helpdesk Executive
```

**Abbreviations on resumes:** CSR, CSE (note: ambiguous with Customer Success Executive — disambiguate by JD context), L1/L2/L3, TSR

**Disambiguation signals — JD body cues that confirm `customer_support`:**
- Mentions: tickets, SLAs, queues, escalation, ticket volume, resolution time, FCR (first-contact resolution), CSAT, omnichannel support
- Reactive: customer reaches out, team responds
- Tools: Zendesk, Freshdesk, Intercom, ServiceNow, Salesforce Service Cloud
- Reports to: Head of Support, Support Operations Manager
- Owns: ticket resolution, CSAT, response time

**What this is NOT:**
- ❌ "Customer Success Manager" → `customer_success` (proactive)
- ❌ "Customer Experience Manager" at a SaaS company → usually `customer_success`
- ❌ "Customer Support Engineer" at Razorpay if JD mentions QBRs/account portfolio → actually `customer_success`

---

## 2.3 `account_executive`

**Title variants (English / Global):**
```
Account Executive
AE
Senior Account Executive
Sr. AE
Lead Account Executive
Principal Account Executive
Enterprise Account Executive
Mid-Market Account Executive
SMB Account Executive
Commercial Account Executive
Inside Sales Account Executive
Field Sales Account Executive
Outside Sales Representative
Sales Executive (when IC, closing role)
Sales Representative
Sales Rep
Sales Associate (when closing-focused)
New Business Manager
New Logo Sales Manager
New Logo Account Executive
```

**Indian-specific variants:**
```
Sales Manager (IC role — very common in Indian SaaS to call AEs "Sales Manager")
Senior Sales Manager
Area Sales Manager (SaaS context — different from FMCG ASM)
Territory Sales Manager
Territory Manager
Regional Sales Manager (when IC, not people-managing)
Enterprise Sales Manager
B2B Sales Manager
Key Account Sales Manager (when net-new, not retention)
Outbound Sales Manager (when closing)
Direct Sales Executive
Field Sales Executive (Indian D2C / SaaS field roles)
```

**Abbreviations on resumes:** AE, Sr. AE, ENT AE, MM AE, SMB AE, ASM (SaaS context only)

**Disambiguation signals — JD body cues that confirm `account_executive`:**
- Mentions: quota, ACV, ARR, new logos, closing, pipeline, opportunities, deal cycles, demos, MEDDIC, BANT
- Owns: net-new revenue, new business quota
- Hunter mindset, hunting deals
- Reports to: Sales Director, VP Sales, CRO, Head of Sales
- Compensation: base + commission, OTE structure

**What this is NOT:**
- ❌ "Account Manager" → `account_management` (retention/expansion on existing book)
- ❌ "Customer Account Manager" → likely `account_management` or `customer_success`
- ❌ "Sales Manager" managing a team of AEs → still `account_executive` but `job_title_levels = ["manager", "senior"]`
- ❌ "Area Sales Manager" at FMCG → `sales` role broadly, often field sales not SaaS AE
- ❌ "Strategic Account Manager" → usually `account_management` (managing existing strategic accounts)

---

## 2.4 `account_management`

**Title variants (English / Global):**
```
Account Manager
AM
Senior Account Manager
Sr. AM
Lead Account Manager           ← exact Freshworks title
Principal Account Manager
Strategic Account Manager
Key Account Manager
KAM
Named Account Manager
Major Account Manager
Global Account Manager
Enterprise Account Manager
Customer Account Manager (when revenue-focused, not CS-focused)
Portfolio Manager (SaaS context, not finance)
Book of Business Manager
Existing Business Manager
Upsell Manager
Expansion Manager
Cross-sell Manager
Renewal Account Manager
```

**Indian-specific variants:**
```
Key Account Executive
Key Accounts Manager
Client Servicing Manager (common in Indian agencies / B2B services)
Client Servicing Executive (Indian agency context — see disambiguation)
Senior Client Servicing
Relationship Manager (in banking/wealth/insurance — see disambiguation)
Client Relationship Manager (when sales-y, not CS)
Premier Relationship Manager (banking)
Wealth Relationship Manager (banking)
```

**Abbreviations on resumes:** AM, Sr. AM, KAM, Strategic AM, Enterprise AM

**Disambiguation signals — JD body cues that confirm `account_management`:**
- Mentions: existing customers, book of business, upsell, cross-sell, expansion, renewals (when revenue-owned), QBR with revenue lens
- Owns: NRR, expansion quota, renewal quota
- Manages existing accounts (not net-new)
- Reports to: VP AM, Head of AM, CRO

**What this is NOT:**
- ❌ "Account Executive" → `account_executive` (net-new)
- ❌ "Customer Success Manager" → `customer_success` (outcomes-focused, not revenue-owned)
- ❌ Banking "Relationship Manager" → `account_executive` or sales sub-role (different industry context)
- ❌ "Client Servicing" at an ad agency → may not be revenue at all; project/delivery role

---

## 2.5 `sales_development`

**Title variants (English / Global):**
```
Sales Development Representative
SDR
Senior SDR
Lead SDR
SDR Team Lead
Sales Development Manager
Business Development Representative
BDR
Senior BDR
Inbound SDR
Outbound SDR
Lead Development Representative
LDR
Market Development Representative
MDR
Account Development Representative
ADR
Demand Development Representative
DDR
Pipeline Generation Manager
Outbound Specialist
Outreach Specialist
Lead Qualification Specialist
```

**Inside-sales prospecting variants:**
```
Inside Sales Representative (when prospecting, not closing — see disambiguation)
Inside Sales Specialist
Inside Sales Associate
Inside Sales Executive (Indian context — often SDR-style)
Inside Sales Rep
```

**India-specific variants — CRITICAL for Indian SaaS:**
```
BDE — Business Development Executive (Indian SaaS — usually entry-level outbound, effectively SDR)
Senior BDE
BD Executive
Lead Generation Executive
Lead Generation Specialist
Lead Gen Executive
Tele-sales Executive
Tele-caller (BPO / D2C / EdTech context)
Tele-marketing Executive
Outbound Calling Executive
Cold Calling Executive
Sales Development Executive
SDE (when not Software Dev Engineer — context-dependent!)
Inside Sales Officer
Pre-sales Executive (Indian SaaS — when prospecting/lead-qualifying, NOT solutions engineering)
Demand Generation Executive
```

**Abbreviations on resumes:** SDR, BDR, BDE, MDR, ADR, LDR, ISR

**Disambiguation signals — JD body cues that confirm `sales_development`:**
- Mentions: cold calls, cold emails, prospecting, lead qualification, MQL, SQL, booking meetings, demos booked, dials per day, activity quota, top of funnel
- Hands off qualified leads to AEs
- High volume of outreach
- Reports to: SDR Manager, Head of SDR, VP Sales
- Compensation: lower base + activity-based bonuses or per-meeting

**What this is NOT:**
- ❌ "Account Executive" → `account_executive` (closing)
- ❌ "Inside Sales Manager" closing deals → `account_executive`
- ❌ "Pre-sales Engineer" in IT services → `solutions_engineer` (technical, not prospecting)
- ❌ "Software Development Engineer" (also "SDE") → engineering, not sales

---

## 2.6 `business_development`

**Title variants (English / Global):**
```
Business Development Manager
BDM
Senior Business Development Manager
Senior BDM
Lead BDM
Business Development Director
Director of Business Development
Head of Business Development
VP Business Development
VP BD
Strategic Business Development Manager
Senior Manager - Business Development
New Markets Manager
Market Expansion Manager
Geo-expansion Manager
Corporate Development Manager (when not pure M&A)
```

**Indian-specific variants:**
```
BDM
Sr. BDM
BD Manager
BD Lead
Business Development Officer
Senior Business Development Executive  ← exact Freshworks title (Inbound)
```

⚠️ **CRITICAL INDIAN AMBIGUITY: "BDE" / "Business Development Executive"**

In India, "BDE" is overloaded across THREE different functions:
- **Most common (B2B SaaS):** entry-level outbound calling → really `sales_development`
- **Sometimes:** mid-level new-logo closing → `account_executive`
- **Sometimes:** real BD work (partnerships, channels) → `business_development` or `partnerships`

Read the JD body. If it says "lead generation, cold calling, qualifying leads" → `sales_development`. If it says "close deals, manage full cycle, demos" → `account_executive`. If it says "partnerships, alliances, channel" → `partnerships` or `business_development`.

**Abbreviations on resumes:** BDM, BDD, BD Head, BD Director

**Disambiguation signals — JD body cues that confirm `business_development`:**
- Mentions: new markets, expansion, channel partners, alliances, strategic partnerships, new verticals, new geographies
- Owns: market entry, partnership deals, strategic accounts (when net-new and strategic)
- Reports to: VP BD, CRO, CBO (Chief Business Officer), CEO
- Long sales cycles, complex multi-party deals

**What this is NOT:**
- ❌ "BDE" doing cold calling → `sales_development`
- ❌ "BDM" closing standard SaaS deals → `account_executive`
- ❌ "Partnership Manager" → `partnerships` (the more specific value)

---

## 2.7 `revenue_operations`

**Title variants (English / Global):**
```
Revenue Operations Manager
RevOps Manager
Senior Revenue Operations Manager
Sr. RevOps Manager
Lead RevOps
Director of Revenue Operations
Head of Revenue Operations
VP Revenue Operations
VP RevOps
Sales Operations Manager
Sales Ops Manager
Senior Manager - Sales Operations         ← exact Freshworks title
Sales Operations Analyst
Customer Success Operations Manager
CS Ops Manager
CS Operations Analyst
Marketing Operations Manager (when revenue-attached)
Marketing Ops Manager
GTM Operations Manager
Go-To-Market Operations Manager
Commercial Operations Manager
Deal Desk Manager
Deal Desk Analyst
Sales Enablement Manager (often counted under RevOps)
Sales Enablement Specialist
Sales Strategy and Operations
Revenue Strategy & Operations
Pipeline Operations
Forecasting Analyst
Sales Compensation Manager                ← exact Freshworks title pattern
Sales Compensation Analyst
```

**Tools-as-titles (when role is tool-focused but RevOps team):**
```
CRM Manager (when Salesforce admin role on RevOps team)
Salesforce Administrator (when in RevOps team, not IT)
HubSpot Administrator (when RevOps-attached)
Marketing Automation Manager (Marketo / Pardot admin)
```

**Indian-specific variants:**
```
Sales Ops Executive
Sales Operations Specialist
Revenue Analyst
Revenue Operations Analyst
GTM Analyst
Sales Strategy Manager
```

**Abbreviations on resumes:** RevOps, Sales Ops, CS Ops, GTM Ops, MOPs (Marketing Ops)

**Disambiguation signals — JD body cues that confirm `revenue_operations`:**
- Mentions: forecasting, pipeline hygiene, Salesforce admin, HubSpot, reporting, dashboards, comp plans, territory design, lead routing, attribution, data hygiene, tech stack, GTM systems
- Tools: Salesforce, HubSpot, Outreach, Salesloft, Gong, Clari, LeanData, Marketo, Tableau
- Owns: data accuracy, process scalability, tooling
- Reports to: VP RevOps, COO, CRO

**What this is NOT:**
- ❌ "Operations Manager" in non-revenue context → `operations` role broadly
- ❌ "Business Operations" at startup level → might be ops, not revenue ops
- ❌ "Sales Manager" who happens to use Salesforce → still `account_executive` or `sales` people-manager

---

## 2.8 `growth`

**Title variants (English / Global):**
```
Growth Manager
Senior Growth Manager
Lead Growth Manager
Growth Marketer
Growth Marketing Manager
Senior Growth Marketing Manager
Director of Growth
Head of Growth
VP Growth
VP of Growth
Growth Strategist
Growth Lead
Growth Hacker (older term, still on resumes)
Growth Specialist
Growth Analyst
Lifecycle Marketing Manager
Retention Marketing Manager
Engagement Marketing Manager
User Acquisition Manager
Paid Acquisition Manager
Performance Marketing Manager (when growth-focused, not pure paid ads)
Demand Generation Manager (overlaps with marketing_services)
Conversion Rate Optimization (CRO) Manager
Funnel Marketing Manager
```

**Indian-specific variants:**
```
Growth Executive
Growth Lead
Senior Growth Executive
Growth Hacker (still in use)
User Growth Manager
Acquisition Marketing Manager
```

**Abbreviations on resumes:** Growth PM (growth product manager — borderline), UA Manager

**Disambiguation signals:**
- Mentions: activation, retention, engagement, virality, growth loops, A/B testing, experimentation, funnel optimization, CAC, LTV, north-star metric
- Cross-functional: works with product, marketing, data
- Owns: user growth metric (signups, activation, retention)

**What this is NOT:**
- ❌ "Growth Product Manager" who builds product features → `product_management` (PM sub-role)
- ❌ Pure paid ads buyer with no growth strategy → `marketing_services`
- ❌ "Demand Generation Manager" focused on top-of-funnel lead gen → `marketing_services`

---

## 2.9 `implementation`

**Title variants (English / Global):**
```
Implementation Manager
Implementation Specialist
Implementation Consultant
Implementation Engineer
Senior Implementation Manager
Lead Implementation Manager
Head of Implementation
VP Implementation
Onboarding Manager
Senior Onboarding Manager
Senior Manager - Customer Onboarding      ← exact Freshworks title
Customer Onboarding Specialist
Customer Onboarding Manager
Solutions Implementation Manager
Solutions Delivery Manager
Solutions Delivery Consultant
Deployment Manager
Deployment Specialist
Deployment Engineer
Professional Services Consultant (when SaaS implementation)
Professional Services Manager
Customer Activation Manager
Technical Implementation Engineer
Implementation Project Manager
Customer Implementation Engineer
```

**Indian-specific variants:**
```
Implementation Executive
Customer Onboarding Executive
Onboarding Executive
Product Implementation Specialist
Implementation Associate
```

**Abbreviations on resumes:** Impl. Mgr, Impl. Specialist, PS Consultant (Professional Services)

**Disambiguation signals:**
- Mentions: onboarding, time-to-value, setup, integration, data migration, configuration, go-live, kickoff, deployment, hand-off from sales
- First 30-90 days of customer journey
- Tools: Asana, Smartsheet, Salesforce, ChurnZero
- Reports to: Head of Implementation, VP CS, Head of Professional Services

**What this is NOT:**
- ❌ Software engineer building integrations → `software` (engineering)
- ❌ "Project Manager" in software dev → `project_management` (not revenue)
- ❌ Implementation engineer at an IT services firm → could be `consulting` or `solutions_engineer`

---

## 2.10 `partnerships`

**Title variants (English / Global):**
```
Partnership Manager
Partnerships Manager
Partner Manager
Senior Partnership Manager
Lead Partnership Manager
Director of Partnerships
Head of Partnerships
VP Partnerships
VP of Partnerships
Strategic Partnerships Manager
Channel Sales Manager
Channel Manager
Channel Account Manager
Channel Partner Manager
Alliance Manager
Strategic Alliances Manager
Alliance Director
Partner Success Manager (post-sale partner enablement)
Partner Account Manager
ISV Partnerships Manager
Technology Partnerships Manager
Integration Partnerships Manager
Distribution Manager (in SaaS / digital context)
Reseller Manager
GTM Partnerships Manager
Ecosystem Manager
```

**Indian-specific variants:**
```
Channel Sales Executive
Channel Partner Executive
Partner Manager - SaaS
Strategic Alliance Lead
Distribution Lead
```

**Abbreviations on resumes:** Partner Mgr, Channel Mgr, Alliances, ISV PM

**Disambiguation signals:**
- Mentions: channels, resellers, ISVs, system integrators (SIs), referral partners, technology partners, co-sell, co-marketing, partner ecosystem, marketplaces
- Tools: Crossbeam, PartnerStack, Allbound
- Reports to: Head of Partnerships, CRO, Head of BD

**What this is NOT:**
- ❌ "Business Development Manager" closing standard deals → `account_executive`
- ❌ "Partner Success Manager" enabling existing partners → still `partnerships` (most common)

---

## 2.11 `solutions_engineer`

**Title variants (English / Global):**
```
Solutions Engineer
SE
Senior Solutions Engineer
Sr. SE
Lead Solutions Engineer
Principal Solutions Engineer
Solutions Engineering Manager
Sales Engineer
Senior Sales Engineer
Pre-Sales Engineer
Pre-Sales Consultant
Pre-Sales Solutions Consultant
Solutions Consultant
Solutions Architect (when customer-facing, pre-sale)
Technical Account Manager (TAM)         ← when pre-sales, NOT post-sale support
Solutions Specialist
Demo Engineer
Application Engineer (when customer-facing)
Customer Solutions Engineer
Associate Solutions Engineer            ← exact Razorpay title
Graduate Trainee - Solution Engineering ← exact Freshworks title
```

**Indian-specific variants:**
```
Pre-Sales Engineer
Pre-Sales Executive (when technical — see disambiguation)
Solutions Specialist
Technical Pre-Sales Consultant
RFP Consultant (when pre-sales for IT services / SaaS)
Bid Manager (RFP-focused, sometimes pre-sales)
```

⚠️ **CRITICAL INDIAN AMBIGUITY: "Pre-sales"**

In India, "Pre-sales" has two distinct meanings depending on company type:

| Context | What "Pre-sales" means | Maps to |
|---|---|---|
| Indian **IT services** (TCS, Infosys, Wipro, etc.) | Solutions engineering, RFP response, POCs, technical proposals | `solutions_engineer` |
| Indian **SaaS** (smaller companies) | Sometimes means SDR-style lead qualification/prospecting | `sales_development` |
| **Global SaaS** | Always means solutions engineering | `solutions_engineer` |

Read the JD: technical demos / POCs / RFPs → `solutions_engineer`. Cold calls / lead qualification → `sales_development`.

**Abbreviations on resumes:** SE, Sr. SE, TAM, PSE (Pre-Sales Engineer)

**Disambiguation signals:**
- Mentions: technical demos, POCs (proof of concept), RFPs, RFIs, technical discovery, solution design, architecture diagrams, integration scoping, partners with AE on deals
- Highly technical role
- Reports to: Head of SE, VP SE, CTO (sometimes), VP Sales

**What this is NOT:**
- ❌ "Pre-sales" in Indian SaaS doing only cold calls → `sales_development`
- ❌ "Technical Account Manager" in post-sale support context → `customer_success` or `customer_support`
- ❌ Backend software engineer → `software` (engineering)

---

## 2.12 `strategy`

**Title variants (English / Global):**
```
Revenue Strategy Manager
Senior Revenue Strategy Manager
Director of Revenue Strategy
GTM Strategy Manager
Go-To-Market Strategy Manager
Sales Strategy Manager
Strategic Planning Manager
Commercial Strategy Manager
Strategic Operations Manager
Chief of Staff to CRO
Chief of Staff to CRO/CCO/Revenue
Business Strategy Manager (when GTM-focused)
Senior Strategy Manager (when revenue-org)
Strategic Initiatives Manager
GTM Planning Manager
```

**Indian-specific variants:**
```
Strategy Lead
Revenue Strategy Lead
GTM Strategy Lead
Strategy Consultant (when internal — could also be `consulting`)
```

**Disambiguation signals:**
- Cross-functional revenue planning, market sizing, segmentation, pricing strategy
- Often reports to: CRO, CEO, COO

**What this is NOT:**
- ❌ "Strategy Consultant" at McKinsey/BCG/Bain → `consulting` (different sub-role)
- ❌ "Product Strategy" → `product_management` (not revenue)

---

## 2.13 `marketing_services`

**Title variants (English / Global):**
```
Marketing Manager
Senior Marketing Manager
Director of Marketing
Head of Marketing
VP Marketing
VP of Marketing
CMO
Demand Generation Manager
Demand Gen Manager
Senior Demand Gen Manager
Field Marketing Manager
Product Marketing Manager
PMM
Senior PMM
Lead PMM
Content Marketing Manager
Content Marketing Strategist
Performance Marketing Manager
Digital Marketing Manager
Director - Digital Marketing             ← exact Freshworks title
Brand Marketing Manager
Brand Manager
Marketing Operations Manager (also fits revenue_operations)
Account-Based Marketing Manager (ABM)
ABM Manager
Lifecycle Marketing Manager (also fits growth)
Email Marketing Manager
SEO Manager
SEM Manager
Paid Acquisition Manager
Marketing Analyst
Senior Marketing Analyst
```

**Indian-specific variants:**
```
Marketing Executive
Senior Marketing Executive
Marketing Lead
Digital Marketing Executive
Brand Executive
Communications Manager (when revenue-attached)
Marcomm Manager (Marketing Communications)
```

**Abbreviations on resumes:** PMM, DGM (Demand Gen Manager — distinct from FMCG "Deputy General Manager"!), ABM, CMO

**Disambiguation signals:**
- Mentions: campaigns, content, SEO, SEM, social, brand, demand gen, MQLs, pipeline contribution, marketing-sourced revenue, attribution
- Reports to: CMO, VP Marketing, Head of Marketing

**What this is NOT:**
- ❌ "Growth Marketing Manager" focused on experimentation → `growth`
- ❌ "Marketing Operations Manager" in RevOps → `revenue_operations`
- ❌ "Brand Strategy" at agency → could be `strategy` or agency-side `consulting`

---

## 2.14 Critical disambiguation rules (global)

When Haiku encounters an ambiguous title, it should apply these rules:

### Rule A — "Inside Sales" disambiguation
- Inside Sales + closing/quota/demos/discovery → `account_executive`
- Inside Sales + cold calling / lead qualification / booking meetings → `sales_development`

### Rule B — "Pre-sales" disambiguation
- Pre-sales + technical/POC/RFP/SE/solutions → `solutions_engineer`
- Pre-sales + cold calls/lead gen (Indian SaaS) → `sales_development`

### Rule C — "BDE" (Business Development Executive) disambiguation (Indian context)
- BDE + lead generation / cold calling / qualifying / outbound → `sales_development`
- BDE + closing / demos / quota → `account_executive`
- BDE + partnerships / channels / alliances → `partnerships`
- Default if unclear: `sales_development` (most common Indian usage)

### Rule D — "Relationship Manager" disambiguation
- Relationship Manager + B2B SaaS company → `customer_success` (post-sale) or `account_management` (revenue-owned)
- Relationship Manager + bank / wealth / insurance / NBFC → `account_executive` or sales (this is a sales role in financial services)
- Premier/Wealth/Priority Relationship Manager → banking sales, treat as `account_executive`

### Rule E — "Account Manager" disambiguation
- AM + retention / NRR / book of business / renewals → `account_management`
- AM + net-new / hunting / new logos → `account_executive`
- "Customer Account Manager" at B2B SaaS → usually `account_management` or `customer_success`

### Rule F — "Customer Experience" disambiguation
- CX Manager at SaaS company + post-sale focus → `customer_success`
- CX at agency / consultancy / product company doing research → not in revenue (`product_design` or out of scope)

### Rule G — "Customer Service" vs "Customer Success" disambiguation
- Customer Service Rep + tickets/SLAs/queues → `customer_support`
- Customer Success Manager + accounts/QBRs/renewals → `customer_success`
- "Customer Service Manager" (older title, India context) — read JD: if proactive account management → `customer_success`; if ticket queue → `customer_support`

### Rule H — "Sales Manager" disambiguation
- Sales Manager as IC closing deals → `account_executive` (set levels to `senior`/`manager`)
- Sales Manager managing a team of AEs → still `account_executive` but with `job_title_levels = ["manager"]`
- "Area Sales Manager" / "Regional Sales Manager" / "Territory Sales Manager" at SaaS → `account_executive`

### Rule I — Hierarchy / level inference

PDL's `job_title_levels` should be set based on these patterns:

| Title prefix | Level |
|---|---|
| Intern, Trainee, Apprentice | `training` |
| Associate, Junior, Jr., Graduate, Entry | `entry` |
| (no prefix) Manager, Specialist, Analyst, Executive, Consultant | `entry` or `manager` (use JD years) |
| Senior, Sr., Lead, Principal | `senior` |
| Manager (as people-manager) | `manager` |
| Senior Manager, Group Manager | `manager` + `senior` |
| Director, Associate Director, Head of | `director` |
| Senior Director, Group Director | `director` + `senior` |
| VP, Vice President | `vp` |
| SVP, Senior Vice President | `vp` + `senior` |
| Chief, C-suite (CEO, CRO, CCO, CSO, CMO) | `cxo` |
| Founder, Co-Founder | `owner` |
| Partner (consulting/VC) | `partner` |

⚠️ In Indian SaaS, "Executive" usually means **entry-level IC** (not senior), unlike US/UK where "Executive" can mean senior. Use `entry` for "Executive" titles unless JD says 5+ years experience.

---

## 2.15 Anti-patterns — titles that look like revenue but are NOT

| Title | Why not revenue | What it actually is |
|---|---|---|
| Customer Success Engineer (when building product) | Engineering role | `software` |
| Customer Experience Designer | UX research/design | `product_design` (not revenue) |
| Sales Coordinator (when admin only, no quota) | Pure admin role | `administrative` |
| Software Development Engineer (SDE) | Engineering, not sales | `software` |
| Growth Product Manager | Product management | `product_management` |
| Customer Acquisition (marketing analyst) | Marketing analytics | `marketing_services` or `data_analyst` |
| Relationship Manager (banking) | Financial services sales | `financial` sub-role or `account_executive` |
| Strategy Consultant (Big 4 / MBB) | Management consulting | `consulting` (not revenue) |
| Channel Sales Engineer | Technical channel role | `solutions_engineer` |
| Project Manager (software dev) | Engineering project mgmt | `project_management` |
| Operations Manager (logistics/warehouse) | Operations | `operations` (not revenue) |

---

## 2.16 Summary mapping table (most common JD titles)

Quick lookup for the most frequent JD title language:

| JD says | Maps to canonical |
|---|---|
| CSM, Customer Success Manager | `customer_success` |
| CS Executive, CSE | `customer_success` |
| Customer Relationship Manager (SaaS) | `customer_success` |
| Client Success / Client Engagement / Client Partner (SaaS post-sale) | `customer_success` |
| Customer Experience Manager (SaaS) | `customer_success` |
| Renewal Manager | `customer_success` |
| Account Success Manager | `customer_success` |
| Customer Delight Manager (Indian) | `customer_success` |
| Customer Support / CSR / Service Rep | `customer_support` |
| Help Desk / Technical Support / L1/L2 | `customer_support` |
| Call Center / Voice Process | `customer_support` |
| AE, Account Executive | `account_executive` |
| Sales Manager (IC) | `account_executive` |
| Enterprise/Mid-Market/SMB Sales | `account_executive` |
| Area/Regional/Territory Sales Manager (SaaS) | `account_executive` |
| AM, Account Manager | `account_management` |
| Key Account Manager / KAM | `account_management` |
| Strategic Account Manager | `account_management` |
| Client Servicing Manager (post-sale revenue) | `account_management` |
| SDR, BDR, MDR, ADR, LDR | `sales_development` |
| Inside Sales Rep (prospecting) | `sales_development` |
| BDE - Inside Sales (Indian) | `sales_development` |
| Lead Generation Executive | `sales_development` |
| Tele-sales Executive | `sales_development` |
| Pre-sales Executive (Indian SaaS, prospecting context) | `sales_development` |
| BDM, Business Development Manager | `business_development` |
| Head of BD / VP BD | `business_development` |
| RevOps Manager, Sales Ops Manager | `revenue_operations` |
| Marketing Ops, CS Ops, GTM Ops | `revenue_operations` |
| Deal Desk, Sales Enablement, Sales Compensation | `revenue_operations` |
| Salesforce Admin (RevOps team) | `revenue_operations` |
| Growth Manager, Growth Marketer | `growth` |
| User Acquisition Manager | `growth` |
| Lifecycle / Retention Marketing | `growth` |
| Implementation Manager, Onboarding Manager | `implementation` |
| Solutions Delivery / Deployment Manager | `implementation` |
| Professional Services Consultant (SaaS) | `implementation` |
| Partnership Manager, Partner Manager | `partnerships` |
| Channel Sales Manager, Alliance Manager | `partnerships` |
| ISV Partnerships | `partnerships` |
| Solutions Engineer, SE | `solutions_engineer` |
| Sales Engineer, Pre-Sales Engineer (technical) | `solutions_engineer` |
| Technical Account Manager (pre-sales) | `solutions_engineer` |
| Pre-sales Consultant (IT services) | `solutions_engineer` |
| Revenue Strategy Manager, GTM Strategy | `strategy` |
| Chief of Staff (revenue org) | `strategy` |
| Marketing Manager, Demand Gen Manager | `marketing_services` |
| Product Marketing Manager, PMM | `marketing_services` |
| Field Marketing, Brand Marketing | `marketing_services` |
| ABM Manager | `marketing_services` |
| Performance Marketing Manager | `marketing_services` (or `growth` if growth-focused) |
| Digital Marketing Manager | `marketing_services` |
| Content Marketing Manager | `marketing_services` |
## §3. `job_title_levels` — ALL 10 values

Seniority level. Array field — a person can have multiple levels at once. Use with `terms`.

```
cxo
director
entry
manager
owner
partner
senior
training
unpaid
vp
```

**Hierarchy (low → high):**
`unpaid` → `training` → `entry` → `manager` → `senior` → `partner` → `director` → `vp` → `owner` → `cxo`

**Recruiter-language mapping:**

| Recruiter says | Use `terms` with |
|---|---|
| "Associate" / "Junior" / "0-2 yrs" | `["entry"]` |
| "Mid-level" / "3-5 yrs" | `["entry", "manager"]` |
| "Senior IC" / "5-8 yrs" | `["senior", "manager"]` |
| "Manager / Team Lead" | `["manager", "senior"]` |
| "Director / Head of" | `["director"]` |
| "VP / SVP" | `["vp"]` |
| "C-suite / Chief / CRO / CCO" | `["cxo"]` |

Combine with `inferred_years_experience` range for precision (level alone is noisy).

---

## §4. `inferred_years_experience` — numeric

PDL-inferred total years of work experience. Integer. Use `range`.

```json
{ "range": { "inferred_years_experience": { "gte": 0, "lte": 3 } } }
```

⚠️ Has ±1-2 years noise. Widen the range by 1 from what the JD says.

| JD says | Range |
|---|---|
| 0-2 years | gte 0, lte 3 |
| 1-3 years | gte 0, lte 4 |
| 3-5 years | gte 2, lte 6 |
| 5-8 years | gte 4, lte 9 |
| 8+ years | gte 7 |


---

## §5. `location_country` — India only

Always set to:

```
india
```

Use with `term`:
```json
{ "term": { "location_country": "india" } }
```

This is the canonical PDL value. Lowercase, single word.

---

## §6. `location_region` — ALL 36 India states/UTs

Lowercase free-form keyword. Use with `term` or `terms`.

### States (28)

```
andhra pradesh
arunachal pradesh
assam
bihar
chhattisgarh
goa
gujarat
haryana
himachal pradesh
jharkhand
karnataka
kerala
madhya pradesh
maharashtra
manipur
meghalaya
mizoram
nagaland
odisha
punjab
rajasthan
sikkim
tamil nadu
telangana
tripura
uttar pradesh
uttarakhand
west bengal
```

### Union Territories (8)

```
andaman and nicobar islands
chandigarh
dadra and nagar haveli and daman and diu
delhi
jammu and kashmir
ladakh
lakshadweep
puducherry
```

**City → state mapping (most common):**

| City | State / UT |
|---|---|
| Bangalore / Bengaluru | karnataka |
| Mumbai / Pune / Nashik | maharashtra |
| Hyderabad | telangana |
| Chennai | tamil nadu |
| Gurgaon / Gurugram / Faridabad | haryana |
| Noida / Ghaziabad / Lucknow | uttar pradesh |
| Delhi / New Delhi | delhi |
| Kolkata | west bengal |
| Ahmedabad / Surat / Vadodara | gujarat |
| Jaipur / Kota / Jodhpur | rajasthan |
| Indore / Bhopal | madhya pradesh |
| Kochi / Thiruvananthapuram | kerala |
| Chandigarh | chandigarh |

---

## §7. `location_locality` — Indian cities (with spelling variants)

⚠️ **CRITICAL:** `location_locality` is a free-form keyword field. PDL indexes whatever appeared in source data, so the **same city often has multiple spellings**. Always use `terms` with all variants.

⚠️ **Do NOT use `location_metro` for India.** PDL's metro canonical list is US-only.

### City → query variants (use ALL variants in `terms`)

```
mumbai            → ["mumbai", "bombay"]
bangalore         → ["bangalore", "bengaluru"]
delhi             → ["delhi", "new delhi"]
hyderabad         → ["hyderabad"]
chennai           → ["chennai", "madras"]
kolkata           → ["kolkata", "calcutta"]
pune              → ["pune", "poona"]
ahmedabad         → ["ahmedabad"]
gurugram          → ["gurgaon", "gurugram"]
noida             → ["noida"]
greater noida     → ["greater noida"]
jaipur            → ["jaipur"]
lucknow           → ["lucknow"]
kanpur            → ["kanpur"]
nagpur            → ["nagpur"]
indore            → ["indore"]
bhopal            → ["bhopal"]
visakhapatnam     → ["visakhapatnam", "vizag"]
vadodara          → ["vadodara", "baroda"]
surat             → ["surat"]
ghaziabad         → ["ghaziabad"]
ludhiana          → ["ludhiana"]
agra              → ["agra"]
nashik            → ["nashik", "nasik"]
ranchi            → ["ranchi"]
faridabad         → ["faridabad"]
meerut            → ["meerut"]
rajkot            → ["rajkot"]
varanasi          → ["varanasi", "banaras"]
amritsar          → ["amritsar"]
prayagraj         → ["allahabad", "prayagraj"]
jabalpur          → ["jabalpur"]
gwalior           → ["gwalior"]
vijayawada        → ["vijayawada"]
jodhpur           → ["jodhpur"]
madurai           → ["madurai"]
raipur            → ["raipur"]
kota              → ["kota"]
chandigarh        → ["chandigarh"]
guwahati          → ["guwahati"]
solapur           → ["solapur", "sholapur"]
hubli             → ["hubli", "hubballi"]
mysore            → ["mysore", "mysuru"]
thiruvananthapuram → ["thiruvananthapuram", "trivandrum"]
kochi             → ["kochi", "cochin", "ernakulam"]
coimbatore        → ["coimbatore"]
tiruchirappalli   → ["tiruchirappalli", "trichy"]
salem             → ["salem"]
warangal          → ["warangal"]
mangalore         → ["mangalore", "mangaluru"]
bhubaneswar       → ["bhubaneswar", "bhubaneshwar"]
dehradun          → ["dehradun"]
jammu             → ["jammu"]
shimla            → ["shimla"]
patna             → ["patna"]
thane             → ["thane"]
navi mumbai       → ["navi mumbai"]
```

### Named region groups (recruiter shortcuts — NOT PDL canonicals)

These are convenience groups your query builder expands into the underlying locality arrays:

**NCR / Delhi NCR** → all of:
```
delhi, new delhi, gurgaon, gurugram, noida, greater noida, ghaziabad, faridabad
```

**Mumbai Metropolitan** → all of:
```
mumbai, bombay, thane, navi mumbai, kalyan
```

**Tier 1 cities** → all of:
```
bangalore, bengaluru, mumbai, bombay, delhi, new delhi, gurgaon, gurugram,
noida, hyderabad, chennai, madras, kolkata, calcutta, pune, ahmedabad
```

**Tech hubs (where SaaS/CS roles concentrate)** → all of:
```
bangalore, bengaluru, hyderabad, pune, chennai, gurgaon, gurugram, noida, mumbai, bombay
```

**South India** → use `location_region` with:
```
karnataka, tamil nadu, kerala, telangana, andhra pradesh
```


---

## §8. `job_company_industry_v2` — ALL 420 values

PDL's modern industry classification. Every company has exactly one of these tagged. Use with `term` or `terms`.

**How to use:** for a JD, pick 3-8 industries that match. Pass them as a `terms` array. Example: "B2B SaaS sales" → `["software development", "it services and it consulting", "technology, information and internet"]`.

```
abrasives and nonmetallic minerals manufacturing
accessible architecture and design
accessible hardware manufacturing
accommodation services
accounting
administration of justice
administrative and support services
advertising services
agricultural chemical manufacturing
agriculture, construction, mining machinery manufacturing
air, water, and waste program management
airlines and aviation
alternative dispute resolution
alternative fuel vehicle manufacturing
alternative medicine
ambulance services
amusement parks and arcades
animal feed manufacturing
animation and post-production
apparel manufacturing
appliances, electrical, and electronics manufacturing
architectural and structural metal manufacturing
architecture and planning
armed forces
artificial rubber and synthetic fiber manufacturing
artists and writers
audio and video equipment manufacturing
automation machinery manufacturing
aviation and aerospace component manufacturing
baked goods manufacturing
banking
bars, taverns, and nightclubs
bed-and-breakfasts, hostels, homestays
beverage manufacturing
biomass electric power generation
biotechnology research
blockchain services
blogs
boilers, tanks, and shipping container manufacturing
book and periodical publishing
book publishing
breweries
broadcast media production and distribution
building construction
building equipment contractors
building finishing contractors
building structure and exterior contractors
business consulting and services
business content
business intelligence platforms
cable and satellite programming
capital markets
caterers
chemical manufacturing
chemical raw materials manufacturing
child day care services
chiropractors
circuses and magic shows
civic and social organizations
civil engineering
claims adjusting, actuarial services
clay and refractory products manufacturing
climate data and analytics
climate technology product manufacturing
coal mining
collection agencies
commercial and industrial equipment rental
commercial and industrial machinery maintenance
commercial and service industry machinery manufacturing
communications equipment manufacturing
community development and urban planning
community services
computer and network security
computer games
computer hardware manufacturing
computer networking products
computers and electronics manufacturing
conservation programs
construction
construction hardware manufacturing
consumer goods rental
consumer services
correctional institutions
cosmetology and barber schools
courts of law
credit intermediation
cutlery and handtool manufacturing
dairy product manufacturing
dance companies
data infrastructure and analytics
data security software products
defense and space manufacturing
dentists
design services
desktop computing software products
digital accessibility services
distilleries
e-learning providers
economic programs
education
education administration programs
electric lighting equipment manufacturing
electric power generation
electric power transmission, control, and distribution
electrical equipment manufacturing
electronic and precision equipment maintenance
embedded software products
emergency and relief services
engineering services
engines and power transmission equipment manufacturing
entertainment providers
environmental quality programs
environmental services
equipment rental services
events services
executive offices
executive search services
fabricated metal products
facilities services
family planning centers
farming
farming, ranching, forestry
fashion accessories manufacturing
financial services
fine arts schools
fire protection
fisheries
flight training
food and beverage manufacturing
food and beverage retail
food and beverage services
footwear and leather goods repair
footwear manufacturing
forestry and logging
fossil fuel electric power generation
freight and package transportation
fruit and vegetable preserves manufacturing
fuel cell manufacturing
fundraising
funds and trusts
furniture and home furnishings manufacturing
gambling facilities and casinos
geothermal electric power generation
glass product manufacturing
glass, ceramics and concrete manufacturing
golf courses and country clubs
government administration
government relations services
graphic design
ground passenger transportation
health and human services
higher education
highway, street, and bridge construction
historical sites
holding companies
home health care services
horticulture
hospitality
hospitals
hospitals and health care
hotels and motels
household and institutional furniture manufacturing
household appliance manufacturing
household services
housing and community development
housing programs
human resources services
hvac and refrigeration equipment manufacturing
hydroelectric power generation
individual and family services
industrial machinery manufacturing
industry associations
information services
insurance
insurance agencies and brokerages
insurance and employee benefit funds
insurance carriers
interior design
international affairs
international trade and development
internet marketplace platforms
internet news
internet publishing
interurban and rural bus services
investment advice
investment banking
investment management
it services and it consulting
it system custom software development
it system data services
it system design services
it system installation and disposal
it system operations and maintenance
it system testing and evaluation
it system training and support
janitorial services
landscaping services
language schools
laundry and drycleaning services
law enforcement
law practice
leasing non-residential real estate
leasing residential real estate
leather product manufacturing
legal services
legislative offices
libraries
lime and gypsum products manufacturing
loan brokers
machinery manufacturing
magnetic and optical media manufacturing
manufacturing
maritime transportation
market research
marketing services
mattress and blinds manufacturing
measuring and control instrument manufacturing
meat products manufacturing
media and telecommunications
media production
medical and diagnostic laboratories
medical equipment manufacturing
medical practices
mental health care
metal ore mining
metal treatments
metal valve, ball, and roller manufacturing
metalworking machinery manufacturing
military and international affairs
mining
mobile computing software products
mobile food services
mobile gaming apps
motor vehicle manufacturing
motor vehicle parts manufacturing
movies and sound recording
movies, videos and sound
museums
museums, historical sites, and zoos
musicians
nanotechnology research
natural gas distribution
natural gas extraction
newspaper publishing
non-profit organizations
nonmetallic mineral mining
nonresidential building construction
nuclear electric power generation
nursing homes and residential care facilities
office administration
office furniture and fixtures manufacturing
oil and coal product manufacturing
oil and gas
oil extraction
oil, gas, and mining
online and mail order retail
online audio and video media
operations consulting
optometrists
outpatient care centers
outsourcing and offshoring consulting
packaging and containers manufacturing
paint, coating, and adhesive manufacturing
paper and forest product manufacturing
pension funds
performing arts
performing arts and spectator sports
periodical publishing
personal and laundry services
personal care product manufacturing
personal care services
pet services
pharmaceutical manufacturing
philanthropic fundraising services
photography
physical, occupational and speech therapists
physicians
pipeline transportation
plastics and rubber product manufacturing
plastics manufacturing
political organizations
postal services
primary and secondary education
primary metal manufacturing
printing services
professional organizations
professional services
professional training and coaching
public assistance programs
public health
public policy offices
public relations and communications services
public safety
racetracks
radio and television broadcasting
rail transportation
railroad equipment manufacturing
ranching
ranching and fisheries
real estate
real estate agents and brokers
real estate and equipment rental services
recreational facilities
regenerative design
religious institutions
renewable energy equipment manufacturing
renewable energy power generation
renewable energy semiconductor manufacturing
repair and maintenance
research services
residential building construction
restaurants
retail
retail apparel and fashion
retail appliances, electrical, and electronic equipment
retail art dealers
retail art supplies
retail books and printed news
retail building materials and garden equipment
retail florists
retail furniture and home furnishings
retail gasoline
retail groceries
retail health and personal care products
retail luxury goods and jewelry
retail motor vehicles
retail musical instruments
retail office equipment
retail office supplies and gifts
retail pharmacies
retail recyclable materials and used merchandise
reupholstery and furniture repair
robot manufacturing
robotics engineering
rubber products manufacturing
satellite telecommunications
savings institutions
school and employee bus services
seafood product manufacturing
secretarial schools
securities and commodity exchanges
security and investigations
security guards and patrol services
security systems services
semiconductor manufacturing
services for renewable energy
services for the elderly and disabled
sheet music publishing
shipbuilding
shuttles and special needs transportation services
sightseeing transportation
skiing facilities
smart meter manufacturing
soap and cleaning product manufacturing
social networking platforms
software development
solar electric power generation
sound recording
space research and technology
specialty trade contractors
spectator sports
sporting goods manufacturing
sports and recreation instruction
sports teams and clubs
spring and wire product manufacturing
staffing and recruiting
steam and air-conditioning supply
strategic management services
subdivision of land
sugar and confectionery product manufacturing
surveying and mapping services
taxi and limousine services
technical and vocational training
technology, information and internet
technology, information and media
telecommunications
telecommunications carriers
telephone call centers
temporary help services
textile manufacturing
theater companies
think tanks
tobacco manufacturing
translation and localization
transportation equipment manufacturing
transportation programs
transportation, logistics, supply chain and storage
travel arrangements
truck transportation
trusts and estates
turned products and fastener manufacturing
urban transit services
utilities
utilities administration
utility system construction
vehicle repair and maintenance
venture capital and private equity principals
veterinary services
vocational rehabilitation services
warehousing and storage
waste collection
waste treatment and disposal
water supply and irrigation systems
water, waste, steam, and air conditioning services
wellness and fitness services
wholesale
wholesale alcoholic beverages
wholesale apparel and sewing supplies
wholesale appliances, electrical, and electronics
wholesale building materials
wholesale chemical and allied products
wholesale computer equipment
wholesale drugs and sundries
wholesale food and beverage
wholesale footwear
wholesale furniture and home furnishings
wholesale hardware, plumbing, heating equipment
wholesale import and export
wholesale luxury goods and jewelry
wholesale machinery
wholesale metals and minerals
wholesale motor vehicles and parts
wholesale paper products
wholesale petroleum and petroleum products
wholesale photography equipment and supplies
wholesale raw farm products
wholesale recyclable materials
wind electric power generation
wineries
wireless services
women's handbag manufacturing
wood product manufacturing
writing and editing
zoos and botanical gardens
```

### Common industry groupings for revenue hiring

**B2B SaaS / Tech:**
```
software development
it services and it consulting
technology, information and internet
technology, information and media
business intelligence platforms
data infrastructure and analytics
data security software products
computer and network security
embedded software products
mobile computing software products
desktop computing software products
internet marketplace platforms
internet publishing
social networking platforms
```

**Fintech / Financial services:**
```
financial services
banking
insurance
capital markets
investment management
investment banking
investment advice
venture capital and private equity principals
credit intermediation
funds and trusts
insurance agencies and brokerages
insurance carriers
```

**E-commerce / Retail:**
```
retail
online and mail order retail
retail apparel and fashion
retail luxury goods and jewelry
retail groceries
food and beverage retail
retail health and personal care products
internet marketplace platforms
```

**Healthcare / Health-tech:**
```
hospitals and health care
hospitals
medical practices
mental health care
biotechnology research
pharmaceutical manufacturing
medical equipment manufacturing
wellness and fitness services
home health care services
```

**EdTech / Education:**
```
e-learning providers
higher education
education
primary and secondary education
professional training and coaching
technical and vocational training
```

**Marketing / Media:**
```
advertising services
marketing services
public relations and communications services
media production
online audio and video media
broadcast media production and distribution
market research
```

**Telecom:**
```
telecommunications
telecommunications carriers
wireless services
satellite telecommunications
```

**Logistics / Supply chain:**
```
transportation, logistics, supply chain and storage
freight and package transportation
truck transportation
warehousing and storage
```

**Professional services / Consulting:**
```
business consulting and services
management consulting
operations consulting
strategic management services
human resources services
staffing and recruiting
executive search services
legal services
law practice
accounting
```

---

## §9. `job_company_size` — ALL 8 values

Company employee-count bucket. Use with `term` or `terms`.

```
1-10
11-50
51-200
201-500
501-1000
1001-5000
5001-10000
10001+
```

**Recruiter mapping:**

| Recruiter says | Filter on |
|---|---|
| "Early-stage startup" | `["1-10", "11-50"]` |
| "Startup" / "Seed–Series A" | `["1-10", "11-50", "51-200"]` |
| "Growth-stage" / "Series B-C" | `["51-200", "201-500", "501-1000"]` |
| "Mid-market" | `["201-500", "501-1000", "1001-5000"]` |
| "Enterprise" / "Large company" | `["1001-5000", "5001-10000", "10001+"]` |
| "FAANG-scale" / "Massive" | `["10001+"]` |

---

## §10. `job_company_inferred_revenue` — ALL 10 values

Revenue band (case-sensitive, exact strings with `$` and `-`). Use with `term` or `terms`.

```
$0
$1M-$10M
$10M-$25M
$25M-$50M
$50M-$100M
$100M-$250M
$250M-$500M
$500M-$1B
$1B-$10B
$10B+
```

**Recruiter mapping:**

| Recruiter says | Filter on |
|---|---|
| "Pre-revenue" | `["$0"]` |
| "Early revenue" | `["$1M-$10M"]` |
| "Mid-stage / scaling" | `["$10M-$25M", "$25M-$50M", "$50M-$100M"]` |
| "Mature / established" | `["$100M-$250M", "$250M-$500M", "$500M-$1B"]` |
| "Enterprise / Public" | `["$1B-$10B", "$10B+"]` |

---

## §11. `job_company_funding_stages` — ALL 29 values

Funding rounds the company has raised. Array field. Use with `term` or `terms`. (Note: field name in schema is `funding_stages`, not `funding_rounds`.)

```
angel
convertible_note
corporate_round
debt_financing
equity_crowdfunding
funding_round
grant
initial_coin_offering
non_equity_assistance
post_ipo_debt
post_ipo_equity
post_ipo_secondary
pre_seed
private_equity
product_crowdfunding
secondary_market
seed
series_a
series_b
series_c
series_d
series_e
series_f
series_g
series_h
series_i
series_j
series_unknown
undisclosed
```

**Recruiter mapping:**

| Recruiter says | Filter on |
|---|---|
| "Pre-seed / Idea-stage" | `["pre_seed", "angel"]` |
| "Seed-stage" | `["seed", "pre_seed"]` |
| "Series A" | `["series_a"]` |
| "Series B" | `["series_b"]` |
| "Series C+" | `["series_c", "series_d", "series_e", "series_f", "series_g", "series_h"]` |
| "Late-stage / Pre-IPO" | `["series_d", "series_e", "series_f", "series_g", "series_h", "series_i", "series_j"]` |
| "Public / Post-IPO" | `["post_ipo_equity", "post_ipo_debt", "post_ipo_secondary"]` |
| "VC-backed (any)" | All series_* values |


---

## §12. `education.degrees` — ALL 161 values

Array field on `education.degrees`. Use with `term` or `terms`. Most queries only use the broad ones (`bachelors`, `masters`, `mba`, `doctorates`) — the granular variants are returned for ranking but rarely filtered on.

```
associate of arts
associates
bachelor of aerospace engineering
bachelor of applied science
bachelor of architecture
bachelor of arts
bachelor of arts in business administration
bachelor of arts in communication
bachelor of arts in education
bachelor of biosystems engineering
bachelor of business administration
bachelor of chemical engineering
bachelor of civil engineering
bachelor of commerce
bachelor of design
bachelor of education
bachelor of electrical engineering
bachelor of engineering
bachelor of fine arts
bachelor of general studies
bachelor of industrial & systems engineering
bachelor of industrial design
bachelor of interdisciplinary studies
bachelor of interior architecture
bachelor of law
bachelor of liberal arts
bachelor of liberal arts and sciences
bachelor of materials engineering
bachelor of mathematics
bachelor of mechanical engineering
bachelor of medicine
bachelor of music
bachelor of music education
bachelor of pharmacy
bachelor of polymer and fiber engineering
bachelor of professional health science
bachelor of science
bachelor of science in aerospace engineering
bachelor of science in biomedical engineering
bachelor of science in business administration
bachelor of science in chemical engineering
bachelor of science in chemistry
bachelor of science in civil engineering
bachelor of science in commerce business administration
bachelor of science in computer science
bachelor of science in education
bachelor of science in electrical engineering
bachelor of science in engineering
bachelor of science in engineering technology
bachelor of science in geology
bachelor of science in human environmental sciences
bachelor of science in materials engineering
bachelor of science in mechanical engineering
bachelor of science in metallurgical engineering
bachelor of science in microbiology
bachelor of science in nursing
bachelor of science in social work
bachelor of social work
bachelor of software engineering
bachelor of technology
bachelor of textile engineering
bachelor of textile management and technology
bachelor of veterinary science
bachelor of wireless engineering
bachelors
doctor of audiology
doctor of business administration
doctor of chiropractic
doctor of dental surgery
doctor of education
doctor of jurisprudence
doctor of medical dentistry
doctor of medicine
doctor of ministry
doctor of musical arts
doctor of nursing practice
doctor of optometry
doctor of osteophathy
doctor of pharmacy
doctor of philosophy
doctor of physical therapy
doctor of psychology
doctor of public health
doctor of science
doctor of veterinary medicine
doctorates
magister juris
magisters
master of accountancy
master of accounting
master of aerospace engineering
master of agriculture
master of applied mathematics
master of aquaculture
master of arts
master of arts in education
master of arts in teaching
master of building construction
master of business administration
master of chemical engineering
master of civil engineering
master of commerce
master of communication disorders
master of community planning
master of dental surgery
master of design
master of divinity
master of education
master of electrical engineering
master of engineering
master of fine arts
master of health science
master of hispanic studies
master of industrial design
master of integrated design and construction
master of international studies
master of landscape architecture
master of laws
master of liberal arts
master of library & information studies
master of library science
master of materials engineering
master of mechanical engineering
master of music
master of natural resources
master of nurse anesthesia
master of political science
master of probability and statistics
master of professional studies
master of public administration
master of public health
master of real estate development
master of rehabilitation counseling
master of science
master of science in aerospace engineering
master of science in basic medical sciences
master of science in biomedical engineering
master of science in chemical engineering
master of science in chemistry
master of science in civil engineering
master of science in computer science
master of science in criminal justice
master of science in education
master of science in electrical engineering
master of science in engineering science & mechanics
master of science in forensic science
master of science in health administration
master of science in health informatics
master of science in human environmental sciences
master of science in industrial engineering
master of science in information systems
master of science in instructional leadership administration
master of science in justice and public safety
master of science in marine science
master of science in materials engineering
master of science in mechanical engineering
master of science in metallurgical engineering
master of science in nursing
master of science in occupational therapy
master of science in operations research
master of science in physician assistant studies
master of science in public health
master of science in software engineering
master of social work
master of software engineering
master of tax accounting
master of taxation
master of technical & professional communication
master of technology
master of urban and regional planning
masters
```

**Practical filter buckets:**

| Recruiter wants | Filter on |
|---|---|
| "Has a bachelor's" | `["bachelors", "bachelor of arts", "bachelor of science", "bachelor of business administration", "bachelor of engineering", "bachelor of technology", "bachelor of commerce"]` |
| "MBA" | `["master of business administration", "doctor of business administration"]` |
| "Has a master's" | `["masters", "master of science", "master of arts", "master of business administration", "master of technology"]` |
| "PhD / Doctorate" | `["doctorates", "doctor of philosophy", "doctor of science"]` |
| "Engineering degree" | `["bachelor of engineering", "bachelor of technology", "bachelor of mechanical engineering", "bachelor of electrical engineering", "bachelor of civil engineering", "bachelor of chemical engineering", "master of engineering", "master of technology"]` |
| "Computer science degree" | `["bachelor of science in computer science", "master of science in computer science", "bachelor of software engineering", "master of software engineering"]` |
| "Commerce/Business degree (common in India)" | `["bachelor of commerce", "bachelor of business administration", "master of commerce", "master of business administration"]` |

---

## §13. Past experience fields (`experience.*`)

PDL exposes every person's full work history as an array under `experience`. These fields use the **same canonical values** as the current-job fields. Use them when the JD says things like "has been a CSM before", "worked at a SaaS company", "ever held a senior role", "worked at Salesforce".

### Available filter fields on past experience

| Field | Canonical values from | Use case |
|---|---|---|
| `experience.title.role` | §1 (24 values) | "Has ever been in sales role" |
| `experience.title.sub_role` | §2 (105 values) | "Has ever been a CSM" |
| `experience.title.levels` | §3 (10 values) | "Has been a manager/director before" |
| `experience.company.industry_v2` | §8 (~420 values) | "Has worked at a SaaS company" |
| `experience.company.industry` | §6 v1 (legacy) | (older field, prefer v2) |
| `experience.company.size` | §9 (8 values) | "Has worked at a startup" / "has enterprise experience" |
| `experience.company.name` | free text (lowercase) | "Has worked at Salesforce / Zoho / Freshworks" |

### How filtering on `experience.*` works

The `experience` field is an array of past jobs. PDL's ES mapping flattens it — a `term` on `experience.title.sub_role` matches if ANY past job has that sub-role. So:

```json
{ "term": { "experience.title.sub_role": "customer_success" } }
```

means "this person has had at least one job where the sub-role was customer_success." Includes current job too — PDL treats current as just the most recent entry in `experience`.

### `experience.company.name` — special case

This is the only `experience.*` filter without canonical values. It's lowercase free-form keyword. Use `term` or `terms`:

```json
{ "terms": { "experience.company.name": ["salesforce", "freshworks", "zoho", "razorpay"] } }
```

For Indian SaaS hiring, common employer filters:
```
salesforce, hubspot, freshworks, zoho, razorpay, postman, browserstack,
chargebee, gainsight, totango, intercom, zendesk, atlassian, microsoft,
google, amazon, oracle, sap, adobe
```

### Worked example: "Senior CSM who has worked at a B2B SaaS company before"

```json
{
  "bool": {
    "filter": [
      { "term":  { "location_country": "india" } },
      { "term":  { "job_title_sub_role": "customer_success" } },
      { "terms": { "job_title_levels": ["senior", "manager"] } },
      { "terms": { "experience.company.industry_v2": [
        "software development",
        "it services and it consulting",
        "technology, information and internet"
      ]}}
    ]
  }
}
```

---

## §14. `dataset` parameter — ALL 8 values

Top-level parameter, NOT a query filter. Controls which slice of PDL's database is searched.

```
all
resume
email
phone
mobile_phone
street_address
consumer_social
developer
```

**Default is `resume` which restricts the pool.** Always set `"dataset": "all"` for max coverage on hiring queries.

Prefix with `-` to exclude. Example: `"dataset": "all,-phone"` excludes records that only have phone-derived data.

---

## §15. Returned fields (Claude reads these for scoring — NOT filterable)

These fields come back in every response and Claude uses them to evaluate candidates after PDL returns the filtered pool. None of these have canonical values — they're free text.

### Profile-level summaries

| Field | What it contains |
|---|---|
| `summary` | Overall profile summary (LinkedIn "About" section) |
| `headline` | One-line tagline (e.g., "Customer Success Manager @ Razorpay") |
| `job_summary` | Description of current role |
| `interests` | Self-reported interests array |

### Current job (free-text fields)

| Field | What it contains |
|---|---|
| `job_title` | Current job title as written (e.g., "Senior Customer Success Manager") |
| `job_company_name` | Current employer name |
| `job_company_website` | Current employer website |
| `job_start_date` | When they started current job (YYYY-MM format, IS filterable via range) |
| `job_last_updated` | When PDL last refreshed this record |

### Per-job experience array

`experience` is an array. Each entry has:

```
experience[].title.name          ← past job title (free text)
experience[].title.role          ← canonical, filterable (§13)
experience[].title.sub_role      ← canonical, filterable (§13)
experience[].title.levels        ← canonical, filterable (§13)
experience[].company.name        ← past employer name
experience[].company.industry    ← v1 canonical
experience[].company.industry_v2 ← v2 canonical, filterable
experience[].company.size        ← canonical, filterable
experience[].start_date          ← YYYY-MM
experience[].end_date            ← YYYY-MM or null if current
experience[].summary             ← what they did in that role (free text)
experience[].is_primary          ← boolean, true for current role
```

### Skills (semi-canonical)

```
skills                  ← array of strings, lowercase, free-form
```

PDL canonicalizes common skills (e.g., "Salesforce", "Salesforce CRM" → `salesforce`), but the list isn't an official enum. You CAN filter on `skills` with `terms`, but it's less reliable than role/industry filters. Better to read skills from results than filter on them.

### Education array

```
education[].school.name           ← school name, free text
education[].school.type           ← post-secondary institution, primary school, secondary school
education[].degrees               ← canonical, filterable (§12)
education[].majors                ← array of free-text majors
education[].start_date            ← YYYY
education[].end_date              ← YYYY
```

### Personal info (filterable but rarely used in hiring)

```
linkedin_url            ← URL (use `exists` to filter for "has LinkedIn")
linkedin_username       ← string
linkedin_connections    ← integer (filterable via range)
github_url              ← URL
twitter_url             ← URL
work_email              ← email
mobile_phone            ← phone (use `exists` to filter for "has phone")
```

---

## §16. Reference query templates

### Template A — "CSM in Bangalore, 1-2 years experience"

```json
{
  "dataset": "all",
  "size": 25,
  "query": {
    "bool": {
      "filter": [
        { "term":   { "location_country": "india" } },
        { "terms":  { "location_locality": ["bangalore", "bengaluru"] } },
        { "term":   { "job_title_sub_role": "customer_success" } },
        { "terms":  { "job_title_levels": ["entry", "manager"] } },
        { "range":  { "inferred_years_experience": { "gte": 0, "lte": 3 } } }
      ]
    }
  }
}
```

### Template B — "Senior AE for B2B SaaS, India, 5-7 years"

```json
{
  "dataset": "all",
  "size": 25,
  "query": {
    "bool": {
      "filter": [
        { "term":   { "location_country": "india" } },
        { "term":   { "job_title_sub_role": "account_executive" } },
        { "terms":  { "job_title_levels": ["senior", "manager"] } },
        { "range":  { "inferred_years_experience": { "gte": 4, "lte": 8 } } },
        { "terms":  { "job_company_industry_v2": [
          "software development",
          "it services and it consulting",
          "technology, information and internet"
        ]}}
      ]
    }
  }
}
```

### Template C — "RevOps Manager, Series B+ SaaS, Delhi NCR"

```json
{
  "dataset": "all",
  "size": 25,
  "query": {
    "bool": {
      "filter": [
        { "term":   { "location_country": "india" } },
        { "terms":  { "location_locality": [
          "delhi", "new delhi", "gurgaon", "gurugram",
          "noida", "greater noida", "ghaziabad", "faridabad"
        ]}},
        { "term":   { "job_title_sub_role": "revenue_operations" } },
        { "terms":  { "job_title_levels": ["manager", "senior"] } },
        { "terms":  { "job_company_industry_v2": [
          "software development",
          "it services and it consulting"
        ]}},
        { "terms":  { "job_company_funding_stages": [
          "series_b", "series_c", "series_d"
        ]}}
      ]
    }
  }
}
```

### Template D — "CSM at scaling startup, has SaaS background, MBA"

Combines current job + past experience + education:

```json
{
  "dataset": "all",
  "size": 25,
  "query": {
    "bool": {
      "filter": [
        { "term":   { "location_country": "india" } },
        { "term":   { "job_title_sub_role": "customer_success" } },
        { "terms":  { "job_title_levels": ["senior", "manager"] } },
        { "terms":  { "job_company_size": ["51-200", "201-500", "501-1000"] } },
        { "terms":  { "experience.company.industry_v2": [
          "software development",
          "it services and it consulting",
          "technology, information and internet"
        ]}},
        { "terms":  { "education.degrees": [
          "master of business administration",
          "doctor of business administration"
        ]}}
      ]
    }
  }
}
```

### Template E — "Anyone who worked at Salesforce/Freshworks, now in CS"

```json
{
  "dataset": "all",
  "size": 25,
  "query": {
    "bool": {
      "filter": [
        { "term":   { "location_country": "india" } },
        { "term":   { "job_title_role": "support" } },
        { "terms":  { "experience.company.name": [
          "salesforce", "freshworks", "zoho", "hubspot", "intercom"
        ]}}
      ]
    }
  }
}
```

---

## §17. Query construction rules (always apply)

1. **`dataset: "all"`** — always set this. Default is `"resume"` which restricts the pool.
2. **`size`** — set explicitly. Default is 1. Use 25 for normal searches.
3. **Use `filter` clauses, not `must`** — filter is faster and doesn't compute relevance scoring.
4. **For multi-value fields use `terms` (array), not `term` (single)** — especially for location_locality (spelling variants), job_title_levels (overlapping seniority).
5. **Don't filter on free-text fields like `job_title`** — use `job_title_sub_role` (canonical) instead. PDL has already mapped title variations to the canonical sub-role during ingestion.
6. **Past experience uses dot-notation, not nested queries** — `experience.title.sub_role` works as a flat keyword filter; ANY past job matching counts.
7. **Widen `inferred_years_experience` ranges by ±1 year** — it's noisy.
8. **For India locations, never use `location_metro`** — that field is US-only.

---

## §18. The Claude Extractor Prompt Template (UPDATED)

> Use this as the system prompt for the JD-to-spec extractor. It bakes in the canonical vocabulary, the fallback rule for unmapped titles, and worked examples that teach Haiku how to reason about new titles it hasn't seen before.

---

## The system prompt

```
You are a PDL search query extractor for SkillVeda Hire, a revenue-team hiring platform
(Customer Success, Sales, RevOps, BD, Marketing, Partnerships — India only).

Your job: convert a recruiter's job description or natural-language search into a
structured JSON spec. The spec is consumed by a downstream query builder that converts
it into a PDL Elasticsearch query.

────────────────────────────────────────────────────────────────────────────────────
CRITICAL RULES
────────────────────────────────────────────────────────────────────────────────────

RULE 1 — Use ONLY canonical values from §1, §2, §3, §6, §7, §8, §9, §11, §12 below.
         The 105 sub-roles in §2 are the ONLY valid values for sub_role.
         The 420 industries in §8 are the ONLY valid values for industries.
         NEVER invent a new value. If you can't find a match, set the field to null.

RULE 2 — For Customer Success roles, use role="support" and sub_role="customer_success".
         The value "customer_service" does NOT exist in PDL's taxonomy.

RULE 3 — For Indian cities, use the city's primary canonical name only
         (e.g., "bangalore" not "bangalore/bengaluru").
         The query builder handles spelling variant expansion.

RULE 4 — For region groups like "NCR" / "Delhi NCR", set locality to "ncr".
         Available region group keys: ncr, mumbai_metropolitan, tier_1, tech_hubs, south_india.

RULE 5 — Widen years_experience by ±1 from what the JD says. PDL's inferred years is noisy.

RULE 6 — Lowercase everything except revenue ranges like "$10M-$25M" which are case-sensitive.

RULE 7 — Output strict JSON only. No prose, no markdown, no explanations. No code fences.

────────────────────────────────────────────────────────────────────────────────────
THE FALLBACK RULE — for titles NOT explicitly listed in §2's mapping tables
────────────────────────────────────────────────────────────────────────────────────

When you encounter a job title that is NOT in §2's recruiter-language mapping tables:

STEP 1: Read the JD body for context — what does this person actually do?
        Mentions of "retention/renewal/health scores/QBRs" → customer_success
        Mentions of "tickets/SLAs/queues/escalation" → customer_support
        Mentions of "quota/closing/new logos/demos" → account_executive
        Mentions of "renewal book/upsell/expansion" → account_management
        Mentions of "cold calls/prospecting/MQLs/booking meetings" → sales_development
        Mentions of "partnerships/channels/alliances/resellers" → partnerships
        Mentions of "forecasting/comp plans/Salesforce admin/data hygiene" → revenue_operations
        Mentions of "onboarding/implementation/go-live/deployment" → implementation
        Mentions of "growth loops/A/B testing/activation/retention loops" → growth
        Mentions of "campaigns/demand gen/content/SEO/brand" → marketing_services
        Mentions of "POCs/RFPs/technical demos/solution architecture" → solutions_engineer
        Mentions of "GTM strategy/revenue strategy/chief of staff" → strategy

STEP 2: Identify which canonical sub-role from §2's list of 105 best matches the
        responsibilities. Pick the SINGLE closest match.

STEP 3: If the JD body is unclear and you genuinely cannot decide between two sub-roles,
        set sub_role to null and use only the broader role field. A null sub_role with a
        valid role is BETTER than an invented sub_role.

STEP 4: NEVER invent a new sub_role value. The 105 canonical sub-roles in §2 are
        exhaustive. Anything outside that list will be silently dropped by the query
        builder, causing zero candidates.

────────────────────────────────────────────────────────────────────────────────────
WORKED EXAMPLES — how to handle titles not in §2's mapping tables
────────────────────────────────────────────────────────────────────────────────────

These examples teach you how to reason about new titles. Study the pattern, don't
memorize the outputs.

─── Example 1: Indian-specific variant of CS ───
JD: "We're hiring a Customer Retention Specialist for our Bangalore office. 4-5 years
     of experience in SaaS post-sale, owning a book of accounts, driving renewals
     and reducing churn."
NOT in §2 explicit table.
REASONING: "Retention Specialist" + "owning book" + "renewals" + "churn" → §2.1 customer_success
           variants include "Customer Retention Manager" and "Customer Lifecycle Manager".
           This is a tier below "Manager" but same function.
OUTPUT: { current_role: { role: "support", sub_role: "customer_success", levels: ["entry", "manager"] } }


─── Example 2: Fintech-specific variant of CS ───
JD: "Member Success Manager for our wealth management platform. Manage portfolio of
     premium members, drive product adoption, conduct quarterly business reviews."
NOT in §2 explicit table.
REASONING: Fintech/wealth platforms call customers "members". "Success Manager" + "portfolio"
           + "adoption" + "QBR" → clearly CS function despite "Member" terminology.
OUTPUT: { current_role: { role: "support", sub_role: "customer_success", levels: ["manager", "senior"] } }


─── Example 3: Hybrid title with unclear function ───
JD: "Customer Operations Manager — own customer-facing operations, manage support
     queues, build CSAT reports, set up SLAs across the team."
NOT in §2 explicit table.
REASONING: "Operations" is ambiguous. JD body says "support queues", "SLAs", "CSAT" — these are
           reactive support metrics, NOT proactive CS metrics like NRR or QBRs.
           Maps to customer_support, not customer_success.
OUTPUT: { current_role: { role: "support", sub_role: "customer_support", levels: ["manager"] } }


─── Example 4: Hybrid title — but different mapping ───
JD: "Customer Operations Manager — design CS workflows, manage Gainsight, build health
     score models, run renewal forecasting, partner with RevOps on tooling."
NOT in §2 explicit table.
REASONING: Same title as Example 3 but JD body is completely different. "Gainsight",
           "health scores", "renewal forecasting", "tooling" → this is CS Ops work,
           which is §2.7 revenue_operations.
OUTPUT: { current_role: { role: "operations", sub_role: "revenue_operations", levels: ["manager"] } }


─── Example 5: Title that LOOKS like CS but isn't ───
JD: "Customer Insights Manager — analyze customer behavior, run NPS surveys, build
     dashboards for product team, identify friction points in user journey."
NOT in §2 explicit table.
REASONING: "Customer Insights" + "analyze" + "dashboards for product team" → this is a
           research/analytics role serving product, NOT a revenue role.
           sub_role: null. This person is not in revenue.
OUTPUT: { current_role: { role: null, sub_role: null, levels: [] } }


─── Example 6: Indian D2C variant ───
JD: "Customer Delight Champion at our D2C startup. Handle escalations, work with
     ops/logistics, ensure post-purchase experience is smooth, manage customer
     reviews and ratings."
NOT in §2 explicit table.
REASONING: "Customer Delight" is Indian D2C language. JD body says escalations, post-purchase,
           reviews → reactive support work, not proactive CS. Maps to customer_support.
OUTPUT: { current_role: { role: "support", sub_role: "customer_support", levels: ["entry", "manager"] } }


─── Example 7: New sales title pattern ───
JD: "Pipeline Generation Manager — build and execute outbound campaigns, manage SDR team,
     own pipeline-generated quota, partner with marketing on demand gen programs."
NOT in §2 explicit table.
REASONING: "Pipeline Generation" + "manages SDR team" → this is an SDR Manager role.
           Maps to sales_development with manager level.
OUTPUT: { current_role: { role: "sales", sub_role: "sales_development", levels: ["manager", "senior"] } }


─── Example 8: Ambiguous Indian title ───
JD: "Business Development Executive — handle inbound leads from our website, qualify
     prospects, set up demos for Account Executives, achieve activity targets."
NOT in §2 explicit table (BDE is mentioned but as ambiguous).
REASONING: "BDE" is overloaded in India. JD body says "qualify prospects" + "set up demos
           for AEs" + "activity targets" → this is SDR work, not closing.
           Apply Rule C from §2.14 (BDE disambiguation): maps to sales_development.
OUTPUT: { current_role: { role: "sales", sub_role: "sales_development", levels: ["entry"] } }


─── Example 9: BDE — different mapping based on body ───
JD: "Business Development Executive — own a territory of mid-market accounts in
     South India, close new business, achieve ₹2Cr ARR quota, manage full sales cycle."
NOT in §2 explicit table (BDE is mentioned but as ambiguous).
REASONING: Same BDE title as Example 8, but body is completely different. "Own territory"
           + "close new business" + "ARR quota" + "full sales cycle" → this is AE work.
           Apply Rule C from §2.14: maps to account_executive.
OUTPUT: { current_role: { role: "sales", sub_role: "account_executive", levels: ["entry", "manager"] },
         location: { country: "india", region: null, locality: "south_india" } }


─── Example 10: Banking title vs SaaS title ───
JD: "Relationship Manager for our Premier Banking division. Manage portfolio of
     high-net-worth clients, cross-sell investment products, achieve AUM targets."
NOT in §2 explicit table (Relationship Manager is mentioned but as ambiguous).
REASONING: Apply Rule D from §2.14: Relationship Manager + banking context + cross-sell +
           AUM → this is banking sales. The closest §2 canonical for banking RM is sales
           role. Map to account_executive (financial services context).
OUTPUT: { current_role: { role: "sales", sub_role: "account_executive", levels: ["manager", "senior"] } }


─── Example 11: New senior CS title ───
JD: "Customer Outcomes Architect — work with our top 20 enterprise accounts as a
     strategic advisor, design success programs, drive multi-million NRR expansion."
NOT in §2 explicit table.
REASONING: "Outcomes" + "strategic advisor" + "top accounts" + "NRR" → senior CS.
           Maps to customer_success with senior/director level given strategic/architect language.
OUTPUT: { current_role: { role: "support", sub_role: "customer_success", levels: ["senior", "director"] } }


─── Example 12: Confusing title that's actually marketing ───
JD: "Demand Capture Lead — convert MQLs to SQLs, work with content and SEO teams,
     drive top-of-funnel conversions, optimize landing pages."
NOT in §2 explicit table.
REASONING: "Demand Capture" + "MQLs to SQLs" + "content/SEO" + "landing pages" → this is
           demand-gen marketing, not sales development.
           Maps to marketing_services.
OUTPUT: { current_role: { role: "marketing", sub_role: "marketing_services", levels: ["manager"] } }


─── Example 13: Hybrid CSM + AM title ───
JD: "Strategic Account Lead — own a portfolio of 15 enterprise accounts. Drive
     adoption, manage renewals, identify and close expansion opportunities, conduct
     QBRs. You'll own both retention and revenue growth from these accounts."
NOT in §2 explicit table.
REASONING: "Adoption" + "QBRs" → CS work. "Manage renewals" + "close expansion" + "own
           revenue growth" → AM work. This is the modern CSM-with-revenue-quota hybrid.
           Decide based on the dominant focus. The JD emphasizes BOTH equally — when in
           doubt, prefer customer_success (CS roles increasingly own renewals).
OUTPUT: { current_role: { role: "support", sub_role: "customer_success", levels: ["senior", "manager"] } }
NOTE: Could also set past_experience.sub_roles=["account_management"] if JD says "AM background preferred".


─── Example 14: Unfamiliar title, vague JD ───
JD: "Revenue Specialist — work with our GTM team to drive growth."
NOT in §2 explicit table. JD body is too vague to disambiguate.
REASONING: "Revenue Specialist" could be RevOps, AE, CSM, marketing — JD doesn't say.
           Per Rule 3 from the fallback rule: set sub_role to null, use only role.
           Default to sales as the closest broad function.
OUTPUT: { current_role: { role: "sales", sub_role: null, levels: ["entry", "manager"] } }


─── Example 15: India-specific telesales variant ───
JD: "Inside Sales Champion — make 80+ cold calls daily, work on outbound leads from
     our database, achieve daily/weekly activity targets, build pipeline for senior AEs."
NOT in §2 explicit table.
REASONING: "Inside Sales" + "cold calls daily" + "activity targets" + "build pipeline for AEs"
           → Apply Rule A from §2.14: Inside Sales + prospecting/activity targets = SDR.
OUTPUT: { current_role: { role: "sales", sub_role: "sales_development", levels: ["entry"] } }


────────────────────────────────────────────────────────────────────────────────────
OUTPUT SCHEMA — return this exact structure
────────────────────────────────────────────────────────────────────────────────────

{
  "current_role": {
    "role": "<canonical from §1 or null>",
    "sub_role": "<canonical from §2 or null>",
    "levels": [<canonical from §3>]
  },
  "current_company": {
    "industries": [<canonical from §8, pick 3-8 best matches>],
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

────────────────────────────────────────────────────────────────────────────────────
CANONICAL VOCABULARY — use only these values
────────────────────────────────────────────────────────────────────────────────────

<<< §1, §2, §3, §6, §7, §8, §9, §11, §12 inserted here at runtime by canonical-prompt.ts >>>

────────────────────────────────────────────────────────────────────────────────────
JD TO PARSE
────────────────────────────────────────────────────────────────────────────────────

<<< RECRUITER INPUT >>>

────────────────────────────────────────────────────────────────────────────────────

Output the JSON spec only. No prose.
```
## §19. Sources (PDL official docs, May 2026)

- Roles: https://docs.peopledatalabs.com/docs/job-title-roles
- Sub-roles: https://docs.peopledatalabs.com/docs/job-title-subroles
- Levels: https://docs.peopledatalabs.com/docs/job-title-levels
- Industries v2: https://docs.peopledatalabs.com/docs/industries-v2
- Company sizes: https://docs.peopledatalabs.com/docs/company-sizes
- Revenue ranges: https://docs.peopledatalabs.com/docs/inferred-revenue-ranges
- Funding rounds: https://docs.peopledatalabs.com/docs/funding-rounds
- Education degrees: https://docs.peopledatalabs.com/docs/education-degrees
- Location countries: https://docs.peopledatalabs.com/docs/location-countries
- Person schema: https://docs.peopledatalabs.com/docs/fields
- ES mapping: https://docs.peopledatalabs.com/docs/elasticsearch-mapping
- Input params: https://docs.peopledatalabs.com/docs/input-parameters-person-search-api

---

*Generated for SkillVeda Hire — revenue team hiring (CS, Sales, RevOps, etc.).*
