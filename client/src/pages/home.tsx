import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Users, Building2, TrendingUp, Star, GraduationCap, Target, Handshake, Rocket, ArrowRight, CheckCircle, Sparkles, ChevronLeft, ChevronRight, Quote, Clock, Zap, Award, Briefcase, UserCheck, Play, Loader2, X } from "lucide-react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/footer";
import CompanyRibbon from "@/components/company-ribbon";
import CounsellingPopup from "@/components/counselling-popup";
import WebinarPopup from "@/components/webinar-popup";
import ParticleBackground from "@/components/particle-background";
import StatsBar from "@/components/stats-bar";
import HeroCarousel from "@/components/hero-carousel";
import WebinarSlide from "@/components/webinar-slide";
import nileshImg from "@assets/IMG_0238_1774946197976.jpeg";
import saurabhTImg from "@assets/c135d750-c524-4abd-94a5-567397b57230_1774246673971.jpeg";
import himanshuImg from "@assets/IMG_0092_1772886630766.jpeg";
import sahibaImg from "@assets/0d97420e-8d76-41cf-89e0-9e096f4a2817_1774858452895.jpeg";
import preritImg from "@assets/IMG_0095_1772886708833.jpeg";
import shauryaImg from "@assets/IMG_0096_1772886818528.jpeg";
import saurabhImg from "@assets/IMG_0099_1772886891276.jpeg";
import vaibhavImg from "@assets/IMG_0097_1772886984146.jpeg";
import gunjanImg from "@assets/f1931e00-faa5-41be-b2bf-db8f322831b2_1772887229342.jpeg";
import krishnaImg from "@assets/WhatsApp_Image_2026-04-13_at_1.19.17_PM_1776077374835.jpeg";
import patriciaImg from "@assets/WhatsApp_Image_2026-04-13_at_12.34.47_PM_1776077374835.jpeg";
import saurabhSImg from "@assets/WhatsApp_Image_2026-04-23_at_2.54.40_PM_1776936399712.jpeg";
import shwetaImg from "@assets/WhatsApp_Image_2026-04-23_at_2.54.40_PM-2_1776936399712.jpeg";
import shubhamImg from "@assets/63ed68f5-a6f4-47a2-8c88-90a17a58f9bd_1772887369377.jpeg";
import yashoImg from "@assets/cd4939ef-96ea-4525-889a-2c0ba73f03c9_1772887709524.jpeg";
import logoFlexiple from "@assets/681d7392-00f3-4c88-9b4c-6ce975f29fdc_1772888365785.jpeg";
import logoRippling from "@assets/46204ff2-d095-4742-9631-3f64ab6d7c8e_1772888365785.jpeg";
import logoDeutscheBank from "@assets/8ee9d187-c8c1-4581-891a-611ee6e48aca_1772888365785.jpeg";
import logoAdobe from "@assets/ae1e65a9-a2e0-4ded-aa48-a9acb2180528_1772888365785.jpeg";
import logoOyo from "@assets/7bb428a7-a2f9-41cc-bbef-dd615eee9134_1772888365785.jpeg";
import logoSkillVeda from "@assets/skill veda final-01 (3)_1750160992799.jpg";
import logoSamagra from "@assets/3a148469-a911-4a1b-98ce-e85fedf07319_1772889077931.jpeg";
import logoAltCarbon from "@assets/c92d03bc-f4d1-496b-ab8b-5be49ba59a4f_1772889077931.jpeg";
import logoSpry from "@assets/spry-logo-generated.png";

const testimonials = [
  {
    name: "Priyanjali",
    role: "Customer Success Associate at TechCorp India",
    content: "What SkillVeda is doing is transformative. Learning while gaining real industry experience helped me grow confident and career-ready.",
    initial: "P"
  },
  {
    name: "Rishish Singappan",
    role: "Customer Success Associate at Even",
    content: "SkillVeda is one of the most innovative ideas I've seen. Offering degrees through integrated work programs not only boosts careers but also helps people improve and adapt to real-world challenges.",
    initial: "R"
  },
  {
    name: "Satyam Gupta",
    role: "Customer Success Associate",
    content: "SkillVeda is redefining how education and work come together. The integrated work-degree model is a brilliant approach that empowers learners to gain practical skills while advancing academically.",
    initial: "S"
  },
  {
    name: "Abhijit Chatterjee",
    role: "Customer Success Associate",
    content: "I'm really impressed by SkillVeda's approach. Learning while gaining real industry experience has helped me grow more confident and career-ready.",
    initial: "A"
  }
];

const mentors: { name: string; role: string; company: string; experience: string; color: string; initial: string; image?: string; linkedin?: string; companyLogo?: string }[] = [
  { name: "Himanshu Choudhary", role: "Sales Leader", company: "Rippling", experience: "9+ Years in SaaS Sales", color: "from-purple-700 to-purple-900", initial: "HC", image: himanshuImg, linkedin: "https://www.linkedin.com/in/h-choudhary/", companyLogo: logoRippling },
  { name: "Vaibhav Singh", role: "Financial Risk Reporting Analyst", company: "Deutsche Bank", experience: "7+ Years in Financial Risk Assessment | IIITB", color: "from-slate-600 to-gray-800", initial: "VS", image: vaibhavImg, linkedin: "https://www.linkedin.com/in/vaibzsingh/", companyLogo: logoDeutscheBank },
  { name: "Gunjan Sharma", role: "Senior Enterprise Customer Success Manager", company: "Adobe", experience: "11+ Years in Customer Success & Operations", color: "from-rose-500 to-pink-500", initial: "GS", image: gunjanImg, linkedin: "https://www.linkedin.com/in/gunjan-sharma-a2471499/", companyLogo: logoAdobe },
  { name: "Shubham Jagtap", role: "Business Consultant", company: "Samagra Consulting", experience: "3+ Years in Operations & Consulting | IIM Bangalore", color: "from-teal-500 to-cyan-600", initial: "SJ", image: shubhamImg, linkedin: "https://www.linkedin.com/in/shubh-jagtap/", companyLogo: logoSamagra },
  { name: "Yashovardhan Bhagat", role: "COO", company: "Alt Carbon", experience: "12+ Years in Operations, Revenue Management & Founding Teams | IIT Kanpur", color: "from-lime-600 to-green-700", initial: "YB", image: yashoImg, linkedin: "https://www.linkedin.com/in/yashovardhan-bhagat/", companyLogo: logoAltCarbon },
  { name: "Prerit Choudhary", role: "CEO", company: "Skill Veda", experience: "7+ Years in Customer Success & Revenue Management", color: "from-indigo-500 to-purple-600", initial: "PC", image: preritImg, companyLogo: logoSkillVeda },
  { name: "Shaurya Vats", role: "Director - OTA Partnerships & Revenue Management", company: "OYO Europe", experience: "8+ Years in Revenue Management | IIT BHU", color: "from-sky-500 to-blue-600", initial: "SV", image: shauryaImg, linkedin: "https://www.linkedin.com/in/shaurya-vats/", companyLogo: logoOyo },
  { name: "Saurabh Kulkarni", role: "Head of Operations", company: "Flexiple", experience: "6+ Years in SaaS Operations | IIM Kozhikode", color: "from-amber-500 to-yellow-500", initial: "SK", image: saurabhImg, companyLogo: logoFlexiple },
  { name: "Saurabh Tendulkar", role: "VP - Customer Success", company: "SPRY", experience: "Customer Success Leader", color: "from-violet-600 to-fuchsia-600", initial: "ST", image: saurabhTImg, linkedin: "https://www.linkedin.com/in/saurabh-tendulkar-74a00255", companyLogo: logoSpry },
  { name: "Saurabh S", role: "CX Global Operations", company: "Groupon", experience: "Customer Experience & Global Operations Leader", color: "from-green-500 to-emerald-600", initial: "SS", image: saurabhSImg },
  { name: "Shweta Kathuria", role: "Sr. Customer Success Specialist", company: "", experience: "Customer Success Specialist", color: "from-pink-500 to-rose-600", initial: "SK", image: shwetaImg },
];

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [webinarSubmitted, setWebinarSubmitted] = useState(false);
  const [showWebinarModal, setShowWebinarModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    graduationYear: "",
    interest: "",
    linkedinProfile: "",
  });
  const mentorScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const webinarMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/webinar-registrations", data);
      return res.json();
    },
    onSuccess: () => {
      setWebinarSubmitted(true);
      toast({ title: "Registered!", description: "You've successfully registered for the webinar." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to register", variant: "destructive" });
    },
  });

  const openWebinarModal = () => {
    setShowWebinarModal(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const handleWebinarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.college || !formData.graduationYear || !formData.interest) {
      toast({ title: "Missing fields", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    webinarMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col">
      <WebinarPopup />

      {/* Hero Carousel */}
      <HeroCarousel>
        {/* Slide 1 — Webinar Banner */}
        <WebinarSlide himanshuImg={saurabhSImg} preritImg={shwetaImg} onRegister={openWebinarModal} />

        {/* Slide 2 — Original Hero */}
        <section className="relative overflow-hidden flex items-center" style={{ background: "linear-gradient(135deg, #0f0a2e 0%, #1a1145 30%, #0d1b3e 60%, #0a0f2e 100%)", minHeight: "100%" }}>
          <ParticleBackground />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20">
                  <Play className="h-4 w-4 mr-2" />
                  FREE Live Webinar
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight font-heading">
                  The Fastest Way Into{" "}
                  <span className="text-yellow-300">AI</span> &{" "}
                  <span className="text-cyan-300">SaaS</span> Companies
                </h1>

                <p className="text-lg text-white/85 leading-relaxed">
                  This FREE Live Webinar will show you how students are entering SaaS & AI companies and building careers in Customer Success roles with up to <strong className="text-yellow-300">20 LPA</strong> salary.
                </p>

                <div className="space-y-3">
                  {[
                    "Understand the SaaS & AI job market",
                    "Learn the Customer Success career path",
                    "Discover companies hiring freshers",
                    "Live Q&A with industry mentors",
                  ].map((point) => (
                    <div key={point} className="flex items-center space-x-3 text-white/90">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button
                    size="lg"
                    onClick={openWebinarModal}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-full shadow-lg shadow-yellow-400/30 animate-pulse hover:animate-none text-base"
                  >
                    Join Upcoming Webinar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                    <span className="text-white/90 text-sm">📅 Friday, 25th April, 2026 · 12:00 PM – 1:00 PM IST</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Rocket className="h-20 w-20 text-white" />
                  </div>
                  <div className="absolute -top-4 -right-8 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex -space-x-3 mt-8">
                  {mentors.map((mentor) => (
                    <div
                      key={mentor.name}
                      className={`w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden flex-shrink-0 ${!mentor.image ? `bg-gradient-to-br ${mentor.color} flex items-center justify-center` : ""}`}
                    >
                      {mentor.image ? (
                        <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">{mentor.name[0]}</span>
                      )}
                    </div>
                  ))}
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/40 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">+5</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">Industry mentors guiding your career</p>
              </div>
            </div>
          </div>
        </section>
      </HeroCarousel>

      {/* Stats Bar */}
      <StatsBar />

      {/* Section 2 — Mentor Section */}
      <section className="py-20" style={{ background: "#fdf6e3" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#d4860b" }}>
                INTRODUCING THE MENTORS
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 font-heading">
                Learn From The Best
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => mentorScrollRef.current?.scrollBy({ left: -260, behavior: "smooth" })}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => mentorScrollRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div
            ref={mentorScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide pr-12 lg:pr-16"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {mentors.map((mentor) => (
              <div
                key={mentor.name}
                className="flex-shrink-0 w-56 sm:w-60 lg:w-[calc(25%-20px)] snap-start rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                style={{ background: "#f5e6d3" }}
              >
                <div className="relative flex items-center justify-center" style={{ background: mentor.image ? "transparent" : "linear-gradient(135deg, #f0dcc8 0%, #e8cdb3 100%)", aspectRatio: "3/4" }}>
                  {mentor.image ? (
                    <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${mentor.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-2xl lg:text-3xl">{mentor.initial}</span>
                    </div>
                  )}
                  <a
                    href={mentor.linkedin || "https://in.linkedin.com/company/skill-veda"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#0A66C2">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
                <div className="bg-white px-4 py-3">
                  <h3 className="text-sm font-bold text-gray-900">{mentor.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{mentor.role}</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-tight">{mentor.experience}</p>
                  {mentor.companyLogo ? (
                    <img src={mentor.companyLogo} alt={mentor.company} className="h-5 mt-2 object-contain rounded" />
                  ) : (
                    <p className="text-xs font-semibold mt-2" style={{ color: "#8B3CFF" }}>{mentor.company}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Company Logo Ribbon */}
      <CompanyRibbon title="Companies Hiring Customer Success Professionals" />

      {/* Section 4 — Career Opportunity Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-heading">
              Build a Career in High Growth SaaS & AI Companies
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Students can build rewarding careers in Customer Success, Account Management, SaaS Consulting, and Client Strategy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">High Salary Growth</h3>
                <p className="text-gray-600">Up to <strong>20 LPA</strong> packages for Customer Success professionals</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Industry Exposure</h3>
                <p className="text-gray-600">Work with fast-growing SaaS startups and leading AI companies</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <UserCheck className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mentorship</h3>
                <p className="text-gray-600">Guidance from industry experts who have been there and done that</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Webinar Registration Modal */}
      <Dialog open={showWebinarModal} onOpenChange={setShowWebinarModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            Register for the Free Webinar
          </DialogTitle>
          <p className="text-gray-600 text-center text-sm -mt-2">
            Learn how to enter AI companies and Customer Success careers
          </p>

          {webinarSubmitted ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Registration Completed!</h3>
              <p className="text-gray-600 text-sm">
                🎉 You're one step away! Our team will personally review your profile and confirm your seat if you're eligible. Keep an eye on your WhatsApp & Email!
              </p>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-amber-900">
                  🔔 Don't miss it! Save the date — <span className="text-orange-600">Friday, 25th April, 2026 · 12:00 PM IST</span>
                </p>
                <p className="text-xs font-semibold text-amber-700 mt-1">
                  Add it to your calendar so you don't forget!
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-800 text-center mb-2">Webinar Details</h4>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Date</p>
                    <p className="text-sm text-gray-600">Saturday, 11th April, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🕛</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Time</p>
                    <p className="text-sm text-gray-600">12:00 PM – 1:00 PM IST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">💻</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Platform</p>
                    <p className="text-sm text-gray-600">Zoom (link will be sent to your email)</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowWebinarModal(false)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-full"
              >
                Got it!
              </Button>
            </div>
          ) : (
            <form onSubmit={handleWebinarSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="font-medium text-sm">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-medium text-sm">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="font-medium text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="college" className="font-medium text-sm">College / University</Label>
                  <Input
                    id="college"
                    placeholder="Your college name"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="graduationYear" className="font-medium text-sm">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="text"
                    placeholder="Enter graduation year"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="interest" className="font-medium text-sm">What interests you most?</Label>
                  <Select value={formData.interest} onValueChange={(v) => setFormData({ ...formData, interest: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select your interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer-success">Customer Success Career Path</SelectItem>
                      <SelectItem value="saas-companies">Working in SaaS Companies</SelectItem>
                      <SelectItem value="ai-roles">AI Company Roles</SelectItem>
                      <SelectItem value="salary-growth">Salary Growth & Packages</SelectItem>
                      <SelectItem value="mentorship">Industry Mentorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="linkedinProfile" className="font-medium text-sm">LinkedIn Profile</Label>
                <Input
                  id="linkedinProfile"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinProfile}
                  onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={webinarMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-full shadow-lg text-base mt-1"
              >
                {webinarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Reserving your seat...
                  </>
                ) : (
                  <>
                    Reserve My Seat
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Section 6 — Enrol Program Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-heading">
              Explore Our Career Programs
            </h2>
            <p className="text-lg text-gray-600">
              Accelerate your career with industry-focused programs designed for results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white border-0 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500" />
              <CardContent className="p-8 space-y-5">
                <div className="inline-flex items-center px-3 py-1 bg-purple-50 rounded-full text-purple-600 text-xs font-semibold uppercase tracking-wide">
                  2-Year Program
                </div>
                <h3 className="text-2xl font-bold text-gray-900">PGDM in Customer Success & Key Account Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <GraduationCap className="h-5 w-5 text-purple-500 flex-shrink-0" />
                    <span>Post Graduate Diploma in Management</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Briefcase className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span>Work-integrated learning model</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Award className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Industry-recognized certification</span>
                  </div>
                </div>
                <Link href="/programs" onClick={() => window.scrollTo(0, 0)}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-full py-3 mt-2">
                    Explore Program
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
              <CardContent className="p-8 space-y-5">
                <div className="inline-flex items-center px-3 py-1 bg-orange-50 rounded-full text-orange-600 text-xs font-semibold uppercase tracking-wide">
                  2-Month Accelerator
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Customer Success Career Accelerator Program</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Target className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <span>Learn SaaS tools & frameworks</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Handshake className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span>Client management training</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <UserCheck className="h-5 w-5 text-purple-500 flex-shrink-0" />
                    <span>Industry mentorship included</span>
                  </div>
                </div>
                <Link href="/customer-success-program" onClick={() => window.scrollTo(0, 0)}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-full py-3 mt-2">
                    View Details
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 7 — Student Success Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-heading">
              Our Students Are Working With Top Companies
            </h2>
            <p className="text-lg text-gray-600">
              Hear from students who transformed their careers with SkillVeda
            </p>
          </div>

          <div className="relative">
            <Card className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <CardContent className="p-8 lg:p-10">
                <div className="text-purple-500 mb-6">
                  <Quote className="h-10 w-10" />
                </div>
                <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      {testimonials[currentTestimonial].initial}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</div>
                    <div className="text-gray-500 text-sm">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center mt-8 space-x-4">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? "w-8 bg-purple-600"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 — Final Call to Action */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 font-heading">
            Your Career in SaaS & AI Starts Here
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of students who are building their dream careers in top companies
          </p>
          <Button
            size="lg"
            onClick={openWebinarModal}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-10 py-6 rounded-full shadow-lg shadow-yellow-400/30 text-lg"
          >
            Join the Free Webinar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
