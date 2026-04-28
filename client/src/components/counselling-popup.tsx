import { useState, useEffect } from "react";
import { X, Award, Phone } from "lucide-react";

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

export default function CounsellingPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    qualification: "",
    graduationYear: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const dismissed = sessionStorage.getItem("counselling-popup-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setIsOpen(false);
    sessionStorage.setItem("counselling-popup-dismissed", "true");
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

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

    if (!formData.qualification) {
      newErrors.qualification = "Please select your qualification";
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = "Please select your graduation year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await fetch("/api/webinar-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: `+91${formData.phone}`,
          college: formData.qualification,
          graduationYear: formData.graduationYear,
          interest: "free-counselling",
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up"
        style={{ maxHeight: "90vh" }}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        <div
          className="px-6 pt-6 pb-5 text-white"
          style={{ background: "linear-gradient(135deg, #1351b4, #0d3d8c)" }}
        >
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
            Free Counselling
          </span>
          <h2 className="text-xl font-bold leading-snug mb-1">
            Want to Break into SaaS & Customer Success?
          </h2>
          <p className="text-white/80 text-sm">
            Get a free 1:1 career roadmap from our expert
          </p>

          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">PS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Priya Sharma</p>
              <p className="text-white/70 text-xs">Senior Academic Counsellor</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-1 rounded-full flex-shrink-0">
              <Award className="h-3 w-3 text-yellow-300" />
              <span className="text-xs font-medium text-yellow-200">500+</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Thank You!</h3>
              <p className="text-gray-600 text-sm">
                Our counsellor Priya Sharma will reach out to you shortly. Keep your phone handy!
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
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.fullName ? "border-red-400 bg-red-50" : "border-gray-200"}`}
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
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`}
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
                    className={`w-full px-4 py-2.5 border rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                <select
                  value={formData.qualification}
                  onChange={(e) => { setFormData({ ...formData, qualification: e.target.value }); setErrors({ ...errors, qualification: undefined }); }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none bg-white ${errors.qualification ? "border-red-400 bg-red-50" : "border-gray-200"} ${!formData.qualification ? "text-gray-400" : "text-gray-900"}`}
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
                <select
                  value={formData.graduationYear}
                  onChange={(e) => { setFormData({ ...formData, graduationYear: e.target.value }); setErrors({ ...errors, graduationYear: undefined }); }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none bg-white ${errors.graduationYear ? "border-red-400 bg-red-50" : "border-gray-200"} ${!formData.graduationYear ? "text-gray-400" : "text-gray-900"}`}
                >
                  <option value="" disabled>Select year</option>
                  {Array.from({ length: 10 }, (_, i) => 2017 + i).map((year) => (
                    <option key={year} value={String(year)}>{year}</option>
                  ))}
                </select>
                {errors.graduationYear && <p className="text-red-500 text-xs mt-1">{errors.graduationYear}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-200 mt-1"
                style={{ background: "linear-gradient(135deg, #1351b4, #0d3d8c)" }}
              >
                Talk to a Counsellor — It's Free!
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
