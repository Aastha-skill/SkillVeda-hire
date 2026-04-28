import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { insertJobSchema } from "@shared/schema";
import type { InsertJob, Job } from "@shared/schema";
import { Plus, X, Building, MapPin, DollarSign, Trash2, Calendar } from "lucide-react";
import { z } from "zod";

const jobFormSchema = insertJobSchema.extend({
  responsibilities: z.array(z.string()).min(1, "At least one responsibility is required"),
  requirements: z.array(z.string()).min(1, "At least one requirement is required"),
  benefits: z.array(z.string()).min(1, "At least one benefit is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

export default function Admin() {
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [skills, setSkills] = useState<string[]>([""]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch existing jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Check localStorage directly for immediate authentication status
  const isAuthenticated = isAdmin || localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    // Only redirect if definitely not authenticated
    if (!isAuthenticated) {
      setLocation("/secret-admin-portal");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Checking authentication...</div>;
  }

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "",
      salary: "",
      description: "",
      responsibilities: [""],
      requirements: [""],
      benefits: [""],
      skills: [""],
      domain: "",
      experienceLevel: "",
      isActive: true,
      icon: "fas fa-briefcase",
      iconColor: "blue"
    },
  });

  const createJob = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-password": "skillveda2024"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create job");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully!",
        description: "The job opening has been created and is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      form.reset();
      setResponsibilities([""]);
      setRequirements([""]);
      setBenefits([""]);
      setSkills([""]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post job",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Delete job mutation
  const deleteJob = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "admin-password": "skillveda2024"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job deleted successfully!",
        description: "The job opening has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete job",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    const jobData = {
      ...data,
      responsibilities: responsibilities.filter(r => r.trim() !== ""),
      requirements: requirements.filter(r => r.trim() !== ""),
      benefits: benefits.filter(b => b.trim() !== ""),
      skills: skills.filter(s => s.trim() !== ""),
    };
    createJob.mutate(jobData);
  };

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ""]);
  };

  const removeField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const generateLinkedInPost = () => {
    const formData = form.getValues();
    const jobUrl = `${window.location.origin}/jobs`;
    
    const linkedInText = `🚀 Exciting Work-Integrated Learning Opportunity at ${formData.company}!

We're hiring for: ${formData.title}
📍 Location: ${formData.location}
💰 Package: ${formData.salary}
🎯 Experience: ${formData.experienceLevel}

This unique program combines:
✅ Competitive salary while studying
✅ Real industry experience
✅ Fully sponsored degree program
✅ No student debt

Apply now: ${jobUrl}

#WorkIntegratedLearning #SkillVeda #CareerOpportunity #${formData.domain} #HiringNow`;

    const encodedText = encodeURIComponent(linkedInText);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&text=${encodedText}`;
    
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Job Posting Dashboard</h1>
          <p className="text-muted-foreground">Create and manage work-integrated learning opportunities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Existing Jobs Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Manage Job Openings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  <div className="h-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-20 bg-muted rounded animate-pulse"></div>
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {job.salary}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary" className="text-xs">{job.domain}</Badge>
                            <Badge variant="outline" className="text-xs">{job.experienceLevel}</Badge>
                            <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                              {job.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="ml-4">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Job Opening</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{job.title}" at {job.company}? 
                                This action cannot be undone and will remove all associated applications.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteJob.mutate(job.id)}
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={deleteJob.isPending}
                              >
                                {deleteJob.isPending ? "Deleting..." : "Delete Job"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No job openings posted yet</p>
                  <p className="text-sm">Create your first job opening using the form</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Creation Form */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Post New Job Opening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Software Engineer - Work Integrated Learning" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. TechCorp Solutions" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Bangalore, India" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Package *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ₹4-6 LPA + Education" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fresher">Fresher</SelectItem>
                            <SelectItem value="0-1 years">0-1 years</SelectItem>
                            <SelectItem value="1-3 years">1-3 years</SelectItem>
                            <SelectItem value="3-5 years">3-5 years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4}
                          placeholder="Describe the work-integrated learning opportunity..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dynamic Lists */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Responsibilities *</Label>
                    {responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <Input
                          value={responsibility}
                          onChange={(e) => updateField(index, e.target.value, setResponsibilities)}
                          placeholder="Enter responsibility"
                        />
                        {responsibilities.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeField(index, setResponsibilities)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addField(setResponsibilities)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Responsibility
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Requirements *</Label>
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <Input
                          value={requirement}
                          onChange={(e) => updateField(index, e.target.value, setRequirements)}
                          placeholder="Enter requirement"
                        />
                        {requirements.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeField(index, setRequirements)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addField(setRequirements)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Requirement
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Benefits *</Label>
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <Input
                          value={benefit}
                          onChange={(e) => updateField(index, e.target.value, setBenefits)}
                          placeholder="Enter benefit"
                        />
                        {benefits.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeField(index, setBenefits)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addField(setBenefits)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Benefit
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Skills & Technologies *</Label>
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <Input
                          value={skill}
                          onChange={(e) => updateField(index, e.target.value, setSkills)}
                          placeholder="Enter skill or technology"
                        />
                        {skills.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeField(index, setSkills)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addField(setSkills)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={createJob.isPending}
                  >
                    {createJob.isPending ? "Posting Job..." : "Post Job Opening"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={generateLinkedInPost}
                    className="flex-1"
                  >
                    Share on LinkedIn
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}