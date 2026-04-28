import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const S = {
  bg: "#ffffff",
  pageBg: "#fafafa",
  sidebar: "#1a1a2e",
  sidebarActive: "#2d2b55",
  sidebarText: "#e2e2f0",
  sidebarMuted: "#8888aa",
  sidebarBorder: "#252540",
  accent: "#7c3aed",
  accentLight: "#f5f3ff",
  border: "#e8e8ee",
  borderLight: "#f0f0f6",
  text: "#111111",
  muted: "#999999",
  muted2: "#cccccc",
  green: "#16a34a",
  greenBg: "#f0fdf4",
  greenBorder: "#bbf7d0",
  red: "#dc2626",
  redBg: "#fef2f2",
  amber: "#d97706",
  amberBg: "#fffbeb",
};

interface EmailSettings {
  senderEmail: string;
  senderName: string;
  reachout1Subject: string;
  reachout1Body: string;
  reachout2Subject: string;
  reachout2Body: string;
  reachout3Subject: string;
  reachout3Body: string;
}

export default function HireEmailSetup() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeReachout, setActiveReachout] = useState(1);

  const [settings, setSettings] = useState<EmailSettings>({
    senderEmail: "",
    senderName: "",
    reachout1Subject: "Interested in your profile for the role at SkillVeda",
    reachout1Body: "Hi {{FIRST_NAME}},\n\nWe came across your profile on LinkedIn and really liked your past experience and background.\n\nWe are currently hiring for a role at SkillVeda and would love to consider your profile.\n\nIf this sounds interesting, please share your resume by replying to this email.\n\nLooking forward to hearing from you.\n\nRegards,\nRecruitment Team\nSkillVeda",
    reachout2Subject: "Following up on our previous email",
    reachout2Body: "Hi {{FIRST_NAME}},\n\nJust checking in regarding the role we had reached out to you about.\n\nIf it feels like a fit, please share your resume by replying to this email.\n\nRegards,\nRecruitment Team\nSkillVeda",
    reachout3Subject: "Last follow up",
    reachout3Body: "Hi {{FIRST_NAME}},\n\nThis is my last follow up regarding the opportunity we discussed.\n\nWould love to hear from you if you are open to exploring.\n\nRegards,\nRecruitment Team\nSkillVeda",
  });

  const tok = () => localStorage.getItem("hiring_token") || "";

  useEffect(() => {
    const t = localStorage.getItem("hiring_token");
    if (!t) { navigate("/hire/login"); return; }
    fetchSettings(t);
  }, []);

  const fetchSettings = async (t: string) => {
    try {
      const res = await fetch("/api/hiring/email-settings", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) { navigate("/hire/login"); return; }
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setError("");
    if (!settings.senderEmail || !settings.senderName) {
      setError("Please fill in your sender email and name");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/hiring/email-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Something went wrong");
    }
    finally { setSaving(false); }
  };

  const getCurrentSubject = () => {
    if (activeReachout === 1) return settings.reachout1Subject;
    if (activeReachout === 2) return settings.reachout2Subject;
    return settings.reachout3Subject;
  };

  const getCurrentBody = () => {
    if (activeReachout === 1) return settings.reachout1Body;
    if (activeReachout === 2) return settings.reachout2Body;
    return settings.reachout3Body;
  };

  const setCurrentSubject = (val: string) => {
    if (activeReachout === 1) setSettings((p) => ({ ...p, reachout1Subject: val }));
    else if (activeReachout === 2) setSettings((p) => ({ ...p, reachout2Subject: val }));
    else setSettings((p) => ({ ...p, reachout3Subject: val }));
  };

  const setCurrentBody = (val: string) => {
    if (activeReachout === 1) setSettings((p) => ({ ...p, reachout1Body: val }));
    else if (activeReachout === 2) setSettings((p) => ({ ...p, reachout2Body: val }));
    else setSettings((p) => ({ ...p, reachout3Body: val }));
  };

  const insertVariable = (variable: string) => {
    setCurrentBody(getCurrentBody() + variable);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: font }}>
        <div style={{ color: "#999" }}>Loading...</div>
      </div>
    );
  }

  const reachouts = [
    { num: 1, label: "Reachout 1", timing: "Scheduled for", timingValue: "Now", showDelete: false },
    { num: 2, label: "Reachout 2", timing: "if no reply", timingValue: "after 1 day", showDelete: true },
    { num: 3, label: "Reachout 3", timing: "if no reply", timingValue: "after 1 day", showDelete: true },
  ];
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: font, background: S.bg, overflow: "hidden" }}>

      {/* SIDEBAR — same as dashboard */}
      <div style={{ width: 220, minWidth: 220, background: S.sidebar, display: "flex", flexDirection: "column" as const, justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ padding: "16px", borderBottom: `1px solid ${S.sidebarBorder}` }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
              SkillVeda <span style={{ color: "#a78bfa" }}>Hire</span>
            </span>
          </div>
          <div style={{ margin: "10px", background: "#12122a", borderRadius: 9, padding: "11px 12px" }}>
            <div style={{ fontSize: 10, color: S.sidebarMuted, fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.4px" }}>Credits Remaining</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "2px 0 1px" }}>—</div>
            <div style={{ fontSize: 10, color: "#555580" }}>Free plan</div>
          </div>
          {[
            { label: "Sourcing Copilot", icon: "🔍", path: "/hire/dashboard" },
            { label: "Saved Candidates", icon: "🔖", path: "/hire/dashboard" },
            { label: "Manage Jobs", icon: "💼", path: "" },
            { label: "Email & WhatsApp", icon: "✉️", path: "/hire/email-setup", active: true },
            { label: "Analytics", icon: "📊", path: "" },
            { label: "Contact Us", icon: "📞", path: "" },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", margin: "2px 7px", borderRadius: 7, fontSize: 12, background: item.active ? S.sidebarActive : "transparent", color: item.active ? S.sidebarText : S.sidebarMuted, cursor: item.path ? "pointer" : "default" }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${S.sidebarBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: S.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#fff" }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: S.sidebarText }}>Aastha</div>
            <div style={{ fontSize: 10, color: "#555580" }}>aastha@skillveda.ai</div>
          </div>
        </div>
      </div>

      {/* PANEL 2 — same as dashboard */}
      <div style={{ width: 220, borderRight: `1px solid ${S.border}`, padding: 12, flexShrink: 0, overflowY: "auto" as const, background: S.bg }}>
        <div style={{ border: `1px solid ${S.border}`, borderRadius: 7, padding: "8px 10px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: S.muted2 }}>Job Folder</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: S.text }}>First job folder</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: S.text, marginBottom: 7, display: "flex", justifyContent: "space-between" }}>
          Searches <span style={{ fontSize: 11, color: S.accent, cursor: "pointer" }} onClick={() => navigate("/hire/dashboard")}>New Search +</span>
        </div>
        <div style={{ marginTop: 12 }}>
          {[
            { label: "Saved Candidates", nav: "/hire/dashboard" },
            { label: "Email and Whatsapp setup", nav: "/hire/email-setup", active: true },
            { label: "Email Inbox" },
            { label: "Analytics" },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => (item as any).nav && navigate((item as any).nav)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 9px", fontSize: 12, color: (item as any).active ? S.accent : "#666", cursor: "pointer", borderRadius: 5, fontWeight: (item as any).active ? 600 : 400 }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN EMAIL SETUP */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden" }}>

        {/* Top warning banner */}
        {!settings.senderEmail && (
          <div style={{ padding: "10px 20px", background: "#fef9f0", borderBottom: `1px solid #fde68a`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#92400e" }}>
              <span style={{ color: S.amber, fontSize: 16 }}>ⓘ</span>
              Campaign setup issues detected. Add your sender email to start sending emails.
            </div>
            <button
              onClick={() => {
                const email = prompt("Enter your sender email address:");
                if (email) setSettings((p) => ({ ...p, senderEmail: email }));
              }}
              style={{ background: S.red, color: "#fff", border: "none", borderRadius: 7, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}
            >
              Connect
            </button>
          </div>
        )}

        {settings.senderEmail && (
          <div style={{ padding: "10px 20px", background: S.greenBg, borderBottom: `1px solid ${S.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: S.green }}>
              <span>✅</span>
              Sending from: <strong>{settings.senderEmail}</strong>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: S.accent, color: "#fff", border: "none", borderRadius: 7, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Settings"}
            </button>
          </div>
        )}

        {error && (
          <div style={{ padding: "8px 20px", background: S.redBg, borderBottom: `1px solid #fecaca`, fontSize: 12, color: S.red }}>
            ⚠️ {error}
          </div>
        )}

        {/* Email sequences */}
        <div style={{ flex: 1, overflowY: "auto" as const, padding: "0 20px 20px" }}>

          {/* Sender setup if not connected */}
          {!settings.senderEmail && (
            <div style={{ background: "#fafafa", border: `1px solid ${S.border}`, borderRadius: 10, padding: 16, margin: "16px 0" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 12 }}>Sender Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#666", marginBottom: 5 }}>From Name</label>
                  <input
                    type="text"
                    placeholder="Recruitment Team"
                    value={settings.senderName}
                    onChange={(e) => setSettings((p) => ({ ...p, senderName: e.target.value }))}
                    style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" as const }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#666", marginBottom: 5 }}>From Email</label>
                  <input
                    type="email"
                    placeholder="hiring@yourcompany.com"
                    value={settings.senderEmail}
                    onChange={(e) => setSettings((p) => ({ ...p, senderEmail: e.target.value }))}
                    style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 7, padding: "8px 11px", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" as const }}
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ marginTop: 14, background: S.accent, color: "#fff", border: "none", borderRadius: 7, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}
              >
                {saving ? "Saving..." : "Save & Connect"}
              </button>
            </div>
          )}

          {/* Reachout cards */}
          {reachouts.map((r) => (
            <div
              key={r.num}
              style={{
                border: `1px solid ${activeReachout === r.num ? "#c4b5fd" : S.border}`,
                borderRadius: 12,
                marginTop: 16,
                overflow: "hidden",
                background: S.bg,
                boxShadow: activeReachout === r.num ? "0 0 0 2px #ede9fe" : "none",
              }}
            >
              {/* Reachout header */}
              <div
                onClick={() => setActiveReachout(r.num)}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  background: activeReachout === r.num ? "#faf9ff" : S.bg,
                  borderBottom: activeReachout === r.num ? `1px solid ${S.borderLight}` : "none",
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, background: S.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: S.accent }}>✉️</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{r.label}</span>
                <span style={{ fontSize: 12, color: S.muted }}>/</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4, border: `1px solid ${S.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#333" }}>
                  <span>✉️</span> Email <span style={{ color: S.muted }}>▾</span>
                </div>
                <span style={{ fontSize: 12, color: S.muted }}>·</span>
                <span style={{ fontSize: 12, color: S.muted }}>{r.timing}</span>
                {r.num > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, border: `1px solid ${S.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#333" }}>
                    📅 {r.timingValue} <span style={{ color: S.muted }}>▾</span>
                  </div>
                )}
                {r.num === 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, border: `1px solid ${S.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#333" }}>
                    📅 Now <span style={{ color: S.muted }}>▾</span>
                  </div>
                )}
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  {r.num === 2 && <span style={{ fontSize: 14, color: S.muted, cursor: "pointer" }}>↓</span>}
                  {r.num === 3 && <span style={{ fontSize: 14, color: S.muted, cursor: "pointer" }}>↑</span>}
                  {r.showDelete && <span style={{ fontSize: 14, color: S.muted, cursor: "pointer" }}>🗑</span>}
                </div>
              </div>

              {/* Expanded editor */}
              {activeReachout === r.num && (
                <div>
                  {/* From row */}
                  <div style={{ padding: "10px 16px", borderBottom: `1px solid ${S.borderLight}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: S.muted, width: 50, flexShrink: 0 }}>From:</span>
                    {settings.senderEmail ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: S.accentLight, border: "1px solid #c4b5fd", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: S.accent }}>
                        ✉️ {settings.senderName || "Your Name"} &lt;{settings.senderEmail}&gt;
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          const email = prompt("Enter your sender email:");
                          if (email) setSettings((p) => ({ ...p, senderEmail: email }));
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f5f8", border: `1px solid ${S.border}`, borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#555", cursor: "pointer" }}
                      >
                        ✉️ Connect your email
                      </div>
                    )}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 12, color: S.muted, cursor: "pointer", padding: "2px 6px", border: `1px solid ${S.border}`, borderRadius: 4 }}>CC</span>
                      <span style={{ fontSize: 12, color: S.muted, cursor: "pointer", padding: "2px 6px", border: `1px solid ${S.border}`, borderRadius: 4 }}>BCC</span>
                    </div>
                  </div>

                  {/* Subject row */}
                  <div style={{ padding: "10px 16px", borderBottom: `1px solid ${S.borderLight}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: S.muted, width: 50, flexShrink: 0 }}>Subject</span>
                    <input
                      type="text"
                      value={getCurrentSubject()}
                      onChange={(e) => setCurrentSubject(e.target.value)}
                      style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: font, color: S.text }}
                    />
                  </div>

                  {/* Toolbar */}
                  <div style={{ padding: "8px 16px", borderBottom: `1px solid ${S.borderLight}`, display: "flex", gap: 4, alignItems: "center", background: "#fafafa" }}>
                    {[
                      { label: "↩", title: "Undo" },
                      { label: "↪", title: "Redo" },
                    ].map((t) => (
                      <button key={t.label} title={t.title} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#666", padding: "2px 5px" }}>{t.label}</button>
                    ))}
                    <div style={{ width: 1, height: 16, background: S.border, margin: "0 4px" }} />
                    <select style={{ border: `1px solid ${S.border}`, borderRadius: 5, padding: "2px 6px", fontSize: 12, fontFamily: font, color: "#444", cursor: "pointer" }}>
                      <option>Paragraph</option>
                    </select>
                    <div style={{ width: 1, height: 16, background: S.border, margin: "0 4px" }} />
                    {["B", "I", "U", "S"].map((t) => (
                      <button key={t} style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: t === "B" ? 700 : 400, fontStyle: t === "I" ? "italic" : "normal", textDecoration: t === "U" ? "underline" : t === "S" ? "line-through" : "none", padding: "2px 7px", color: "#444", fontFamily: font }}>{t}</button>
                    ))}
                    <div style={{ width: 1, height: 16, background: S.border, margin: "0 4px" }} />
                    <button style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "2px 8px", color: "#444", fontFamily: font }}>• List</button>
                    <button style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "2px 8px", color: "#444", fontFamily: font }}>1. List</button>
                    <button style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 4, cursor: "pointer", fontSize: 14, padding: "2px 8px", color: "#444" }}>—</button>
                  </div>

                  {/* Body editor */}
                  <div style={{ padding: "0 16px" }}>
                    <textarea
                      value={getCurrentBody()}
                      onChange={(e) => setCurrentBody(e.target.value)}
                      style={{ width: "100%", minHeight: 200, border: "none", outline: "none", resize: "vertical" as const, fontSize: 13, fontFamily: font, color: S.text, lineHeight: 1.8, padding: "14px 0", boxSizing: "border-box" as const }}
                    />
                  </div>

                  {/* Variables row */}
                  <div style={{ padding: "10px 16px", borderTop: `1px solid ${S.borderLight}`, display: "flex", alignItems: "center", gap: 8, background: "#fafafa" }}>
                    <span style={{ fontSize: 12, color: S.muted, fontWeight: 600 }}>Variables:</span>
                    {[
                      { label: "First Name", value: "{{FIRST_NAME}}" },
                      { label: "Candidate Past Company", value: "{{COMPANY}}" },
                      { label: "Application Link", value: "{{APPLICATION_LINK}}" },
                    ].map((v) => (
                      <span
                        key={v.value}
                        onClick={() => insertVariable(v.value)}
                        style={{ background: S.accentLight, color: S.accent, border: "1px solid #c4b5fd", borderRadius: 20, padding: "3px 12px", fontSize: 12, cursor: "pointer" }}
                      >
                        {v.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Save button at bottom */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={() => navigate("/hire/dashboard")}
              style={{ background: "#f5f5f8", color: "#444", border: `1px solid ${S.border}`, borderRadius: 8, padding: "9px 20px", fontSize: 13, cursor: "pointer", fontFamily: font }}
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: S.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: saving ? "default" : "pointer", fontFamily: font, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  }