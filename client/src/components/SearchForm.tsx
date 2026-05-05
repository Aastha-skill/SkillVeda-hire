import { useEffect, useMemo, useState, KeyboardEvent, CSSProperties } from "react";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f5f3ff";
const PURPLE_BORDER = "#ddd6fe";
const RED = "#dc2626";
const RED_LIGHT = "#fef2f2";
const RED_BORDER = "#fecaca";
const BORDER = "#e8e8ee";
const BORDER_LIGHT = "#f1f1f5";
const TEXT = "#111";
const MUTED = "#888";
const MUTED_LIGHT = "#bbb";
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type CompanyModel =
  | "b2b_saas"
  | "b2c"
  | "b2b_services"
  | "enterprise"
  | "marketplace"
  | "other";

type RoleFunction =
  | "renewals"
  | "onboarding"
  | "support"
  | "implementation"
  | "account_management";

interface FormState {
  // Pickers
  companyModel: CompanyModel | null;
  roleFunction: RoleFunction | null;

  // Where & when
  locationCountry: string;
  locationCities: string[];
  minExp: number;
  maxExp: number;

  // The role
  subRoles: string[];
  titleContains: string;
  levels: string[];

  // Company fit
  targetIndustries: string[];
  avoidIndustries: string[];
  companySizes: string[];
  pastCompaniesMust: string[];
  pastCompaniesAvoid: string[];

  // Skills
  mustHaveSkills: string[];
  niceToHaveSkills: string[];

  // Education
  degrees: string[];
  topSchools: string[];
  majors: string[];

  // CS-specific (conditional)
  accountScope: string | null;
  voiceMode: string | null;
  supportTier: string | null;
  hiringArchetype: string | null;
  renewalsExpansionFocus: string | null;
  languages: string[];

  // Other context
  compensationMinLPA: number | null;
  compensationMaxLPA: number | null;
  workingModel: string[];
  noticePeriodDays: number | null;
  freeText: string;
}

interface Props {
  onSearch: (filters: any, ctx: any) => void;
  loading?: boolean;
  outOfCredits?: boolean;
  initialFilters?: any | null;
}

// ═══════════════════════════════════════════════════════════════════
// CURATED DATA (per SEARCH_FORM_SCHEMA.md §5)
// ═══════════════════════════════════════════════════════════════════

const COMPANY_MODELS: { value: CompanyModel; label: string; tagline: string }[] = [
  { value: "b2b_saas", label: "B2B SaaS", tagline: "Software product sold to other businesses" },
  { value: "b2c", label: "B2C / D2C", tagline: "Consumer-facing app, brand, or service" },
  { value: "b2b_services", label: "B2B Services / Agency", tagline: "Consulting, IT services, outsourced ops" },
  { value: "enterprise", label: "Enterprise / Traditional", tagline: "Bank, telecom, manufacturing, big traditional cos" },
  { value: "marketplace", label: "Marketplace", tagline: "Two-sided platform (sellers/buyers, drivers/riders)" },
  { value: "other", label: "Other / Mixed", tagline: "Doesn't quite fit one — that's OK" },
];

const ROLE_FUNCTIONS: { value: RoleFunction; label: string; tagline: string }[] = [
  { value: "renewals", label: "Renewals & Expansion", tagline: "Owns retention + growth in existing accounts" },
  { value: "onboarding", label: "Onboarding & Adoption", tagline: "Gets new customers live + driving usage" },
  { value: "support", label: "Support & Resolution", tagline: "Handles customer questions + issues" },
  { value: "implementation", label: "Implementation", tagline: "Technical deployment + configuration" },
  { value: "account_management", label: "Account Management", tagline: "Strategic ownership of key accounts" },
];

const TOP_15_METROS = [
  "Bangalore", "Mumbai", "Delhi NCR", "Gurgaon", "Noida", "Hyderabad",
  "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Indore",
  "Kochi", "Coimbatore", "Chandigarh",
];

const SUB_ROLES = [
  { value: "customer_success", label: "CSM (Customer Success)" },
  { value: "customer_support", label: "Customer Support" },
  { value: "account_management", label: "Account Management" },
  { value: "technical_account_management", label: "Technical Account Mgmt" },
  { value: "implementation", label: "Implementation" },
  { value: "solutions_engineering", label: "Solutions Engineering" },
  { value: "client_services", label: "Client Services" },
  { value: "customer_experience", label: "Customer Experience" },
  { value: "customer_education", label: "Customer Education" },
];

const LEVELS = [
  { value: "entry", label: "Entry" },
  { value: "training", label: "Training" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
  { value: "director", label: "Director" },
  { value: "vp", label: "VP" },
  { value: "cxo", label: "C-Suite" },
];

const INDUSTRIES_TIER_1 = [
  "Computer Software", "Internet", "Financial Services", "Banking", "Insurance",
  "E-Learning", "Hospital & Health Care", "Telecommunications", "Retail",
  "Consumer Services", "Food & Beverages", "Logistics & Supply Chain",
];

const INDUSTRIES_TIER_2 = [
  "Real Estate", "Media Production", "Entertainment", "Government Administration",
  "Management Consulting", "Information Technology and Services",
  "Computer & Network Security", "Marketing & Advertising", "Hospitality",
  "Education Management", "Pharmaceuticals", "Automotive",
];

const COMPANY_SIZES = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "501-1000", label: "501–1,000" },
  { value: "1001-5000", label: "1,001–5,000" },
  { value: "5001-10000", label: "5,001–10,000" },
  { value: "10001+", label: "10,000+" },
];

// Past company suggestion lists per archetype (§5.3 chips, NOT search universe)
const PAST_COMPANIES_BY_ARCHETYPE: Record<string, string[]> = {
  b2b_saas: [
    "Freshworks", "Zoho", "Razorpay", "Postman", "Chargebee", "BrowserStack",
    "Whatfix", "Mindtickle", "Druva", "MoEngage", "CleverTap", "LeadSquared",
    "Atlan", "Hasura", "Salesforce", "HubSpot", "Atlassian", "Adobe",
  ],
  b2c: [
    "Swiggy", "Zomato", "Flipkart", "Meesho", "Myntra", "Nykaa",
    "Urban Company", "BookMyShow", "MakeMyTrip", "OYO", "BlinkIt", "Zepto",
    "Dunzo", "Lenskart", "Mamaearth", "Boat", "Bigbasket", "PharmEasy",
  ],
  b2b_services: [
    "TCS", "Infosys", "Accenture", "Deloitte", "KPMG", "EY",
    "McKinsey", "BCG", "Bain", "ZS Associates",
  ],
  enterprise: [
    "TCS", "Infosys", "Wipro", "HCL", "Accenture", "Cognizant",
    "IBM India", "SAP Labs", "Oracle India", "Microsoft India", "Capgemini",
    "Tech Mahindra",
  ],
  marketplace: [
    "Flipkart", "Amazon India", "Meesho", "Myntra", "Urban Company",
    "OYO", "BlinkIt", "Zepto", "Dunzo", "Swiggy",
  ],
  other: [],
};

// Skill suggestions per role function (§5.4)
const SKILLS_BY_FUNCTION: Record<string, string[]> = {
  renewals: ["Gainsight", "Totango", "Catalyst", "ChurnZero", "Salesforce", "Outreach", "Mixpanel", "MEDDIC"],
  onboarding: ["Pendo", "WalkMe", "Whatfix", "Mixpanel", "Amplitude", "Looker", "SQL", "JIRA"],
  support: ["Zendesk", "Freshdesk", "Intercom", "HelpScout", "ServiceNow", "Salesforce Service Cloud", "ITIL"],
  implementation: ["Salesforce", "SQL", "REST APIs", "Postman", "JIRA", "Python", "AWS", "Snowflake"],
  account_management: ["Salesforce", "HubSpot", "Outreach", "MEDDIC", "ZoomInfo", "LinkedIn Sales Navigator", "Apollo", "Gong"],
};

const TOP_SCHOOLS = [
  "IIT (any)", "IIM (any)", "IISc", "ISB", "XLRI", "FMS Delhi", "MDI Gurgaon",
  "SP Jain", "NMIMS", "Symbiosis", "BITS Pilani", "NIT (top)", "Manipal",
  "DTU", "VIT",
];

const DEGREE_LEVELS = [
  { value: "high school", label: "High School" },
  { value: "associates", label: "Associates" },
  { value: "bachelors", label: "Bachelors" },
  { value: "masters", label: "Masters" },
  { value: "mbas", label: "MBA" },
  { value: "doctorates", label: "Doctorate" },
  { value: "engineering", label: "Engineering" },
];

const INDIAN_LANGUAGES = [
  "Hindi", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali",
  "Malayalam", "Gujarati", "Punjabi", "Odia", "Assamese",
];

const WORKING_MODELS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const ACCOUNT_SCOPES = [
  { value: "smb", label: "SMB" },
  { value: "mid_market", label: "Mid-market" },
  { value: "enterprise", label: "Enterprise" },
  { value: "mixed", label: "Mixed" },
];

const VOICE_MODES = [
  { value: "voice", label: "Voice" },
  { value: "non_voice", label: "Non-voice" },
  { value: "both", label: "Both" },
];

const SUPPORT_TIERS = [
  { value: "tier_1", label: "Tier 1" },
  { value: "tier_2", label: "Tier 2" },
  { value: "tier_3", label: "Tier 3" },
  { value: "mixed", label: "Mixed" },
];

const HIRING_ARCHETYPES = [
  { value: "builder", label: "Builder" },
  { value: "operator", label: "Operator" },
  { value: "scaler", label: "Scaler" },
];

const RENEWALS_FOCI = [
  { value: "retention", label: "Retention" },
  { value: "expansion", label: "Expansion" },
  { value: "both", label: "Both" },
];

const SENIOR_LEVELS = new Set(["senior", "director", "vp", "cxo"]);

// ═══════════════════════════════════════════════════════════════════
// STATE INIT
// ═══════════════════════════════════════════════════════════════════

const blankState: FormState = {
  companyModel: "b2b_saas", // §7 Q1 lean: pre-select B2B SaaS
  roleFunction: null, // §7 Q2 lean: force pick
  locationCountry: "india",
  locationCities: [],
  minExp: 0,
  maxExp: 15,
  subRoles: [],
  titleContains: "",
  levels: [],
  targetIndustries: [],
  avoidIndustries: [],
  companySizes: [],
  pastCompaniesMust: [],
  pastCompaniesAvoid: [],
  mustHaveSkills: [],
  niceToHaveSkills: [],
  degrees: [],
  topSchools: [],
  majors: [],
  accountScope: null,
  voiceMode: null,
  supportTier: null,
  hiringArchetype: null,
  renewalsExpansionFocus: null,
  languages: [],
  compensationMinLPA: null,
  compensationMaxLPA: null,
  workingModel: [],
  noticePeriodDays: null,
  freeText: "",
};

function stateFromInitialFilters(init: any | null): FormState {
  if (!init) return { ...blankState };
  return {
    ...blankState,
    companyModel: init.companyModel ?? blankState.companyModel,
    roleFunction: init.roleFunction ?? null,
    locationCountry: init.locationCountry ?? "india",
    locationCities: init.locationCities ?? init.locationTags ?? [],
    minExp: init.minExp ?? 0,
    maxExp: init.maxExp ?? 15,
    subRoles: init.subRoles ?? (init.titleRole ? [init.titleRole] : []),
    titleContains: init.titleContains ?? "",
    levels: init.levels ?? (init.titleLevel ? [init.titleLevel] : []),
    targetIndustries: init.targetIndustries ?? init.industries ?? [],
    avoidIndustries: init.avoidIndustries ?? [],
    companySizes: init.companySizes ?? (init.companySize ? [init.companySize] : []),
    pastCompaniesMust: init.pastCompaniesMust ?? init.companies ?? [],
    pastCompaniesAvoid: init.pastCompaniesAvoid ?? init.excludedCompanies ?? [],
    mustHaveSkills: init.mustHaveSkills ?? [],
    degrees: init.degreeLevels ?? init.degrees ?? [],
    majors: init.majors ?? [],
  };
}

// ═══════════════════════════════════════════════════════════════════
// SHARED INPUT COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function SectionShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20, padding: 16, border: `1px solid ${BORDER}`, borderRadius: 10, background: "#fff" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: subtitle ? 4 : 12 }}>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 11, color: MUTED_LIGHT, marginBottom: 12, lineHeight: 1.4 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
      {children}
      {hint && <span style={{ fontSize: 10, fontWeight: 400, color: MUTED_LIGHT }}>{hint}</span>}
    </div>
  );
}

function Chip({
  label, onRemove, color, onClick, selected,
}: {
  label: string;
  onRemove?: () => void;
  color?: "purple" | "red" | "neutral";
  onClick?: () => void;
  selected?: boolean;
}) {
  const palette =
    color === "red"
      ? { bg: RED_LIGHT, text: RED, border: RED_BORDER }
      : color === "neutral"
        ? { bg: "#fafafa", text: "#555", border: BORDER }
        : { bg: PURPLE_LIGHT, text: PURPLE, border: PURPLE_BORDER };

  const selectedPalette = selected
    ? { bg: PURPLE, text: "#fff", border: PURPLE }
    : palette;

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: selectedPalette.bg, color: selectedPalette.text,
        border: `1px solid ${selectedPalette.border}`,
        borderRadius: 16, padding: "4px 10px",
        fontSize: 12, fontWeight: 500, lineHeight: 1.4,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ background: "transparent", border: "none", color: selectedPalette.text, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1, fontFamily: FONT }}
          aria-label="remove"
        >
          ×
        </button>
      )}
    </span>
  );
}

function ChipInput({
  values, onChange, placeholder, suggestions, color, maxItems,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  color?: "purple" | "red" | "neutral";
  maxItems?: number;
}) {
  const [text, setText] = useState("");
  const atMax = maxItems != null && values.length >= maxItems;

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (values.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    if (atMax) return;
    onChange([...values, v]);
    setText("");
  };

  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && values.length > 0) {
      remove(values[values.length - 1]);
    }
  };

  const visibleSuggestions = (suggestions || []).filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <div>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
        padding: "8px 10px", border: `1.5px solid ${BORDER}`, borderRadius: 8,
        background: atMax ? "#fafafa" : "#fff", minHeight: 42,
      }}>
        {values.map((v) => (
          <Chip key={v} label={v} color={color} onRemove={() => remove(v)} />
        ))}
        {!atMax && (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            onBlur={() => text.trim() && add(text)}
            placeholder={values.length === 0 ? placeholder : ""}
            style={{
              flex: 1, minWidth: 120, border: "none", outline: "none",
              fontSize: 13, fontFamily: FONT, color: TEXT, background: "transparent",
              padding: "2px 0",
            }}
          />
        )}
      </div>
      {visibleSuggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
          <span style={{ fontSize: 10, color: MUTED, marginRight: 4, alignSelf: "center" }}>Quick add:</span>
          {visibleSuggestions.slice(0, 14).map((s) => (
            <button
              key={s}
              onClick={() => add(s)}
              disabled={atMax}
              style={{
                background: "transparent", border: `1px dashed ${BORDER}`,
                borderRadius: 14, padding: "3px 9px", fontSize: 11,
                color: atMax ? MUTED_LIGHT : MUTED, cursor: atMax ? "not-allowed" : "pointer",
                fontFamily: FONT,
              }}
              onMouseEnter={(e) => { if (!atMax) { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.color = PURPLE; } }}
              onMouseLeave={(e) => { if (!atMax) { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; } }}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {atMax && (
        <div style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>
          Max {maxItems} reached.
        </div>
      )}
    </div>
  );
}

function SingleSelectChips({
  value, onChange, options, allowClear,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
  allowClear?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <Chip
            key={o.value}
            label={o.label}
            selected={selected}
            onClick={() => {
              if (selected && allowClear) onChange(null);
              else onChange(o.value);
            }}
          />
        );
      })}
    </div>
  );
}

function MultiSelectChips({
  values, onChange, options,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  options: { value: string; label: string }[];
}) {
  const toggle = (v: string) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          selected={values.includes(o.value)}
          onClick={() => toggle(o.value)}
        />
      ))}
    </div>
  );
}

function ExperienceRange({
  minExp, maxExp, onChange,
}: {
  minExp: number;
  maxExp: number;
  onChange: (min: number, max: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="number"
          min={0}
          max={20}
          value={minExp}
          onChange={(e) => onChange(Math.max(0, Math.min(20, parseInt(e.target.value || "0", 10))), maxExp)}
          style={inputBoxStyle(70)}
        />
        <span style={{ color: MUTED, fontSize: 13 }}>to</span>
        <input
          type="number"
          min={0}
          max={20}
          value={maxExp}
          onChange={(e) => onChange(minExp, Math.max(0, Math.min(20, parseInt(e.target.value || "0", 10))))}
          style={inputBoxStyle(70)}
        />
        <span style={{ color: MUTED, fontSize: 13 }}>years</span>
      </div>
    </div>
  );
}

function inputBoxStyle(width: number): CSSProperties {
  return {
    width, padding: "8px 10px", border: `1.5px solid ${BORDER}`, borderRadius: 7,
    fontSize: 13, fontFamily: FONT, color: TEXT, outline: "none",
  };
}

function PickerCard({
  label, tagline, selected, onClick,
}: {
  label: string;
  tagline: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left", padding: "10px 12px",
        background: selected ? PURPLE_LIGHT : "#fff",
        border: `1.5px solid ${selected ? PURPLE : BORDER}`,
        borderRadius: 9, cursor: "pointer", fontFamily: FONT,
        flex: "1 1 200px", minWidth: 180,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: selected ? PURPLE : TEXT, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>
        {tagline}
      </div>
    </button>
  );
}

function CollapsibleSection({
  title, children, defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div style={{ marginTop: 20, border: `1px solid ${BORDER}`, borderRadius: 10, background: "#fff", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "14px 16px", background: "transparent",
          border: "none", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "space-between", fontFamily: FONT,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.6px" }}>
          {title}
        </span>
        <span style={{ fontSize: 14, color: MUTED }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function SearchForm({ onSearch, loading, outOfCredits = false, initialFilters = null }: Props) {
  const [state, setState] = useState<FormState>(() => stateFromInitialFilters(initialFilters));

  // Reload state if parent passes new initialFilters (e.g., switching saved search)
  useEffect(() => {
    if (initialFilters) setState(stateFromInitialFilters(initialFilters));
  }, [initialFilters]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const showAccountScope = state.roleFunction != null && ["renewals", "account_management", "implementation"].includes(state.roleFunction);
  const showSupportFields = state.roleFunction === "support";
  const showRenewalsFocus = state.roleFunction === "renewals";
  const showArchetype = state.levels.some((l) => SENIOR_LEVELS.has(l));
  const showLanguages = showSupportFields || state.voiceMode != null;

  const pastCompanySuggestions = useMemo(() => {
    if (!state.companyModel) return [];
    return PAST_COMPANIES_BY_ARCHETYPE[state.companyModel] || [];
  }, [state.companyModel]);

  const skillSuggestions = useMemo(() => {
    if (!state.roleFunction) return [];
    return SKILLS_BY_FUNCTION[state.roleFunction] || [];
  }, [state.roleFunction]);

  // Validation: search disabled until at least country + (sub-role OR title OR past co)
  const canSearch =
    !!state.locationCountry &&
    (state.subRoles.length > 0 || state.titleContains.trim() !== "" || state.pastCompaniesMust.length > 0);

  const handleSearch = () => {
    // Old-shape filter keys (so existing backend keeps working)
    const filters = {
      titleRole: state.subRoles[0] || null,
      titleLevel: state.levels[0] || null,
      minExp: state.minExp,
      maxExp: state.maxExp,
      locationTags: state.locationCities,
      companySize: state.companySizes[0] || null,
      industries: state.targetIndustries,
      companies: state.pastCompaniesMust,
      excludedCompanies: state.pastCompaniesAvoid,

      // New-shape keys (consumed by C2 backend updates)
      companyModel: state.companyModel,
      roleFunction: state.roleFunction,
      subRoles: state.subRoles,
      levels: state.levels,
      titleContains: state.titleContains.trim() || null,
      locationCountry: state.locationCountry,
      locationCities: state.locationCities,
      targetIndustries: state.targetIndustries,
      avoidIndustries: state.avoidIndustries,
      companySizes: state.companySizes,
      pastCompaniesMust: state.pastCompaniesMust,
      pastCompaniesAvoid: state.pastCompaniesAvoid,
      mustHaveSkills: state.mustHaveSkills,
      degreeLevels: state.degrees,
      majors: state.majors,
    };

    const scoringContext = {
      // Old-shape (backwards compat)
      relevantSkills: [...state.mustHaveSkills, ...state.niceToHaveSkills],

      // New-shape
      companyModel: state.companyModel,
      roleFunction: state.roleFunction,
      niceToHaveSkills: state.niceToHaveSkills,
      topSchools: state.topSchools,
      accountScope: state.accountScope,
      voiceMode: state.voiceMode,
      supportTier: state.supportTier,
      hiringArchetype: state.hiringArchetype,
      renewalsExpansionFocus: state.renewalsExpansionFocus,
      languages: state.languages,
      compensationLPA:
        state.compensationMinLPA != null || state.compensationMaxLPA != null
          ? [state.compensationMinLPA, state.compensationMaxLPA]
          : null,
      workingModel: state.workingModel,
      noticePeriodDays: state.noticePeriodDays,
      freeText: state.freeText.trim() || null,
    };

    onSearch(filters, { scoringContext, preferences: {}, rawInput: null });
  };

  const isEditing = Boolean(initialFilters);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: FONT }}>
      {/* Header */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>
          {isEditing ? "Edit search filters" : "Tell us about the role"}
        </div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
          Pick a company model + role function — everything below adapts to CS hiring for that combination.
        </div>
      </div>

      {/* ─── ROLE CONTEXT (the two pickers) ───────────────────────── */}
      <SectionShell title="Role context" subtitle="What kind of company is this, and what does the role do?">
        <FieldLabel>Your company is...</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {COMPANY_MODELS.map((cm) => (
            <PickerCard
              key={cm.value}
              label={cm.label}
              tagline={cm.tagline}
              selected={state.companyModel === cm.value}
              onClick={() => update("companyModel", cm.value)}
            />
          ))}
        </div>

        <FieldLabel>This role focuses on...</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ROLE_FUNCTIONS.map((rf) => (
            <PickerCard
              key={rf.value}
              label={rf.label}
              tagline={rf.tagline}
              selected={state.roleFunction === rf.value}
              onClick={() => update("roleFunction", rf.value)}
            />
          ))}
        </div>
      </SectionShell>

      {/* ─── WHERE & WHEN ─────────────────────────────────────────── */}
      <SectionShell title="Where & when">
        <FieldLabel hint="Leave empty for all India">Locations</FieldLabel>
        <ChipInput
          values={state.locationCities}
          onChange={(v) => update("locationCities", v)}
          placeholder="Type a city and press Enter…"
          suggestions={TOP_15_METROS}
        />

        <div style={{ marginTop: 16 }}>
          <FieldLabel>Experience</FieldLabel>
          <ExperienceRange
            minExp={state.minExp}
            maxExp={state.maxExp}
            onChange={(min, max) => setState((s) => ({ ...s, minExp: min, maxExp: max }))}
          />
        </div>
      </SectionShell>

      {/* ─── THE ROLE ─────────────────────────────────────────────── */}
      <SectionShell title="The role">
        <FieldLabel>Sub-role(s)</FieldLabel>
        <MultiSelectChips
          values={state.subRoles}
          onChange={(v) => update("subRoles", v)}
          options={SUB_ROLES}
        />

        <div style={{ marginTop: 16 }}>
          <FieldLabel>Level(s)</FieldLabel>
          <MultiSelectChips
            values={state.levels}
            onChange={(v) => update("levels", v)}
            options={LEVELS}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <FieldLabel hint="optional — exact words to look for in job titles">Title contains</FieldLabel>
          <input
            value={state.titleContains}
            onChange={(e) => update("titleContains", e.target.value)}
            placeholder="e.g., enterprise, renewals, voice…"
            style={{ ...inputBoxStyle(0), width: "100%", boxSizing: "border-box" }}
          />
        </div>
      </SectionShell>

      {/* ─── COMPANY FIT ──────────────────────────────────────────── */}
      <SectionShell title="Company fit">
        <FieldLabel>Target industries</FieldLabel>
        <ChipInput
          values={state.targetIndustries}
          onChange={(v) => update("targetIndustries", v)}
          placeholder="Type an industry…"
          suggestions={INDUSTRIES_TIER_1}
        />

        <div style={{ marginTop: 16 }}>
          <FieldLabel>Avoid industries</FieldLabel>
          <ChipInput
            values={state.avoidIndustries}
            onChange={(v) => update("avoidIndustries", v)}
            placeholder="Industries to filter out…"
            suggestions={INDUSTRIES_TIER_1.concat(INDUSTRIES_TIER_2)}
            color="red"
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <FieldLabel>Company size</FieldLabel>
          <MultiSelectChips
            values={state.companySizes}
            onChange={(v) => update("companySizes", v)}
            options={COMPANY_SIZES}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <FieldLabel hint="boost candidates who worked at these">Past companies (must / strong boost)</FieldLabel>
          <ChipInput
            values={state.pastCompaniesMust}
            onChange={(v) => update("pastCompaniesMust", v)}
            placeholder="Type a company name…"
            suggestions={pastCompanySuggestions}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <FieldLabel>Past companies (avoid)</FieldLabel>
          <ChipInput
            values={state.pastCompaniesAvoid}
            onChange={(v) => update("pastCompaniesAvoid", v)}
            placeholder="Companies to exclude…"
            color="red"
          />
        </div>
      </SectionShell>

      {/* ─── SKILLS & TOOLS ───────────────────────────────────────── */}
      <SectionShell title="Skills & tools" subtitle="Soft skills (communication, leadership) go in 'Anything else important' — they shape scoring, not PDL filters.">
        <FieldLabel hint="max 3 — used as hard filter">Must-have skills</FieldLabel>
        <ChipInput
          values={state.mustHaveSkills}
          onChange={(v) => update("mustHaveSkills", v)}
          placeholder="e.g., Gainsight, Zendesk, Salesforce…"
          suggestions={skillSuggestions}
          maxItems={3}
        />

        <div style={{ marginTop: 16 }}>
          <FieldLabel hint="ranks higher — won't exclude candidates without them">Nice-to-have skills</FieldLabel>
          <ChipInput
            values={state.niceToHaveSkills}
            onChange={(v) => update("niceToHaveSkills", v)}
            placeholder="Skills that boost ranking…"
            suggestions={skillSuggestions}
          />
        </div>
      </SectionShell>

      {/* ─── CS-SPECIFIC SIGNALS (conditional) ────────────────────── */}
      {(showAccountScope || showSupportFields || showRenewalsFocus || showArchetype || showLanguages) && (
        <SectionShell title="CS-specific signals" subtitle="These adapt to your role function + level — they shape scoring.">
          {showAccountScope && (
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Account scope</FieldLabel>
              <SingleSelectChips
                value={state.accountScope}
                onChange={(v) => update("accountScope", v)}
                options={ACCOUNT_SCOPES}
                allowClear
              />
            </div>
          )}
          {showSupportFields && (
            <>
              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Voice / non-voice</FieldLabel>
                <SingleSelectChips
                  value={state.voiceMode}
                  onChange={(v) => update("voiceMode", v)}
                  options={VOICE_MODES}
                  allowClear
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Support tier</FieldLabel>
                <SingleSelectChips
                  value={state.supportTier}
                  onChange={(v) => update("supportTier", v)}
                  options={SUPPORT_TIERS}
                  allowClear
                />
              </div>
            </>
          )}
          {showRenewalsFocus && (
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Renewals vs expansion focus</FieldLabel>
              <SingleSelectChips
                value={state.renewalsExpansionFocus}
                onChange={(v) => update("renewalsExpansionFocus", v)}
                options={RENEWALS_FOCI}
                allowClear
              />
            </div>
          )}
          {showArchetype && (
            <div style={{ marginBottom: 16 }}>
              <FieldLabel hint="senior+ roles only">Hiring archetype</FieldLabel>
              <SingleSelectChips
                value={state.hiringArchetype}
                onChange={(v) => update("hiringArchetype", v)}
                options={HIRING_ARCHETYPES}
                allowClear
              />
            </div>
          )}
          {showLanguages && (
            <div>
              <FieldLabel hint="boost — won't exclude candidates">Languages (besides English)</FieldLabel>
              <ChipInput
                values={state.languages}
                onChange={(v) => update("languages", v)}
                placeholder="Type a language…"
                suggestions={INDIAN_LANGUAGES}
              />
            </div>
          )}
        </SectionShell>
      )}

      {/* ─── EDUCATION (collapsed) ────────────────────────────────── */}
      <CollapsibleSection title="Education">
        <FieldLabel>Degree level</FieldLabel>
        <MultiSelectChips
          values={state.degrees}
          onChange={(v) => update("degrees", v)}
          options={DEGREE_LEVELS}
        />

        <div style={{ marginTop: 16 }}>
          <FieldLabel hint="boost only — won't exclude others">Top schools</FieldLabel>
          <ChipInput
            values={state.topSchools}
            onChange={(v) => update("topSchools", v)}
            placeholder="e.g., IIT, IIM, ISB…"
            suggestions={TOP_SCHOOLS}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <FieldLabel>Majors / fields of study</FieldLabel>
          <ChipInput
            values={state.majors}
            onChange={(v) => update("majors", v)}
            placeholder="e.g., Business Administration, Computer Science…"
          />
        </div>
      </CollapsibleSection>

      {/* ─── OTHER CONTEXT (collapsed) ────────────────────────────── */}
      <CollapsibleSection title="Other context">
        <FieldLabel>Compensation (LPA, INR)</FieldLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="number"
            min={0}
            value={state.compensationMinLPA ?? ""}
            onChange={(e) => update("compensationMinLPA", e.target.value === "" ? null : parseFloat(e.target.value))}
            placeholder="min"
            style={inputBoxStyle(80)}
          />
          <span style={{ color: MUTED, fontSize: 13 }}>to</span>
          <input
            type="number"
            min={0}
            value={state.compensationMaxLPA ?? ""}
            onChange={(e) => update("compensationMaxLPA", e.target.value === "" ? null : parseFloat(e.target.value))}
            placeholder="max"
            style={inputBoxStyle(80)}
          />
          <span style={{ color: MUTED, fontSize: 13 }}>LPA</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <FieldLabel hint="scoring only — PDL doesn't filter on this">Working model</FieldLabel>
          <MultiSelectChips
            values={state.workingModel}
            onChange={(v) => update("workingModel", v)}
            options={WORKING_MODELS}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <FieldLabel>Notice period (days, max)</FieldLabel>
          <input
            type="number"
            min={0}
            value={state.noticePeriodDays ?? ""}
            onChange={(e) => update("noticePeriodDays", e.target.value === "" ? null : parseInt(e.target.value, 10))}
            placeholder="e.g., 60"
            style={inputBoxStyle(100)}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <FieldLabel hint="anything else important — soft skills, culture fit, deal-breakers, vertical knowledge">Anything else</FieldLabel>
          <textarea
            value={state.freeText}
            onChange={(e) => update("freeText", e.target.value)}
            placeholder="Catch-all context for scoring. e.g., 'must have managed a book of 50+ enterprise accounts; bonus if they've sold to CFOs; avoid candidates from agency backgrounds.'"
            rows={4}
            style={{ ...inputBoxStyle(0), width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}
          />
        </div>
      </CollapsibleSection>

      {/* ─── OUT-OF-CREDITS BANNER ────────────────────────────────── */}
      {outOfCredits && (
        <div style={{ marginTop: 18, padding: "10px 12px", background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e", borderRadius: 8, fontSize: 12 }}>
          You've used all your search credits. Buy more to run new searches.
        </div>
      )}

      {/* ─── ACTION BAR ───────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingBottom: 12 }}>
        <div style={{ fontSize: 11, color: MUTED }}>
          {!canSearch && "Add at least a sub-role, title keyword, or past company to search."}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || outOfCredits || !canSearch}
          title={
            outOfCredits ? "No search credits left" :
            !canSearch ? "Add at least a sub-role, title keyword, or past company" : ""
          }
          style={{
            background: (loading || outOfCredits || !canSearch) ? "#e8e8ee" : PURPLE,
            color: (loading || outOfCredits || !canSearch) ? MUTED : "#fff",
            border: "none", borderRadius: 8, padding: "11px 24px",
            fontSize: 13, fontWeight: 600,
            cursor: (loading || outOfCredits || !canSearch) ? "not-allowed" : "pointer",
            fontFamily: FONT,
          }}
        >
          {loading ? "Searching…" : isEditing ? "Run updated search →" : "Search candidates →"}
        </button>
      </div>
    </div>
  );
}
