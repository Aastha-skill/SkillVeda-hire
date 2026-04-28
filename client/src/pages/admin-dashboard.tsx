import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Plus, X, Building, MapPin, DollarSign, Trash2, Calendar, LogOut, Edit3 } from "lucide-react";
import { z } from "zod";

const jobFormSchema = insertJobSchema;

type JobFormData = z.infer<typeof jobFormSchema>;

export default function AdminDashboard() {
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [skills, setSkills] = useState<string[]>([""]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Check authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAdmin') === 'true';
      setIsAuthenticated(authStatus);
      if (!authStatus) {
        console.log('Not authenticated, redirecting to login');
        setLocation("/secret-admin-portal");
      } else {
        console.log('User is authenticated');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Fetch existing jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setLocation("/");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin dashboard",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the admin dashboard</p>
          <Button onClick={() => setLocation("/secret-admin-portal")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
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
      domain: "",
      experienceLevel: "",
      responsibilities: [],
      requirements: [],
      benefits: [],
      skills: [],
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-password": "skillveda2024",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create job");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job created successfully!",
        description: "The job posting has been added to the platform.",
      });
      form.reset();
      setResponsibilities([""]);
      setRequirements([""]);
      setBenefits([""]);
      setSkills([""]);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: any) => {
      console.error("Error creating job:", error);
      toast({
        title: "Error creating job",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: JobFormData }) => {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "admin-password": "skillveda2024",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update job");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job updated successfully!",
        description: "The job posting has been updated.",
      });
      setEditingJob(null);
      form.reset();
      setResponsibilities([""]);
      setRequirements([""]);
      setBenefits([""]);
      setSkills([""]);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: any) => {
      console.error("Error updating job:", error);
      toast({
        title: "Error updating job",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "admin-password": "skillveda2024",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job deleted successfully!",
        description: "The job posting has been removed from the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: any) => {
      console.error("Error deleting job:", error);
      toast({
        title: "Error deleting job",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Editing job state:", editingJob);
    console.log("Responsibilities state:", responsibilities);
    console.log("Requirements state:", requirements);
    console.log("Benefits state:", benefits);
    console.log("Skills state:", skills);
    
    const jobData = {
      ...data,
      responsibilities: responsibilities.filter(r => r.trim() !== ""),
      requirements: requirements.filter(r => r.trim() !== ""),
      benefits: benefits.filter(b => b.trim() !== ""),
      skills: skills.filter(s => s.trim() !== ""),
    };
    
    console.log("Processed job data:", jobData);
    
    if (editingJob) {
      console.log("Calling update mutation for job ID:", editingJob.id);
      updateJobMutation.mutate({ id: editingJob.id, data: jobData });
    } else {
      console.log("Calling create mutation");
      createJobMutation.mutate(jobData);
    }
  };

  const editJob = (job: Job) => {
    console.log("Editing job:", job);
    setEditingJob(job);
    
    // Populate dynamic arrays first
    const jobResponsibilities = job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [""];
    const jobRequirements = job.requirements && job.requirements.length > 0 ? job.requirements : [""];
    const jobBenefits = job.benefits && job.benefits.length > 0 ? job.benefits : [""];
    const jobSkills = job.skills && job.skills.length > 0 ? job.skills : [""];
    
    setResponsibilities(jobResponsibilities);
    setRequirements(jobRequirements);
    setBenefits(jobBenefits);
    setSkills(jobSkills);
    
    // Populate form with job data including the arrays
    form.reset({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      domain: job.domain,
      experienceLevel: job.experienceLevel,
      responsibilities: jobResponsibilities,
      requirements: jobRequirements,
      benefits: jobBenefits,
      skills: jobSkills,
    });
  };

  const cancelEdit = () => {
    setEditingJob(null);
    form.reset();
    setResponsibilities([""]);
    setRequirements([""]);
    setBenefits([""]);
    setSkills([""]);
  };

  const addField = (type: 'responsibilities' | 'requirements' | 'benefits' | 'skills') => {
    switch (type) {
      case 'responsibilities':
        setResponsibilities([...responsibilities, ""]);
        break;
      case 'requirements':
        setRequirements([...requirements, ""]);
        break;
      case 'benefits':
        setBenefits([...benefits, ""]);
        break;
      case 'skills':
        setSkills([...skills, ""]);
        break;
    }
  };

  const removeField = (type: 'responsibilities' | 'requirements' | 'benefits' | 'skills', index: number) => {
    switch (type) {
      case 'responsibilities':
        setResponsibilities(responsibilities.filter((_, i) => i !== index));
        break;
      case 'requirements':
        setRequirements(requirements.filter((_, i) => i !== index));
        break;
      case 'benefits':
        setBenefits(benefits.filter((_, i) => i !== index));
        break;
      case 'skills':
        setSkills(skills.filter((_, i) => i !== index));
        break;
    }
  };

  const updateField = (type: 'responsibilities' | 'requirements' | 'benefits' | 'skills', index: number, value: string) => {
    switch (type) {
      case 'responsibilities':
        const newResponsibilities = [...responsibilities];
        newResponsibilities[index] = value;
        setResponsibilities(newResponsibilities);
        break;
      case 'requirements':
        const newRequirements = [...requirements];
        newRequirements[index] = value;
        setRequirements(newRequirements);
        break;
      case 'benefits':
        const newBenefits = [...benefits];
        newBenefits[index] = value;
        setBenefits(newBenefits);
        break;
      case 'skills':
        const newSkills = [...skills];
        newSkills[index] = value;
        setSkills(newSkills);
        break;
    }
  };

  const shareOnLinkedIn = (job: Job) => {
    const text = `🚀 New Job Opportunity at ${job.company}!\n\n${job.title}\n📍 ${job.location}\n💰 ${job.salary}\n\n${job.description.substring(0, 200)}...\n\nApply now on SkillVeda! #Jobs #Hiring #Career`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/jobs')}&mini=true`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">SkillVeda Admin</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create/Edit Job Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>{editingJob ? "Edit Job" : "Create New Job"}</span>
                </div>
                {editingJob && (
                  <Button variant="outline" size="sm" onClick={cancelEdit}>
                    Cancel Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.log("Form validation errors:", errors);
                })} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
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
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Tech Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco, CA" {...field} />
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
                          <FormLabel>Job Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary</FormLabel>
                          <FormControl>
                            <Input placeholder="$80,000 - $120,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Technology">Technology</SelectItem>
                              <SelectItem value="Healthcare">Healthcare</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Education">Education</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Design">Design</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Entry Level">Entry Level</SelectItem>
                            <SelectItem value="Mid Level">Mid Level</SelectItem>
                            <SelectItem value="Senior Level">Senior Level</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Responsibilities */}
                  <div>
                    <Label className="text-sm font-medium">Responsibilities</Label>
                    <div className="space-y-2 mt-2">
                      {responsibilities.map((responsibility, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Enter responsibility"
                            value={responsibility}
                            onChange={(e) => updateField('responsibilities', index, e.target.value)}
                          />
                          {responsibilities.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeField('responsibilities', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addField('responsibilities')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Responsibility
                      </Button>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <Label className="text-sm font-medium">Requirements</Label>
                    <div className="space-y-2 mt-2">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Enter requirement"
                            value={requirement}
                            onChange={(e) => updateField('requirements', index, e.target.value)}
                          />
                          {requirements.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeField('requirements', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addField('requirements')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Requirement
                      </Button>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <Label className="text-sm font-medium">Benefits</Label>
                    <div className="space-y-2 mt-2">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Enter benefit"
                            value={benefit}
                            onChange={(e) => updateField('benefits', index, e.target.value)}
                          />
                          {benefits.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeField('benefits', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addField('benefits')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Benefit
                      </Button>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label className="text-sm font-medium">Required Skills</Label>
                    <div className="space-y-2 mt-2">
                      {skills.map((skill, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Enter skill"
                            value={skill}
                            onChange={(e) => updateField('skills', index, e.target.value)}
                          />
                          {skills.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeField('skills', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addField('skills')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createJobMutation.isPending || updateJobMutation.isPending}
                    onClick={(e) => {
                      console.log("=== UPDATE BUTTON CLICKED ===");
                      console.log("Event:", e);
                      console.log("Button clicked! Editing job:", editingJob);
                      console.log("Form valid:", form.formState.isValid);
                      console.log("Form errors:", form.formState.errors);
                      console.log("Form values:", form.getValues());
                      console.log("Responsibilities:", responsibilities);
                      console.log("Requirements:", requirements);
                      console.log("Benefits:", benefits);
                      console.log("Skills:", skills);
                      
                      // Force form submission for debugging
                      if (editingJob) {
                        console.log("Manually triggering form submission...");
                        const formData = form.getValues();
                        onSubmit(formData);
                      }
                    }}
                  >
                    {editingJob 
                      ? (updateJobMutation.isPending ? "Updating..." : "Update Job")
                      : (createJobMutation.isPending ? "Creating..." : "Create Job")
                    }
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Existing Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Posted Jobs ({jobs?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {job.company}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {job.salary}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary">{job.type}</Badge>
                            <Badge variant="outline">{job.domain}</Badge>
                            <Badge variant="outline">{job.experienceLevel}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareOnLinkedIn(job)}
                          >
                            Share on LinkedIn
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => editJob(job)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              console.log("Direct update test for job:", job);
                              const testData = {
                                title: job.title + " (Updated)",
                                company: job.company,
                                location: job.location,
                                type: job.type,
                                salary: job.salary,
                                description: job.description,
                                domain: job.domain,
                                experienceLevel: job.experienceLevel,
                                responsibilities: job.responsibilities || [],
                                requirements: job.requirements || [],
                                benefits: job.benefits || [],
                                skills: job.skills || [],
                                icon: job.icon,
                                iconColor: job.iconColor
                              };
                              updateJobMutation.mutate({ id: job.id, data: testData });
                            }}
                          >
                            Test Update
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{job.title}" at {job.company}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteJobMutation.mutate(job.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No jobs posted yet</p>
                  <p className="text-sm text-muted-foreground">Create your first job posting to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}