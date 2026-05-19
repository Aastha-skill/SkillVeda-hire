import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, ChevronDown, ChevronUp, Zap, Shield, TrendingUp, Brain, Target, Award, X, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/footer";

function LeadCaptureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ fullName: '', email: '', phone: '' });
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          leadType: 'PROGRAM',
          sourcePage: 'pgdm-customer-success',
          metadata: JSON.stringify({ program: 'PG Diploma in Customer Success & KAM · 2026 Batch' }),
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
      toast({ title: "Application received!", description: "Our team will reach out within 24 hours." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={handleClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.45)', backdropFilter: 'blur(8px)' }} />
      <div
        style={{ position: 'relative', background: '#ffffff', border: '1px solid #ebe8f5', borderRadius: '20px', maxWidth: '440px', width: '100%', overflow: 'hidden', animation: 'fadeUp 0.3s ease both', boxShadow: '0 24px 64px rgba(124,58,237,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed' }}>⚡ PGDM · 2026 Batch</span>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b9aab', padding: '4px' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '18px 28px 28px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', border: '1.5px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={30} color="#16a34a" />
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#0a0a0f', marginBottom: '10px', letterSpacing: '-0.02em' }}>Application Received</h3>
              <p style={{ fontSize: '0.92rem', color: '#6b6a7a', lineHeight: 1.6, marginBottom: '24px' }}>Our counsellor will reach out within <strong style={{ color: '#7c3aed' }}>24 hours</strong> to discuss next steps for the 2026 Batch.</p>
              <button
                onClick={handleClose}
                style={{ background: '#7c3aed', color: 'white', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.92rem', padding: '12px 32px', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.35rem', color: '#0a0a0f', marginBottom: '6px', letterSpacing: '-0.02em' }}>Apply for the 2026 Batch</h3>
              <p style={{ fontSize: '0.88rem', color: '#6b6a7a', marginBottom: '22px', lineHeight: 1.5 }}>Fill in your details — our team will get in touch within 24 hours.</p>

              <form onSubmit={handleSubmit}>
                {[
                  { label: 'Full Name', type: 'text', key: 'fullName', placeholder: 'Your full name' },
                  { label: 'Email Address', type: 'email', key: 'email', placeholder: 'you@example.com' },
                  { label: 'Phone Number', type: 'tel', key: 'phone', placeholder: '+91 98765 43210' },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? '14px' : '22px' }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#6b6a7a', marginBottom: '6px', letterSpacing: '0.04em' }}>{f.label} *</label>
                    <input
                      type={f.type}
                      required
                      value={formData[f.key as keyof typeof formData]}
                      onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '12px 14px', background: '#ffffff', border: '1px solid #ebe8f5', borderRadius: '10px', color: '#0a0a0f', fontSize: '0.92rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#ebe8f5'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', background: '#7c3aed', color: 'white', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem', padding: '14px', border: 'none', borderRadius: '10px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s' }}
                >
                  {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <>Submit Application <ArrowRight size={16} /></>}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9b9aab', marginTop: '12px', lineHeight: 1.5 }}>
                  🔒 Your information stays private and is only used to contact you about this programme.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "What is the 6-month paid internship — and is it really guaranteed?",
    a: "Yes — a paid internship at a partner B2B / SaaS company is built into every enrollment. From month 7 to month 12, you work full-time at the company as a paid intern, applying what you learned in the first 6 months of training. This is real, paid work — not a token project or simulation.",
  },
  {
    q: "How much will I earn during the paid internship?",
    a: "Internship stipends typically range from ₹15,000–₹25,000 per month, depending on the partner company, your role, and your performance during the first 6 months of training.",
  },
  {
    q: "What's the placement opportunity after 12 months?",
    a: "After completing the 12-month programme — diploma coursework plus the 6-month paid internship — graduates apply for full-time Customer Success and Key Account Management roles. Our previous cohort placed at an average CTC of ₹6.3 LPA, with the highest offer at ₹10.3 LPA. Placement is opportunity-based: we open doors at our hiring partners, and converting to a full-time offer depends on your internship performance and interview readiness.",
  },
  {
    q: "When does the 2026 Batch start? How do I apply?",
    a: "Applications for the 2026 Batch are open now, with rolling admissions. Each cohort has limited seats to ensure quality training and internship placement support. Submit your application to receive the exact batch start date and reserve your seat.",
  },
  {
    q: "How do I pay the ₹99,000 programme fee?",
    a: "The ₹99,000 programme fee is paid upfront at enrollment to secure your seat in the 2026 Batch. In select cases, we can accommodate semester-wise payment splits — talk to our counsellor when you apply and we'll see what works for your situation.",
  },
  {
    q: "Is the diploma recognized / accredited?",
    a: "Yes — this PG Diploma is certified by Medhavi Skills University, a UGC-recognised, government-approved university credential. You can confidently showcase it on your resume, LinkedIn, and to prospective employers.",
  },
];

const curriculum = [
  { icon: "🎯", title: "Customer Success Foundations", desc: "Onboarding, health scoring, NPS, CSAT, churn prevention" },
  { icon: "🤝", title: "Key Account Management", desc: "Account planning, stakeholder mapping, upsell strategies" },
  { icon: "📊", title: "CRM & Industry Tools", desc: "Salesforce, HubSpot, Freshdesk, Gainsight — hands-on" },
  { icon: "💬", title: "Communication & Negotiation", desc: "Executive presentations, objection handling, deal closing" },
  { icon: "📈", title: "Revenue & Business Metrics", desc: "ARR, MRR, LTV, CAC — CS impact on company revenue" },
  { icon: "🧠", title: "Career & Interview Readiness", desc: "Mock interviews, case studies, salary negotiation" },
];

export default function PGDMCustomerSuccess() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const handleApply = () => {
    setShowLeadForm(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap');

        .pgdm-hero-bg {
          background: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .pgdm-hero-bg::before {
          content: '';
          position: absolute;
          top: -300px; right: -200px;
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        .pgdm-hero-bg::after {
          content: '';
          position: absolute;
          bottom: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%);
          pointer-events: none;
        }
        .pgdm-eyebrow {
          background: #f5f3ff;
          border: 1px solid #ebe8f5;
          color: #7c3aed;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }
        .pgdm-pulse {
          width: 7px; height: 7px;
          background: #7c3aed;
          border-radius: 50%;
          animation: pgdmPulse 2s infinite;
        }
        @keyframes pgdmPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(124,58,237,0.5); }
          50% { opacity: 0.4; box-shadow: none; }
        }
        .pgdm-gradient-text {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pgdm-stat {
          background: #ffffff;
          border: 1px solid #ebe8f5;
          border-radius: 14px;
          padding: 18px 20px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .pgdm-stat:hover {
          border-color: #c4b5fd;
          box-shadow: 0 4px 16px rgba(124,58,237,0.08);
          transform: translateY(-1px);
        }
        .pgdm-enroll {
          background: #ffffff;
          border: 1px solid #ebe8f5;
          border-radius: 20px;
          padding: 0;
          overflow: hidden;
          position: sticky;
          top: 80px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.08);
        }
        .pgdm-btn {
          background: #7c3aed;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 14px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(124,58,237,0.2);
        }
        .pgdm-btn:hover {
          background: #6d28d9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.3);
        }
        .pgdm-btn-inline {
          background: #7c3aed;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 14px 32px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(124,58,237,0.2);
        }
        .pgdm-btn-inline:hover {
          background: #6d28d9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.3);
        }
        .pgdm-btn-outline {
          background: #ffffff;
          color: #5b21b6;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.92rem;
          padding: 13px 28px;
          border: 1px solid #ebe8f5;
          border-radius: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .pgdm-btn-outline:hover {
          background: #f5f3ff;
          border-color: #c4b5fd;
        }
        .pgdm-top-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #ebe8f5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5vw;
          height: 62px;
        }
        .pgdm-back {
          display: flex; align-items: center; gap: 6px;
          color: #6b6a7a; font-size: 0.88rem; font-weight: 500;
          background: none; border: none; cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }
        .pgdm-back:hover { color: #7c3aed; }
        .pgdm-nav-btn {
          background: #7c3aed;
          color: white; font-weight: 700; font-size: 0.83rem;
          padding: 10px 22px; border: none; border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          box-shadow: 0 2px 6px rgba(124,58,237,0.18);
        }
        .pgdm-nav-btn:hover { background: #6d28d9; }
        .pgdm-t-card {
          background: #ffffff;
          border: 1px solid #ebe8f5;
          border-radius: 16px;
          padding: 24px;
          flex: 1;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pgdm-t-card:hover {
          border-color: #c4b5fd;
          box-shadow: 0 4px 16px rgba(124,58,237,0.08);
        }
        .pgdm-t-dot {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800; font-size: 0.7rem;
          flex-shrink: 0; position: relative; z-index: 1;
        }
        .pgdm-cur-card {
          background: #ffffff;
          border: 1px solid #ebe8f5;
          border-radius: 14px;
          padding: 24px;
          transition: all 0.2s;
        }
        .pgdm-cur-card:hover {
          border-color: #c4b5fd;
          box-shadow: 0 6px 20px rgba(124,58,237,0.1);
          transform: translateY(-2px);
        }
        .pgdm-outcome {
          background: #ffffff;
          border: 1px solid #ebe8f5;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.2s;
        }
        .pgdm-outcome:hover {
          border-color: #c4b5fd;
          box-shadow: 0 6px 20px rgba(124,58,237,0.08);
        }
        .pgdm-outcome-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .pgdm-faq {
          border: 1px solid #ebe8f5;
          border-radius: 12px;
          margin-bottom: 10px;
          overflow: hidden;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pgdm-faq.open {
          border-color: #c4b5fd;
          box-shadow: 0 4px 16px rgba(124,58,237,0.06);
        }
        .pgdm-faq-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 20px 22px; background: transparent; border: none;
          cursor: pointer; text-align: left; gap: 16px;
          color: #0a0a0f; font-size: 0.95rem; font-weight: 600;
        }
        .pgdm-faq-btn:hover { background: #faf9fc; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .pgdm-hero-grid { grid-template-columns: 1fr !important; }
          .pgdm-enroll { position: static !important; }
        }
      `}</style>

      <LeadCaptureModal isOpen={showLeadForm} onClose={() => setShowLeadForm(false)} />

      {/* NAV */}
      <div className="pgdm-top-nav">
        <Link href="/programs" onClick={() => window.scrollTo(0, 0)}>
          <button className="pgdm-back">
            <ArrowLeft size={15} /> All Programs
          </button>
        </Link>
        <button className="pgdm-nav-btn" onClick={handleApply}>Apply for 2026 Batch →</button>
      </div>

      {/* HERO */}
      <div className="pgdm-hero-bg" style={{ paddingTop: '108px', paddingBottom: '88px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5vw', position: 'relative', zIndex: 1 }}>
          <div className="pgdm-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', alignItems: 'start' }}>

            <div>
              <div className="pgdm-eyebrow">
                <span className="pgdm-pulse" /> 2026 Batch · Applications Open
              </div>

              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2.2rem, 4.6vw, 3.4rem)', lineHeight: 1.05, letterSpacing: '-0.035em', marginBottom: '22px', color: '#0a0a0f' }}>
                PG Diploma in<br />
                <span className="pgdm-gradient-text">Customer Success</span><br />
                & Key Account Management
              </h1>

              <p style={{ fontSize: '1.08rem', color: '#5e5d6e', maxWidth: '520px', marginBottom: '36px', lineHeight: 1.65 }}>
                Learn for 6 months, earn through a guaranteed 6-month paid internship, then launch into full-time CS roles. India's only work-integrated PG Diploma in Customer Success.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '36px' }}>
                {[
                  { val: "₹6.3 LPA", sub: "Average CTC", col: "#7c3aed" },
                  { val: "₹10.3 LPA", sub: "Highest CTC", col: "#3b82f6" },
                  { val: "6 Months", sub: "Paid Internship", col: "#16a34a" },
                ].map((s, i) => (
                  <div key={i} className="pgdm-stat">
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.55rem', color: s.col, letterSpacing: '-0.02em' }}>{s.val}</div>
                    <div style={{ fontSize: '0.74rem', color: '#9b9aab', marginTop: '3px', fontWeight: 500 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="pgdm-btn-inline" onClick={handleApply}>Apply for 2026 Batch <ArrowRight size={16} /></button>
                <a href="#curriculum" className="pgdm-btn-outline">View Curriculum</a>
              </div>

              {/* TRUST BADGE — Medhavi */}
              <div style={{ marginTop: '32px', display: 'inline-flex', alignItems: 'center', gap: '14px', background: '#ffffff', border: '1px solid #ebe8f5', borderRadius: '14px', padding: '12px 18px', boxShadow: '0 2px 8px rgba(10,10,15,0.03)' }}>
                <div style={{ width: '40px', height: '40px', background: '#faf9fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '4px', border: '1px solid #ebe8f5' }}>
                  <img src="https://www.msu.edu.in/logo.svg" alt="Medhavi Skills University" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#9b9aab', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>University Certified</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.92rem', color: '#0a0a0f' }}>Medhavi Skills University</div>
                </div>
                <div style={{ width: '1px', height: '34px', background: '#ebe8f5', margin: '0 4px' }} />
                <div style={{ fontSize: '0.78rem', color: '#6b6a7a', lineHeight: 1.4, maxWidth: '120px' }}>UGC recognised · Govt. approved</div>
              </div>
            </div>

            {/* CARD — GTM */}
            <div className="pgdm-enroll">

              {/* Top label */}
              <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', padding: '12px 22px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ffffff' }}>⚡ 2026 Batch · Paid Internship Guaranteed</span>
              </div>

              <div style={{ padding: '26px 26px 24px' }}>

                {/* ROI framing */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>💡 The Math That Makes Sense</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#6b6a7a', marginBottom: '3px' }}>You invest</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#0a0a0f' }}>₹99,000</div>
                      <div style={{ fontSize: '0.68rem', color: '#9b9aab' }}>upfront programme fee</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#6b6a7a', marginBottom: '3px' }}>You earn</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#16a34a' }}>₹6.3 – 10.3 LPA</div>
                      <div style={{ fontSize: '0.68rem', color: '#9b9aab' }}>avg / highest CTC</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #bbf7d0', marginTop: '12px', paddingTop: '12px', fontSize: '0.78rem', color: '#15803d', fontWeight: 500 }}>
                    → Plus a paid stipend during your 6-month internship 🎯
                  </div>
                </div>

                {/* 12-month journey */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9b9aab', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Your 12-Month Journey</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#5b21b6' }}>Month 1–6 · Learn</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b6a7a', marginTop: '2px' }}>Full-time CS + KAM training</div>
                    </div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#15803d' }}>Month 7–12 · Earn (Paid Internship)</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b6a7a', marginTop: '2px' }}>Guaranteed paid internship at a partner company</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px' }}>
                      <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#b45309' }}>Month 12+ · Launch</div>
                        <div style={{ fontSize: '0.72rem', color: '#6b6a7a', marginTop: '2px' }}>Placement opportunities</div>
                      </div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#b45309' }}>₹6.3–10.3 <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#9b9aab' }}>LPA</span></div>
                    </div>
                  </div>
                </div>

                {/* What's included */}
                <div style={{ borderTop: '1px solid #ebe8f5', paddingTop: '18px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9b9aab', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>What's Included</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      "Medhavi University certified",
                      "Guaranteed 6-mo paid internship",
                      "CRM tools training",
                      "Mock interviews",
                      "Industry mentor support",
                      "Placement opportunities",
                    ].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#5e5d6e' }}>
                        <CheckCircle size={13} color="#16a34a" style={{ flexShrink: 0 }} /> {f}
                      </div>
                    ))}
                  </div>
                </div>

                <button className="pgdm-btn" onClick={handleApply} style={{ fontSize: '0.95rem', padding: '15px' }}>
                  Apply for 2026 Batch →
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9b9aab', marginTop: '10px', lineHeight: 1.5 }}>
                  🔒 Limited seats · 2026 Batch enrolling now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JOURNEY */}
      <section style={{ padding: '96px 5vw', background: '#faf9fc', borderTop: '1px solid #ebe8f5', borderBottom: '1px solid #ebe8f5' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '10px' }}>Your Journey</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#0a0a0f', letterSpacing: '-0.03em', marginBottom: '12px' }}>Learn · Earn · Launch</div>
          <p style={{ color: '#5e5d6e', fontSize: '1rem', marginBottom: '52px', lineHeight: 1.7, maxWidth: '560px' }}>From learner to employable CS professional — with a guaranteed paid internship in the middle.</p>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '28px', top: '48px', bottom: '48px', width: '2px', background: 'linear-gradient(to bottom, #c4b5fd, #86efac, #fcd34d)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                {
                  label: "M1–6",
                  phase: "Learn",
                  icon: <Brain size={14} color="#5b21b6" />,
                  phaseColor: '#7c3aed',
                  dotBg: '#f5f3ff',
                  dotBorder: '#c4b5fd',
                  dotCol: '#5b21b6',
                  title: "Full-Time Learning Phase — 6 Months",
                  body: "Six months of intensive, structured training in Customer Success, Key Account Management, CRM tools (Salesforce, HubSpot, Gainsight), executive communication, and interview readiness. Learn from industry-active CS leaders and work on real-world case studies.",
                  pill: "Full-time · Live online sessions",
                  pillBg: '#f5f3ff',
                  pillBorder: '#ddd6fe',
                  pillCol: '#5b21b6'
                },
                {
                  label: "M7–12",
                  phase: "Earn (Paid Internship)",
                  icon: <TrendingUp size={14} color="#15803d" />,
                  phaseColor: '#16a34a',
                  dotBg: '#f0fdf4',
                  dotBorder: '#86efac',
                  dotCol: '#15803d',
                  title: "Guaranteed Paid Internship — 6 Months",
                  body: "Work full-time at a partner B2B / SaaS company as a paid intern. Apply your training to real client work, earn a stipend, and continue diploma coursework alongside. Internship placement is built into your enrollment.",
                  pill: "Paid stipend ₹15-25K/mo · Real client work",
                  pillBg: '#f0fdf4',
                  pillBorder: '#bbf7d0',
                  pillCol: '#15803d'
                },
                {
                  label: "M12+",
                  phase: "Launch (Placement Opportunities)",
                  icon: <Target size={14} color="#b45309" />,
                  phaseColor: '#d97706',
                  dotBg: '#fffbeb',
                  dotBorder: '#fcd34d',
                  dotCol: '#b45309',
                  title: "Launch — Full-Time Placement Opportunities",
                  body: "Graduate with a PG Diploma plus 6 months of real CS experience at a hiring partner. Apply for full-time CS, KAM, and Account Management roles. Previous cohort placed at an average CTC of ₹6.3 LPA, with the highest offer at ₹10.3 LPA.",
                  pill: "Avg ₹6.3 LPA · Highest ₹10.3 LPA",
                  pillBg: '#fffbeb',
                  pillBorder: '#fde68a',
                  pillCol: '#b45309'
                },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '22px', alignItems: 'flex-start' }}>
                  <div className="pgdm-t-dot" style={{ background: step.dotBg, border: `2px solid ${step.dotBorder}`, color: step.dotCol }}>{step.label}</div>
                  <div className="pgdm-t-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {step.icon}
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: step.phaseColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{step.phase}</span>
                    </div>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#0a0a0f', marginBottom: '8px', letterSpacing: '-0.02em' }}>{step.title}</h3>
                    <p style={{ fontSize: '0.92rem', color: '#5e5d6e', lineHeight: 1.65 }}>{step.body}</p>
                    <div style={{ marginTop: '12px', display: 'inline-block', background: step.pillBg, border: `1px solid ${step.pillBorder}`, color: step.pillCol, fontSize: '0.72rem', fontWeight: 700, padding: '5px 13px', borderRadius: '999px' }}>{step.pill}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section style={{ padding: '96px 5vw', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '10px' }}>Outcomes</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#0a0a0f', letterSpacing: '-0.03em', marginBottom: '48px' }}>What Success Looks Like</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { icon: <TrendingUp size={22} color="#7c3aed" />, bg: "#f5f3ff", val: "₹6.3 LPA", lbl: "Average CTC" },
              { icon: <Award size={22} color="#3b82f6" />, bg: "#eff6ff", val: "₹10.3 LPA", lbl: "Highest CTC" },
              { icon: <Zap size={22} color="#16a34a" />, bg: "#f0fdf4", val: "6 Months", lbl: "Paid Internship Guaranteed" },
              { icon: <Shield size={22} color="#b45309" />, bg: "#fffbeb", val: "12 Months", lbl: "Diploma + Real Work Exp" },
            ].map((o, i) => (
              <div key={i} className="pgdm-outcome">
                <div className="pgdm-outcome-icon" style={{ background: o.bg }}>{o.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.9rem', color: '#0a0a0f', letterSpacing: '-0.02em', marginBottom: '6px' }}>{o.val}</div>
                <div style={{ fontSize: '0.82rem', color: '#6b6a7a' }}>{o.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section id="curriculum" style={{ padding: '96px 5vw', background: '#faf9fc', borderTop: '1px solid #ebe8f5', borderBottom: '1px solid #ebe8f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '10px' }}>Curriculum</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#0a0a0f', letterSpacing: '-0.03em', marginBottom: '12px' }}>What You'll Master</div>
          <p style={{ color: '#5e5d6e', fontSize: '1rem', marginBottom: '44px', lineHeight: 1.7, maxWidth: '560px' }}>Practical modules built around what top employers actually need.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {curriculum.map((c, i) => (
              <div key={i} className="pgdm-cur-card">
                <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{c.icon}</div>
                <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.98rem', color: '#0a0a0f', marginBottom: '6px', letterSpacing: '-0.01em' }}>{c.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#6b6a7a', lineHeight: 1.55 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ELIGIBILITY TEST GATE */}
      <section style={{ padding: '96px 5vw', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '10px' }}>Eligibility</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#0a0a0f', letterSpacing: '-0.03em', marginBottom: '14px' }}>Are You the Right Fit?</div>
          <p style={{ color: '#5e5d6e', fontSize: '1rem', marginBottom: '44px', maxWidth: '560px', lineHeight: 1.7 }}>
            We don't just accept everyone. To keep the quality of every 2026 Batch cohort high — and ensure you get the paid internship you're promised — we ask all applicants to clear a short eligibility test first.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', maxWidth: '900px' }}>

            {/* What the test checks */}
            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '20px', padding: '30px' }}>
              <div style={{ fontSize: '1.9rem', marginBottom: '14px' }}>🧪</div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#5b21b6', marginBottom: '14px', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>What the Test Checks</h4>
              {[
                "Basic English communication ability",
                "Logical & analytical thinking",
                "Customer mindset & empathy",
                "Aptitude for learning new tools",
                "Motivation & career intent",
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.88rem', color: '#5e5d6e', alignItems: 'flex-start' }}>
                  <CheckCircle size={15} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} /> {t}
                </div>
              ))}
            </div>

            {/* Test details + CTA */}
            <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: '20px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white', boxShadow: '0 12px 32px rgba(124,58,237,0.2)' }}>
              <div>
                <div style={{ fontSize: '1.9rem', marginBottom: '14px' }}>⚡</div>
                <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#ffffff', marginBottom: '14px', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>Quick & Free to Take</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  {[
                    { label: "Duration", val: "20 mins" },
                    { label: "Format", val: "Online MCQ" },
                    { label: "Cost", val: "Free" },
                    { label: "Result", val: "Instant" },
                  ].map((d, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{d.label}</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.98rem', color: '#ffffff' }}>{d.val}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '22px' }}>
                  Clear the test and you're eligible to enroll in the 2026 Batch. It's designed to be fair — not hard. We're looking for potential, not perfection.
                </p>
              </div>
              <a
                href="https://app.goodfit.so/jobs/skill-veda/Customer-Success-Skill-Veda-Assessment?id=Vlfk1AU6"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#ffffff', color: '#5b21b6', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.94rem', padding: '14px 24px', borderRadius: '10px', textDecoration: 'none', transition: 'transform 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Take the Eligibility Test →
              </a>
            </div>

            {/* Who this is for */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '30px' }}>
              <div style={{ fontSize: '1.9rem', marginBottom: '14px' }}>✅</div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#15803d', marginBottom: '14px', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>Who Typically Clears It</h4>
              {[
                "Fresh graduates in any discipline",
                "Career switchers with people skills",
                "Anyone who's customer-oriented",
                "Self-motivated learners",
                "Those ready to commit 12 months",
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.88rem', color: '#5e5d6e', alignItems: 'flex-start' }}>
                  <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} /> {t}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '96px 5vw', background: '#faf9fc', borderTop: '1px solid #ebe8f5' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '10px' }}>FAQ</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#0a0a0f', letterSpacing: '-0.03em', marginBottom: '36px' }}>Common Questions</div>
          {faqs.map((faq, i) => (
            <div key={i} className={`pgdm-faq ${openFaq === i ? 'open' : ''}`}>
              <button className="pgdm-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} color="#7c3aed" /> : <ChevronDown size={16} color="#9b9aab" />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 22px 20px', fontSize: '0.92rem', color: '#5e5d6e', lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: '104px 5vw', textAlign: 'center', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)', color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '16px', lineHeight: 1.1 }}>
            Ready to Launch Your Career<br />
            in Customer Success?
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '32px', lineHeight: 1.7 }}>
            ₹99,000 upfront programme fee · Guaranteed 6-month paid internship built in. Apply for the 2026 Batch today.
          </p>
          <button onClick={handleApply} style={{ background: '#ffffff', color: '#5b21b6', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1rem', padding: '16px 40px', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', transition: 'transform 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Apply for 2026 Batch <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}