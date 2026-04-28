import { useState } from "react";
import { useLocation } from "wouter";

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const C = {
  purple: "#7c3aed",
  purpleLight: "#f5f3ff",
  text: "#111827",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  border: "#e5e7eb",
  bg: "#fff",
  bgGray: "#f9fafb",
  error: "#dc2626",
  errorBg: "#fef2f2",
  success: "#16a34a",
  successBg: "#f0fdf4",
  successBorder: "#bbf7d0",
};

export default function HireForgotPassword() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
  };

  const handleRequestCode = async () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email");
    setLoading(true);
    try {
      await fetch("/api/hiring/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStep(2);
      setSuccess("If this email exists, a reset code has been sent.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    if (!code.trim()) return setError("Please enter the 6-digit code");
    if (!newPassword) return setError("Please enter a new password");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch("/api/hiring/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Reset failed");
      navigate("/hire/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bgGray, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
      <div style={{ width: "100%", maxWidth: 400, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "36px 36px", boxSizing: "border-box" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, background: C.purple, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>S</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
            SkillVeda <span style={{ color: C.purple }}>Hire</span>
          </span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 6px", letterSpacing: "-0.3px" }}>
          {step === 1 ? "Forgot password" : "Enter reset code"}
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 24px" }}>
          {step === 1
            ? "Enter your email and we'll send a reset code"
            : `We sent a 6-digit code to ${email}`}
        </p>

        {error && (
          <div style={{ background: C.errorBg, border: "1px solid #fecaca", borderRadius: 8, padding: "9px 12px", color: C.error, fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 8, padding: "9px 12px", color: C.success, fontSize: 12, marginBottom: 16 }}>
            {success}
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, display: "block", marginBottom: 6 }}>Work email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRequestCode()}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>
            <button onClick={handleRequestCode} disabled={loading} style={primaryBtn}>
              {loading ? "Sending..." : "Send reset code →"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, display: "block", marginBottom: 6 }}>6-digit code</label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                style={{ ...inputStyle, letterSpacing: "0.2em", fontSize: 18, textAlign: "center" }}
                onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, display: "block", marginBottom: 6 }}>New password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, display: "block", marginBottom: 6 }}>Confirm new password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = C.purple)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>
            <button onClick={handleResetPassword} disabled={loading} style={primaryBtn}>
              {loading ? "Updating..." : "Update password →"}
            </button>
            <button
              onClick={() => { setStep(1); setError(""); setSuccess(""); }}
              style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: font }}
            >
              ← Try a different email
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: C.textMuted, marginTop: 24 }}>
          Remember your password?{" "}
          <span onClick={() => navigate("/hire/login")} style={{ color: C.purple, cursor: "pointer", fontWeight: 600 }}>Sign in</span>
        </p>

      </div>
    </div>
  );
}
