import { ArrowRight, CheckCircle, Clock, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/footer";

export default function TestThankYou() {
  const handleApply = () => {
    if ((window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({ url: 'https://calendly.com/aastha-skillveda/30min' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');

        .ty-bg {
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 5vw;
        }
        .ty-bg::before {
          content: '';
          position: absolute;
          top: -150px; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%);
          pointer-events: none;
        }
        .ty-bg::after {
          content: '';
          position: absolute;
          bottom: -100px; right: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        .ty-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .ty-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.35);
          color: #86efac;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 7px 16px;
          border-radius: 999px;
          margin-bottom: 28px;
        }
        .ty-check-ring {
          width: 88px; height: 88px;
          border-radius: 50%;
          background: rgba(34,197,94,0.1);
          border: 2px solid rgba(34,197,94,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          animation: tyPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes tyPop {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .ty-gradient-text {
          background: linear-gradient(135deg, #86efac 0%, #34d399 50%, #6ee7b7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ty-step-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 24px;
          transition: border-color 0.2s, background 0.2s;
          text-align: left;
        }
        .ty-step-card:hover {
          border-color: rgba(124,58,237,0.35);
          background: rgba(124,58,237,0.05);
        }
        .ty-step-num {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.4);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 0.82rem;
          color: #c4b5fd;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .ty-btn {
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
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
          transition: opacity 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .ty-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .ty-btn-outline {
          background: transparent;
          color: #94a3b8;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 13px 28px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.2s, color 0.2s;
          text-decoration: none;
        }
        .ty-btn-outline:hover { border-color: rgba(124,58,237,0.5); color: #c4b5fd; }
        .ty-contact-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: border-color 0.2s;
        }
        .ty-contact-card:hover { border-color: rgba(124,58,237,0.3); }
        .ty-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(8,11,20,0.9);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5vw;
          height: 62px;
        }
        .ty-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 1.15rem;
          color: #f1f5f9;
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .ty-logo span { color: #a78bfa; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ty-fade-1 { animation: fadeUp 0.5s ease 0.1s both; }
        .ty-fade-2 { animation: fadeUp 0.5s ease 0.25s both; }
        .ty-fade-3 { animation: fadeUp 0.5s ease 0.4s both; }
        .ty-fade-4 { animation: fadeUp 0.5s ease 0.55s both; }
      `}</style>

      {/* NAV */}
      <div className="ty-nav">
        <Link href="/">
          <a className="ty-logo">Skilled<span>Veda</span></a>
        </Link>
      </div>

      <div className="ty-bg">
        <div className="ty-grid" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', width: '100%', textAlign: 'center' }}>

          {/* Check icon */}
          <div className="ty-check-ring ty-fade-1">
            <CheckCircle size={42} color="#4ade80" strokeWidth={1.5} />
          </div>

          {/* Badge */}
          <div className="ty-fade-1" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="ty-badge">
              <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }} />
              Test Submitted Successfully
            </div>
          </div>

          {/* Headline */}
          <div className="ty-fade-2">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px', color: '#f1f5f9' }}>
              Great Job! You've<br />
              <span className="ty-gradient-text">Completed the Test</span>
            </h1>
            <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.7, marginBottom: '48px', maxWidth: '480px', margin: '0 auto 48px' }}>
              Our team is reviewing your assessment. We'll reach out within <strong style={{ color: '#c4b5fd' }}>24–48 hours</strong> with your result and next steps.
            </p>
          </div>

          {/* What happens next */}
          <div className="ty-fade-3" style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '20px' }}>What Happens Next</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', textAlign: 'left' }}>
              {[
                { num: '01', title: 'Test Review', desc: 'Our team evaluates your assessment within 24–48 hrs.' },
                { num: '02', title: 'Result on WhatsApp & Email', desc: 'You receive your eligibility result directly from us.' },
                { num: '03', title: 'Counselling Call', desc: 'If you clear, we schedule a quick call to discuss enrollment.' },
                { num: '04', title: 'Join the Cohort', desc: 'Pay ₹12,000, join the next batch and start your journey.' },
              ].map((s, i) => (
                <div key={i} className="ty-step-card">
                  <div className="ty-step-num">{s.num}</div>
                  <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '6px' }}>{s.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline pill */}
          <div className="ty-fade-3" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#fde047', fontSize: '0.82rem', fontWeight: 500, padding: '10px 20px', borderRadius: '999px' }}>
              <Clock size={14} />
              Expected response within 24–48 hours
            </div>
          </div>

          {/* CTAs */}
          <div className="ty-fade-4" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '52px' }}>
            <button className="ty-btn" onClick={handleApply}>
              Book a Counselling Call <ArrowRight size={16} />
            </button>
            <Link href="/programs">
              <a className="ty-btn-outline" onClick={() => window.scrollTo(0, 0)}>
                Explore Other Programs
              </a>
            </Link>
          </div>

          {/* Contact */}
          <div className="ty-fade-4">
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#334155', marginBottom: '14px' }}>Have a question? Reach us directly</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:aastha@skillveda.ai" className="ty-contact-card" style={{ textDecoration: 'none' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(124,58,237,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={16} color="#a78bfa" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>aastha@skillveda.ai</div>
                </div>
              </a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="ty-contact-card" style={{ textDecoration: 'none' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(34,197,94,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={16} color="#86efac" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>WhatsApp</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Chat with us</div>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}