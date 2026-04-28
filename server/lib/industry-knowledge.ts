// ═══════════════════════════════════════════════════════════════════════
// Industry Knowledge — single source of truth for industry classification
//
// Used by:
//   - pdl-query-builder.ts v8 (eligibility + relevance ranking)
//   - cs-scoring-engine.ts (later, for AI scoring with curated context)
//
// Strategy per industry:
//   v1Industries     → PDL canonical `job_company_industry` labels
//   v2Industries     → PDL canonical `job_company_industry_v2` labels
//   positiveCompanies→ Indian companies known to be real instances of this
//                       segment, used as a deterministic name match.
//                       Catches companies PDL miscategorizes (e.g. tagged
//                       "internet" instead of "financial services").
//   evidencePhrases  → Phrases in summary/job_summary that signal this
//                       segment when industry is generic-tech (e.g. internet,
//                       technology information and internet).
//   aliases          → User-typed labels that map to this key.
//
// PDL canonical sources:
//   v1: https://docs.peopledatalabs.com/docs/industries
//   v2: https://docs.peopledatalabs.com/docs/industries-v2
// ═══════════════════════════════════════════════════════════════════════

export type IndustryKey =
  | "fintech"
  | "saas"
  | "healthtech"
  | "edtech"
  | "hrtech"
  | "traveltech"
  | "ecommerce"
  | "cybersecurity";

export interface IndustryProfile {
  key: IndustryKey;
  displayName: string;
  aliases: string[];
  v1Industries: string[];
  v2Industries: string[];
  positiveCompanies: string[];
  evidencePhrases: string[];
}

// ═══════════════════════════════════════════════════════════════════════
// Generic-tech labels — these are PDL's catch-all buckets that lump
// real fintechs/edtechs/healthtechs together with food delivery,
// e-commerce, social media, etc. When a candidate's company is tagged
// with one of these, we require additional evidence (name match,
// summary phrase, or past-experience signal) to count them as eligible
// for the requested industry.
// ═══════════════════════════════════════════════════════════════════════

export const GENERIC_TECH_V1 = ["internet"];
export const GENERIC_TECH_V2 = [
  "technology, information and internet",
  "technology, information and media",
];

// ═══════════════════════════════════════════════════════════════════════
// INDUSTRY_KNOWLEDGE
// ═══════════════════════════════════════════════════════════════════════

export const INDUSTRY_KNOWLEDGE: Record<IndustryKey, IndustryProfile> = {
  // ────────────────────────────────────────────────────────────────────
  // FINTECH
  // ────────────────────────────────────────────────────────────────────
  fintech: {
    key: "fintech",
    displayName: "Fintech",
    aliases: [
      "fintech", "fin tech", "fin-tech", "financial technology",
      "fintech saas", "financial services tech", "neobank",
      "payments", "lending tech", "wealth tech", "wealthtech",
      "insurtech", "insurance tech", "insurance technology",
    ],
    v1Industries: [
      "financial services",
      "banking",
      "capital markets",
      "investment banking",
      "investment management",
      "insurance",
    ],
    v2Industries: [
      "financial services",
      "banking",
      "capital markets",
      "credit intermediation",
      "investment advice",
      "investment banking",
      "investment management",
      "loan brokers",
      "funds and trusts",
      "securities and commodity exchanges",
      "savings institutions",
      "pension funds",
      "insurance carriers",
      "insurance agencies and brokerages",
      "claims adjusting, actuarial services",
      "insurance and employee benefit funds",
    ],
    positiveCompanies: [
      // Payments / UPI / wallets
      "razorpay", "razorpayx", "cashfree", "phonepe", "paytm", "mobikwik",
      "freecharge", "bharatpe", "khatabook", "okcredit", "instamojo",
      // Neobanks
      "jupiter", "fi money", "fampay", "junio", "walrus", "niyo",
      "open", "open financial technologies",
      // Investment / trading
      "groww", "zerodha", "upstox", "fyers", "smallcase", "indmoney",
      "stable money", "kuvera", "scripbox", "dezerv", "wint wealth",
      // Lending / BNPL
      "slice", "lendingkart", "bright money", "kreditbee", "moneytap",
      "smartcoin", "earlysalary", "kissht", "money view", "nira",
      "stashfin", "indifi", "capital float", "kredx", "flexiloans",
      "aye finance", "northern arc", "zest money", "fibe", "lazypay",
      "kredit.pe", "capinex", "creditnirvana", "perfios",
      // Insurance tech
      "acko", "digit insurance", "go digit", "turtlemint", "policybazaar",
      "policy bazaar", "coverfox", "renewbuy", "ditto insurance",
      // SMB / accounting
      "vyapar", "khatabook", "okcredit", "myhq", "refrens", "zoho books",
      // Crypto / web3
      "coindcx", "coinswitch", "wazirx", "zebpay",
      // Broader / well-known
      "cred", "freo", "navi", "amplifin",
    ],
    evidencePhrases: [
      "payments", "upi", "bnpl", "lending", "neobank", "wealth tech",
      "wealthtech", "trading platform", "broker", "credit card",
      "fintech", "stock market", "mutual fund", "investment app",
      "savings app", "loan app", "insurance tech", "insurtech",
      "digital lending", "consumer lending", "small business loans",
      "kyc", "underwriting", "credit underwriting", "p2p lending",
      "demat", "broking", "stock broking", "wealth management app",
      "digital banking", "challenger bank", "crypto exchange",
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // SAAS
  // ────────────────────────────────────────────────────────────────────
  saas: {
    key: "saas",
    displayName: "SaaS",
    aliases: [
      "saas", "b2b saas", "software", "enterprise software",
      "product saas", "vertical saas", "horizontal saas",
      "cloud software", "subscription software",
    ],
    v1Industries: [
      "computer software",
      "information technology and services",
    ],
    v2Industries: [
      "software development",
      "it services and it consulting",
      "it system custom software development",
      "it system data services",
      "it system design services",
      "business intelligence platforms",
      "data infrastructure and analytics",
      "data security software products",
      "desktop computing software products",
      "embedded software products",
      "mobile computing software products",
      "computer and network security",
    ],
    positiveCompanies: [
      // Pure-play product SaaS (Indian)
      "freshworks", "zoho", "zoho corp", "zoho corporation",
      "postman", "browserstack", "chargebee", "druva", "innovaccer",
      "mindtickle", "whatfix", "leadsquared", "capillary",
      "capillary technologies", "exotel", "hippo video",
      "icertis", "kissflow", "mailmodo", "clevertap", "moengage",
      "wingify", "vwo", "amplitude", "scaler", "interviewbit",
      "haptik", "yellow.ai", "yellow ai", "verloop", "kapture crm",
      "leadsquared", "freshdesk", "freshchat", "freshsales",
      "zluri", "vymo", "darwinbox", "keka", "springworks",
      "betterplace", "jodo", "ezetap", "innoviti", "airmeet",
      "hubilo", "exotel", "ozonetel", "knowlarity", "myoperator",
      "ecom express", "shipsy", "fareye",
      // Communication / marketing SaaS
      "netcore", "netcore cloud", "wati", "interakt", "gallabox",
      "mailmodo", "exotel", "knowlarity",
      // Vertical SaaS
      "icertis", "vymo", "uniphore", "mindtickle", "whatfix",
      // Lower-known but real product SaaS
      "leadsquared", "salesken", "postman", "browserstack",
    ],
    evidencePhrases: [
      "saas", "b2b saas", "subscription product", "subscription model",
      "enterprise software", "product-led growth", "plg",
      "annual recurring revenue", "arr", "monthly recurring revenue", "mrr",
      "churn", "retention", "qbr", "implementation", "onboarding",
      "renewal", "expansion", "upsell", "cross-sell", "platform",
      "api integration", "saas platform", "cloud platform",
      "mobile app", "web app", "self-serve", "freemium",
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // HEALTHTECH
  // ────────────────────────────────────────────────────────────────────
  healthtech: {
    key: "healthtech",
    displayName: "Healthtech",
    aliases: [
      "healthtech", "health tech", "health-tech", "digital health",
      "telemedicine", "telehealth", "e-pharmacy", "epharmacy",
      "medical tech", "medtech", "med tech",
    ],
    v1Industries: [
      "hospital & health care",
      "health, wellness and fitness",
      "biotechnology",
      "pharmaceuticals",
      "medical devices",
      "medical practice",
    ],
    v2Industries: [
      "hospitals and health care",
      "wellness and fitness services",
      "mental health care",
      "medical and diagnostic laboratories",
      "outpatient care centers",
      "home health care services",
      "biotechnology research",
      "pharmaceutical manufacturing",
      "medical equipment manufacturing",
      "medical practices",
      // Note: "hospitals" v2 is the literal-hospitals bucket — kept
      // here intentionally so we surface them (scorer tiers them)
      "hospitals",
    ],
    positiveCompanies: [
      // Telemedicine / consultations
      "practo", "mfine", "docsapp", "lybrate", "tata 1mg",
      "1mg", "tata health", "doconline",
      // E-pharmacy
      "pharmeasy", "netmeds", "medplus", "1mg", "tata 1mg",
      "apollo 24/7", "apollo 247", "truemeds",
      // Health & wellness
      "cure.fit", "cult.fit", "cultfit", "curefit", "healthifyme",
      "fittr", "stepathlon", "obino",
      // Diagnostics / labs
      "thyrocare", "lalpath labs", "metropolis healthcare", "redcliffe labs",
      "agilus diagnostics", "1mg labs", "orange health",
      // Health SaaS / B2B
      "innovaccer", "pharmaq", "medibuddy", "visit health",
      "loop health", "mfine", "plum", "plumhq",
      // Mental health
      "mindpeers", "wysa", "yourdost", "amaha", "amaha health",
      "the mood space", "trijog", "lissun", "heart it out",
      // Sleep / nutrition
      "wakefit", "sleepy owl",
    ],
    evidencePhrases: [
      "telemedicine", "telehealth", "e-pharmacy", "epharmacy",
      "digital health", "health tech", "healthtech", "ehr",
      "electronic health records", "patient experience",
      "diagnostic platform", "lab tests", "online consultation",
      "doctor consultation", "medicine delivery", "wellness app",
      "fitness app", "mental health app", "therapy app",
      "health insurance tech", "preventive health", "chronic care",
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // EDTECH
  // ────────────────────────────────────────────────────────────────────
  edtech: {
    key: "edtech",
    displayName: "Edtech",
    aliases: [
      "edtech", "ed tech", "ed-tech", "education technology",
      "online learning", "e-learning", "elearning",
      "test prep", "test prep tech",
    ],
    v1Industries: [
      "e-learning",
      "education management",
      "higher education",
      "primary/secondary education",
      "professional training & coaching",
    ],
    v2Industries: [
      "e-learning providers",
      "education",
      "education administration programs",
      "higher education",
      "primary and secondary education",
      "professional training and coaching",
      "technical and vocational training",
    ],
    positiveCompanies: [
      // K-12 / test prep / general
      "byju's", "byjus", "byju's the learning app", "unacademy",
      "vedantu", "whitehat jr", "whitehatjr", "toppr", "doubtnut",
      "physicswallah", "physics wallah", "pw", "embibe", "akash institute",
      "aakash educational services", "extramarks", "next education",
      "lido learning", "k12 techno",
      // Skills / upskilling
      "upgrad", "great learning", "scaler", "scaler academy",
      "masai school", "newton school", "almabetter", "interviewbit",
      "coding ninjas", "geeksforgeeks", "internshala", "talentedge",
      "edureka", "simplilearn", "imarticus learning", "pesto tech",
      "crio.do", "crio do", "kraftshala", "henry harvin",
      // Kids / extracurricular
      "cuemath", "lido learning", "yellow class", "vedantu young",
      "teachmint", "lead school",
      // International
      "leverage edu", "yocket", "imarticus", "upskillist",
      // Bootcamps / placement
      "scaler", "newton school", "masai school", "almabetter",
      "pesto tech", "crio.do",
      // EdTech SaaS
      "teachmint", "classplus", "lead school", "vedantu",
    ],
    evidencePhrases: [
      "online learning", "test prep", "k-12", "k12", "ed-tech",
      "edtech", "e-learning", "elearning", "online courses",
      "live classes", "doubt solving", "iit jee", "neet prep",
      "upskilling", "reskilling", "career platform", "placement assistance",
      "bootcamp", "coding bootcamp", "online tutoring", "lms",
      "learning management", "course platform", "skill development",
      "professional certification", "online education", "ed tech",
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // HRTECH
  // ────────────────────────────────────────────────────────────────────
  hrtech: {
    key: "hrtech",
    displayName: "HR Tech",
    aliases: [
      "hr tech", "hrtech", "hr-tech", "human resources tech",
      "hcm", "hrms", "ats", "applicant tracking",
      "recruitment tech", "people tech", "people analytics",
    ],
    v1Industries: [
      "human resources",
      "computer software",
      "staffing and recruiting",
    ],
    v2Industries: [
      "human resources services",
      "software development",
      "staffing and recruiting",
      "executive search services",
      "temporary help services",
    ],
    positiveCompanies: [
      // HRMS / HCM
      "darwinbox", "keka", "keka hr", "zoho people", "greythr",
      "pockethrms", "saral paypack", "hibob", "razorpayx payroll",
      "betterplace",
      // Talent / hiring
      "springworks", "skuad", "multiplier", "deel", "skillveda",
      "instahyre", "internshala", "naukri", "naukri.com", "shine.com",
      "indeed", "linkedin", "monster", "timesjobs", "iimjobs",
      "hirect", "apna", "apna jobs", "workindia",
      // Engagement / pulse
      "betterworks", "vantage circle", "advantage club", "xoxoday",
      "happay", "happymonday", "amber by infeedo", "infeedo",
      // Background verification
      "springverify", "authbridge", "idfy", "onsurity",
      // L&D
      "harappa", "edcast", "bridge", "jombay",
    ],
    evidencePhrases: [
      "hrms", "hcm", "ats", "applicant tracking", "payroll",
      "hr platform", "people platform", "talent management",
      "performance management", "employee engagement", "okrs",
      "onboarding platform", "recruitment platform", "hr tech",
      "hrtech", "people analytics", "compensation management",
      "benefits administration", "leave management", "attendance",
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // TRAVELTECH
  // ────────────────────────────────────────────────────────────────────
  traveltech: {
    key: "traveltech",
    displayName: "Travel Tech",
    aliases: [
      "travel tech", "traveltech", "travel-tech",
      "online travel", "travel platform", "booking platform",
      "stay tech", "hospitality tech",
    ],
    v1Industries: [
      "leisure, travel & tourism",
      "hospitality",
      "airlines/aviation",
    ],
    v2Industries: [
      "travel arrangements",
      "hospitality",
      "hotels and motels",
      "airlines and aviation",
      "bed-and-breakfasts, hostels, homestays",
      "hotels and motels",
      "sightseeing transportation",
    ],
    positiveCompanies: [
      // OTAs
      "makemytrip", "make my trip", "yatra", "cleartrip", "goibibo",
      "ixigo", "easemytrip", "ease my trip", "musafir", "via.com",
      // Stay / hotels
      "oyo", "oyo rooms", "oyo hotels", "treebo", "treebo hotels",
      "fabhotels", "stayvista", "lohono stays", "saffron stays",
      // Adventure / experiences
      "thrillophilia", "padhaaro", "headout", "klook",
      // Bus / cab tech
      "redbus", "abhibus", "ola", "ola cabs", "uber", "uber india",
      "rapido", "blusmart", "blu smart",
      // Flight metasearch
      "ixigo", "skyscanner",
      // Boutique
      "lohono stays", "saffron stays", "stayvista", "the postcard",
    ],
    evidencePhrases: [
      "online travel", "travel booking", "ota", "stay booking",
      "hotel booking", "flight booking", "travel platform",
      "travel tech", "traveltech", "stay tech", "tour packages",
      "travel itinerary", "trip planning", "travel app",
      "booking app", "travel marketplace", "homestay",
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // ECOMMERCE
  // ────────────────────────────────────────────────────────────────────
  ecommerce: {
    key: "ecommerce",
    displayName: "E-commerce",
    aliases: [
      "ecommerce", "e-commerce", "e commerce", "online retail",
      "online marketplace", "d2c", "direct to consumer",
      "quick commerce", "q-commerce", "social commerce",
    ],
    v1Industries: [
      "retail",
      "consumer goods",
      "internet",
    ],
    v2Industries: [
      "retail",
      "online and mail order retail",
      "internet marketplace platforms",
      "retail apparel and fashion",
      "retail appliances, electrical, and electronic equipment",
      "retail health and personal care products",
      "retail luxury goods and jewelry",
      "retail groceries",
      "retail furniture and home furnishings",
      "retail books and printed news",
      "retail florists",
      "retail motor vehicles",
    ],
    positiveCompanies: [
      // Marketplaces
      "flipkart", "myntra", "amazon india", "amazon", "meesho",
      "snapdeal", "ajio", "tata cliq", "shopclues",
      // Quick commerce / grocery
      "zepto", "blinkit", "swiggy instamart", "swiggy", "bigbasket",
      "dunzo", "zomato", "country delight", "milkbasket", "licious",
      "freshtohome", "fresh to home",
      // D2C
      "mamaearth", "boat", "boat lifestyle", "lenskart", "firstcry",
      "zivame", "nykaa", "nykaa fashion", "wakefit", "the man company",
      "bombay shaving company", "sleepyhead", "duroflex", "wow skin science",
      "kapiva", "plum goodness", "plum", "minimalist", "the moms co",
      "mama earth", "nutrabay", "organic india", "the whole truth",
      "supertails", "drools", "pet jonas", "sugar cosmetics",
      "purplle", "myglamm", "good glamm", "azah", "sirona",
      // Beauty / wellness
      "nykaa", "purplle", "myglamm", "sugar cosmetics", "mamaearth",
      // Apparel
      "myntra", "ajio", "snitch", "bewakoof", "the souled store",
      "fablestreet", "sabhyata", "westside",
      // Home / furniture
      "pepperfry", "urban ladder", "wakefit", "duroflex",
    ],
    evidencePhrases: [
      "ecommerce", "e-commerce", "d2c", "direct-to-consumer",
      "quick commerce", "q-commerce", "online marketplace",
      "online retail", "social commerce", "online store",
      "consumer brand", "shopify", "marketplace platform",
      "fulfillment", "last mile", "supply chain", "warehouse",
      "delivery experience", "customer journey", "checkout",
      "cart abandonment", "conversion rate", "gmv",
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // CYBERSECURITY / DATA SECURITY
  // ────────────────────────────────────────────────────────────────────
  cybersecurity: {
    key: "cybersecurity",
    displayName: "Cybersecurity",
    aliases: [
      "cybersecurity", "cyber security", "cyber-security",
      "data security", "datasecurity", "data-security",
      "infosec", "information security", "info security",
      "network security", "endpoint security", "cloud security",
      "application security", "appsec", "security tech",
      "security saas", "security software",
    ],
    v1Industries: [
      "computer & network security",
      "computer software",
      "information technology and services",
    ],
    v2Industries: [
      "computer and network security",
      "data security software products",
      "software development",
      "it system testing and evaluation",
      "security and investigations",
      "security systems services",
    ],
    positiveCompanies: [
      // Indian cybersecurity product companies
      "druva", "sequretek", "lucideus", "innefu labs", "innefu",
      "quick heal", "quick heal technologies", "k7 computing",
      "k7 security", "seclore", "seclore technology",
      "esec forte", "esec forte technologies",
      "tata cyber", "tata advanced systems",
      "inspira enterprise", "inspira",
      "saviynt", "saviynt india", "instasafe", "instasafe technologies",
      "wijungle", "shield square", "shieldsquare",
      "trapmine", "lcubelabs", "uniken",
      "appknox", "fluid attacks", "wallarm india",
      "safehouse technologies", "encrypto", "trustlogics",
      "cyfirma", "secneurx", "secneurx technologies",
      "rezilion", "spritle software", "happiestminds cybersecurity",
      "wibmo", "haltdos", "indusface",
      "tac security", "tac infosec",
      // Indian arms of global cybersec companies
      "crowdstrike india", "palo alto networks india",
      "fortinet india", "checkpoint india", "check point india",
      "trend micro india", "kaspersky india", "mcafee india",
      "symantec india", "norton india", "sophos india",
      "fireeye india", "cyberark india", "rapid7 india",
      "okta india", "zscaler india", "netskope india",
      "barracuda networks india", "f5 networks india",
      "tenable india", "qualys india", "fortify india",
      // SaaS-flavored security adjacent
      "happiest minds technologies", "paladion networks",
      "aujas networks", "network intelligence",
      "kratikal", "kratikal tech", "preludesys",
      "valuementor", "ec-council", "ec-council global services",
    ],
    evidencePhrases: [
      "cybersecurity", "cyber security", "data security",
      "infosec", "information security", "network security",
      "endpoint security", "cloud security", "application security",
      "appsec", "siem", "soc", "security operations center",
      "edr", "xdr", "mdr", "managed detection",
      "vulnerability management", "penetration testing", "pen test",
      "threat intelligence", "threat detection", "incident response",
      "iam", "identity access management", "privileged access",
      "zero trust", "ddos protection", "waf", "web application firewall",
      "encryption", "data loss prevention", "dlp", "data protection",
      "compliance", "soc 2", "iso 27001", "gdpr", "hipaa",
      "ransomware", "malware", "phishing", "email security",
      "saas security", "cnapp", "cspm", "cwpp",
      "security platform", "security product",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Detect which industry key matches a list of user-typed industry labels.
 * Returns the first matching industry's key, or null if none match.
 */
export function detectIndustryKey(
  industries: string[] | undefined
): IndustryKey | null {
  if (!industries || industries.length === 0) return null;

  for (const raw of industries) {
    const lc = String(raw).toLowerCase().trim();
    for (const [key, profile] of Object.entries(INDUSTRY_KNOWLEDGE)) {
      if (profile.aliases.includes(lc)) {
        return key as IndustryKey;
      }
      // Also check if any v1 or v2 canonical matches directly
      if (profile.v1Industries.includes(lc)) return key as IndustryKey;
      if (profile.v2Industries.includes(lc)) return key as IndustryKey;
    }
  }
  return null;
}

/**
 * Get all unique positive company names across all industries (for diagnostics).
 */
export function getAllPositiveCompanies(): Set<string> {
  const all = new Set<string>();
  for (const profile of Object.values(INDUSTRY_KNOWLEDGE)) {
    for (const c of profile.positiveCompanies) all.add(c);
  }
  return all;
}

/**
 * Normalize a company name for matching (lowercase, trim, strip common suffixes).
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return "";
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+(pvt|private|ltd|limited|inc|corp|llp|company|technologies|tech)\.?$/i, "")
    .replace(/\s+/g, " ");
}