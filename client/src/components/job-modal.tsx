import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { insertApplicationSchema } from "@shared/schema";
import type { Job, InsertApplication } from "@shared/schema";
import { MapPin, Briefcase, IndianRupee, CheckCircle, X, Upload, Share2, Gift } from "lucide-react";
import { z } from "zod";

interface JobModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

const applicationFormSchema = insertApplicationSchema.extend({
  experience: z.string().min(1, "Experience is required"),
  currentCtc: z.string().min(1, "Current CTC is required"),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

export default function JobModal({ job, isOpen, onClose }: JobModalProps) {
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      jobId: job.id,
      fullName: "",
      email: "",
      phone: "",
      educationLevel: "",
      resumeUrl: "",
      experience: "",
      currentCtc: "",
    },
  });

  // Auto-populate form with student profile data
  useEffect(() => {
    const savedProfile = localStorage.getItem("studentProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        form.setValue("fullName", profile.fullName || "");
        form.setValue("email", profile.email || "");
        form.setValue("phone", profile.phone || "");
        form.setValue("educationLevel", profile.educationLevel || "");
        form.setValue("experience", profile.experience || "");
        form.setValue("currentCtc", profile.currentCtc || "");
        if (profile.resumeUrl) {
          form.setValue("resumeUrl", profile.resumeUrl);
        }
      } catch (error) {
        console.error("Error parsing student profile:", error);
      }
    }
  }, [form, isOpen]);

  const submitApplication = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const formData = new FormData();
      
      // Add all form fields to FormData
      formData.append('jobId', data.jobId.toString());
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('educationLevel', data.educationLevel);
      formData.append('experience', data.experience);
      formData.append('currentCtc', data.currentCtc);
      
      // Add resume file if selected
      if (selectedFile) {
        formData.append('resume', selectedFile);
      }
      
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });
      if (!response.ok) {
        throw new Error("Failed to submit application");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setApplicationSubmitted(true);
      toast({
        title: "Application submitted successfully!",
        description: "We'll review your application and get back to you within 2-3 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit application",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    // Validate that a resume file has been selected
    if (!selectedFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume before submitting the application",
        variant: "destructive",
      });
      return;
    }
    
    submitApplication.mutate(data);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, DOC, or DOCX file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      // For now, we'll just store the filename as the resume URL
      // In a real app, you'd upload to a file storage service
      form.setValue('resumeUrl', file.name);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setApplicationSubmitted(false);
    setSelectedFile(null);
    form.reset();
    onClose();
  };

  const shareOnLinkedIn = () => {
    const jobUrl = `${window.location.origin}/jobs/${job.id}`;
    const linkedInText = `🚀 Exciting Work-Integrated Learning Opportunity!

${job.title} at ${job.company}
📍 ${job.location}
💰 ${job.salary}
🎯 ${job.experienceLevel}

This unique program offers:
✅ Competitive salary while studying
✅ Real industry experience
✅ Fully sponsored degree program
✅ No student debt

Apply at SkillVeda: ${jobUrl}

#WorkIntegratedLearning #SkillVeda #CareerOpportunity #${job.domain} #HiringNow`;

    const encodedText = encodeURIComponent(linkedInText);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&text=${encodedText}`;
    
    window.open(linkedInUrl, '_blank');
  };

  const getIconColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-600",
      purple: "text-purple-600",
      pink: "text-pink-600",
      green: "text-green-600",
      orange: "text-orange-600",
      red: "text-red-600",
    };
    return colorMap[color] || "text-blue-600";
  };

  const getIconBgClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100",
      purple: "bg-purple-100",
      pink: "bg-pink-100",
      green: "bg-green-100",
      orange: "bg-orange-100",
      red: "bg-red-100",
    };
    return colorMap[color] || "bg-blue-100";
  };

  if (applicationSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground">
                Thank you for your interest. We'll review your application and get back to you within 2-3 business days.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90">
                Continue Browsing
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${getIconBgClass(job.iconColor)} rounded-xl flex items-center justify-center mx-auto sm:mx-0`}>
                <i className={`${job.icon} ${getIconColorClass(job.iconColor)} text-xl sm:text-2xl`}></i>
              </div>
              <div className="text-center sm:text-left">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">{job.title}</DialogTitle>
                <DialogDescription className="text-base sm:text-lg text-muted-foreground">{job.company}</DialogDescription>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground mt-2 space-y-1 sm:space-y-0">
                  <span className="flex items-center justify-center sm:justify-start space-x-1">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center justify-center sm:justify-start space-x-1">
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{job.type}</span>
                  </span>
                  <span className="flex items-center justify-center sm:justify-start space-x-1">
                    <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{job.salary}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={shareOnLinkedIn} className="text-xs sm:text-sm">
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Share on LinkedIn</span>
                <span className="sm:hidden">Share</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">About This Opportunity</h3>
              <div className="text-muted-foreground leading-relaxed space-y-3">
                {job.description.split('\n').map((line, index) => {
                  if (line.trim() === '') return null;
                  
                  // Check if line starts with bullet point
                  if (line.trim().startsWith('•')) {
                    return (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-secondary mt-1">•</span>
                        <span>{line.trim().substring(1).trim()}</span>
                      </div>
                    );
                  }
                  
                  // Check if line looks like a header (all caps or ends with colon)
                  if (line.trim().length > 0 && (line.trim().endsWith(':') || line.trim() === line.trim().toUpperCase())) {
                    return (
                      <h4 key={index} className="font-semibold text-foreground mt-4 mb-2">
                        {line.trim()}
                      </h4>
                    );
                  }
                  
                  // Regular paragraph
                  return (
                    <p key={index} className="text-sm">
                      {line.trim()}
                    </p>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">What You'll Do</h3>
              <ul className="space-y-2">
                {(job.responsibilities || []).map((responsibility, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Requirements</h3>
              <ul className="space-y-2">
                {(job.requirements || []).map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {(job.skills || []).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-secondary/10 text-secondary border border-secondary/20"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Benefits & Perks</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Gift className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Apply for This Position</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+91 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education Level *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 12th Grade, Bachelor's in Engineering, MBA, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <Label htmlFor="resume">Resume *</Label>
                      <div 
                        className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors duration-200 cursor-pointer mt-2"
                        onClick={handleFileClick}
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        {selectedFile ? (
                          <div>
                            <p className="text-sm text-foreground font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOC up to 5MB</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden" 
                          accept=".pdf,.doc,.docx" 
                        />
                      </div>
                      {!selectedFile && (
                        <p className="text-xs text-destructive mt-1">Please upload your resume to continue</p>
                      )}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 2 years, 6 months, Fresh Graduate"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currentCtc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current CTC *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 3.5 LPA, 50,000/month, Fresh Graduate"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={submitApplication.isPending}
                    >
                      {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
