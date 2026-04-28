import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const C = {
  purple: "#7c3aed",
  purpleLight: "#f5f3ff",
  purpleBorder: "#ede9fe",
  text: "#111827",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  border: "#e5e7eb",
  bg: "#ffffff",
  bgGray: "#f9fafb",
  red: "#dc2626",
  redLight: "#fef2f2",
  redBorder: "#fecaca",
  green: "#16a34a",
  greenLight: "#f0fdf4",
};

type NavItem =
  | "account"
  | "credits"
  | "billing"
  | "mailbox"
  | "team";

interface Company {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  credits: number;
  plan: string;
}

export default function HireSettings() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<NavItem>("account");
  const [company, setCompany] = useState<Company | null>(null);
  const token = localStorage.getItem("hiring_token") || "";

  useEffect(() => {
    if (!token) { navigate("/hire/login"); return; }
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await fetch("/api/hiring/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigate("/hire/login"); return; }
      if (res.ok) {
        const data = await res.json();
        setCompany(data);
        localStorage.setItem("hiring_company", JSON.stringify(data));
      }
    } catch {}
  };

  const navSections = [
    {
      title: "Account",
      items: [
        { key: "account" as NavItem, label: "Your Account" },
        { key: "mailbox" as NavItem, label: "Mailbox and Emails" },
      ],
    },
    {
      title: "Organization",
      items: [
        { key: "credits" as NavItem, label: "Credits" },
        { key: "billing" as NavItem, label: "Plan and Billing" },
        { key: "team" as NavItem, label: "Team Members" },
      ],
    },
  ];

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: font,
      background: C.bg,
    }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 220,
        minWidth: 220,
        borderRight: `1px solid ${C.border}`,
        padding: "16px 0",
        flexShrink: 0,
        background: C.bg,
      }}>

        {/* Back button */}
        <div
          onClick={() => navigate("/hire/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            marginBottom: 8,
            cursor: "pointer",
            fontSize: 13,
            color: C.textMuted,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
        >
          ← Back
        </div>

        {navSections.map(section => (
          <div key={section.title} style={{ marginBottom: 8 }}>
            <div style={{
              padding: "6px 20px",
              fontSize: 11,
              fontWeight: 600,
              color: C.textLight,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              {section.title}
            </div>
            {section.items.map(item => (
              <div
                key={item.key}
                onClick={() => setActive(item.key)}
                style={{
                  padding: "8px 20px",
                  fontSize: 13,
                  cursor: "pointer",
                  color: active === item.key ? C.purple : C.text,
                  fontWeight: active === item.key ? 600 : 400,
                  background: active === item.key ? C.purpleLight : "transparent",
                  borderRight: active === item.key
                    ? `2px solid ${C.purple}`
                    : "2px solid transparent",
                }}
                onMouseEnter={e => {
                  if (active !== item.key)
                    e.currentTarget.style.background = C.bgGray;
                }}
                onMouseLeave={e => {
                  if (active !== item.key)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1,
        padding: "32px 48px",
        maxWidth: 800,
        overflowY: "auto",
      }}>

        {active === "account" && (
          <AccountPage
            company={company}
            token={token}
            onUpdate={fetchCompany}
            onNavigate={navigate}
          />
        )}

        {active === "credits" && (
          <CreditsPage company={company} />
        )}

        {active === "billing" && (
          <BillingPage company={company} onNavigate={navigate} />
        )}

        {active === "mailbox" && (
          <ComingSoon title="Mailbox and Emails" />
        )}

        {active === "team" && (
          <ComingSoon title="Team Members" />
        )}

      </div>
    </div>
  );
}

// ── ACCOUNT PAGE ──────────────────────────────────────

function AccountPage({ company, token, onUpdate, onNavigate }: {
  company: Company | null;
  token: string;
  onUpdate: () => void;
  onNavigate: (path: string) => void;
}) {
  const [displayName, setDisplayName] = useState(
    company?.contactName || ""
  );
  const [nameChanged, setNameChanged] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    if (company?.contactName) {
      setDisplayName(company.contactName);
    }
  }, [company]);

  const handleNameChange = (val: string) => {
    setDisplayName(val);
    setNameChanged(val !== company?.contactName);
    setNameSaved(false);
  };

  const saveName = async () => {
    setSavingName(true);
    try {
      const res = await fetch("/api/hiring/me/name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contactName: displayName }),
      });
      if (res.ok) {
        setNameSaved(true);
        setNameChanged(false);
        onUpdate();
        setTimeout(() => setNameSaved(false), 3000);
      }
    } catch {}
    finally { setSavingName(false); }
  };

  const handleResetPassword = async () => {
    if (!company?.email) return;
    setResettingPw(true);
    setPwMsg("");
    try {
      const res = await fetch("/api/hiring/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: company.email }),
      });
      if (res.ok) {
        setPwMsg(
          `Reset email sent to ${company.email}. Check your inbox.`
        );
      }
    } catch {}
    finally { setResettingPw(false); }
  };

  const handleSignOut = () => {
    localStorage.removeItem("hiring_token");
    localStorage.removeItem("hiring_company");
    onNavigate("/hire/login");
  };

  const planLabel = (plan: string) => {
    if (plan === "starter") return "Starter Plan";
    if (plan === "growth") return "Growth Plan";
    if (plan === "scale") return "Scale Plan";
    return "Free Plan";
  };

  return (
    <div>
      <h1 style={{
        fontSize: 20,
        fontWeight: 700,
        color: C.text,
        margin: "0 0 28px",
      }}>
        Your Account
      </h1>

      {/* Display Name */}
      <SettingsCard>
        <CardTitle>Display Name</CardTitle>
        <CardDesc>Please enter your full name.</CardDesc>
        <input
          type="text"
          value={displayName}
          onChange={e => handleNameChange(e.target.value)}
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 14,
            fontFamily: font,
            outline: "none",
            width: 300,
            boxSizing: "border-box",
            color: C.text,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
          onBlur={e => (e.currentTarget.style.borderColor = C.border)}
        />
        <CardFooter>
          <span style={{ fontSize: 13, color: C.textMuted }}>
            Please avoid using special characters.
          </span>
          {nameChanged && (
            <button
              onClick={saveName}
              disabled={savingName}
              style={primaryBtnSm}
            >
              {savingName ? "Saving..." : "Save Changes"}
            </button>
          )}
          {nameSaved && (
            <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>
              ✓ Saved
            </span>
          )}
        </CardFooter>
      </SettingsCard>

      {/* Login Email */}
      <SettingsCard>
        <CardTitle>Login Email</CardTitle>
        <CardDesc>
          This is the email address you use to log in to your account.
        </CardDesc>
        <div style={{
          fontSize: 14,
          color: C.text,
          fontWeight: 500,
          padding: "4px 0",
        }}>
          {company?.email || "—"}
        </div>
        <CardFooter>
          <span style={{ fontSize: 13, color: C.textMuted }}>
            Contact support to change your login email.
          </span>
        </CardFooter>
      </SettingsCard>

      {/* Active Subscription */}
      <SettingsCard>
        <CardTitle>Active Subscription</CardTitle>
        <CardDesc>
          Your organization's current subscription plan.
        </CardDesc>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: C.text,
          padding: "4px 0",
        }}>
          {planLabel(company?.plan || "free")}
        </div>
        <CardFooter>
          <span style={{ fontSize: 13, color: C.textMuted }}>
            Your subscription will automatically renew at the end
            of each billing period.
          </span>
          <button style={outlineBtnSm}>
            Manage Plan
          </button>
        </CardFooter>
      </SettingsCard>

      {/* Account Security */}
      <SettingsCard>
        <CardTitle>Account Security</CardTitle>
        <CardDesc>
          Manage your account security settings and password.
        </CardDesc>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <button
            onClick={handleResetPassword}
            disabled={resettingPw}
            style={outlineBtnSm}
          >
            {resettingPw ? "Sending..." : "Reset Password"}
          </button>
          <button
            onClick={handleSignOut}
            style={{
              ...outlineBtnSm,
              color: C.red,
              borderColor: C.red,
            }}
          >
            Sign out
          </button>
        </div>
        {pwMsg && (
          <div style={{
            fontSize: 13,
            color: C.green,
            background: C.greenLight,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: "8px 12px",
            marginTop: 4,
          }}>
            ✓ {pwMsg}
          </div>
        )}
        <CardFooter>
          <span style={{ fontSize: 13, color: C.textMuted }}>
            Password reset emails are sent to your email address.
          </span>
        </CardFooter>
      </SettingsCard>

      {/* Privacy */}
      <SettingsCard>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDesc>Manage your privacy settings.</CardDesc>
        <div style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 4,
        }}>
          {[
            "Privacy policy",
            "Terms of Service",
            "Cookie Policy",
          ].map(link => (
            <a
              key={link}
              href="#"
              style={{
                fontSize: 13,
                color: C.textMuted,
                textDecoration: "none",
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.color = C.purple)
              }
              onMouseLeave={e =>
                (e.currentTarget.style.color = C.textMuted)
              }
            >
              {link}
            </a>
          ))}
        </div>
        <CardFooter>
          <span style={{ fontSize: 13, color: C.textMuted }}>
            You can manage your privacy settings above.
          </span>
        </CardFooter>
      </SettingsCard>
    </div>
  );
}

// ── CREDITS PAGE ──────────────────────────────────────

function CreditsPage({ company }: { company: Company | null }) {
  return (
    <div>
      <h1 style={{
        fontSize: 20,
        fontWeight: 700,
        color: C.text,
        margin: "0 0 28px",
      }}>
        Credits
      </h1>

      {/* Contact Credits */}
      <SettingsCard>
        <CardTitle>Contact Credits</CardTitle>
        <CardDesc>
          Every time you reveal a profile's email address and phone
          number, it counts as 1 credit. Contact credits are shared
          across your team.
        </CardDesc>

        <div style={{
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          maxWidth: 320,
        }}>
          <span style={{ fontSize: 14, color: C.textMuted }}>
            Credits Remaining
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
          }}>
            {company?.credits ?? 0}
          </span>
        </div>

        <div style={{
          fontSize: 13,
          color: C.textMuted,
          marginTop: 10,
        }}>
          Your credits will renew at the start of the next billing cycle.
        </div>

        <CardFooter>
          <span style={{ fontSize: 13, color: C.textMuted }}>
            You will never be double-charged for revealing the same contact.
          </span>
          <a
            href="#"
            style={{
              fontSize: 13,
              color: C.purple,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Buy More Credits
          </a>
        </CardFooter>
      </SettingsCard>

      {/* Export Credits */}
      <SettingsCard>
        <CardTitle>Export Credits</CardTitle>
        <CardDesc>
          Every profile you export as a CSV file counts as 1 credit.
        </CardDesc>

        <div style={{
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          maxWidth: 320,
        }}>
          <span style={{ fontSize: 14, color: C.textMuted }}>
            Credits Remaining
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
          }}>
            0
          </span>
        </div>

        <CardFooter>
          <span style={{ fontSize: 13, color: C.textMuted }}>
            Export credits are included in paid plans.
          </span>
          <a
            href="#"
            style={{
              fontSize: 13,
              color: C.purple,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Upgrade Plan
          </a>
        </CardFooter>
      </SettingsCard>
    </div>
  );
}

// ── BILLING PAGE ──────────────────────────────────────

function BillingPage({
  company,
  onNavigate,
}: {
  company: Company | null;
  onNavigate: (path: string) => void;
}) {
  const planLabel = (plan: string) => {
    if (plan === "starter") return "Starter Plan";
    if (plan === "growth") return "Growth Plan";
    if (plan === "scale") return "Scale Plan";
    return "Free Plan";
  };

  return (
    <div>
      <h1 style={{
        fontSize: 20,
        fontWeight: 700,
        color: C.text,
        margin: "0 0 28px",
      }}>
        Plan and Billing
      </h1>

      <SettingsCard>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
          <div>
            <CardTitle>
              Current Plan{" "}
              <span style={{ color: C.purple }}>
                ({planLabel(company?.plan || "free")})
              </span>
            </CardTitle>
            <CardDesc>
              View and manage your billing history and plan details.
            </CardDesc>
            <a
              href="#"
              style={{
                fontSize: 13,
                color: C.purple,
                textDecoration: "none",
              }}
            >
              Learn more about managing your billing ↗
            </a>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button style={outlineBtnSm}>
              Manage Billing
            </button>
            <button style={primaryBtnSm}>
              Modify Plan →
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* Billing History Table */}
      <SettingsCard>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr 2fr",
          padding: "10px 0",
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 8,
        }}>
          {[
            "Plan",
            "Amount",
            "Date",
            "Payment Status",
            "View Receipt",
          ].map(h => (
            <div key={h} style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.textLight,
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div style={{
          textAlign: "center",
          padding: "60px 0",
          color: C.textMuted,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.text,
            marginBottom: 4,
          }}>
            No Billing History
          </div>
          <div style={{ fontSize: 13 }}>
            No billing history found. Only organization admins
            have access to this.
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

// ── COMING SOON ───────────────────────────────────────

function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 style={{
        fontSize: 20,
        fontWeight: 700,
        color: C.text,
        margin: "0 0 28px",
      }}>
        {title}
      </h1>
      <SettingsCard>
        <div style={{
          textAlign: "center",
          padding: "60px 0",
          color: C.textMuted,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.text,
            marginBottom: 4,
          }}>
            Coming Soon
          </div>
          <div style={{ fontSize: 13 }}>
            This feature is under development.
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "20px 24px",
      marginBottom: 16,
      background: C.bg,
    }}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 15,
      fontWeight: 600,
      color: C.text,
      marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

function CardDesc({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 13,
      color: C.textMuted,
      lineHeight: 1.6,
      marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 14,
      paddingTop: 14,
      borderTop: `1px solid ${C.border}`,
      gap: 12,
    }}>
      {children}
    </div>
  );
}

// ── BUTTON STYLES ─────────────────────────────────────

const primaryBtnSm: React.CSSProperties = {
  padding: "8px 16px",
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: font,
  whiteSpace: "nowrap",
};

const outlineBtnSm: React.CSSProperties = {
  padding: "8px 16px",
  background: "#fff",
  color: "#374151",
  border: "1px solid #e5e7eb",
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: font,
  whiteSpace: "nowrap",
};