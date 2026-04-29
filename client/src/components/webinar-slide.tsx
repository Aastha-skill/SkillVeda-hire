import { ArrowRight } from "lucide-react";
import dayforceLogoImg from "@assets/image_1776082779827.png";
import pumaLogoImg from "@assets/image_1776082799604.png";

interface WebinarSlideProps {
  himanshuImg: string;
  preritImg: string;
  onRegister: () => void;
}

export default function WebinarSlide({ himanshuImg, preritImg, onRegister }: WebinarSlideProps) {
  return (
    <div className="ws2-root">
      <style>{`
        .ws2-root {
          position: relative;
          width: 100%;
          min-height: 620px;
          background: #06061a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 0 56px;
          box-sizing: border-box;
        }
        .ws2-grid-mesh {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .ws2-glow-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.05) 40%, transparent 70%);
          pointer-events: none;
        }
        .ws2-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          width: 100%;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 40px;
          align-items: center;
        }
        .ws2-speaker-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .ws2-speaker-badge {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 5px 16px;
          border-radius: 6px;
          backdrop-filter: blur(8px);
        }
        .ws2-badge-purple {
          background: rgba(124,58,237,0.85);
          color: #fff;
        }
        .ws2-badge-teal {
          background: rgba(20,184,166,0.85);
          color: #fff;
        }
        .ws2-photo-wrap {
          width: 280px;
          height: 340px;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }
        .ws2-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ws2-photo-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to top, rgba(6,6,26,0.95), transparent);
          pointer-events: none;
        }
        .ws2-speaker-info {
          margin-top: 16px;
        }
        .ws2-speaker-name {
          font-weight: 800;
          font-size: 1.05rem;
          color: #f1f5f9;
          margin-bottom: 4px;
        }
        .ws2-speaker-role {
          font-size: 0.8rem;
          color: #94a3b8;
          line-height: 1.4;
        }
        .ws2-company-pill {
          display: inline-block;
          margin-top: 10px;
          padding: 5px 18px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ws2-pill-purple {
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.4);
          color: #c4b5fd;
        }
        .ws2-pill-teal {
          background: rgba(20,184,166,0.15);
          border: 1px solid rgba(20,184,166,0.35);
          color: #5eead4;
        }
        .ws2-logo-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .ws2-logo-pill img {
          height: 22px;
          width: auto;
          object-fit: contain;
        }
        .ws2-center {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @keyframes ws2Pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ws2-live-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #fbbf24;
          margin-bottom: 20px;
        }
        .ws2-live-dot {
          width: 9px;
          height: 9px;
          background: #fbbf24;
          border-radius: 50%;
          animation: ws2Pulse 2s infinite;
          box-shadow: 0 0 8px rgba(251,191,36,0.5);
        }
        .ws2-headline {
          font-family: 'Inter', 'DM Sans', sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 3.5vw, 2.5rem);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #f1f5f9;
          margin-bottom: 24px;
        }
        .ws2-gradient {
          background: linear-gradient(135deg, #a78bfa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ws2-date-box {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px 28px;
          margin-bottom: 12px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(4px);
        }
        .ws2-date-text {
          font-weight: 700;
          font-size: 1.05rem;
          color: #fbbf24;
        }
        .ws2-time-text {
          font-size: 0.85rem;
          color: #e2e8f0;
          margin-top: 4px;
        }
        .ws2-free-label {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 10px 0 20px;
        }
        .ws2-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 40px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 24px rgba(124,58,237,0.35);
        }
        .ws2-cta-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 6px 32px rgba(124,58,237,0.45);
        }
        @keyframes ws2Marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ws2-marquee-wrap {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          overflow: hidden;
          height: 36px;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .ws2-marquee-track {
          display: flex;
          white-space: nowrap;
          animation: ws2Marquee 20s linear infinite;
        }
        .ws2-marquee-text {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.12);
          padding-right: 60px;
        }
        @media (max-width: 960px) {
          .ws2-content {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 0 20px;
          }
          .ws2-speaker-card { order: 0; }
          .ws2-center { order: -1; }
          .ws2-photo-wrap {
            width: 200px;
            height: 250px;
          }
          .ws2-root {
            min-height: auto;
            padding: 36px 0 50px;
          }
        }
        @media (max-width: 640px) {
          .ws2-photo-wrap {
            width: 180px;
            height: 220px;
          }
          .ws2-headline {
            font-size: 1.3rem;
          }
        }
      `}</style>

      <div className="ws2-grid-mesh" />
      <div className="ws2-glow-center" />

      <div className="ws2-content">
        <div className="ws2-speaker-card">
          <div className="ws2-photo-wrap">
            <span className="ws2-speaker-badge ws2-badge-purple">Speaker</span>
            <img src={himanshuImg} alt="Utsav Tiwari" />
            <div className="ws2-photo-overlay" />
          </div>
          <div className="ws2-speaker-info">
            <div className="ws2-speaker-name">Utsav Tiwari</div>
            <div className="ws2-speaker-role">Senior CSM & CS Ops</div>
          </div>
        </div>

        <div className="ws2-center">
          <div className="ws2-live-label">
            <span className="ws2-live-dot" />
            Live Webinar
          </div>
          <div className="ws2-headline">
            Customer Success<br />
            <span className="ws2-gradient">in the Age of AI</span><br />
            What Will Change in the Next 3 Years
          </div>
          <div className="ws2-date-box">
            <div className="ws2-date-text">2nd May, 2026</div>
            <div className="ws2-time-text">12:00 PM – 1:00 PM IST</div>
          </div>
          <div className="ws2-free-label">— Free & Live Session —</div>
          <button className="ws2-cta-btn" onClick={onRegister}>
            Register Now <ArrowRight size={18} />
          </button>
        </div>

        <div className="ws2-speaker-card">
          <div className="ws2-photo-wrap">
            <span className="ws2-speaker-badge ws2-badge-teal">Speaker</span>
            <img src={preritImg} alt="Dhiraj Patel" />
            <div className="ws2-photo-overlay" />
          </div>
          <div className="ws2-speaker-info">
            <div className="ws2-speaker-name">Dhiraj Patel</div>
            <div className="ws2-speaker-role">Founder & CEO · RetainSure</div>
          </div>
        </div>
      </div>

      <div className="ws2-marquee-wrap">
        <div className="ws2-marquee-track">
          <span className="ws2-marquee-text">Skill Veda · Career Growth · AI · SaaS · skillveda.ai · Skill Veda · Career Growth · AI · SaaS · skillveda.ai · Skill Veda · Career Growth · AI · SaaS · skillveda.ai · Skill Veda · Career Growth · AI · SaaS · skillveda.ai</span>
          <span className="ws2-marquee-text">Skill Veda · Career Growth · AI · SaaS · skillveda.ai · Skill Veda · Career Growth · AI · SaaS · skillveda.ai · Skill Veda · Career Growth · AI · SaaS · skillveda.ai · Skill Veda · Career Growth · AI · SaaS · skillveda.ai</span>
        </div>
      </div>
    </div>
  );
}
