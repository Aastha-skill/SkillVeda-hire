import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Footer from "@/components/footer";
import { Download } from "lucide-react";
import krishnaPhoto from "@assets/WhatsApp_Image_2026-04-13_at_1.19.17_PM_1776077374835.jpeg";
import patriciaPhoto from "@assets/WhatsApp_Image_2026-04-13_at_12.34.47_PM_1776077374835.jpeg";
import gunjanPhoto from "@assets/WhatsApp_Image_2026-04-14_at_10.44.04_AM_1776166332362.jpeg";

const PROGRAM_SLUG = "customer-success-career-accelerator";

const interestOptions = [
  "Career switch",
  "First job opportunity",
  "Upskilling",
  "Better salary",
  "Exploring Customer Success",
  "Other",
];

const benefits = [
  { num: "01", title: "Live Expert Sessions", desc: "Live classes with CS leaders actively working at global SaaS companies." },
  { num: "02", title: "Guaranteed Placement", desc: "100% placement assistance. We work with you until you land the role — no exceptions." },
  { num: "03", title: "1:1 Mentorship", desc: "Personalised guidance from experienced Customer Success managers throughout the programme." },
  { num: "04", title: "Real-World Projects", desc: "Live case studies from actual CS teams — the kind of work you'd do on Day 1 of a job." },
  { num: "05", title: "Interview Preparation", desc: "Mock interviews and resume reviews with hiring managers who know exactly what CS teams want." },
  { num: "06", title: "Career Growth Tools", desc: "Job board access, alumni network, LinkedIn optimisation, and lifetime learning resources." },
];

const mentors = [
  { initials: "KR", photo: krishnaPhoto, name: "Krishna Ramalingam", role: "CS Consultant", company: "Global CS Practice", exp: "20+ years in CS & Account Management" },
  { initials: "PA", photo: patriciaPhoto, name: "Patricia Abad", role: "CS Operations Manager", company: "Puma Energy", exp: "8+ years in CS Operations" },
  { initials: "GS", photo: gunjanPhoto, name: "Gunjan Sharma", role: "Sr. Enterprise CSM", company: "Adobe", exp: "11+ years in Enterprise CS" },
];

const curriculum = [
  { n: "01", title: "Foundations of Customer Success", desc: "CS lifecycle, key metrics — NPS, CSAT, churn, ARR — and how CS teams operate." },
  { n: "02", title: "Onboarding & Implementation", desc: "Onboard customers at scale, set expectations, and drive time-to-value fast." },
  { n: "03", title: "Retention & Renewals", desc: "Identify churn signals early, structure QBRs, and negotiate renewals confidently." },
  { n: "04", title: "Upsell & Expansion", desc: "Grow accounts, identify expansion opportunities, and drive revenue through CS." },
  { n: "05", title: "CS Tools & Tech Stack", desc: "Gainsight, Salesforce, HubSpot, Zendesk — hands-on with tools teams actually use." },
  { n: "06", title: "Interview Prep & Job Strategy", desc: "Mock interviews, resume reviews, LinkedIn optimisation, and offer negotiation." },
];

const audience = [
  { title: "Freshers & Graduates", desc: "No prior experience needed. Built to get you your first CS role from scratch." },
  { title: "Career Switchers", desc: "From support, ops, sales, or marketing? Your background is an advantage here." },
  { title: "Early-Career Professionals", desc: "Already in CS and want to move up to senior or enterprise-level positions." },
  { title: "Global CS Aspirants", desc: "Aiming for a CS role at an international company? We have the mentors and network." },
];

const F = "'DM Sans', 'Inter', sans-serif";
const FH = "'Bricolage Grotesque', 'DM Sans', sans-serif";

export default function CustomerSuccessProgram() {
  const { toast } = useToast();
  const [curriculumModalOpen, setCurriculumModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ fullName: "", email: "", phone: "", interest: "" });

  const curriculumMutation = useMutation({
    mutationFn: async (data: typeof leadForm & { programSlug: string }) => {
      const res = await apiRequest("POST", "/api/curriculum-leads", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Download starting!", description: "Your curriculum PDF is downloading now." });
      setLeadForm({ fullName: "", email: "", phone: "", interest: "" });
      setCurriculumModalOpen(false);
      const link = document.createElement("a");
      link.href = "/SkillVeda_Customer_Success_Curriculum.pdf";
      link.download = "SkillVeda_Customer_Success_Curriculum.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: () => {
      toast({ title: "Failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleCurriculumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    curriculumMutation.mutate({ ...leadForm, programSlug: PROGRAM_SLUG });
  };

  return (
    <div className="csp-root" style={{ fontFamily: F, minHeight: "100vh", background: "#fff" }}>
      <style>{`
        .csp-root * { box-sizing: border-box; }

        /* ── INFO BAR ── */
        .csp-infobar {
          border-bottom: 1px solid #E8E4F8;
          background: #fff;
          display: flex;
          align-items: stretch;
          padding: 0 48px;
          gap: 0;
          overflow-x: auto;
        }
        .csp-infobar-item {
          flex: 1;
          min-width: 130px;
          padding: 16px 28px 16px 0;
          border-right: 1px solid #E8E4F8;
          margin-right: 28px;
        }
        .csp-infobar-item:last-of-type { border-right: none; margin-right: 0; }
        .csp-infobar-btn { display: flex; align-items: center; padding-left: 28px; flex-shrink: 0; }

        /* ── HERO ── */
        .csp-hero { background: linear-gradient(135deg,#4A28D4 0%,#5E39E3 45%,#7B5CF6 100%); padding: 88px 48px 96px; position: relative; overflow: hidden; }
        .csp-hero-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 400px; gap: 64px; align-items: center; position: relative; z-index: 1; }
        .csp-hero-cards { display: flex; flex-direction: column; gap: 12px; }

        /* ── SECTIONS ── */
        .csp-section { padding: 88px 48px; }
        .csp-section-sm { padding: 88px 48px; background: #F7F6FF; }
        .csp-inner { max-width: 1200px; margin: 0 auto; }

        /* ── GRIDS ── */
        .csp-grid3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .csp-grid3-divider { display: grid; grid-template-columns: repeat(3,1fr); border: 1px solid #E8E4F8; border-radius: 20px; overflow: hidden; background: #E8E4F8; gap: 1px; }
        .csp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .csp-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; border-radius: 20px; overflow: hidden; background: rgba(255,255,255,0.08); }

        /* ── HEADINGS ── */
        .csp-h1 { font-family: ${FH}; font-size: 62px; font-weight: 800; line-height: 1.06; color: white; letter-spacing: -0.03em; margin-bottom: 20px; }
        .csp-h2 { font-family: ${FH}; font-size: 38px; font-weight: 800; letter-spacing: -0.02em; color: #0D0B1A; margin-bottom: 10px; }
        .csp-h2-white { font-family: ${FH}; font-size: 38px; font-weight: 800; color: white; letter-spacing: -0.02em; margin-bottom: 8px; }
        .csp-stat-num { font-family: ${FH}; font-size: 52px; font-weight: 800; color: #F5C842; line-height: 1; margin-bottom: 8px; }
        .csp-price-num { font-family: ${FH}; font-size: 54px; font-weight: 800; color: white; line-height: 1; }

        /* ── PRICING CARD ── */
        .csp-price-header { background: linear-gradient(135deg,#5E39E3,#7B5CF6); padding: 36px 40px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }

        /* ── BOTTOM CTA ── */
        .csp-cta { background: #0D0B1A; padding: 72px 48px; text-align: center; }
        .csp-cta-h { font-family: ${FH}; font-size: 44px; font-weight: 800; color: white; letter-spacing: -0.03em; margin-bottom: 12px; }
        .csp-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .csp-infobar { padding: 0 16px; gap: 0; }
          .csp-infobar-item { min-width: 110px; padding: 12px 16px 12px 0; margin-right: 16px; }
          .csp-infobar-btn { padding-left: 12px; }

          .csp-hero { padding: 52px 20px 60px; }
          .csp-hero-grid { grid-template-columns: 1fr; gap: 32px; }
          .csp-hero-cards { display: none; }

          .csp-section { padding: 52px 20px; }
          .csp-section-sm { padding: 52px 20px; }

          .csp-grid3 { grid-template-columns: 1fr; }
          .csp-grid3-divider { grid-template-columns: 1fr; }
          .csp-grid2 { grid-template-columns: 1fr; }
          .csp-stats-grid { grid-template-columns: 1fr; gap: 1px; }

          .csp-h1 { font-size: 36px; }
          .csp-h2 { font-size: 28px; }
          .csp-h2-white { font-size: 28px; }
          .csp-stat-num { font-size: 40px; }
          .csp-price-num { font-size: 42px; }
          .csp-price-header { padding: 24px 20px; }

          .csp-cta { padding: 52px 20px; }
          .csp-cta-h { font-size: 30px; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .csp-hero { padding: 64px 32px 72px; }
          .csp-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .csp-section { padding: 64px 32px; }
          .csp-section-sm { padding: 64px 32px; }
          .csp-grid3 { grid-template-columns: repeat(2,1fr); }
          .csp-grid3-divider { grid-template-columns: repeat(2,1fr); }
          .csp-h1 { font-size: 46px; }
          .csp-h2 { font-size: 32px; }
          .csp-h2-white { font-size: 32px; }
          .csp-cta { padding: 64px 32px; }
        }
      `}</style>

      {/* ── INFO BAR ── */}
      <div className="csp-infobar">
        {[
          { label: "PROGRAMME FEE", value: "₹29,999", sub: "EMI options available" },
          { label: "DURATION", value: "2 Months", sub: "Live online, weekends" },
          { label: "MENTOR EXPERIENCE", value: "8+ Years", sub: "Industry-active CS leaders" },
          { label: "PLACEMENT", value: "100% Support", sub: "Guaranteed interviews" },
        ].map((item, i) => (
          <div key={i} className="csp-infobar-item">
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#9896B0", textTransform: "uppercase", marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0D0B1A", letterSpacing: "-0.02em" }}>{item.value}</div>
            <div style={{ fontSize: 11, color: "#9896B0", marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
        <div className="csp-infobar-btn">
          <Link href="/customer-success-enrol" onClick={() => window.scrollTo(0, 0)}>
            <button style={{ background: "#5E39E3", color: "white", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", padding: "11px 24px", borderRadius: 8, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
              ENROL NOW →
            </button>
          </Link>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="csp-hero">
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)" }} />
        <div className="csp-hero-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "6px 16px", color: "white", fontSize: 12, fontWeight: 500, marginBottom: 28 }}>
              <span style={{ color: "#F5C842" }}>★</span> 2-Month Intensive Programme
            </div>
            <h1 className="csp-h1">
              Customer Success<br />
              <span style={{ color: "#F5C842" }}>Career</span><br />
              <span style={{ color: "#F5C842" }}>Accelerator</span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.78)", lineHeight: 1.65, maxWidth: 500, marginBottom: 32 }}>
              Launch your career in one of the fastest-growing roles in SaaS. Get trained by industry experts and placed at top companies — in 8 weeks.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "14px 22px", marginBottom: 36 }}>
              <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📈</div>
              <div>
                <div style={{ fontFamily: FH, fontSize: 22, fontWeight: 800, color: "#F5C842" }}>₹6 – 12 LPA</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Average Placement Range</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/customer-success-enrol" onClick={() => window.scrollTo(0, 0)}>
                <button style={{ background: "white", color: "#5E39E3", fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 12, border: "none", cursor: "pointer" }}>
                  Enrol Now →
                </button>
              </Link>
              <button onClick={() => setCurriculumModalOpen(true)} style={{ background: "transparent", color: "white", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Download size={16} /> Download Curriculum
              </button>
            </div>
          </div>

          <div className="csp-hero-cards">
            {[
              { icon: "✅", title: "100% Placement Support", sub: "Guaranteed interview opportunities at top SaaS companies" },
              { icon: "🎓", title: "Expert Mentors", sub: "CS leaders with 8+ years of real-world experience" },
              { icon: "🏆", title: "Industry Certificate", sub: "Recognised credentials that stand out to hiring managers" },
              { icon: "💳", title: "Easy EMI Options", sub: "₹29,999 total — flexible payment plans available" },
            ].map((c, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="csp-section" style={{ background: "#fff" }}>
        <div className="csp-inner">
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5E39E3", marginBottom: 10 }}>What You'll Get</div>
            <h2 className="csp-h2">Everything you need to land<br />your first CS role</h2>
            <p style={{ fontSize: 16, color: "#7A788F", maxWidth: 480, lineHeight: 1.65 }}>A structured programme built around real hiring needs — not textbook theory.</p>
          </div>
          <div className="csp-grid3-divider">
            {benefits.map((b, i) => (
              <div key={i} style={{ background: "#fff", padding: "36px 32px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#5E39E3", letterSpacing: "0.08em", marginBottom: 14 }}>{b.num}</div>
                <div style={{ fontFamily: FH, fontSize: 17, fontWeight: 700, color: "#0D0B1A", marginBottom: 8 }}>{b.title}</div>
                <div style={{ fontSize: 14, color: "#7A788F", lineHeight: 1.65 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENTORS ── */}
      <section className="csp-section-sm">
        <div className="csp-inner">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5E39E3", marginBottom: 10 }}>Our Mentors</div>
            <h2 className="csp-h2">Learn from the best</h2>
            <p style={{ fontSize: 16, color: "#7A788F", maxWidth: 460, margin: "0 auto", lineHeight: 1.65 }}>Mentors with decades of real-world CS experience from global companies.</p>
          </div>
          <div className="csp-grid3">
            {mentors.map((m, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #E8E4F8" }}>
                <div style={{ background: "linear-gradient(135deg,#5E39E3,#7B5CF6)", padding: "32px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)" }} />
                  <div style={{ width: 88, height: 88, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)", overflow: "hidden", margin: "0 auto 14px", position: "relative", zIndex: 1, flexShrink: 0 }}>
                    <img src={m.photo} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ fontFamily: FH, fontSize: 17, fontWeight: 800, color: "white", position: "relative", zIndex: 1 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3, position: "relative", zIndex: 1 }}>{m.role}</div>
                </div>
                <div style={{ padding: "22px 24px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "#3D3B52", background: "#F7F6FF", borderRadius: 6, padding: "4px 10px", marginBottom: 8 }}>💼 {m.company}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7A788F", marginTop: 4 }}>🎓 {m.exp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "linear-gradient(135deg,#4428C4,#5E39E3 50%,#7B5FF5)", padding: "88px 48px", textAlign: "center" }}>
        <div className="csp-inner">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Placement Highlights</div>
          <h2 className="csp-h2-white">Our graduates get placed</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginBottom: 48 }}>At leading SaaS and tech companies across India and globally.</p>
          <div className="csp-stats-grid">
            {[
              { n: "₹6–12", l: "LPA Salary Range", s: "Average for programme graduates" },
              { n: "100%", l: "Placement Support", s: "Every student gets placement help" },
              { n: "50+", l: "Hiring Partners", s: "Top SaaS & tech companies" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", padding: "44px 32px", textAlign: "center" }}>
                <div className="csp-stat-num">{s.n}</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{s.l}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section className="csp-section" style={{ background: "#fff" }}>
        <div className="csp-inner">
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5E39E3", marginBottom: 10 }}>Curriculum</div>
            <h2 className="csp-h2">8 weeks. Career-ready.</h2>
            <p style={{ fontSize: 16, color: "#7A788F", maxWidth: 480, lineHeight: 1.65 }}>Built around what CS hiring managers actually look for — not textbook theory.</p>
          </div>
          <div className="csp-grid2">
            {curriculum.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "24px", border: "1px solid #E8E4F8", borderRadius: 16, background: "#fff" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "#EDE8FF", color: "#5E39E3", fontFamily: FH, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.n}</div>
                <div>
                  <div style={{ fontFamily: FH, fontSize: 15, fontWeight: 700, color: "#0D0B1A", marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: "#7A788F", lineHeight: 1.55 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="csp-section-sm">
        <div className="csp-inner">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5E39E3", marginBottom: 10 }}>Pricing</div>
            <h2 className="csp-h2">Simple, transparent pricing</h2>
            <p style={{ fontSize: 16, color: "#7A788F" }}>One programme. Everything included. Flexible EMI to make it accessible.</p>
          </div>
          <div style={{ maxWidth: 580, margin: "0 auto", background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid #E8E4F8", boxShadow: "0 24px 60px rgba(94,57,227,0.09)" }}>
            <div className="csp-price-header">
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Programme Fee</div>
                <div className="csp-price-num">
                  <span style={{ fontSize: 26, verticalAlign: "top", marginTop: 8, display: "inline-block" }}>₹</span>29,999
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>GST charged at checkout</div>
              </div>
              <div style={{ background: "#F5C842", color: "#0D0B1A", fontFamily: FH, fontSize: 14, fontWeight: 800, padding: "12px 18px", borderRadius: 12, textAlign: "center", flexShrink: 0 }}>
                Easy EMI
                <span style={{ display: "block", fontSize: 11, fontWeight: 500, marginTop: 2 }}>Available at checkout</span>
              </div>
            </div>
            <div style={{ padding: "36px 32px" }}>
              <ul style={{ listStyle: "none", marginBottom: 28, padding: 0 }}>
                {[
                  "1:1 mentorship with industry leaders",
                  "Real-world CS project work",
                  "Mock interviews with hiring managers",
                  "100% placement support",
                  "Industry-recognised certificate",
                  "Lifetime alumni network access",
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 5 ? "1px solid #F0EDF8" : "none", fontSize: 15, color: "#3D3B52" }}>
                    <span style={{ color: "#5E39E3", fontSize: 16, fontWeight: 700 }}>✦</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/customer-success-enrol" onClick={() => window.scrollTo(0, 0)}>
                <button style={{ display: "block", width: "100%", textAlign: "center", background: "#5E39E3", color: "white", fontFamily: FH, fontSize: 17, fontWeight: 700, padding: "16px", borderRadius: 14, border: "none", cursor: "pointer" }}>
                  Enrol Now →
                </button>
              </Link>
              <button onClick={() => setCurriculumModalOpen(true)} style={{ display: "block", width: "100%", textAlign: "center", background: "transparent", color: "#5E39E3", fontSize: 14, fontWeight: 500, padding: "12px", borderRadius: 14, border: "1.5px solid #E8E4F8", cursor: "pointer", marginTop: 10 }}>
                ⬇ Download Full Curriculum
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IS THIS FOR ── */}
      <section className="csp-section" style={{ background: "#fff" }}>
        <div className="csp-inner">
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5E39E3", marginBottom: 10 }}>Who is this for</div>
            <h2 className="csp-h2">Built for anyone ready<br />to break into CS</h2>
          </div>
          <div className="csp-grid2">
            {audience.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "22px 24px", border: "1px solid #E8E4F8", borderRadius: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "#EDE8FF", color: "#5E39E3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginTop: 1 }}>✓</div>
                <div>
                  <div style={{ fontFamily: FH, fontSize: 15, fontWeight: 700, color: "#0D0B1A", marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: "#7A788F", lineHeight: 1.55 }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="csp-cta">
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className="csp-cta-h">Ready to get <span style={{ color: "#F5C842" }}>started?</span></h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", marginBottom: 36 }}>Take the first step towards a rewarding career in Customer Success.</p>
          <div className="csp-cta-btns">
            <Link href="/customer-success-enrol" onClick={() => window.scrollTo(0, 0)}>
              <button style={{ background: "#F5C842", color: "#0D0B1A", fontFamily: FH, fontSize: 16, fontWeight: 800, padding: "16px 36px", borderRadius: 14, border: "none", cursor: "pointer" }}>
                Enrol Now — ₹29,999 →
              </button>
            </Link>
            <button onClick={() => setCurriculumModalOpen(true)} style={{ background: "transparent", color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: 500, padding: "16px 28px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
              ⬇ Download Curriculum
            </button>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM MODAL ── */}
      <Dialog open={curriculumModalOpen} onOpenChange={setCurriculumModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: FH, fontSize: 20, fontWeight: 800 }}>Download Curriculum</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: 14, color: "#7A788F", marginBottom: 4 }}>Enter your details to download the detailed curriculum.</p>
          <form onSubmit={handleCurriculumSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Full Name *</Label>
              <Input id="lead-name" required value={leadForm.fullName} onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })} placeholder="Enter your full name" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email *</Label>
              <Input id="lead-email" type="email" required value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="you@example.com" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone *</Label>
              <Input id="lead-phone" type="tel" required value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>What interests you? *</Label>
              <Select value={leadForm.interest} onValueChange={(v) => setLeadForm({ ...leadForm, interest: v })} required>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select your interest" /></SelectTrigger>
                <SelectContent>
                  {interestOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="lg" disabled={curriculumMutation.isPending} style={{ width: "100%", background: "#5E39E3", borderRadius: 12, fontWeight: 700 }}>
              {curriculumMutation.isPending ? "Sending..." : "Get Curriculum →"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
