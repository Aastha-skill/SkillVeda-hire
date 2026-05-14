// server/pdl/india-locations.ts
// India location constants for PDL queries.
// PDL's location_metro field is US-only — for India use country + region + locality.

/** All 28 Indian states (canonical lowercase strings PDL indexes). */
export const INDIA_STATES = [
  "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
  "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand",
  "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur",
  "meghalaya", "mizoram", "nagaland", "odisha", "punjab",
  "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura",
  "uttar pradesh", "uttarakhand", "west bengal",
] as const;

/** All 8 Indian union territories. */
export const INDIA_UTS = [
  "andaman and nicobar islands", "chandigarh",
  "dadra and nagar haveli and daman and diu", "delhi",
  "jammu and kashmir", "ladakh", "lakshadweep", "puducherry",
] as const;

/** All 36 valid values for location_region when filtering on India. */
export const INDIA_REGIONS = [...INDIA_STATES, ...INDIA_UTS] as const;
export type IndiaRegion = typeof INDIA_REGIONS[number];

/**
 * City canonical name → all spelling variants to use in a `terms` query.
 * PDL stores whatever appeared in source data, so the same city can have
 * multiple spellings (Bangalore/Bengaluru, Mumbai/Bombay, Gurgaon/Gurugram).
 */
export const INDIA_CITY_VARIANTS: Record<string, string[]> = {
  // Tier 1
  mumbai: ["mumbai", "bombay"],
  bangalore: ["bangalore", "bengaluru"],
  delhi: ["delhi", "new delhi"],
  hyderabad: ["hyderabad"],
  chennai: ["chennai", "madras"],
  kolkata: ["kolkata", "calcutta"],
  pune: ["pune", "poona"],
  ahmedabad: ["ahmedabad"],
  gurugram: ["gurgaon", "gurugram"],
  noida: ["noida"],
  "greater noida": ["greater noida"],

  // Tier 2
  jaipur: ["jaipur"],
  lucknow: ["lucknow"],
  kanpur: ["kanpur"],
  nagpur: ["nagpur"],
  indore: ["indore"],
  bhopal: ["bhopal"],
  visakhapatnam: ["visakhapatnam", "vizag"],
  vadodara: ["vadodara", "baroda"],
  surat: ["surat"],
  ghaziabad: ["ghaziabad"],
  ludhiana: ["ludhiana"],
  agra: ["agra"],
  nashik: ["nashik", "nasik"],
  ranchi: ["ranchi"],
  faridabad: ["faridabad"],
  meerut: ["meerut"],
  rajkot: ["rajkot"],
  varanasi: ["varanasi", "banaras"],
  amritsar: ["amritsar"],
  prayagraj: ["allahabad", "prayagraj"],
  jabalpur: ["jabalpur"],
  gwalior: ["gwalior"],
  vijayawada: ["vijayawada"],
  jodhpur: ["jodhpur"],
  madurai: ["madurai"],
  raipur: ["raipur"],
  kota: ["kota"],
  chandigarh: ["chandigarh"],
  guwahati: ["guwahati"],
  solapur: ["solapur", "sholapur"],
  hubli: ["hubli", "hubballi"],
  mysore: ["mysore", "mysuru"],
  thiruvananthapuram: ["thiruvananthapuram", "trivandrum"],
  kochi: ["kochi", "cochin", "ernakulam"],
  coimbatore: ["coimbatore"],
  tiruchirappalli: ["tiruchirappalli", "trichy"],
  salem: ["salem"],
  warangal: ["warangal"],
  mangalore: ["mangalore", "mangaluru"],
  bhubaneswar: ["bhubaneswar", "bhubaneshwar"],
  dehradun: ["dehradun"],
  jammu: ["jammu"],
  shimla: ["shimla"],
  patna: ["patna"],
  thane: ["thane"],
  "navi mumbai": ["navi mumbai"],
};

/**
 * Named region groups — recruiter shortcuts that don't map to a single
 * PDL canonical. The extractor sets locality to one of these keys, and the
 * query builder expands it into the underlying city/region list.
 */
export const REGION_GROUPS: Record<
  string,
  { localities?: string[]; regions?: string[] }
> = {
  ncr: {
    localities: [
      "delhi", "new delhi", "gurgaon", "gurugram",
      "noida", "greater noida", "ghaziabad", "faridabad",
    ],
  },
  mumbai_metropolitan: {
    localities: ["mumbai", "bombay", "thane", "navi mumbai", "kalyan"],
  },
  tier_1: {
    localities: [
      "bangalore", "bengaluru",
      "mumbai", "bombay",
      "delhi", "new delhi", "gurgaon", "gurugram", "noida",
      "hyderabad",
      "chennai", "madras",
      "kolkata", "calcutta",
      "pune", "ahmedabad",
    ],
  },
  tech_hubs: {
    localities: [
      "bangalore", "bengaluru",
      "hyderabad", "pune",
      "chennai",
      "gurgaon", "gurugram", "noida",
      "mumbai", "bombay",
    ],
  },
  south_india: {
    regions: ["karnataka", "tamil nadu", "kerala", "telangana", "andhra pradesh"],
  },
};

/**
 * Resolve an extractor's `locality` value into the actual query terms.
 * Returns either:
 *  - { localities: [...] }  → use as a terms clause on location_locality
 *  - { regions: [...] }     → use as a terms clause on location_region
 *  - null                   → no locality constraint
 */
export function resolveLocality(
  input: string | null | undefined
): { localities?: string[]; regions?: string[] } | null {
  if (!input) return null;
  const key = input.toLowerCase().trim();

  // Region group shortcut?
  if (REGION_GROUPS[key]) {
    return REGION_GROUPS[key];
  }

  // Single canonical city with known spelling variants?
  if (INDIA_CITY_VARIANTS[key]) {
    return { localities: INDIA_CITY_VARIANTS[key] };
  }

  // Unknown city — pass through as-is.
  // (Lets us handle long-tail cities the extractor recognizes.)
  return { localities: [key] };
}

/** Returns true if the given string is a known Indian state or UT. */
export function isIndiaRegion(input: string): boolean {
  return INDIA_REGIONS.includes(input.toLowerCase().trim() as IndiaRegion);
}
