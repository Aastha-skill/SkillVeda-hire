import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, MapPin, Briefcase, Upload, Share2, X, Check, Gift, AlertTriangle } from "lucide-react";
import { SiLinkedin } from "react-icons/si";

interface JobDetails {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  benefits: string[];
  keyRequirement: string;
  responsibilities?: string[];
  requirements?: string[];
  whyJoinUs?: string[];
  whatYoullGain?: string[];
  aboutOpportunity?: string;
  iconBg: string;
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobDetails | null;
}

export default function ApplyModal({ isOpen, onClose, job }: ApplyModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    educationLevel: "",
    experience: "",
    currentCtc: ""
  });

  if (!job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      setResumeError(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('educationLevel', formData.educationLevel);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('currentCtc', formData.currentCtc);
      formDataToSend.append('jobTitle', job.title);
      formDataToSend.append('company', job.company);
      formDataToSend.append('resume', resumeFile);

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setIsSuccess(true);
      toast({
        title: "Application Submitted!",
        description: `Your application for ${job.title} at ${job.company} has been received.`,
      });
      
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setResumeFile(null);
    setResumeError(false);
    setFormData({ name: "", email: "", phone: "", educationLevel: "", experience: "", currentCtc: "" });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeError(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setResumeFile(file);
      setResumeError(false);
    }
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this opportunity: ${job.title} at ${job.company}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const responsibilities = job.responsibilities || [
    "Help customers and HR teams use their health insurance & wellness benefits seamlessly.",
    "Own post-onboarding relationships and ensure top-tier support and satisfaction.",
    "Communicate across chat, email, and phone with empathy and problem-solving focus.",
    "Collaborate with internal teams & insurance partners to ensure quick resolution.",
    "Meet SLAs for response time, accuracy, and issue resolution.",
    "Identify customer patterns and share insights to improve internal processes.",
    "Drive 100% retention through an extraordinary customer experience."
  ];

  const requirements = job.requirements || [
    "Graduate in any discipline (Postgraduates not eligible).",
    "Excellent English communication (verbal & written) is mandatory.",
    "Strong ownership mindset and ability to think on your feet.",
    "Tech-comfortable: tools like Intercom, Slack, Freshdesk, Hubspot, or Google Suite.",
    "A genuine passion for helping people and solving problems."
  ];

  const whatYoullGain = job.whatYoullGain || job.benefits;

  const whyJoinUs = job.whyJoinUs || [
    `${job.company}'s Customer Success team is growing rapidly — having doubled in size last year while scaling 10x in customer numbers.`
  ];

  const aboutOpportunity = job.aboutOpportunity || 
    `We're looking for passionate ${job.title}s (Entry-Level) who are eager to help customers succeed, solve real business challenges, and grow alongside one of India's fastest-scaling SaaS startups in the healthtech space — ${job.company}.\n\nThis is a work-integrated role in partnership with Skill Veda, where you'll pursue a PGDM in Customer Success Management while gaining real-world experience at ${job.company}.\n\nIt's the perfect launchpad for someone who wants to build a long-term career in Customer Success, Client Relations, or SaaS Account Management.`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {isSuccess ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Application Sent!</h3>
            <p className="text-gray-500">We'll be in touch soon.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Job Details */}
            <div className="flex-1 p-6 lg:p-8 border-r border-gray-100 overflow-y-auto max-h-[80vh]">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${job.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shareOnLinkedIn}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    data-testid="button-share-linkedin"
                  >
                    <Share2 className="h-4 w-4" />
                    Share on LinkedIn
                  </Button>
                </div>
              </div>

              {/* Job Meta */}
              <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-gray-100 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                  {job.type}
                </div>
                <div className="flex items-center">
                  {job.salary} per annum (includes PF, PGDM fees of 6,666, & 10% variable pay)
                </div>
              </div>

              {/* About This Opportunity */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About This Opportunity</h3>
                <div className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {aboutOpportunity}
                </div>
              </div>

              {/* Why Join Us */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Why Join Us:</h3>
                {whyJoinUs.map((item, idx) => (
                  <p key={idx} className="text-gray-600 mb-2">{item}</p>
                ))}
              </div>

              {/* You'll */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">You'll:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>Work directly with CXOs and decision-makers from India's top startups.</li>
                  <li>Learn how high-growth SaaS companies manage clients, retention, and expansion.</li>
                  <li>Be part of a team that combines empathy, analytics, and strategy to deliver exceptional outcomes.</li>
                </ul>
              </div>

              {/* Your Key Responsibilities */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Your Key Responsibilities:</h3>
                <ul className="space-y-2 text-gray-600">
                  {responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>

              {/* What We're Looking For */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">What We're Looking For</h3>
                <ul className="space-y-2 text-gray-600">
                  {requirements.slice(0, -1).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
                
                {/* Note Box */}
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-sm">
                    Note: Pursuing the PGDM (Post Graduate Diploma in Management) through Skill Veda alongside this role is mandatory and non-negotiable.
                  </p>
                </div>
              </div>

              {/* What You'll Gain */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">What You'll Gain:</h3>
                <ul className="space-y-2 text-gray-600">
                  {whatYoullGain.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                  <li>Career progression opportunities into Senior CSM / Account Manager roles within 12-18 months.</li>
                  <li>Dynamic, growth-oriented environment focused on skill development and ownership.</li>
                </ul>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills Required */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Skills Required</h3>
                <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                  {job.keyRequirement}
                </div>
              </div>

              {/* Benefits & Perks */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Benefits & Perks</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <Gift className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-gray-600">
                    <Gift className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Career progression opportunities into Senior CSM / Account Manager roles within 12–18 months.</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <Gift className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Dynamic, growth-oriented environment focused on skill development and ownership.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Application Form */}
            <div className="w-full lg:w-96 p-6 lg:p-8 bg-white sticky top-0">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Apply for This Position</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="border-gray-300"
                    data-testid="input-apply-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="border-gray-300"
                    data-testid="input-apply-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="border-gray-300"
                    data-testid="input-apply-phone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level *</Label>
                  <Input
                    id="educationLevel"
                    required
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    placeholder="e.g., 12th Grade, Bachelor's in Engineering"
                    className="border-gray-300"
                    data-testid="input-apply-education"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume *</Label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${resumeError ? 'border-red-400 bg-red-50' : resumeFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    data-testid="dropzone-resume"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="input-apply-resume"
                    />
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{resumeFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PDF, DOC up to 5MB</p>
                      </>
                    )}
                  </div>
                  {resumeError && (
                    <p className="text-sm text-red-500">Please upload your resume to continue</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience *</Label>
                  <Input
                    id="experience"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 2 years, 6 months, Fresh Graduate"
                    className="border-gray-300"
                    data-testid="input-apply-experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCtc">Current CTC *</Label>
                  <Input
                    id="currentCtc"
                    required
                    value={formData.currentCtc}
                    onChange={(e) => setFormData({ ...formData, currentCtc: e.target.value })}
                    placeholder="e.g., 3.5 LPA, 50,000/month, Fresh Graduate"
                    className="border-gray-300"
                    data-testid="input-apply-ctc"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-6 rounded-lg"
                  disabled={isSubmitting}
                  data-testid="button-submit-application"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
