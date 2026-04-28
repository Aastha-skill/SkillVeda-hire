import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/footer";
import CompanyRibbon from "@/components/company-ribbon";
import { X, Check, Upload, CheckCircle, MapPin, Briefcase, Clock } from "lucide-react";
import type { Job } from "@shared/schema";

const WHATSAPP_LINK = "https://chat.whatsapp.com/B74yk0TlvFi3FeC9UZckdx?mode=gi_t";

function getCandidate() {
  try {
    const info = localStorage.getItem("sv_candidate_info");
    return info ? JSON.parse(info) : null;
  } catch { return null; }
}

export default function Jobs() {
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<{ name: string; email: string; phone?: string } | null>(getCandidate());
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [locationFilter, setLocationFilter] = useState("All");
  const jobsSectionRef = useRef<HTMLDivElement>(null);

  const [regForm, setRegForm] = useState({ fullName: "", email: "", phone: "" });
  const [regSubmitting, setRegSubmitting] = useState(false);

  const [applyForm, setApplyForm] = useState({ fullName: "", email: "", phone: "", educationLevel: "", experience: "", currentCtc: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: dbJobs } = useQuery<Job[]>({ queryKey: ["/api/jobs"] });

  const jobs = dbJobs?.filter(j => j.isActive) || [];

  const filteredJobs = locationFilter === "All"
    ? jobs
    : jobs.filter(j => j.location.toLowerCase().includes(locationFilter.toLowerCase()));

  const locationTabs = ["All", ...Array.from(new Set(jobs.map(j => {
    const loc = j.location.split(",")[0].trim();
    return loc;
  })))];

  useEffect(() => {
    const token = localStorage.getItem("sv_candidate_token");
    if (!token) {
      setTokenValid(false);
      return;
    }
    fetch("/api/candidate/verify-token", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setTokenValid(true);
          if (data.candidate) {
            setCandidate(data.candidate);
          }
        } else {
          setTokenValid(false);
          localStorage.removeItem("sv_candidate_token");
          localStorage.removeItem("sv_candidate_info");
          setCandidate(null);
        }
      })
      .catch(() => setTokenValid(false));
  }, []);

  useEffect(() => {
    if (tokenValid === false && !candidate) {
      const timer = setTimeout(() => setShowRegModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [tokenValid, candidate]);

  const handleSignOut = () => {
    localStorage.removeItem("sv_candidate_token");
    localStorage.removeItem("sv_candidate_info");
    setCandidate(null);
    setTokenValid(false);
    window.location.reload();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.email || !regForm.phone) return;
    setRegSubmitting(true);
    try {
      const res = await fetch("/api/candidate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem("sv_candidate_token", data.token);
      localStorage.setItem("sv_candidate_info", JSON.stringify(data.candidate));
      setCandidate(data.candidate);
      setTokenValid(true);
      setShowRegModal(false);
      toast({ title: "Welcome!", description: "Your profile has been created." });
    } catch {
      toast({ title: "Registration failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setApplySuccess(false);
    setResumeFile(null);
    if (!candidate || tokenValid === false) {
      setShowRegModal(true);
    } else {
      setApplyForm({
        fullName: candidate.name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        educationLevel: "",
        experience: "",
        currentCtc: "",
      });
      setShowApplyModal(true);
    }
  };

  useEffect(() => {
    if (candidate && selectedJob && !showRegModal && !showApplyModal && !applySuccess) {
      setApplyForm({
        fullName: candidate.name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        educationLevel: "",
        experience: "",
        currentCtc: "",
      });
      setShowApplyModal(true);
    }
  }, [candidate]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !resumeFile) {
      toast({ title: "Resume required", description: "Please upload your resume.", variant: "destructive" });
      return;
    }
    setApplySubmitting(true);
    try {
      const fd = new FormData();
      fd.append("fullName", applyForm.fullName);
      fd.append("email", applyForm.email);
      fd.append("phone", applyForm.phone);
      fd.append("educationLevel", applyForm.educationLevel || "Not specified");
      fd.append("experience", applyForm.experience || "Not specified");
      fd.append("currentCtc", applyForm.currentCtc || "Not specified");
      fd.append("jobId", String(selectedJob.id));
      fd.append("jobTitle", selectedJob.title);
      fd.append("company", selectedJob.company);
      fd.append("resume", resumeFile);

      const res = await fetch("/api/applications", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");


      setApplySuccess(true);
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setApplySubmitting(false);
    }
  };

  const scrollToJobs = () => {
    jobsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen font-dm" style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--sv-ink)" }}>
      {candidate && tokenValid && (
        <div className="bg-[#0A0A0F] text-white flex items-center justify-between px-4 sm:px-8" style={{ height: 40 }}>
          <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            Welcome back, <span className="text-white font-medium">{candidate.name}</span> — your profile is active
          </span>
          <button onClick={handleSignOut} className="text-xs text-white/60 hover:text-white transition-colors duration-150">
            Sign out
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="bg-white" style={{ padding: "140px 24px 80px" }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--sv-purple)" }} />
            <span className="uppercase tracking-[1.5px] text-[11px] font-medium" style={{ color: "var(--sv-muted)" }}>
              Work-Integrated Program
            </span>
          </div>

          <h1 className="font-instrument" style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 400, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 24 }}>
            Get Hired. Earn a Salary.<br />
            <span className="italic" style={{ color: "var(--sv-purple)" }}>Earn Your PGDM.</span>
          </h1>

          <p className="mx-auto" style={{ fontSize: 17, color: "var(--sv-muted)", maxWidth: 460, lineHeight: 1.6, marginBottom: 48 }}>
            Apply to a Customer Success role at a top SaaS company. Get assessed. Get placed. Your degree runs alongside — all in 12 months.
          </p>

          {/* 4 Steps */}
          <div className="flex items-center justify-center gap-0 max-w-[900px] mx-auto mb-12 flex-wrap sm:flex-nowrap">
            {[
              { num: 1, title: "Apply", desc: "Browse and apply to open roles" },
              { num: 2, title: "Assessment", desc: "Complete an AI evaluation" },
              { num: 3, title: "Review", desc: "Our team reviews your profile" },
              { num: 4, title: "Placement", desc: "We match you to a company" },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center text-center" style={{ minWidth: 140 }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2"
                    style={{
                      background: step.num === 1 ? "var(--sv-ink)" : "white",
                      color: step.num === 1 ? "white" : "var(--sv-ink)",
                      border: step.num === 1 ? "none" : "1px solid var(--sv-border-mid)",
                    }}
                  >
                    {step.num}
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: "var(--sv-ink)" }}>{step.title}</span>
                  <span className="text-[11px]" style={{ color: "var(--sv-muted)", maxWidth: 120 }}>{step.desc}</span>
                </div>
                {i < 3 && (
                  <div className="hidden sm:block h-px w-12 mx-1" style={{ background: "var(--sv-border-mid)" }} />
                )}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg text-white font-medium transition-all duration-150 hover:opacity-90"
              style={{ background: "var(--sv-ink)", padding: "13px 28px", fontSize: 14 }}
            >
              Join our Customer Success Community
            </a>
            <button
              onClick={scrollToJobs}
              className="text-sm font-medium transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--sv-muted)" }}
            >
              Learn how it works ↓
            </button>
          </div>
        </div>
      </section>

      <CompanyRibbon title="Our Hiring Partners" titleClassName="font-instrument text-center mb-10" titleStyle={{ fontSize: 38, fontWeight: 400, letterSpacing: "-1px", color: "var(--sv-ink)" }} />

      {/* STATS STRIP */}
      <section style={{ background: "var(--sv-off-white)", borderTop: "1px solid var(--sv-border)", borderBottom: "1px solid var(--sv-border)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-5">
          {[
            { num: "50+", label: "Hiring partners" },
            { num: "85%", label: "Placement rate" },
            { num: "₹8 LPA", label: "Average salary" },
            { num: "12 mo", label: "Duration" },
            { num: "Day 1", label: "Employment" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-6"
              style={{ borderRight: i < 4 ? "1px solid var(--sv-border)" : "none" }}
            >
              <span className="font-instrument" style={{ fontSize: 36, fontWeight: 400, color: "var(--sv-ink)" }}>{stat.num}</span>
              <span className="text-[12px] font-medium" style={{ color: "var(--sv-muted)" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* JOBS LISTING */}
      <section ref={jobsSectionRef} style={{ padding: "80px 24px" }}>
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="uppercase tracking-[1.5px] text-[11px] font-medium" style={{ color: "var(--sv-muted)" }}>
                Open Roles
              </span>
              <h2 className="font-instrument" style={{ fontSize: 38, fontWeight: 400, letterSpacing: "-1px", color: "var(--sv-ink)" }}>
                {filteredJobs.length} {filteredJobs.length === 1 ? "opportunity" : "opportunities"}
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {locationTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setLocationFilter(tab)}
                  className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150"
                  style={{
                    background: locationFilter === tab ? "var(--sv-ink)" : "transparent",
                    color: locationFilter === tab ? "white" : "var(--sv-muted)",
                    border: locationFilter === tab ? "none" : "1px solid var(--sv-border-mid)",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Job Grid */}
          {filteredJobs.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 overflow-hidden"
              style={{
                gap: 1,
                background: "var(--sv-border)",
                border: "1px solid var(--sv-border)",
                borderRadius: 16,
              }}
            >
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white transition-colors duration-150 hover:bg-[#FAFAF9]"
                  style={{ padding: 32 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ border: "1px solid var(--sv-border-mid)", color: job.iconColor || "var(--sv-ink)", background: "var(--sv-off-white)" }}
                      >
                        {job.icon ? <i className={job.icon} /> : job.company.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[12px]" style={{ color: "var(--sv-muted)" }}>{job.company}</p>
                        <h3 className="font-instrument" style={{ fontSize: 20, fontWeight: 400 }}>{job.title}</h3>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px]"
                      style={{ border: "1px solid var(--sv-border)", color: "var(--sv-muted)" }}>
                      <MapPin className="w-3 h-3" />{job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px]"
                      style={{ border: "1px solid var(--sv-border)", color: "var(--sv-muted)" }}>
                      <Briefcase className="w-3 h-3" />{job.type}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium"
                      style={{ background: "#FEF3C7", color: "#92400E" }}>
                      {job.salary}
                    </span>
                  </div>

                  <button
                    onClick={() => handleApplyClick(job)}
                    className="w-full py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 border hover:bg-[var(--sv-ink)] hover:text-white"
                    style={{ borderColor: "var(--sv-border-mid)", color: "var(--sv-ink)", background: "white" }}
                  >
                    Apply Now →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: "var(--sv-muted)" }}>No openings match this filter.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* REGISTRATION MODAL */}
      {showRegModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,10,15,0.5)", backdropFilter: "blur(12px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRegModal(false); }}
        >
          <div
            className="bg-white w-full relative"
            style={{
              maxWidth: 460,
              borderRadius: 20,
              animation: "svSlideUp 0.3s ease forwards",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <style>{`@keyframes svSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <span className="text-[11px] font-medium" style={{ color: "var(--sv-muted)" }}>
                Free · One-time registration
              </span>
              <h2 className="font-instrument mt-2" style={{ fontSize: 28, fontWeight: 400 }}>
                Join our Customer Success Community
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--sv-muted)" }}>
                Create your profile once. Get access to all open roles, job updates, and free CS resources — forever.
              </p>

              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1" style={{ color: "var(--sv-ink)" }}>Full Name</label>
                  <input
                    required
                    value={regForm.fullName}
                    onChange={e => setRegForm({ ...regForm, fullName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-gray-400"
                    style={{ borderColor: "var(--sv-border-mid)" }}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1" style={{ color: "var(--sv-ink)" }}>Email</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-gray-400"
                    style={{ borderColor: "var(--sv-border-mid)" }}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1" style={{ color: "var(--sv-ink)" }}>Phone</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none transition-colors focus:border-gray-400"
                    style={{ borderColor: "var(--sv-border-mid)" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="w-full py-3 rounded-lg text-white font-medium text-[14px] transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--sv-ink)" }}
                >
                  {regSubmitting ? "Joining..." : "Join Community & View Open Roles →"}
                </button>
              </form>

              <p className="text-center mt-4" style={{ fontSize: 11, color: "var(--sv-muted)" }}>
                By continuing you agree to our Terms
              </p>
            </div>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {showApplyModal && selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,10,15,0.5)", backdropFilter: "blur(12px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowApplyModal(false); setApplySuccess(false); } }}
        >
          <div
            className="bg-white w-full relative sv-desc-scroll"
            style={{
              maxWidth: 900,
              borderRadius: 20,
              animation: "svSlideUp 0.3s ease forwards",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => { setShowApplyModal(false); setApplySuccess(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header — full width */}
            <div className="flex items-center gap-3 p-6" style={{ borderBottom: "1px solid var(--sv-border)" }}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ border: "1px solid var(--sv-border-mid)", background: "var(--sv-off-white)", color: selectedJob.iconColor || "var(--sv-ink)" }}
              >
                {selectedJob.icon ? <i className={selectedJob.icon} /> : selectedJob.company.charAt(0)}
              </div>
              <div>
                <h3 className="font-instrument" style={{ fontSize: 18 }}>{selectedJob.title}</h3>
                <p className="text-[12px]" style={{ color: "var(--sv-muted)" }}>{selectedJob.company}</p>
              </div>
            </div>

            {applySuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-instrument" style={{ fontSize: 22 }}>Application Submitted!</h3>
                <p className="mt-2 text-[14px]" style={{ color: "var(--sv-muted)" }}>
                  We'll review your profile and reach out within 48 hours.
                </p>

                <div className="mt-5 p-4 rounded-xl text-left" style={{ background: "#F0FDF4", border: "1px solid #A7F3D0" }}>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--sv-ink)" }}>Stay ahead in Customer Success</p>
                  <p className="text-[12px] mt-1" style={{ color: "var(--sv-muted)" }}>
                    Get free webinars, CS job updates and career resources — join our WhatsApp community.
                  </p>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-3 py-2.5 rounded-lg text-white text-center text-[13px] font-medium transition-opacity hover:opacity-90"
                    style={{ background: "#25D366" }}
                  >
                    Join Customer Success Community →
                  </a>
                </div>

                <button
                  onClick={() => { setShowApplyModal(false); setApplySuccess(false); }}
                  className="mt-4 text-[13px] transition-colors"
                  style={{ color: "var(--sv-muted)" }}
                >
                  Maybe later
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row">
                {/* LEFT — Job Description (60%) */}
                <div className="w-full md:w-[60%] p-6">
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--sv-muted)", marginBottom: 10 }}>About this role</p>
                  <div
                    className="job-description-content"
                    dangerouslySetInnerHTML={{ __html: selectedJob.description || "<p>No description provided.</p>" }}
                  />
                </div>

                {/* RIGHT — Application Form (40%) */}
                <div className="w-full md:w-[40%] p-6 md:sticky md:top-0 md:self-start sv-apply-right" style={{ borderTop: "1px solid var(--sv-border)" }}>
                  <p className="font-medium text-[14px] mb-4" style={{ color: "var(--sv-ink)" }}>Apply for this role</p>
                  {candidate && (
                    <p className="text-[12px] mb-4 px-3 py-2 rounded-lg" style={{ background: "var(--sv-surface)", color: "var(--sv-muted)" }}>
                      Details pre-filled from your profile
                    </p>
                  )}
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1">Full Name</label>
                      <input
                        required
                        value={applyForm.fullName}
                        onChange={e => setApplyForm({ ...applyForm, fullName: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none focus:border-gray-400"
                        style={{ borderColor: "var(--sv-border-mid)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={applyForm.email}
                        onChange={e => setApplyForm({ ...applyForm, email: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none focus:border-gray-400"
                        style={{ borderColor: "var(--sv-border-mid)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        required
                        value={applyForm.phone}
                        onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none focus:border-gray-400"
                        style={{ borderColor: "var(--sv-border-mid)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1">Current CTC</label>
                      <input
                        value={applyForm.currentCtc}
                        onChange={e => setApplyForm({ ...applyForm, currentCtc: e.target.value })}
                        placeholder="e.g. 3 LPA or Fresher"
                        className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none focus:border-gray-400"
                        style={{ borderColor: "var(--sv-border-mid)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1">Years of Experience</label>
                      <input
                        value={applyForm.experience}
                        onChange={e => setApplyForm({ ...applyForm, experience: e.target.value })}
                        placeholder="e.g. 0-1 years or Fresher"
                        className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none focus:border-gray-400"
                        style={{ borderColor: "var(--sv-border-mid)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1">Resume</label>
                      <div
                        className="border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors"
                        style={{ borderColor: resumeFile ? "#A7F3D0" : "var(--sv-border-mid)", background: resumeFile ? "#F0FDF4" : "white" }}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setResumeFile(f); }}
                        onDragOver={e => e.preventDefault()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={e => { if (e.target.files?.[0]) setResumeFile(e.target.files[0]); }}
                        />
                        {resumeFile ? (
                          <div className="flex items-center justify-center gap-2 text-emerald-600 text-[13px]">
                            <CheckCircle className="w-4 h-4" />
                            {resumeFile.name}
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 mx-auto mb-1" style={{ color: "var(--sv-muted)" }} />
                            <p className="text-[13px]" style={{ color: "var(--sv-muted)" }}>PDF or DOC · 2MB max</p>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={applySubmitting}
                      className="w-full py-3 rounded-lg text-white font-medium text-[14px] transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
                      style={{ background: "var(--sv-ink)" }}
                    >
                      {applySubmitting ? "Submitting..." : "Submit application →"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
