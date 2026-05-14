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

## §2. `job_title_sub_role` — ALL 105 values

Granular role classification. Use with `term` or `terms`. More precise than `job_title_role`.

```
academic
account_executive
account_management
accounting
accounting_services
administrative
advisor
agriculture
aides
architecture
artist
board_member
bookkeeping
brand
building_and_grounds
business_analyst
business_development
chemical
compliance
construction
consulting
content
corporate_development
curation
customer_success
customer_support
data_analyst
data_engineering
data_science
dental
devops
doctor
electric
electrical
emergency_services
entertainment
executive
fashion
financial
fitness
fraud
graphic_design
growth
hair_stylist
hardware
health_and_safety
human_resources
implementation
industrial
information_technology
insurance
investment_banking
investor
investor_relations
journalism
judicial
legal
legal_services
logistics
machinist
marketing_design
marketing_services
mechanic
mechanical
military
network
nursing
partnerships
pharmacy
planning_and_analysis
plumbing
political
primary_and_secondary
procurement
product_design
product_management
professor
project_management
protective_service
qa_engineering
quality_assurance
realtor
recruiting
restaurants
retail
revenue_operations
risk
sales_development
scientific
security
social_service
software
solutions_engineer
strategy
student
talent_analytics
therapy
tour_and_travel
training
translation
transport
unemployed
veterinarian
warehouse
web
wellness
```

**Revenue hiring subset with recruiter-language mapping:**

| Sub-role | What it captures (recruiter language) |
|---|---|
| `customer_success` | CSM, Customer Success Manager, Client Success, Account Success |
| `customer_support` | Customer Support Rep, Support Specialist, Help Desk |
| `account_executive` | AE, Senior AE, Enterprise AE, Mid-Market AE |
| `account_management` | AM, Strategic Account Manager, Key Account Manager |
| `sales_development` | SDR, BDR, Inside Sales Rep |
| `business_development` | BD Manager, BD Rep |
| `revenue_operations` | RevOps, Sales Ops, CS Ops |
| `growth` | Growth Manager, Growth Marketer |
| `implementation` | Implementation Specialist, Onboarding Manager |
| `partnerships` | Partnership Manager, Channel Manager |
| `solutions_engineer` | SE, Pre-sales Engineer, Sales Engineer |
| `strategy` | Revenue Strategy, GTM Strategy |

**Key rule:** `job_title_sub_role` is more precise than `job_title_role`. PDL has already mapped "Customer Relationship Associate", "Client Success Specialist", "Account Success Coordinator" all to `customer_success` — so you filter on the sub-role and PDL handles the title variations for you.

---

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

## §18. The Claude extractor prompt template

Use this as the system prompt for the JD-to-spec extractor. It bakes in the canonical vocabulary.

```
You convert recruiter requests / job descriptions into structured PDL search specs.
Output strict JSON. Use ONLY the canonical values listed below. If unsure, set null.

CANONICAL VOCABULARY:

job_title_role (pick ONE or null):
  sales | support | sales_engineering | operations | marketing | partnerships
  (or any of the other 18 values in §1)

job_title_sub_role (pick ONE or null, prefer specific):
  customer_success | customer_support | account_executive | account_management
  | sales_development | business_development | revenue_operations | growth
  | implementation | partnerships | solutions_engineer | strategy

job_title_levels (array of 1+):
  entry | manager | senior | director | vp | cxo | owner | partner | training | unpaid

job_company_industry_v2 (array of 3-8 best matches from §8 list):
  e.g. ["software development", "it services and it consulting", "technology, information and internet"]

job_company_size (array, optional):
  "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1001-5000" | "5001-10000" | "10001+"

job_company_funding_stages (array, optional):
  series_a | series_b | series_c | ... (see §11)

education.degrees (array, optional):
  bachelors | masters | master of business administration | doctorates | (any of §12)

location.country: always "india"
location.region: Indian state name lowercase (see §6)
location.locality: Indian city name lowercase (see §7) OR a region group key:
  "ncr" | "mumbai_metropolitan" | "tier_1" | "tech_hubs" | "south_india"

inferred_years_experience: { min: int, max: int } — widen ±1 from JD

OUTPUT SCHEMA:
{
  "current_role": {
    "role": "<canonical or null>",
    "sub_role": "<canonical or null>",
    "levels": [<canonical>]
  },
  "current_company": {
    "industries": [<canonical>],
    "sizes": [<canonical>],
    "funding_stages": [<canonical>]
  },
  "past_experience": {
    "industries": [<canonical>],
    "sub_roles": [<canonical>],
    "company_names": [<lowercase strings>]
  },
  "location": {
    "country": "india",
    "region": <or null>,
    "locality": <or null>
  },
  "years_experience": { "min": <int>, "max": <int> },
  "education": {
    "degrees": [<canonical>]
  }
}

Rules:
- If JD says specific sub-role (CSM, AE, SDR), ALWAYS set sub_role.
- If JD says only function ("customer-facing"), set role only.
- Lowercase everything.
- For locations, use the city's canonical name only — query builder expands variants.
- Past experience fields only set if JD mentions past requirements explicitly.

JD TO PARSE:
<<<RECRUITER INPUT>>>

Output JSON only. No prose.
```

---

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
