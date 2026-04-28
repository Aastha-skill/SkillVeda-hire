import { useState, useEffect } from "react";

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f5f3ff";
const BORDER = "#e8e8ee";
const TEXT = "#111";
const MUTED = "#888";
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

interface ExtractedRequirement {
  filters: any;
  preferences: any;
  dealBreakers: any;
  scoringContext: any;
  confidence: Record<string, "high" | "medium" | "low">;
  missingFields: string[];
  rawInput: string;
}

interface Props {
  onSearch: (filterState: any, scoringContext: any) => void;
  loading?: boolean;
  outOfCredits?: boolean;
  initialFilters?: any | null;
}

const EXAMPLE_PARAGRAPH = `I'm hiring a Customer Success Manager for our Series B SaaS product. 4-7 years experience, ideally from another B2B SaaS company. Must be in Bangalore. Should know Gainsight or similar. Avoid candidates currently at Freshworks. Notice period under 60 days preferred.`;

const COMPANY_SIZE_OPTIONS = ["Startup", "Growth", "Mid-market", "Enterprise", "Any"];

export default function RequirementWizard({ onSearch, loading, outOfCredits = false, initialFilters = null }: Props) {
  // If we're editing a saved search, jump straight to the review step.
  const isEditing = Boolean(initialFilters);
  const [step, setStep] = useState<"input" | "review">(isEditing ? "review" : "input");
  const [paragraph, setParagraph] = useState("");
  const [parsing, setParsing] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedRequirement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<any>(initialFilters || {});
  const [preferences, setPreferences] = useState<any>({});
  const [scoringContext, setScoringContext] = useState<any>({});

  // If the parent passes new initialFilters (e.g., user clicks "Edit Filters"
  // on a different saved search while wizard is already mounted), reload them.
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
      setStep("review");
      setExtracted(null);
      setPreferences({});
      setScoringContext({});
      setError(null);
    }
  }, [initialFilters]);

  const tok = () => localStorage.getItem("hiring_token") || "";

  const handleParse = async () => {
    if (paragraph.trim().length < 10) {
      setError("Please write at least a sentence describing the role");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const res = await fetch("/api/hiring/parse-requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({ paragraph }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to parse requirement");
        return;
      }
      const data = await res.json();
      setExtracted(data);
      setFilters(data.filters || {});
      setPreferences(data.preferences || {});
      setScoringContext(data.scoringContext || {});
      setStep("review");
    } catch (e: any) {
      setError(String(e));
    } finally {
      setParsing(false);
    }
  };

  const handleSearch = () => {
    onSearch(filters, { preferences, scoringContext, rawInput: extracted?.rawInput });
  };

  const removeTag = (key: string, value: string) => {
    setFilters({ ...filters, [key]: (filters[key] || []).filter((v: string) => v !== value) });
  };

  const removeScoringTag = (key: string, value: string) => {
    setScoringContext({ ...scoringContext, [key]: (scoringContext[key] || []).filter((v: string) => v !== value) });
  };

  if (step === "input") {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", fontFamily: FONT }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
          Tell us about the role
        </div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.6 }}>
          The more specific, the better the match. Include role, experience, location, must-haves, and any deal-breakers.
        </div>

        <details style={{ marginBottom: 16, fontSize: 12, color: MUTED }}>
          <summary style={{ cursor: "pointer", color: PURPLE }}>See an example</summary>
          <div style={{ marginTop: 8, padding: 12, background: PURPLE_LIGHT, borderRadius: 8, fontSize: 12, lineHeight: 1.6, color: "#444" }}>
            {EXAMPLE_PARAGRAPH}
          </div>
        </details>

        <textarea
          value={paragraph}
          onChange={(e) => setParagraph(e.target.value)}
          placeholder="Describe who you want to hire..."
          rows={8}
          style={{
            width: "100%",
            padding: 14,
            border: `1.5px solid ${BORDER}`,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: FONT,
            color: TEXT,
            outline: "none",
            resize: "vertical",
            lineHeight: 1.6,
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = PURPLE)}
          onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
        />

        {error && (
          <div style={{ marginTop: 10, padding: 10, background: "#fef2f2", color: "#991b1b", borderRadius: 7, fontSize: 12 }}>
            {error}
          </div>
        )}

        {outOfCredits && (
          <div style={{ marginTop: 14, padding: "10px 12px", background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e", borderRadius: 7, fontSize: 12 }}>
            You've used all your free searches. Please buy credits to run new searches.
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button
            onClick={handleParse}
            disabled={parsing || paragraph.trim().length < 10 || outOfCredits}
            title={outOfCredits ? "No search credits left" : ""}
            style={{
              background: (paragraph.trim().length >= 10 && !outOfCredits) ? PURPLE : "#e8e8ee",
              color: (paragraph.trim().length >= 10 && !outOfCredits) ? "#fff" : MUTED,
              border: "none",
              borderRadius: 8,
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 600,
              cursor: (paragraph.trim().length >= 10 && !outOfCredits) ? "pointer" : "not-allowed",
              fontFamily: FONT,
            }}
          >
            {parsing ? "Reading..." : outOfCredits ? "No credits left" : "Continue →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
            {isEditing ? "Edit search filters" : "Here's what we extracted"}
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
            {isEditing
              ? "Tweak the filters below, then re-run as a new search."
              : "Review and tweak — click × to remove anything wrong."}
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setStep("input")}
            style={{
              background: "transparent",
              border: `1px solid ${BORDER}`,
              color: MUTED,
              borderRadius: 6,
              padding: "5px 10px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            ← Edit paragraph
          </button>
        )}
      </div>

      {isEditing && (
        <div style={{
          background: "#f5f3ff", border: "1px solid #c4b5fd",
          borderRadius: 7, padding: "10px 12px",
          marginBottom: 16, fontSize: 12, color: "#5b21b6",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
        }}>
          <span>📝 Editing a saved search. Running it will create a new search row — your original results are preserved.</span>
        </div>
      )}

      {/* ─── Must-haves: Role / Level / Experience ─────────────────── */}
      <Section title="Role & Experience" filters={filters} fields={[
        { key: "titleRole", label: "Role" },
        { key: "titleLevel", label: "Level" },
        { key: "minExp", label: "Min experience", suffix: " yrs" },
        { key: "maxExp", label: "Max experience", suffix: " yrs" },
      ]} confidence={extracted?.confidence || {}} setFilters={setFilters} />

      {/* ─── Locations ───────────────────────────────────────────── */}
      {(filters.workArrangement === "remote" || (filters.locationTags || []).length === 0) ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 6 }}>
            Locations
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, alignItems: "center" }}>
            <span style={{
              background: "#eff6ff", color: "#1e40af",
              border: "1px solid #bfdbfe", borderRadius: 14,
              padding: "4px 10px", fontSize: 12, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              {filters.workArrangement === "remote" ? "Remote · All India" : "All India"}
            </span>
            <span style={{ fontSize: 11, color: MUTED }}>
              {filters.workArrangement === "remote"
                ? "We'll search candidates across India — PDL doesn't filter by work arrangement."
                : "No specific city — searching all India."}
            </span>
          </div>
        </div>
      ) : (
        <ArraySection title="Locations" arr={filters.locationTags} onRemove={(v) => removeTag("locationTags", v)} />
      )}

      {/* ─── Company fit (industry + size) ───────────────────────── */}
      <Section title="Company fit" filters={filters} fields={[
        { key: "companySize", label: "Company size" },
      ]} confidence={extracted?.confidence || {}} setFilters={setFilters} />

      <ArraySection title="Industries" arr={filters.industries} onRemove={(v) => removeTag("industries", v)} />

      {/* ─── Targeting (companies in/out) ────────────────────────── */}
      <ArraySection title="Source from these companies" arr={filters.companies} onRemove={(v) => removeTag("companies", v)} />
      <ArraySection
        title="Excluded companies"
        arr={filters.excludedCompanies}
        onRemove={(v) => removeTag("excludedCompanies", v)}
        color="#dc2626"
      />

      {/* ─── Scoring signals (not filters) ───────────────────────── */}
      <ArraySection
        title="Skills (used for ranking, not filtering)"
        arr={scoringContext.relevantSkills}
        onRemove={(v) => removeScoringTag("relevantSkills", v)}
        helpText="Candidates with these skills will rank higher, but profiles without them won't be excluded."
      />

      {/* ─── Soft preferences ────────────────────────────────────── */}
      {(preferences.accountScope || preferences.hiringArchetype || preferences.companyStage) && (
        <Section
          title="Strong preferences"
          filters={preferences}
          fields={[
            { key: "accountScope", label: "Account scope" },
            { key: "hiringArchetype", label: "Hiring archetype" },
            { key: "companyStage", label: "Company stage" },
          ]}
          confidence={extracted?.confidence || {}}
          setFilters={setPreferences}
        />
      )}

      {/* ─── Compensation / notice period ────────────────────────── */}
      {(scoringContext.compensationRangeLPA || scoringContext.noticePeriodDays) && (
        <Section
          title="Other context"
          filters={scoringContext}
          fields={[
            {
              key: "compensationRangeLPA",
              label: "Compensation",
              format: (v: number[]) => v ? `${v[0] ?? "any"} – ${v[1] ?? "any"} LPA` : null,
            },
            { key: "noticePeriodDays", label: "Notice period", suffix: " days" },
          ]}
          confidence={extracted?.confidence || {}}
          setFilters={setScoringContext}
        />
      )}

      {extracted?.missingFields && extracted.missingFields.length > 0 && (
        <div style={{
          background: "#fef9e7",
          border: "1px solid #fde68a",
          borderRadius: 8,
          padding: 12,
          marginTop: 16,
          fontSize: 12,
          color: "#92400e",
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Could improve match quality if you add:</div>
          <div style={{ lineHeight: 1.6 }}>
            {extracted.missingFields.map((f, i) => (
              <span key={f}>{i > 0 ? ", " : ""}{prettyField(f)}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
        {!isEditing && (
          <button
            onClick={() => setStep("input")}
            style={{
              background: "transparent",
              border: `1px solid ${BORDER}`,
              color: MUTED,
              borderRadius: 7,
              padding: "9px 16px",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={loading || outOfCredits}
          title={outOfCredits ? "No search credits left — buy more to continue" : ""}
          style={{
            background: outOfCredits ? "#e8e8ee" : PURPLE,
            color: outOfCredits ? MUTED : "#fff",
            border: "none",
            borderRadius: 7,
            padding: "9px 22px",
            fontSize: 13,
            fontWeight: 600,
            cursor: (loading || outOfCredits) ? "not-allowed" : "pointer",
            fontFamily: FONT,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Searching..." : outOfCredits ? "No credits left" : (isEditing ? "Run updated search →" : "Search candidates →")}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  filters,
  fields,
  confidence,
  setFilters,
}: {
  title: string;
  filters: any;
  fields: { key: string; label: string; suffix?: string; format?: (v: any) => string | null }[];
  confidence: Record<string, string>;
  setFilters: (f: any) => void;
}) {
  const visible = fields.filter((f) => filters[f.key] !== undefined && filters[f.key] !== null && filters[f.key] !== "");
  if (visible.length === 0) return null;

  return (
    <div style={{ marginTop: 16, padding: 14, border: `1px solid ${BORDER}`, borderRadius: 9, background: "#fff" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
        {title}
      </div>
      {visible.map((f) => {
        const val = filters[f.key];
        const display = f.format ? f.format(val) : `${val}${f.suffix || ""}`;
        const conf = confidence[f.key];
        return (
          <div key={f.key} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid #f5f5f8`, fontSize: 13 }}>
            <span style={{ color: "#666", display: "flex", alignItems: "center", gap: 6 }}>
              {f.label}
              {conf === "low" && (
                <span title="Low confidence — please verify" style={{ fontSize: 10, color: "#d97706" }}>⚠</span>
              )}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, color: TEXT }}>{display}</span>
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters[f.key];
                  setFilters(newFilters);
                }}
                title="Remove"
                style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: 14, padding: 0, fontFamily: FONT }}
              >
                ×
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ArraySection({
  title,
  arr,
  onRemove,
  color,
  helpText,
}: {
  title: string;
  arr: string[] | undefined;
  onRemove: (v: string) => void;
  color?: string;
  helpText?: string;
}) {
  if (!arr || arr.length === 0) return null;
  const tagColor = color || PURPLE;
  return (
    <div style={{ marginTop: 16, padding: 14, border: `1px solid ${BORDER}`, borderRadius: 9, background: "#fff" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: helpText ? 4 : 10 }}>
        {title}
      </div>
      {helpText && (
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 10, lineHeight: 1.5 }}>
          {helpText}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {arr.map((v) => (
          <span
            key={v}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: color ? "#fef2f2" : PURPLE_LIGHT,
              color: tagColor,
              border: `1px solid ${color ? "#fecaca" : "#ddd6fe"}`,
              borderRadius: 16,
              padding: "3px 10px",
              fontSize: 12,
            }}
          >
            {v}
            <button
              onClick={() => onRemove(v)}
              style={{ background: "transparent", border: "none", color: tagColor, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1, fontFamily: FONT }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function prettyField(f: string): string {
  const map: Record<string, string> = {
    titleRole: "role",
    titleLevel: "seniority level",
    locationTags: "location",
    industries: "industry",
    companySize: "company size",
    excludedCompanies: "companies to exclude",
    accountScope: "account scope (SMB/MM/Enterprise)",
    hiringArchetype: "hiring style (builder/operator)",
    compensationRangeLPA: "compensation range",
    noticePeriodDays: "notice period preference",
  };
  return map[f] || f;
}