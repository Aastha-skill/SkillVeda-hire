# §2 (EXPANDED) — Recruiter-Language Mapping for Revenue Sub-Roles

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
