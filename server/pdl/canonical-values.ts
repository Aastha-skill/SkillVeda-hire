// server/pdl/canonical-values.ts
// Runtime validation lists. The extractor's output is checked against
// these sets before being passed to the query builder — anything that's
// not a valid canonical value gets dropped (with a warning logged).

/** §1 — all 24 PDL job_title_role values (v28.0+) */
export const ROLES = new Set([
  "advisory", "analyst", "creative", "education", "engineering", "finance",
  "fulfillment", "health", "hospitality", "human_resources", "legal",
  "manufacturing", "marketing", "operations", "partnerships", "product",
  "professional_service", "public_service", "research", "sales",
  "sales_engineering", "support", "trade", "unemployed",
]);

/** §2 — all 105 PDL job_title_sub_role values (v28.0+) */
export const SUB_ROLES = new Set([
  "academic", "account_executive", "account_management", "accounting",
  "accounting_services", "administrative", "advisor", "agriculture", "aides",
  "architecture", "artist", "board_member", "bookkeeping", "brand",
  "building_and_grounds", "business_analyst", "business_development",
  "chemical", "compliance", "construction", "consulting", "content",
  "corporate_development", "curation", "customer_success", "customer_support",
  "data_analyst", "data_engineering", "data_science", "dental", "devops",
  "doctor", "electric", "electrical", "emergency_services", "entertainment",
  "executive", "fashion", "financial", "fitness", "fraud", "graphic_design",
  "growth", "hair_stylist", "hardware", "health_and_safety", "human_resources",
  "implementation", "industrial", "information_technology", "insurance",
  "investment_banking", "investor", "investor_relations", "journalism",
  "judicial", "legal", "legal_services", "logistics", "machinist",
  "marketing_design", "marketing_services", "mechanic", "mechanical",
  "military", "network", "nursing", "partnerships", "pharmacy",
  "planning_and_analysis", "plumbing", "political", "primary_and_secondary",
  "procurement", "product_design", "product_management", "professor",
  "project_management", "protective_service", "qa_engineering",
  "quality_assurance", "realtor", "recruiting", "restaurants", "retail",
  "revenue_operations", "risk", "sales_development", "scientific", "security",
  "social_service", "software", "solutions_engineer", "strategy", "student",
  "talent_analytics", "therapy", "tour_and_travel", "training", "translation",
  "transport", "unemployed", "veterinarian", "warehouse", "web", "wellness",
]);

/** §3 — all 10 job_title_levels values */
export const LEVELS = new Set([
  "cxo", "director", "entry", "manager", "owner",
  "partner", "senior", "training", "unpaid", "vp",
]);

/** §9 — all 8 job_company_size buckets (exact strings, case-sensitive) */
export const COMPANY_SIZES = new Set([
  "1-10", "11-50", "51-200", "201-500",
  "501-1000", "1001-5000", "5001-10000", "10001+",
]);

/** §10 — all 10 job_company_inferred_revenue buckets */
export const REVENUE_RANGES = new Set([
  "$0", "$1M-$10M", "$10M-$25M", "$25M-$50M", "$50M-$100M",
  "$100M-$250M", "$250M-$500M", "$500M-$1B", "$1B-$10B", "$10B+",
]);

/** §11 — all 29 funding_stages values */
export const FUNDING_STAGES = new Set([
  "angel", "convertible_note", "corporate_round", "debt_financing",
  "equity_crowdfunding", "funding_round", "grant", "initial_coin_offering",
  "non_equity_assistance", "post_ipo_debt", "post_ipo_equity",
  "post_ipo_secondary", "pre_seed", "private_equity", "product_crowdfunding",
  "secondary_market", "seed", "series_a", "series_b", "series_c", "series_d",
  "series_e", "series_f", "series_g", "series_h", "series_i", "series_j",
  "series_unknown", "undisclosed",
]);

/**
 * Common suffixes Haiku adds to sub_role values by accident (copying recruiter
 * title text into the canonical slot). Strip these and re-check canonicality.
 */
const SUFFIX_PATTERNS = [
  "_manager",
  "_executive",
  "_specialist",
  "_associate",
  "_representative",
  "_rep",
  "_lead",
  "_analyst",
  "_consultant",
  "_engineer",
  "_director",
  "_coordinator",
  "_officer",
];

/**
 * If a value doesn't match a canonical set, try stripping common Haiku-added
 * suffixes and check again. Returns the cleaned canonical value if found,
 * else null.
 */
function tryCleanSuffix(
  value: string,
  validSet: Set<string>
): string | null {
  const normalized = value.toLowerCase().trim();
  for (const suffix of SUFFIX_PATTERNS) {
    if (normalized.endsWith(suffix)) {
      const cleaned = normalized.slice(0, -suffix.length);
      if (validSet.has(cleaned)) {
        return cleaned;
      }
    }
  }
  // Also try noun→action swaps: "account_manager" → "account_management",
  // "sales_developer" → "sales_development", etc.
  const noun_to_action: Record<string, string> = {
    "_manager": "_management",
    "_developer": "_development",
    "_engineer": "_engineering",
    "_analyst": "_analytics",
  };
  for (const [from, to] of Object.entries(noun_to_action)) {
    if (normalized.endsWith(from)) {
      const transformed = normalized.slice(0, -from.length) + to;
      if (validSet.has(transformed)) {
        return transformed;
      }
    }
  }
  return null;
}

/**
 * Filter an array to only canonical values from the given set.
 * Logs anything that gets dropped so we can audit extractor mistakes.
 */
export function filterCanonical(
  values: string[] | undefined,
  validSet: Set<string>,
  fieldName: string
): string[] {
  if (!values || !Array.isArray(values)) return [];
  const out: string[] = [];
  for (const v of values) {
    const normalized = String(v).toLowerCase().trim();
    if (validSet.has(normalized)) {
      out.push(normalized);
      continue;
    }
    const cleaned = tryCleanSuffix(normalized, validSet);
    if (cleaned) {
      // eslint-disable-next-line no-console
      console.warn(
        `[pdl] Auto-corrected non-canonical value for ${fieldName}: "${v}" → "${cleaned}"`
      );
      out.push(cleaned);
      continue;
    }
    // eslint-disable-next-line no-console
    console.warn(
      `[pdl] Dropped non-canonical value for ${fieldName}: "${v}"`
    );
  }
  return out;
}

/**
 * Validate a single canonical value (returns null if invalid).
 */
export function validateCanonical(
  value: string | null | undefined,
  validSet: Set<string>,
  fieldName: string
): string | null {
  if (!value) return null;
  const normalized = String(value).toLowerCase().trim();
  if (validSet.has(normalized)) return normalized;

  // Try to recover from common Haiku suffix mistakes
  const cleaned = tryCleanSuffix(normalized, validSet);
  if (cleaned) {
    // eslint-disable-next-line no-console
    console.warn(
      `[pdl] Auto-corrected non-canonical value for ${fieldName}: "${value}" → "${cleaned}"`
    );
    return cleaned;
  }

  // eslint-disable-next-line no-console
  console.warn(
    `[pdl] Dropped non-canonical value for ${fieldName}: "${value}"`
  );
  return null;
}

/**
 * Complete set of canonical PDL industry_v2 values (434 entries).
 * Source: server/pdl/data/pdl-industries-v2.txt
 * Originally from https://docs.peopledatalabs.com/docs/industries-v2 (verified May 15, 2026).
 *
 * Keep in sync with §8 of canonical-reference.md and the txt file. If PDL
 * publishes new values, update the txt file first, then regenerate both
 * §8 and this set.
 *
 * Used as runtime validator: anything not in this set is dropped from queries
 * before sending to PDL. Haiku is responsible for emitting values from this
 * set (see §18); this set is the safety backstop.
 */
export const KNOWN_CANONICAL_INDUSTRIES: ReadonlySet<string> = new Set([
  "abrasives and nonmetallic minerals manufacturing",
  "accessible architecture and design",
  "accessible hardware manufacturing",
  "accommodation services",
  "accounting",
  "administration of justice",
  "administrative and support services",
  "advertising services",
  "agricultural chemical manufacturing",
  "agriculture, construction, mining machinery manufacturing",
  "air, water, and waste program management",
  "airlines and aviation",
  "alternative dispute resolution",
  "alternative fuel vehicle manufacturing",
  "alternative medicine",
  "ambulance services",
  "amusement parks and arcades",
  "animal feed manufacturing",
  "animation and post-production",
  "apparel manufacturing",
  "appliances, electrical, and electronics manufacturing",
  "architectural and structural metal manufacturing",
  "architecture and planning",
  "armed forces",
  "artificial rubber and synthetic fiber manufacturing",
  "artists and writers",
  "audio and video equipment manufacturing",
  "automation machinery manufacturing",
  "aviation and aerospace component manufacturing",
  "baked goods manufacturing",
  "banking",
  "bars, taverns, and nightclubs",
  "bed-and-breakfasts, hostels, homestays",
  "beverage manufacturing",
  "biomass electric power generation",
  "biotechnology research",
  "blockchain services",
  "blogs",
  "boilers, tanks, and shipping container manufacturing",
  "book and periodical publishing",
  "book publishing",
  "breweries",
  "broadcast media production and distribution",
  "building construction",
  "building equipment contractors",
  "building finishing contractors",
  "building structure and exterior contractors",
  "business consulting and services",
  "business content",
  "business intelligence platforms",
  "cable and satellite programming",
  "capital markets",
  "caterers",
  "chemical manufacturing",
  "chemical raw materials manufacturing",
  "child day care services",
  "chiropractors",
  "circuses and magic shows",
  "civic and social organizations",
  "civil engineering",
  "claims adjusting, actuarial services",
  "clay and refractory products manufacturing",
  "climate data and analytics",
  "climate technology product manufacturing",
  "coal mining",
  "collection agencies",
  "commercial and industrial equipment rental",
  "commercial and industrial machinery maintenance",
  "commercial and service industry machinery manufacturing",
  "communications equipment manufacturing",
  "community development and urban planning",
  "community services",
  "computer and network security",
  "computer games",
  "computer hardware manufacturing",
  "computer networking products",
  "computers and electronics manufacturing",
  "conservation programs",
  "construction",
  "construction hardware manufacturing",
  "consumer goods rental",
  "consumer services",
  "correctional institutions",
  "cosmetology and barber schools",
  "courts of law",
  "credit intermediation",
  "cutlery and handtool manufacturing",
  "dairy product manufacturing",
  "dance companies",
  "data infrastructure and analytics",
  "data security software products",
  "defense and space manufacturing",
  "dentists",
  "design services",
  "desktop computing software products",
  "digital accessibility services",
  "distilleries",
  "e-learning providers",
  "economic programs",
  "education",
  "education administration programs",
  "electric lighting equipment manufacturing",
  "electric power generation",
  "electric power transmission, control, and distribution",
  "electrical equipment manufacturing",
  "electronic and precision equipment maintenance",
  "embedded software products",
  "emergency and relief services",
  "engineering services",
  "engines and power transmission equipment manufacturing",
  "entertainment providers",
  "environmental quality programs",
  "environmental services",
  "equipment rental services",
  "events services",
  "executive offices",
  "executive search services",
  "fabricated metal products",
  "facilities services",
  "family planning centers",
  "farming",
  "farming, ranching, forestry",
  "fashion accessories manufacturing",
  "financial services",
  "fine arts schools",
  "fire protection",
  "fisheries",
  "flight training",
  "food and beverage manufacturing",
  "food and beverage retail",
  "food and beverage services",
  "footwear and leather goods repair",
  "footwear manufacturing",
  "forestry and logging",
  "fossil fuel electric power generation",
  "freight and package transportation",
  "fruit and vegetable preserves manufacturing",
  "fuel cell manufacturing",
  "fundraising",
  "funds and trusts",
  "furniture and home furnishings manufacturing",
  "gambling facilities and casinos",
  "geothermal electric power generation",
  "glass product manufacturing",
  "glass, ceramics and concrete manufacturing",
  "golf courses and country clubs",
  "government administration",
  "government relations services",
  "graphic design",
  "ground passenger transportation",
  "health and human services",
  "higher education",
  "highway, street, and bridge construction",
  "historical sites",
  "holding companies",
  "home health care services",
  "horticulture",
  "hospitality",
  "hospitals",
  "hospitals and health care",
  "hotels and motels",
  "household and institutional furniture manufacturing",
  "household appliance manufacturing",
  "household services",
  "housing and community development",
  "housing programs",
  "human resources services",
  "hvac and refrigeration equipment manufacturing",
  "hydroelectric power generation",
  "individual and family services",
  "industrial machinery manufacturing",
  "industry associations",
  "information services",
  "insurance",
  "insurance agencies and brokerages",
  "insurance and employee benefit funds",
  "insurance carriers",
  "interior design",
  "international affairs",
  "international trade and development",
  "internet marketplace platforms",
  "internet news",
  "internet publishing",
  "interurban and rural bus services",
  "investment advice",
  "investment banking",
  "investment management",
  "it services and it consulting",
  "it system custom software development",
  "it system data services",
  "it system design services",
  "it system installation and disposal",
  "it system operations and maintenance",
  "it system testing and evaluation",
  "it system training and support",
  "janitorial services",
  "landscaping services",
  "language schools",
  "laundry and drycleaning services",
  "law enforcement",
  "law practice",
  "leasing non-residential real estate",
  "leasing residential real estate",
  "leather product manufacturing",
  "legal services",
  "legislative offices",
  "libraries",
  "lime and gypsum products manufacturing",
  "loan brokers",
  "machinery manufacturing",
  "magnetic and optical media manufacturing",
  "manufacturing",
  "maritime transportation",
  "market research",
  "marketing services",
  "mattress and blinds manufacturing",
  "measuring and control instrument manufacturing",
  "meat products manufacturing",
  "media and telecommunications",
  "media production",
  "medical and diagnostic laboratories",
  "medical equipment manufacturing",
  "medical practices",
  "mental health care",
  "metal ore mining",
  "metal treatments",
  "metal valve, ball, and roller manufacturing",
  "metalworking machinery manufacturing",
  "military and international affairs",
  "mining",
  "mobile computing software products",
  "mobile food services",
  "mobile gaming apps",
  "motor vehicle manufacturing",
  "motor vehicle parts manufacturing",
  "movies and sound recording",
  "movies, videos and sound",
  "museums",
  "museums, historical sites, and zoos",
  "musicians",
  "nanotechnology research",
  "natural gas distribution",
  "natural gas extraction",
  "newspaper publishing",
  "non-profit organizations",
  "nonmetallic mineral mining",
  "nonresidential building construction",
  "nuclear electric power generation",
  "nursing homes and residential care facilities",
  "office administration",
  "office furniture and fixtures manufacturing",
  "oil and coal product manufacturing",
  "oil and gas",
  "oil extraction",
  "oil, gas, and mining",
  "online and mail order retail",
  "online audio and video media",
  "operations consulting",
  "optometrists",
  "outpatient care centers",
  "outsourcing and offshoring consulting",
  "packaging and containers manufacturing",
  "paint, coating, and adhesive manufacturing",
  "paper and forest product manufacturing",
  "pension funds",
  "performing arts",
  "performing arts and spectator sports",
  "periodical publishing",
  "personal and laundry services",
  "personal care product manufacturing",
  "personal care services",
  "pet services",
  "pharmaceutical manufacturing",
  "philanthropic fundraising services",
  "photography",
  "physical, occupational and speech therapists",
  "physicians",
  "pipeline transportation",
  "plastics and rubber product manufacturing",
  "plastics manufacturing",
  "political organizations",
  "postal services",
  "primary and secondary education",
  "primary metal manufacturing",
  "printing services",
  "professional organizations",
  "professional services",
  "professional training and coaching",
  "public assistance programs",
  "public health",
  "public policy offices",
  "public relations and communications services",
  "public safety",
  "racetracks",
  "radio and television broadcasting",
  "rail transportation",
  "railroad equipment manufacturing",
  "ranching",
  "ranching and fisheries",
  "real estate",
  "real estate agents and brokers",
  "real estate and equipment rental services",
  "recreational facilities",
  "regenerative design",
  "religious institutions",
  "renewable energy equipment manufacturing",
  "renewable energy power generation",
  "renewable energy semiconductor manufacturing",
  "repair and maintenance",
  "research services",
  "residential building construction",
  "restaurants",
  "retail",
  "retail apparel and fashion",
  "retail appliances, electrical, and electronic equipment",
  "retail art dealers",
  "retail art supplies",
  "retail books and printed news",
  "retail building materials and garden equipment",
  "retail florists",
  "retail furniture and home furnishings",
  "retail gasoline",
  "retail groceries",
  "retail health and personal care products",
  "retail luxury goods and jewelry",
  "retail motor vehicles",
  "retail musical instruments",
  "retail office equipment",
  "retail office supplies and gifts",
  "retail pharmacies",
  "retail recyclable materials and used merchandise",
  "reupholstery and furniture repair",
  "robot manufacturing",
  "robotics engineering",
  "rubber products manufacturing",
  "satellite telecommunications",
  "savings institutions",
  "school and employee bus services",
  "seafood product manufacturing",
  "secretarial schools",
  "securities and commodity exchanges",
  "security and investigations",
  "security guards and patrol services",
  "security systems services",
  "semiconductor manufacturing",
  "services for renewable energy",
  "services for the elderly and disabled",
  "sheet music publishing",
  "shipbuilding",
  "shuttles and special needs transportation services",
  "sightseeing transportation",
  "skiing facilities",
  "smart meter manufacturing",
  "soap and cleaning product manufacturing",
  "social networking platforms",
  "software development",
  "solar electric power generation",
  "sound recording",
  "space research and technology",
  "specialty trade contractors",
  "spectator sports",
  "sporting goods manufacturing",
  "sports and recreation instruction",
  "sports teams and clubs",
  "spring and wire product manufacturing",
  "staffing and recruiting",
  "steam and air-conditioning supply",
  "strategic management services",
  "subdivision of land",
  "sugar and confectionery product manufacturing",
  "surveying and mapping services",
  "taxi and limousine services",
  "technical and vocational training",
  "technology, information and internet",
  "technology, information and media",
  "telecommunications",
  "telecommunications carriers",
  "telephone call centers",
  "temporary help services",
  "textile manufacturing",
  "theater companies",
  "think tanks",
  "tobacco manufacturing",
  "translation and localization",
  "transportation equipment manufacturing",
  "transportation programs",
  "transportation, logistics, supply chain and storage",
  "travel arrangements",
  "truck transportation",
  "trusts and estates",
  "turned products and fastener manufacturing",
  "urban transit services",
  "utilities",
  "utilities administration",
  "utility system construction",
  "vehicle repair and maintenance",
  "venture capital and private equity principals",
  "veterinary services",
  "vocational rehabilitation services",
  "warehousing and storage",
  "waste collection",
  "waste treatment and disposal",
  "water supply and irrigation systems",
  "water, waste, steam, and air conditioning services",
  "wellness and fitness services",
  "wholesale",
  "wholesale alcoholic beverages",
  "wholesale apparel and sewing supplies",
  "wholesale appliances, electrical, and electronics",
  "wholesale building materials",
  "wholesale chemical and allied products",
  "wholesale computer equipment",
  "wholesale drugs and sundries",
  "wholesale food and beverage",
  "wholesale footwear",
  "wholesale furniture and home furnishings",
  "wholesale hardware, plumbing, heating equipment",
  "wholesale import and export",
  "wholesale luxury goods and jewelry",
  "wholesale machinery",
  "wholesale metals and minerals",
  "wholesale motor vehicles and parts",
  "wholesale paper products",
  "wholesale petroleum and petroleum products",
  "wholesale photography equipment and supplies",
  "wholesale raw farm products",
  "wholesale recyclable materials",
  "wind electric power generation",
  "wineries",
  "wireless services",
  "women's handbag manufacturing",
  "wood product manufacturing",
  "writing and editing",
  "zoos and botanical gardens",
]);

/**
 * Validates an array of industry values against the canonical PDL set.
 * Drops anything not recognized; logs dropped values so we can monitor Haiku's
 * mapping accuracy and improve the §18 prompt if needed.
 *
 * Returns deduplicated lowercase array of canonical values only.
 */
export function canonicalizeIndustries(input: string[] | undefined | null): string[] {
  if (!input || input.length === 0) return [];
  const valid = new Set<string>();
  const dropped: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const lower = raw.toLowerCase().trim();
    if (!lower) continue;
    if (KNOWN_CANONICAL_INDUSTRIES.has(lower)) {
      valid.add(lower);
    } else {
      dropped.push(raw);
    }
  }
  if (dropped.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[canonicalizeIndustries] Dropped non-canonical values from input: ${JSON.stringify(dropped)}. ` +
      `If these recur, strengthen §18 industry extraction rules.`
    );
  }
  return Array.from(valid);
}
