import { useState } from "react";
import { useLocation } from "wouter";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const C = {
  purple: "#7c3aed",
  purpleLight: "#f5f3ff",
  purpleBorder: "#ede9fe",
  text: "#111827",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  border: "#e5e7eb",
  borderFocus: "#7c3aed",
  bg: "#fff",
  bgGray: "#f9fafb",
  error: "#dc2626",
  errorBg: "#fef2f2",
  success: "#16a34a",
  successBg: "#f0fdf4",
  successBorder: "#bbf7d0",
};

function HireLoginInner() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ── HANDLERS ──────────────────────────────────────

  const handleLogin = async () => {
    setError("");
    if (!loginForm.email || !loginForm.password) {
      return setError("Please fill in all fields");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/hiring/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed");
      localStorage.setItem("hiring_token", data.token);
      localStorage.setItem("hiring_company", JSON.stringify(data.company));
      navigate("/hire/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (
      !signupForm.companyName ||
      !signupForm.contactName ||
      !signupForm.email ||
      !signupForm.password
    ) {
      return setError("Please fill in all required fields");
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (signupForm.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/hiring/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: signupForm.companyName,
          contactName: signupForm.contactName,
          email: signupForm.email,
          password: signupForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Signup failed");
      localStorage.setItem("hiring_token", data.token);
      localStorage.setItem("hiring_company", JSON.stringify(data.company));
      window.location.replace("/hire/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    if (!accessToken) {
      setError("Google did not return a valid token. Please try again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      let res: Response;
      try {
        res = await fetch("/api/hiring/auth/google-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        if (fetchErr?.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else {
          setError("Could not reach the server. Please try refreshing the page.");
        }
        return;
      } finally {
        clearTimeout(timer);
      }
      let data: any = {};
      try { data = await res.json(); } catch { /* non-JSON response */ }
      if (!res.ok) {
        setError(data.error || `Authentication failed (${res.status}). Please try again.`);
        return;
      }
      if (!data.token) {
        setError("Unexpected server response. Please try again.");
        return;
      }
      localStorage.setItem("hiring_token", data.token);
      localStorage.setItem("hiring_company", JSON.stringify(data.company));
      window.location.replace("/hire/dashboard");
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setError("");
  };

  // ── STYLES ────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: font,
    color: C.text,
    outline: "none",
    background: C.bg,
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    background: loading ? C.textLight : C.purple,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "11px",
    fontSize: 13,
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: font,
    transition: "all 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bgGray,
      display: "flex",
      fontFamily: font,
    }}>

      {/* ── LEFT — AUTH PANEL ── */}
      <div style={{
        width: "100%",
        maxWidth: 460,
        minHeight: "100vh",
        background: C.bg,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "40px 44px",
        boxSizing: "border-box",
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <div style={{
              width: 30,
              height: 30,
              background: C.purple,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>S</span>
            </div>
            <span style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.2px",
            }}>
              SkillVeda{" "}
              <span style={{ color: C.purple }}>Hire</span>
            </span>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            margin: "0 0 6px",
            letterSpacing: "-0.4px",
          }}>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h1>
          <p style={{
            fontSize: 13,
            color: C.textMuted,
            margin: 0,
          }}>
            {mode === "login"
              ? "Sign in to your hiring dashboard"
              : "Start finding the right CS talent — free"}
          </p>
        </div>

        {/* Google Button */}
        {GOOGLE_CLIENT_ID ? (
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in was cancelled or blocked. Make sure popups are allowed, then try again.")}
          />
        ) : (
          <button
            disabled
            style={{
              padding: "10px 16px",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              background: C.bgGray,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontSize: 13,
              fontWeight: 500,
              color: C.textLight,
              cursor: "not-allowed",
              fontFamily: font,
              marginBottom: 18,
              boxSizing: "border-box" as const,
              width: "100%",
            }}
          >
            <GoogleIcon />
            Continue with Google (not configured)
          </button>
        )}

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
        }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 12, color: C.textLight }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: "flex",
          background: C.bgGray,
          borderRadius: 8,
          padding: 3,
          marginBottom: 20,
          border: `1px solid ${C.border}`,
        }}>
          {(["login", "signup"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => switchMode(tab)}
              style={{
                flex: 1,
                padding: "8px",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: mode === tab ? 600 : 400,
                cursor: "pointer",
                fontFamily: font,
                background: mode === tab ? C.bg : "transparent",
                color: mode === tab ? C.text : C.textMuted,
                boxShadow: mode === tab
                  ? "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
                transition: "all 0.15s",
              }}
            >
              {tab === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid #fecaca`,
            borderRadius: 8,
            padding: "9px 12px",
            color: C.error,
            fontSize: 12,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
          <div>
            <Field label="Work email" style={{ marginBottom: 14 }}>
              <input
                type="email"
                placeholder="you@company.com"
                value={loginForm.email}
                onChange={e =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </Field>

            <Field label="Password" style={{ marginBottom: 20 }}>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={e =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
                <a
                  href="/hire/forgot-password"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: -22,
                    fontSize: 12,
                    color: C.purple,
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </a>
              </div>
            </Field>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={primaryBtn}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>

            <p style={{
              textAlign: "center",
              fontSize: 12,
              color: C.textMuted,
              marginTop: 16,
            }}>
              Don't have an account?{" "}
              <span
                onClick={() => switchMode("signup")}
                style={{
                  color: C.purple,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Sign up free
              </span>
            </p>
          </div>
        )}

        {/* ── SIGNUP FORM ── */}
        {mode === "signup" && (
          <div>
            {/* Row: Company + Name */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 12,
            }}>
              <Field label="Company name *">
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={signupForm.companyName}
                  onChange={e =>
                    setSignupForm({ ...signupForm, companyName: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </Field>
              <Field label="Your name *">
                <input
                  type="text"
                  placeholder="Aastha Tyagi"
                  value={signupForm.contactName}
                  onChange={e =>
                    setSignupForm({ ...signupForm, contactName: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Work email *" style={{ marginBottom: 12 }}>
              <input
                type="email"
                placeholder="aastha@skillveda.ai"
                value={signupForm.email}
                onChange={e =>
                  setSignupForm({ ...signupForm, email: e.target.value })
                }
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </Field>

            {/* Row: Password + Confirm */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 16,
            }}>
              <Field label="Password *">
                <input
                  type="password"
                  placeholder="Min 6 chars"
                  value={signupForm.password}
                  onChange={e =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </Field>
              <Field label="Confirm password *">
                <input
                  type="password"
                  placeholder="Repeat"
                  value={signupForm.confirmPassword}
                  onChange={e =>
                    setSignupForm({
                      ...signupForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  onKeyDown={e => e.key === "Enter" && handleSignup()}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </Field>
            </div>

            {/* Free credits banner */}
            <div style={{
              background: C.successBg,
              border: `1px solid ${C.successBorder}`,
              borderRadius: 8,
              padding: "9px 14px",
              fontSize: 12,
              color: C.success,
              textAlign: "center",
              marginBottom: 14,
              fontWeight: 500,
            }}>
              🎁 20 free contact credits on signup — no credit card needed
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              style={primaryBtn}
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>

            <p style={{
              textAlign: "center",
              fontSize: 12,
              color: C.textMuted,
              marginTop: 16,
            }}>
              Already have an account?{" "}
              <span
                onClick={() => switchMode("login")}
                style={{
                  color: C.purple,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Sign in
              </span>
            </p>

            <p style={{
              textAlign: "center",
              fontSize: 11,
              color: C.textLight,
              marginTop: 12,
              lineHeight: 1.6,
            }}>
              By signing up you agree to our{" "}
              <a href="/terms" style={{ color: C.purple }}>Terms</a>
              {" "}and{" "}
              <a href="/privacy" style={{ color: C.purple }}>Privacy Policy</a>
            </p>
          </div>
        )}

      </div>

      {/* ── RIGHT — VALUE PANEL ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 48px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background blobs */}
        <div style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, #f5f3ff 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: -80,
          left: -60,
          width: 350,
          height: 350,
          background: "radial-gradient(circle, #f5f3ff 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 500,
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: C.purpleLight,
            border: `1px solid ${C.purpleBorder}`,
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 12,
            color: C.purple,
            fontWeight: 600,
            marginBottom: 20,
          }}>
            ✦ India's first CS-specific hiring platform
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: 30,
            fontWeight: 700,
            color: C.text,
            margin: "0 0 14px",
            letterSpacing: "-0.6px",
            lineHeight: 1.25,
          }}>
            Find the right CSM,
            <br />
            <span style={{ color: C.purple }}>not just any CSM</span>
          </h2>

          <p style={{
            fontSize: 14,
            color: C.textMuted,
            lineHeight: 1.7,
            margin: "0 0 32px",
          }}>
            AI scoring built for Customer Success hiring.
            Tier 1/2/3 ranking based on commercial fit,
            CS tools, and role-specific context.
          </p>

          {/* Feature list */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 32,
          }}>
            {[
              {
                icon: "🔍",
                title: "Unlimited search — always free",
                desc: "Search 50M+ profiles. No credit needed to browse.",
              },
              {
                icon: "🎯",
                title: "AI scores every candidate",
                desc: "Tier 1/2/3 ranking with WHY MATCHED evidence.",
              },
              {
                icon: "✅",
                title: "CS-specific intelligence",
                desc: "Commercial fit, renewal signals, tool match.",
              },
              {
                icon: "📧",
                title: "1 credit = full contact reveal",
                desc: "Personal email + phone. Only pay for who you want.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "13px 16px",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
                <div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    marginBottom: 2,
                  }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "16px 20px",
          }}>
            <div style={{
              display: "flex",
              gap: 4,
              marginBottom: 8,
            }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
              ))}
            </div>
            <p style={{
              fontSize: 13,
              color: C.text,
              lineHeight: 1.6,
              margin: "0 0 10px",
              fontStyle: "italic",
            }}>
              "Found our perfect Senior CSM in 3 days.
              The AI scoring saved us 40+ hours of manual screening."
            </p>
            <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>
              Head of Customer Success, B2B SaaS · Series B
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// ── FIELD WRAPPER ─────────────────────────────────────
function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label style={{
        display: "block",
        fontSize: 12,
        fontWeight: 500,
        color: "#374151",
        marginBottom: 5,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── GOOGLE POPUP BUTTON (uses hook — must be inside provider) ─
function GoogleLoginButton({ onSuccess, onError }: {
  onSuccess: (accessToken: string) => void;
  onError: () => void;
}) {
  const login = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: (res) => onSuccess(res.access_token),
    onError: (err) => {
      console.error("Google OAuth error:", err);
      onError();
    },
  });
  return (
    <button
      onClick={() => login()}
      style={{
        padding: "10px 16px",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: 13,
        fontWeight: 500,
        color: C.text,
        cursor: "pointer",
        fontFamily: font,
        marginBottom: 18,
        boxSizing: "border-box" as const,
        width: "100%",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = C.bgGray)}
      onMouseLeave={e => (e.currentTarget.style.background = C.bg)}
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

// ── PROVIDER WRAPPER (export) ─────────────────────────
export default function HireLogin() {
  if (!GOOGLE_CLIENT_ID) {
    return <HireLoginInner />;
  }
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HireLoginInner />
    </GoogleOAuthProvider>
  );
}

// ── GOOGLE ICON ───────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path
        fill="#4285F4"
        d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
      />
      <path
        fill="#34A853"
        d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
      />
      <path
        fill="#FBBC05"
        d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
      />
      <path
        fill="#EA4335"
        d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
      />
    </svg>
  );
}