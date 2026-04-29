import { useState, useEffect } from "react";
import { X, Calendar, Clock, Monitor } from "lucide-react";

const WEBINAR_DATE = "May 2, 2026";
const WEBINAR_TIME = "12:00 PM – 1:00 PM IST";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  graduationYear: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  qualification?: string;
  graduationYear?: string;
}

export default function WebinarPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    qualification: "",
    graduationYear: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const alreadyShown = localStorage.getItem("webinar-popup-shown");
    if (!alreadyShown) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setIsOpen(false);
    localStorage.setItem("webinar-popup-shown", "true");
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!formData.qualification) newErrors.qualification = "Please select your qualification";
    if (!formData.graduationYear) newErrors.graduationYear = "Please select your graduation year";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/webinar-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: `+91${formData.phone}`,
          college: formData.qualification,
          graduationYear: formData.graduationYear,
          interest: "webinar-popup",
        }),
      });
      if (!res.ok) throw new Error("Registration failed");
      localStorage.setItem("webinar-popup-shown", "true");
      setSubmitted(true);
    } catch {
      setErrors({ fullName: "Something went wrong. Please try again." });
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: "90vh", animation: "slideUp 0.3s ease-out" }}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        <div
          className="px-6 pt-6 pb-5 text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
            Free Webinar
          </span>
          <h2 className="text-xl font-bold leading-snug mb-2">
            Careers in AI & Customer Success
          </h2>
          <p className="text-white/80 text-sm mb-4">
            Discover how to start a high-growth career in AI and Customer Success in the SaaS industry.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-yellow-300 flex-shrink-0" />
              <span className="text-sm">{WEBINAR_DATE}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Clock className="h-4 w-4 text-yellow-300 flex-shrink-0" />
              <span className="text-sm">{WEBINAR_TIME}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Monitor className="h-4 w-4 text-yellow-300 flex-shrink-0" />
              <span className="text-sm">Online Webinar</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "calc(90vh - 260px)" }}>
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-bold text-gray-900">You're successfully registered!</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Webinar Date: <strong>{WEBINAR_DATE}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Time: <strong>{WEBINAR_TIME}</strong></span>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                We will share the webinar joining link with you before the session.
              </p>
              <button
                onClick={close}
                className="mt-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setErrors({ ...errors, fullName: undefined }); }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${errors.fullName ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-600 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={(e) => { setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }); setErrors({ ...errors, phone: undefined }); }}
                    className={`w-full px-4 py-2.5 border rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                <select
                  value={formData.qualification}
                  onChange={(e) => { setFormData({ ...formData, qualification: e.target.value }); setErrors({ ...errors, qualification: undefined }); }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none bg-white ${errors.qualification ? "border-red-400 bg-red-50" : "border-gray-200"} ${!formData.qualification ? "text-gray-400" : "text-gray-900"}`}
                >
                  <option value="" disabled>Select qualification</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's">Bachelor's</option>
                  <option value="Master's">Master's</option>
                  <option value="PhD">PhD</option>
                </select>
                {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation / Passing Out Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2024"
                  value={formData.graduationYear}
                  onChange={(e) => { setFormData({ ...formData, graduationYear: e.target.value }); setErrors({ ...errors, graduationYear: undefined }); }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${errors.graduationYear ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {errors.graduationYear && <p className="text-red-500 text-xs mt-1">{errors.graduationYear}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-200 mt-1 disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                {isSubmitting ? "Registering..." : "Reserve My Seat"}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
