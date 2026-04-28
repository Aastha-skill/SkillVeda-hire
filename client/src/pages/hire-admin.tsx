import { useState, useEffect } from "react";

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const ADMIN_SECRET = "skillveda-admin-2024";

interface Company {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  credits: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function HireAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Company | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [setCreditsInput, setSetCreditsInput] = useState<Record<number, string>>({});

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hiring/admin/companies", {
        headers: { "x-admin-key": ADMIN_SECRET },
      });
      if (res.ok) setCompanies(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (authed) fetchCompanies();
  }, [authed]);

  const handleAuth = () => {
    if (pwInput === ADMIN_SECRET) {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password");
    }
  };

  const updateCredits = async (companyId: number, action: "add" | "subtract" | "set", amount: number) => {
    setActionLoading(companyId);
    try {
      const res = await fetch("/api/hiring/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_SECRET },
        body: JSON.stringify({ companyId, action, amount }),
      });
      if (res.ok) {
        await fetchCompanies();
        if (selected?.id === companyId) {
          const updated = companies.find(c => c.id === companyId);
          if (updated) setSelected(updated);
        }
      }
    } catch {}
    finally { setActionLoading(null); }
  };

  const filtered = companies.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "36px 40px", width: 360, boxSizing: "border-box" as const }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 6 }}>Admin Access</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>SkillVeda Hire — Internal admin panel</div>
          {pwError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", color: "#dc2626", fontSize: 12, marginBottom: 14 }}>
              ⚠️ {pwError}
            </div>
          )}
          <input
            type="password"
            placeholder="Admin password"
            value={pwInput}
            onChange={e => setPwInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
            style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" as const, marginBottom: 14 }}
          />
          <button
            onClick={handleAuth}
            style={{ width: "100%", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}
          >
            Enter →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: font }}>
      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
          SkillVeda <span style={{ color: "#a78bfa" }}>Hire</span> — Admin
        </div>
        <div style={{ fontSize: 12, color: "#8888aa" }}>{companies.length} companies</div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {/* Search + Refresh */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search by company or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontFamily: font, outline: "none", background: "#fff" }}
          />
          <button onClick={fetchCompanies} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer", fontFamily: font }}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2.5fr 1.5fr 1fr 1fr 2fr", padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            {["Company", "Email", "Name", "Credits", "Plan", "Joined"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.4px" }}>{h}</div>
            ))}
          </div>

          {loading && (
            <div style={{ padding: "32px", textAlign: "center" as const, color: "#9ca3af", fontSize: 13 }}>Loading companies...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center" as const, color: "#9ca3af", fontSize: 13 }}>No companies found</div>
          )}

          {filtered.map(c => (
            <div
              key={c.id}
              style={{ display: "grid", gridTemplateColumns: "2fr 2.5fr 1.5fr 1fr 1fr 2fr", padding: "13px 16px", borderBottom: "1px solid #f3f4f6", alignItems: "center", background: selected?.id === c.id ? "#f5f3ff" : "#fff" }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{c.companyName}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{c.email}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{c.contactName}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>{c.credits}</div>
              <div>
                <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>
                  Free
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Credit Actions</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {filtered.map(c => (
              <div key={c.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const }}>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{c.companyName}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.credits} credits</div>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" as const }}>
                  <button
                    onClick={() => updateCredits(c.id, "add", 10)}
                    disabled={actionLoading === c.id}
                    style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}
                  >
                    +10
                  </button>
                  <button
                    onClick={() => updateCredits(c.id, "subtract", 10)}
                    disabled={actionLoading === c.id}
                    style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}
                  >
                    -10
                  </button>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={setCreditsInput[c.id] || ""}
                      onChange={e => setSetCreditsInput(prev => ({ ...prev, [c.id]: e.target.value }))}
                      style={{ width: 80, border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: font, outline: "none" }}
                    />
                    <button
                      onClick={() => {
                        const amt = parseInt(setCreditsInput[c.id] || "0");
                        if (amt >= 0) updateCredits(c.id, "set", amt);
                      }}
                      disabled={actionLoading === c.id}
                      style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ede9fe", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}
                    >
                      Set
                    </button>
                  </div>
                  <button
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                    style={{ background: "#f9fafb", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: font }}
                  >
                    {selected?.id === c.id ? "Hide" : "View"}
                  </button>
                </div>
                {actionLoading === c.id && <span style={{ fontSize: 11, color: "#9ca3af" }}>Updating...</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ marginTop: 20, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 16 }}>{selected.companyName}</div>
            {[
              ["Email", selected.email],
              ["Contact", selected.contactName],
              ["Credits", String(selected.credits)],
              ["Status", selected.isActive ? "Active" : "Inactive"],
              ["Joined", new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
              ["Last Login", selected.lastLoginAt ? new Date(selected.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Never"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                <span style={{ color: "#9ca3af" }}>{label}</span>
                <span style={{ fontWeight: 600, color: "#111" }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
