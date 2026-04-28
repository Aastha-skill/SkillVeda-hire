import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { insertJobSchema, insertQuestionSchema } from "@shared/schema";
import type { InsertJob, Job, JobAlert, Application, PartnerRegistration, Question, InsertQuestion, Candidate, Lead, EmailCampaign, EmailTemplate } from "@shared/schema";
import { Plus, X, Building, MapPin, DollarSign, Trash2, Edit3, LogOut, Settings, Users, FileText, Mail, Phone, Calendar, Download, Link2, Copy, ExternalLink, ClipboardList, Upload, Search, ChevronLeft, ChevronRight, Database, Send, Eye, MousePointerClick, BarChart3, FileEdit, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminNavigation from "@/components/admin-navigation";
import { z } from "zod";
import * as XLSX from 'xlsx';
import ReactQuillNew from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const jobFormSchema = insertJobSchema.extend({
  responsibilities: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  description: z.string().min(1, "Job description is required"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

const questionFormSchema = insertQuestionSchema;
type QuestionFormData = z.infer<typeof questionFormSchema>;

export default function AdminComplete() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [skills, setSkills] = useState<string[]>([""]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [testSessions, setTestSessions] = useState<Map<number, { token: string; created: boolean }>>(new Map());
  const [testOptions, setTestOptions] = useState<string[]>(["", "", "", ""]);
  const [viewingTestResult, setViewingTestResult] = useState<number | null>(null);
  const [testResultDialogOpen, setTestResultDialogOpen] = useState(false);
  const [applicationJobFilter, setApplicationJobFilter] = useState<string>("all");
  const [applicationDateFilter, setApplicationDateFilter] = useState<string>("all");
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateSearchInput, setCandidateSearchInput] = useState("");
  const [leadTab, setLeadTab] = useState<string>("ALL");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadDateFilter, setLeadDateFilter] = useState("");
  const [leadSourceFilter, setLeadSourceFilter] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<Lead | null>(null);
  const [leadDetailNotes, setLeadDetailNotes] = useState("");
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [viewingCampaignId, setViewingCampaignId] = useState<number | null>(null);
  const [campaignDetailOpen, setCampaignDetailOpen] = useState(false);
  const [campaignMode, setCampaignMode] = useState<"new" | "template">("new");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [previewTemplateOpen, setPreviewTemplateOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [campaignsTab, setCampaignsTab] = useState("campaigns");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());
  const [candidateCampaignModalOpen, setCandidateCampaignModalOpen] = useState(false);
  const [candidateCampaignMode, setCandidateCampaignMode] = useState<"new" | "template">("new");
  const [candidateCampaignName, setCandidateCampaignName] = useState("");
  const [candidateCampaignSubject, setCandidateCampaignSubject] = useState("");
  const [candidateCampaignBody, setCandidateCampaignBody] = useState("");
  const [candidateSelectedTemplateId, setCandidateSelectedTemplateId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication on load
  useEffect(() => {
    const isAuth = localStorage.getItem('isAdmin') === 'true';
    if (!isAuth) {
      window.location.href = '/secret-admin-portal';
    }
  }, []);

  // Fetch existing jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Fetch job alerts
  const { data: jobAlerts, isLoading: jobAlertsLoading } = useQuery<JobAlert[]>({
    queryKey: ["/api/job-alerts"],
    queryFn: () => {
      const adminPassword = localStorage.getItem('adminPassword');
      return fetch("/api/job-alerts", {
        headers: {
          "admin-password": adminPassword || "",
        },
      }).then((res) => res.json());
    },
  });

  // Fetch applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<(Application & { jobTitle: string; jobCompany: string })[]>({
    queryKey: ["/api/applications"],
    queryFn: () => {
      const adminPassword = localStorage.getItem('adminPassword');
      return fetch("/api/applications", {
        headers: {
          "admin-password": adminPassword || "",
        },
      }).then((res) => res.json());
    },
  });

  // Fetch partner registrations
  const { data: partnerRegistrations, isLoading: partnerLoading } = useQuery<PartnerRegistration[]>({
    queryKey: ["/api/partner-registrations"],
    queryFn: () => {
      const adminPassword = localStorage.getItem('adminPassword');
      return fetch("/api/partner-registrations", {
        headers: {
          "admin-password": adminPassword || "",
        },
      }).then((res) => res.json());
    },
  });

  // Fetch candidates
  const { data: candidatesData, isLoading: candidatesLoading } = useQuery<{ candidates: Candidate[]; total: number }>({
    queryKey: ["/api/candidates", candidatePage, candidateSearch],
    queryFn: () => {
      const adminPassword = localStorage.getItem('adminPassword');
      const params = new URLSearchParams({ page: String(candidatePage), pageSize: '50' });
      if (candidateSearch) params.set('search', candidateSearch);
      return fetch(`/api/candidates?${params}`, {
        headers: { "admin-password": adminPassword || "" },
      }).then((res) => res.json());
    },
  });

  const { data: allLeads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch("/api/leads", {
        headers: { "admin-password": adminPassword || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch(`/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'admin-password': adminPassword || '',
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Lead status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const updateLeadNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch(`/api/leads/${id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'admin-password': adminPassword || '',
        },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to update notes');
      return res.json();
    },
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setSelectedLeadDetail(updatedLead);
      toast({ title: "Notes saved" });
    },
    onError: () => {
      toast({ title: "Failed to save notes", variant: "destructive" });
    },
  });

  type CampaignWithStats = EmailCampaign & { sent: number; opened: number; clicked: number };

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch("/api/campaigns", {
        headers: { "admin-password": adminPassword || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return res.json();
    },
  });

  const { data: campaignDetail } = useQuery({
    queryKey: ["/api/campaigns", viewingCampaignId],
    queryFn: async () => {
      if (!viewingCampaignId) return null;
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch(`/api/campaigns/${viewingCampaignId}`, {
        headers: { "admin-password": adminPassword || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch campaign detail");
      return res.json();
    },
    enabled: !!viewingCampaignId,
  });

  const { data: engagementData } = useQuery<Record<number, { opened: boolean; clicked: boolean }>>({
    queryKey: ["/api/leads/engagement"],
    queryFn: async () => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch("/api/leads/engagement", {
        headers: { "admin-password": adminPassword || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch engagement");
      return res.json();
    },
  });

  const { data: emailTemplates, isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
    queryFn: async () => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch("/api/email-templates", {
        headers: { "admin-password": adminPassword || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: { templateName: string; subject: string; emailBody: string }) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch("/api/email-templates", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'admin-password': adminPassword || '' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create template');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      setTemplateModalOpen(false);
      setTemplateName(""); setTemplateSubject(""); setTemplateBody("");
      toast({ title: "Template created" });
    },
    onError: () => { toast({ title: "Failed to create template", variant: "destructive" }); },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; templateName: string; subject: string; emailBody: string }) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch(`/api/email-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'admin-password': adminPassword || '' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update template');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      setTemplateModalOpen(false);
      setEditingTemplate(null);
      setTemplateName(""); setTemplateSubject(""); setTemplateBody("");
      toast({ title: "Template updated" });
    },
    onError: () => { toast({ title: "Failed to update template", variant: "destructive" }); },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch(`/api/email-templates/${id}`, {
        method: 'DELETE',
        headers: { 'admin-password': adminPassword || '' },
      });
      if (!res.ok) throw new Error('Failed to delete template');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Template deleted" });
    },
    onError: () => { toast({ title: "Failed to delete template", variant: "destructive" }); },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (data: { campaignName: string; subject: string; body: string; leadIds: number[] }) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch("/api/campaigns", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-password': adminPassword || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send campaign');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/engagement"] });
      setCampaignModalOpen(false);
      setCampaignName("");
      setCampaignSubject("");
      setCampaignBody("");
      setSelectedLeads(new Set());
      toast({ title: `Campaign sent to ${data.sentCount} recipients` });
    },
    onError: () => {
      toast({ title: "Failed to send campaign", variant: "destructive" });
    },
  });

  const sendCandidateCampaignMutation = useMutation({
    mutationFn: async (data: { campaignName: string; subject: string; body: string; candidateIds: number[] }) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch("/api/campaigns/candidates", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-password': adminPassword || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send campaign');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setCandidateCampaignModalOpen(false);
      setCandidateCampaignName("");
      setCandidateCampaignSubject("");
      setCandidateCampaignBody("");
      setSelectedCandidates(new Set());
      setCandidateSelectedTemplateId("");
      toast({ title: `Campaign sent to ${data.sentCount} candidate${data.sentCount !== 1 ? 's' : ''}` });
    },
    onError: () => {
      toast({ title: "Failed to send campaign", variant: "destructive" });
    },
  });

  const uploadCandidatesMutation = useMutation({
    mutationFn: async (file: File) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/candidates/upload', {
        method: 'POST',
        headers: { 'admin-password': adminPassword || '' },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Upload Complete",
        description: `${data.inserted} candidates added, ${data.skipped} duplicates skipped (${data.totalRows} total rows)`,
      });
    },
    onError: (error: any) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: number) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
        headers: { 'admin-password': adminPassword || '' },
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({ title: "Candidate deleted" });
    },
  });

  // Fetch test questions
  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
    queryFn: async () => {
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch("/api/questions", {
        headers: {
          "admin-password": adminPassword || "",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  // Fetch test session and results by application ID
  const { data: testSessionData, isLoading: testSessionLoading } = useQuery({
    queryKey: ["/api/test-sessions/application", viewingTestResult],
    queryFn: async () => {
      if (!viewingTestResult) return null;
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch(`/api/test-sessions/application/${viewingTestResult}`, {
        headers: {
          "admin-password": adminPassword || "",
        },
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch test session");
      }
      return response.json();
    },
    enabled: !!viewingTestResult && testResultDialogOpen,
  });

  // Get unique job titles for filter dropdown
  const uniqueJobTitles = useMemo(() => {
    if (!applications) return [];
    const titles = Array.from(new Set(applications.map(app => app.jobTitle)));
    return titles.sort();
  }, [applications]);

  // Filter applications based on selected filters
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    
    return applications.filter(app => {
      // Job title filter
      if (applicationJobFilter !== "all" && app.jobTitle !== applicationJobFilter) {
        return false;
      }
      
      // Date filter
      if (applicationDateFilter !== "all" && app.appliedDate) {
        const appliedDate = new Date(app.appliedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (applicationDateFilter === "today") {
          const startOfDay = new Date(today);
          if (appliedDate < startOfDay) return false;
        } else if (applicationDateFilter === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (appliedDate < weekAgo) return false;
        } else if (applicationDateFilter === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (appliedDate < monthAgo) return false;
        }
      }
      
      return true;
    });
  }, [applications, applicationJobFilter, applicationDateFilter]);

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
      icon: "fas fa-briefcase",
      iconColor: "blue",
      responsibilities: [],
      requirements: [],
      benefits: [],
      skills: [],
    },
  });

  const resetForm = () => {
    form.reset({
      title: "",
      company: "",
      location: "",
      type: "",
      salary: "",
      description: "",
      domain: "",
      experienceLevel: "",
      icon: "fas fa-briefcase",
      iconColor: "blue",
      responsibilities: [],
      requirements: [],
      benefits: [],
      skills: [],
    });
    setResponsibilities([""]);
    setRequirements([""]);
    setBenefits([""]);
    setSkills([""]);
    setEditingJob(null);
  };

  const editJob = (job: Job) => {
    console.log("Editing job:", job);
    setEditingJob(job);
    
    // Set the array states first
    const jobResponsibilities = job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [""];
    const jobRequirements = job.requirements && job.requirements.length > 0 ? job.requirements : [""];
    const jobBenefits = job.benefits && job.benefits.length > 0 ? job.benefits : [""];
    const jobSkills = job.skills && job.skills.length > 0 ? job.skills : [""];
    
    setResponsibilities(jobResponsibilities);
    setRequirements(jobRequirements);
    setBenefits(jobBenefits);
    setSkills(jobSkills);
    
    // Reset the form with job data immediately
    form.reset({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      domain: job.domain,
      experienceLevel: job.experienceLevel,
      icon: job.icon,
      iconColor: job.iconColor,
      responsibilities: jobResponsibilities.filter(r => r.trim() !== ""),
      requirements: jobRequirements.filter(r => r.trim() !== ""),
      benefits: jobBenefits.filter(b => b.trim() !== ""),
      skills: jobSkills.filter(s => s.trim() !== ""),
    });
    
    // Scroll to the form to make it clear editing is active
    setTimeout(() => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : "/api/jobs";
      const method = editingJob ? "PUT" : "POST";
      const adminPassword = localStorage.getItem('adminPassword');
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "admin-password": adminPassword || "",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(editingJob ? "Failed to update job" : "Failed to create job");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: editingJob ? "Job updated successfully!" : "Job created successfully!",
        description: editingJob ? "The job posting has been updated." : "The job posting has been added to the platform.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: any) => {
      console.error("Error saving job:", error);
      toast({
        title: editingJob ? "Error updating job" : "Error creating job",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "admin-password": adminPassword || "",
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

  const createTestSessionMutation = useMutation({
    mutationFn: async ({ applicationId, totalQuestions }: { applicationId: number; totalQuestions: number }) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch("/api/test-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-password": adminPassword || "",
        },
        body: JSON.stringify({ applicationId, totalQuestions }),
      });
      if (!response.ok) {
        throw new Error("Failed to create test session");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      setTestSessions(prev => new Map(prev).set(variables.applicationId, { token: data.token, created: true }));
      toast({
        title: "Test invitation created!",
        description: "Test link has been generated. Copy and send it to the candidate.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating test session",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyTestLink = (token: string) => {
    const testLink = `${window.location.origin}/test/${token}`;
    navigator.clipboard.writeText(testLink);
    toast({
      title: "Test link copied!",
      description: "The test link has been copied to your clipboard.",
    });
  };

  // Test question form
  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "",
      domain: "",
      options: [],
      correctAnswer: "",
      difficulty: "medium",
      isActive: true,
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-password": adminPassword || "",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create question");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Question created successfully!",
        description: "The question has been added to the test bank.",
      });
      questionForm.reset();
      setTestOptions(["", "", "", ""]);
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
        headers: {
          "admin-password": adminPassword || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete question");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Question deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
  });

  const onQuestionSubmit = (data: QuestionFormData) => {
    const filteredOptions = testOptions.filter(opt => opt.trim() !== "");
    
    if (filteredOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least 2 options",
        variant: "destructive",
      });
      return;
    }

    if (!filteredOptions.includes(data.correctAnswer)) {
      toast({
        title: "Error",
        description: "Correct answer must be one of the options",
        variant: "destructive",
      });
      return;
    }

    createQuestionMutation.mutate({
      ...data,
      options: filteredOptions,
    });
  };

  const addTestOption = () => {
    if (testOptions.length < 6) {
      setTestOptions([...testOptions, ""]);
    }
  };

  const removeTestOption = (index: number) => {
    if (testOptions.length > 2) {
      setTestOptions(testOptions.filter((_, i) => i !== index));
    }
  };

  const updateTestOption = (index: number, value: string) => {
    const newOptions = [...testOptions];
    newOptions[index] = value;
    setTestOptions(newOptions);
  };

  const onSubmit = (data: JobFormData) => {
    const jobData = {
      ...data,
      responsibilities: editingJob?.responsibilities ?? [],
      requirements: editingJob?.requirements ?? [],
      benefits: editingJob?.benefits ?? [],
      skills: editingJob?.skills ?? [],
    };
    createJobMutation.mutate(jobData);
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

  const downloadApplicationsExcel = () => {
    if (!applications || applications.length === 0) {
      toast({
        title: "No applications to download",
        description: "There are currently no applications to export.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for Excel
    const excelData = applications.map((application, index) => ({
      'S.No': index + 1,
      'Full Name': application.fullName,
      'Email': application.email,
      'Phone': application.phone,
      'Education Level': application.educationLevel,
      'Experience': application.experience,
      'Current CTC': application.currentCtc,
      'Job Title': application.jobTitle,
      'Company': application.jobCompany,
      'Applied Date': application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A',
      'Status': application.status || 'Pending',
      'Resume Download': application.resumeUrl ? 'Click to Download' : 'Not uploaded'
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add hyperlinks to resume download column using secure API endpoint with query parameter auth
    const adminPassword = localStorage.getItem('adminPassword');
    applications.forEach((application, index) => {
      if (application.resumeUrl && application.id) {
        const cellAddress = XLSX.utils.encode_cell({ r: index + 1, c: 11 }); // Column L (Resume Download)
        // Use the secure download API endpoint with admin key as query parameter for Excel compatibility
        const downloadUrl = `${window.location.origin}/api/download/resume/${application.id}?admin_key=${adminPassword}`;
        
        ws[cellAddress] = {
          t: 's',
          v: 'Download Resume',
          l: { Target: downloadUrl, Tooltip: `Download resume for ${application.fullName}` }
        };
      }
    });

    // Set column widths for better readability
    const colWidths = [
      { wch: 8 },   // S.No
      { wch: 20 },  // Full Name
      { wch: 25 },  // Email
      { wch: 15 },  // Phone
      { wch: 20 },  // Education Level
      { wch: 15 },  // Experience
      { wch: 15 },  // Current CTC
      { wch: 30 },  // Job Title
      { wch: 20 },  // Company
      { wch: 12 },  // Applied Date
      { wch: 12 },  // Status
      { wch: 20 }   // Resume Download
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');

    // Add a notes worksheet with instructions
    const notesData = [
      { 'Note': 'Resume files are uploaded and stored on the server.' },
      { 'Note': 'Click the blue "Click to Download" links in the Resume Download column.' },
      { 'Note': 'If the link doesn\'t work, copy the URL from the Links sheet below.' },
      { 'Note': 'Files will download automatically when accessed.' }
    ];
    
    // Add a separate worksheet with secure download URLs for manual copying
    const linksData = applications
      .filter(app => app.resumeUrl && app.id)
      .map(app => ({
        'Candidate': app.fullName,
        'Secure Download URL': `${window.location.origin}/api/download/resume/${app.id}`,
        'Note': 'Copy this URL to download resume (requires admin authentication)'
      }));
    const notesWs = XLSX.utils.json_to_sheet(notesData);
    XLSX.utils.book_append_sheet(wb, notesWs, 'Resume Notes');
    
    // Add links worksheet if there are resumes
    if (linksData.length > 0) {
      const linksWs = XLSX.utils.json_to_sheet(linksData);
      XLSX.utils.book_append_sheet(wb, linksWs, 'Direct Links');
    }

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `job_applications_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);

    toast({
      title: "Excel file downloaded",
      description: `Applications exported to ${filename}. Check 'Resume Notes' tab for file access info.`,
    });
  };

  // Helper function to download resume securely
  const downloadResume = async (applicationId: number, candidateName: string) => {
    try {
      console.log('Downloading resume for application:', applicationId);
      const adminPassword = localStorage.getItem('adminPassword');
      
      const response = await fetch(`/api/download/resume/${applicationId}`, {
        method: 'GET',
        headers: {
          'admin-password': adminPassword || "",
          'Accept': 'application/octet-stream',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const errorMessage = errorData.details || errorData.message || errorData.error || 'Download failed';
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      console.log('Filename:', filename);
      console.log('Content-Type:', response.headers.get('content-type'));

      // Create blob and download
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'Blob type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      toast({
        title: "Resume downloaded",
        description: `${candidateName}'s resume has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareOnLinkedIn = (job: Job) => {
    const text = `🚀 New Job Opportunity at ${job.company}!\n\n${job.title}\n📍 ${job.location}\n💰 ${job.salary}\n\n${job.description.substring(0, 200)}...\n\nApply now on SkillVeda! #Jobs #Hiring #Career`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/jobs')}&mini=true`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const dashboardLeadStats = useMemo(() => {
    if (!allLeads) return { total: 0, today: 0, thisWeek: 0, converted: 0, byType: {} as Record<string, number> };
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const byType: Record<string, number> = {};
    let today = 0, thisWeek = 0, converted = 0;
    allLeads.forEach((l: Lead) => {
      byType[l.leadType] = (byType[l.leadType] || 0) + 1;
      if (l.status === "CONVERTED") converted++;
      if (l.createdAt) {
        const d = new Date(l.createdAt);
        if (d.toISOString().split('T')[0] === todayStr) today++;
        if (d >= weekAgo) thisWeek++;
      }
    });
    return { total: allLeads.length, today, thisWeek, converted, byType };
  }, [allLeads]);

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold">{dashboardLeadStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{dashboardLeadStats.today}</p>
            <p className="text-xs text-muted-foreground">New Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{dashboardLeadStats.thisWeek}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {dashboardLeadStats.total > 0 ? Math.round((dashboardLeadStats.converted / dashboardLeadStats.total) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["WEBINAR", "PROGRAM", "JOB", "CONTACT", "JOB_ALERT", "CURRICULUM", "NEWSLETTER"].map((type) => (
              <button
                key={type}
                onClick={() => { setCurrentPage('leads'); setLeadTab(type); }}
                className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <p className="text-xl font-bold">{dashboardLeadStats.byType[type] || 0}</p>
                <p className="text-xs text-muted-foreground">{type === "JOB_ALERT" ? "Job Alerts" : type.charAt(0) + type.slice(1).toLowerCase()}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Platform Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Platform Statistics</h3>
                <p className="text-sm text-muted-foreground">Total Jobs: {jobs?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Applications: {applications?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Job Alert Subscribers: {jobAlerts?.length || 0}</p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => setCurrentPage('create-job')} 
                  className="w-full"
                >
                  Create New Job
                </Button>
                <Button 
                  onClick={() => setCurrentPage('leads')} 
                  variant="outline"
                  className="w-full"
                >
                  View All Leads ({dashboardLeadStats.total})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => setCurrentPage('posted-jobs')}>
                <Building className="h-4 w-4 mr-2" />
                View Posted Jobs ({jobs?.length || 0})
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setCurrentPage('applications')}>
                <FileText className="h-4 w-4 mr-2" />
                View Applications ({applications?.length || 0})
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setCurrentPage('alerts')}>
                <Mail className="h-4 w-4 mr-2" />
                Job Alert Subscribers ({jobAlerts?.length || 0})
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setCurrentPage('campaigns')}>
                <Send className="h-4 w-4 mr-2" />
                Email Campaigns
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCreateJob = () => (
    <div className="max-w-4xl mx-auto">
      <Card className={editingJob ? "border-2 border-blue-500 shadow-lg" : ""}>
        <CardHeader className={editingJob ? "bg-blue-50 dark:bg-blue-950" : ""}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {editingJob ? <Edit3 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5" />}
              <span className={editingJob ? "text-blue-700 dark:text-blue-300" : ""}>
                {editingJob ? `Edit Job: ${editingJob.title}` : 'Create New Job'}
              </span>
            </div>
            {editingJob && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetForm}
              >
                Cancel Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Icon</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fas fa-briefcase">Briefcase</SelectItem>
                          <SelectItem value="fas fa-code">Code</SelectItem>
                          <SelectItem value="fas fa-chart-line">Chart</SelectItem>
                          <SelectItem value="fas fa-paint-brush">Design</SelectItem>
                          <SelectItem value="fas fa-megaphone">Marketing</SelectItem>
                          <SelectItem value="fas fa-stethoscope">Healthcare</SelectItem>
                          <SelectItem value="fas fa-graduation-cap">Education</SelectItem>
                          <SelectItem value="fas fa-dollar-sign">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iconColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="teal">Teal</SelectItem>
                          <SelectItem value="pink">Pink</SelectItem>
                          <SelectItem value="indigo">Indigo</SelectItem>
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
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <div className="sv-quill-wrapper">
                        <ReactQuillNew
                          theme="snow"
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Write or paste your complete job description here..."
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, 3, false] }],
                              ["bold", "italic", "underline"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              [{ color: [] }],
                              ["clean"],
                            ],
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Array fields removed — all job details now go in the description textarea above */}

              <Button type="submit" className="w-full" disabled={createJobMutation.isPending}>
                {createJobMutation.isPending ? (
                  "Processing..."
                ) : editingJob ? (
                  "Update Job"
                ) : (
                  "Create Job"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );

  const renderPostedJobs = () => (
    <div>
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
                <div key={i} className="h-32 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="border border-border rounded-lg p-6 bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{job.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-3 mb-4 job-description-content" dangerouslySetInnerHTML={{ __html: job.description }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          editJob(job);
                          setCurrentPage('create-job');
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareOnLinkedIn(job)}
                      >
                        Share
                      </Button>
                    </div>
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
  );

  const renderJobManagement = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Create Job Form */}
      <Card className={editingJob ? "border-2 border-blue-500 shadow-lg" : ""}>
        <CardHeader className={editingJob ? "bg-blue-50 dark:bg-blue-950" : ""}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {editingJob ? <Edit3 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5" />}
              <span className={editingJob ? "text-blue-700 dark:text-blue-300" : ""}>
                {editingJob ? `Edit Job: ${editingJob.title}` : 'Create New Job'}
              </span>
            </div>
            {editingJob && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetForm}
              >
                Cancel Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Icon</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fas fa-briefcase">Briefcase</SelectItem>
                          <SelectItem value="fas fa-code">Code</SelectItem>
                          <SelectItem value="fas fa-chart-line">Chart</SelectItem>
                          <SelectItem value="fas fa-paint-brush">Design</SelectItem>
                          <SelectItem value="fas fa-megaphone">Marketing</SelectItem>
                          <SelectItem value="fas fa-stethoscope">Healthcare</SelectItem>
                          <SelectItem value="fas fa-graduation-cap">Education</SelectItem>
                          <SelectItem value="fas fa-dollar-sign">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iconColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="teal">Teal</SelectItem>
                          <SelectItem value="pink">Pink</SelectItem>
                          <SelectItem value="indigo">Indigo</SelectItem>
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
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <div className="sv-quill-wrapper">
                        <ReactQuillNew
                          theme="snow"
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Write or paste your complete job description here..."
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, 3, false] }],
                              ["bold", "italic", "underline"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              [{ color: [] }],
                              ["clean"],
                            ],
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Array fields removed — all job details now go in the description textarea above */}

              <Button 
                type="button" 
                className="w-full" 
                disabled={createJobMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Button clicked!");
                  console.log("Form state:", form.formState);
                  console.log("Form values:", form.getValues());
                  console.log("Form errors:", form.formState.errors);
                  
                  // Manually trigger form submission
                  form.handleSubmit(onSubmit)();
                }}
              >
                {createJobMutation.isPending 
                  ? (editingJob ? "Updating..." : "Creating...") 
                  : (editingJob ? "Update Job" : "Create Job")
                }
              </Button>
              
              {editingJob && (
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full mt-2"
                  onClick={resetForm}
                >
                  Cancel Edit
                </Button>
              )}
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
                        title="Edit job"
                      >
                        <Edit3 className="h-4 w-4" />
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
  );

  const renderJobAlerts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Job Alert Subscribers ({jobAlerts?.length || 0})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobAlertsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : jobAlerts && jobAlerts.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {jobAlerts.map((alert) => (
              <div key={alert.id} className="p-4 border border-border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{alert.fullName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {alert.email}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(alert.subscribedDate!).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {alert.location && <Badge variant="outline">{alert.location}</Badge>}
                      {alert.domain && <Badge variant="outline">{alert.domain}</Badge>}
                      {alert.experienceLevel && <Badge variant="outline">{alert.experienceLevel}</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No job alert subscribers yet</p>
            <p className="text-sm text-muted-foreground">Subscribers will appear here when users sign up for job alerts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const copyPartnerLink = () => {
    const partnerLink = `${window.location.origin}/become-partner`;
    navigator.clipboard.writeText(partnerLink);
    toast({
      title: "Link Copied!",
      description: "Partner registration link has been copied to clipboard",
    });
  };

  const renderPartnerRegistrations = () => (
    <div className="space-y-6">
      {/* Shareable Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link2 className="h-5 w-5" />
            <span>Partner Registration Link</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">
              {window.location.origin}/become-partner
            </code>
            <Button
              onClick={copyPartnerLink}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </Button>
            <Button
              onClick={() => window.open('/become-partner', '_blank')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Share this link with companies who want to become partners. They can register their interest and provide their details.
          </p>
        </CardContent>
      </Card>

      {/* Partner Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Partner Registrations ({partnerRegistrations?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {partnerLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : partnerRegistrations && partnerRegistrations.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {partnerRegistrations.map((registration) => (
                <div key={registration.id} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{registration.name}</h3>
                      <p className="text-lg text-muted-foreground font-medium">{registration.companyName}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {registration.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {registration.contactDetails}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(registration.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Badge 
                          variant={registration.status === 'pending' ? 'secondary' : 'default'}
                        >
                          {registration.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No partner registrations yet</p>
              <p className="text-sm text-muted-foreground">Companies will appear here when they register their interest</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTests = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Question Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...questionForm}>
              <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-6">
                <FormField
                  control={questionForm.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-domain">
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={questionForm.control}
                  name="questionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter the question" data-testid="input-question-text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Options</Label>
                  {testOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateTestOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        data-testid={`input-option-${index}`}
                      />
                      {testOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTestOption(index)}
                          data-testid={`button-remove-option-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {testOptions.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestOption}
                      className="mt-2"
                      data-testid="button-add-option"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

                <FormField
                  control={questionForm.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter the exact correct answer" data-testid="input-correct-answer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={questionForm.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createQuestionMutation.isPending}
                  data-testid="button-create-question"
                >
                  {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Question Bank ({questions?.length || 0} questions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <p>Loading questions...</p>
            ) : questions && questions.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg space-y-2"
                    data-testid={`question-${question.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{question.questionText}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Domain: {question.domain} | Difficulty: {question.difficulty}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-delete-${question.id}`}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Question</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this question? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteQuestionMutation.mutate(question.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Options:</p>
                      <ul className="text-sm space-y-1">
                        {question.options?.map((opt, idx) => (
                          <li
                            key={idx}
                            className={opt === question.correctAnswer ? "text-green-600 font-medium" : ""}
                          >
                            {idx + 1}. {opt} {opt === question.correctAnswer && "✓"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No questions created yet. Start by creating your first question!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderApplications = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Job Applications</span>
          </CardTitle>
          {applications && applications.length > 0 && (
            <Button 
              onClick={downloadApplicationsExcel}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Excel</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {applicationsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm font-medium mb-2 block">Filter by Job Title</Label>
                <Select value={applicationJobFilter} onValueChange={setApplicationJobFilter}>
                  <SelectTrigger data-testid="select-job-filter">
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {uniqueJobTitles.map((title) => (
                      <SelectItem key={title} value={title}>{title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm font-medium mb-2 block">Filter by Date Applied</Label>
                <Select value={applicationDateFilter} onValueChange={setApplicationDateFilter}>
                  <SelectTrigger data-testid="select-date-filter">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setApplicationJobFilter("all");
                    setApplicationDateFilter("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground" data-testid="text-filter-count">
                Showing <span className="font-semibold text-foreground">{filteredApplications.length}</span> of {applications.length} applications
              </p>
              {(applicationJobFilter !== "all" || applicationDateFilter !== "all") && (
                <Badge variant="secondary">
                  Filters Applied
                </Badge>
              )}
            </div>

            {/* Applications List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredApplications.length > 0 ? filteredApplications.map((application) => (
              <div key={application.id} className="p-4 border border-border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{application.fullName}</h3>
                      <Badge variant={
                        application.status === 'pending' ? 'secondary' :
                        application.status === 'accepted' ? 'default' : 'destructive'
                      }>
                        {application.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Applied for: {application.jobTitle} at {application.jobCompany}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {application.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {application.phone}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {application.educationLevel}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(application.appliedDate!).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 p-3 bg-muted rounded">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <p>
                          <strong>Experience:</strong> {application.experience}
                        </p>
                        <p>
                          <strong>Current CTC:</strong> {application.currentCtc}
                        </p>
                        <div className="flex items-center justify-between">
                          <strong>Resume:</strong> 
                          {application.resumeUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadResume(application.id!, application.fullName)}
                              className="ml-2 h-7 px-3 text-xs"
                              data-testid={`button-download-resume-${application.id}`}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          ) : (
                            <span className="text-red-600 ml-1 text-xs">✗ Not uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Assessment Section */}
                    <div className="mt-3 flex items-center gap-2">
                      {(application as any).assessmentSentAt ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-emerald-600">Sent ✓</span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date((application as any).assessmentSentAt).toLocaleDateString()}
                          </span>
                          <button
                            className="text-[11px] text-muted-foreground underline hover:text-foreground"
                            onClick={async () => {
                              if (!confirm(`Resend assessment to ${application.email}?`)) return;
                              try {
                                const res = await fetch(`/api/applications/${application.id}/send-assessment`, {
                                  method: "POST",
                                  headers: { "admin-password": localStorage.getItem("adminPassword") || "" },
                                });
                                if (res.ok) {
                                  toast({ title: `Resent to ${application.email} ✓` });
                                  queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
                                }
                              } catch {}
                            }}
                          >
                            Resend
                          </button>
                        </div>
                      ) : (
                        <button
                          className="text-xs px-3 py-1.5 rounded-md transition-colors"
                          style={{ border: "1px solid #7C3AED", color: "#7C3AED", background: "white" }}
                          onMouseEnter={e => { (e.target as HTMLElement).style.background = "#7C3AED"; (e.target as HTMLElement).style.color = "white"; }}
                          onMouseLeave={e => { (e.target as HTMLElement).style.background = "white"; (e.target as HTMLElement).style.color = "#7C3AED"; }}
                          onClick={async () => {
                            if (!confirm(`Send assessment to ${application.email}?`)) return;
                            try {
                              const res = await fetch(`/api/applications/${application.id}/send-assessment`, {
                                method: "POST",
                                headers: { "admin-password": localStorage.getItem("adminPassword") || "" },
                              });
                              if (res.ok) {
                                toast({ title: `Sent to ${application.email} ✓` });
                                queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
                              } else {
                                toast({ title: "Failed to send", variant: "destructive" });
                              }
                            } catch {
                              toast({ title: "Failed to send", variant: "destructive" });
                            }
                          }}
                        >
                          Send Assessment
                        </button>
                      )}
                    </div>

                    {/* Test Invitation Section */}
                    <div className="mt-3 flex items-center gap-2">
                      {testSessions.get(application.id!)?.created ? (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                              Test invitation created
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyTestLink(testSessions.get(application.id!)!.token)}
                            className="flex items-center gap-1"
                            data-testid={`button-copy-test-link-${application.id}`}
                          >
                            <Copy className="h-3 w-3" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/test/${testSessions.get(application.id!)!.token}`, '_blank')}
                            className="flex items-center gap-1"
                            data-testid={`button-open-test-${application.id}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewingTestResult(application.id!);
                              setTestResultDialogOpen(true);
                            }}
                            className="flex items-center gap-1"
                            data-testid={`button-view-test-results-${application.id}`}
                          >
                            <ClipboardList className="h-3 w-3" />
                            View Results
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => createTestSessionMutation.mutate({ applicationId: application.id!, totalQuestions: 10 })}
                          disabled={createTestSessionMutation.isPending}
                          className="flex items-center gap-1"
                          data-testid={`button-send-test-${application.id}`}
                        >
                          <Mail className="h-3 w-3" />
                          {createTestSessionMutation.isPending ? "Creating..." : "Send Test (10 questions)"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applications match your filters</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filter criteria</p>
              </div>
            )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No applications received yet</p>
            <p className="text-sm text-muted-foreground">Applications will appear here when candidates apply for jobs</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCandidates = () => {
    const totalPages = candidatesData ? Math.ceil(candidatesData.total / 50) : 0;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadCandidatesMutation.mutate(file);
        e.target.value = '';
      }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setCandidateSearch(candidateSearchInput);
      setCandidatePage(1);
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Candidate Database</h2>
            <p className="text-muted-foreground">
              {candidatesData ? `${candidatesData.total} total candidates` : 'Loading...'}
            </p>
          </div>
          <div className="flex gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploadCandidatesMutation.isPending
                  ? 'bg-gray-200 text-gray-500 cursor-wait'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
              }`}>
                <Upload className="h-4 w-4" />
                {uploadCandidatesMutation.isPending ? 'Uploading...' : 'Upload Excel'}
              </div>
            </label>
          </div>
        </div>

        {selectedCandidates.size > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <CardContent className="py-3 flex items-center justify-between">
              <span className="text-sm font-medium">{selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? 's' : ''} selected</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setCandidateCampaignModalOpen(true)}>
                  <Send className="h-4 w-4 mr-2" /> Send Email Campaign
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  if (!candidatesData) return;
                  const selected = candidatesData.candidates.filter(c => selectedCandidates.has(c.id));
                  const ws = XLSX.utils.json_to_sheet(selected.map(c => ({
                    Name: c.fullName, Email: c.email, Phone: c.phone || '',
                    Location: c.currentLocation || '', Experience: c.totalExperience || '0',
                    'Current CTC': c.currentCtc || '', 'Expected CTC': c.expectedCtc || '',
                    Skills: c.skillSets?.join(', ') || '', 'Email Status': c.emailStatus || 'no_mail',
                  })));
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
                  XLSX.writeFile(wb, 'selected_candidates.xlsx');
                }}>
                  <Download className="h-4 w-4 mr-2" /> Export Selected
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedCandidates(new Set())}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or location..."
                  value={candidateSearchInput}
                  onChange={(e) => setCandidateSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">Search</Button>
              {candidateSearch && (
                <Button type="button" variant="ghost" onClick={() => {
                  setCandidateSearch('');
                  setCandidateSearchInput('');
                  setCandidatePage(1);
                }}>Clear</Button>
              )}
            </form>

            <div className="text-xs text-muted-foreground mb-4 bg-muted/50 p-3 rounded-lg">
              <strong>Excel format:</strong> full_name, email, phone, current_location, preferred_location, total_experience, saas_experience, current_ctc, expected_ctc, skill_sets (comma-separated)
            </div>

            {candidatesLoading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading candidates...</p>
              </div>
            ) : candidatesData && candidatesData.candidates.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={candidatesData.candidates.length > 0 && candidatesData.candidates.every(c => selectedCandidates.has(c.id))}
                            onChange={(e) => {
                              const next = new Set(selectedCandidates);
                              if (e.target.checked) {
                                candidatesData.candidates.forEach(c => next.add(c.id));
                              } else {
                                candidatesData.candidates.forEach(c => next.delete(c.id));
                              }
                              setSelectedCandidates(next);
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Phone</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Location</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Exp (yrs)</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">CTC</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Skills</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Email Status</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatesData.candidates.map((c) => (
                        <tr key={c.id} className={`border-b hover:bg-muted/30 transition-colors ${selectedCandidates.has(c.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.has(c.id)}
                              onChange={(e) => {
                                const next = new Set(selectedCandidates);
                                if (e.target.checked) next.add(c.id); else next.delete(c.id);
                                setSelectedCandidates(next);
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-3 font-medium">{c.fullName}</td>
                          <td className="py-3 px-3 text-muted-foreground">{c.email}</td>
                          <td className="py-3 px-3 text-muted-foreground">{c.phone || '-'}</td>
                          <td className="py-3 px-3 text-muted-foreground">{c.currentLocation || '-'}</td>
                          <td className="py-3 px-3">{c.totalExperience || '0'}</td>
                          <td className="py-3 px-3">{c.currentCtc ? `₹${(c.currentCtc / 100000).toFixed(1)}L` : '-'}</td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {c.skillSets?.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                              ))}
                              {c.skillSets && c.skillSets.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{c.skillSets.length - 3}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant={
                              c.emailStatus === "second_mail_sent" ? "default" :
                              c.emailStatus === "first_mail_sent" ? "secondary" : "outline"
                            } className="text-xs whitespace-nowrap">
                              {c.emailStatus === "first_mail_sent" ? "1st Sent" :
                               c.emailStatus === "second_mail_sent" ? "2nd Sent" : "No Mail"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently remove {c.fullName} from the database.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteCandidateMutation.mutate(c.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {candidatePage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={candidatePage <= 1}
                        onClick={() => setCandidatePage(p => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={candidatePage >= totalPages}
                        onClick={() => setCandidatePage(p => p + 1)}
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No candidates yet</p>
                <p className="text-sm text-muted-foreground">Upload an Excel file to add candidates to the database</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const filteredLeads = useMemo(() => {
    if (!allLeads) return [];
    let filtered = leadTab === "ALL" ? [...allLeads] : allLeads.filter((l: Lead) => l.leadType === leadTab);
    if (leadSearch) {
      const s = leadSearch.toLowerCase();
      filtered = filtered.filter((l: Lead) =>
        l.fullName.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        (l.phone && l.phone.toLowerCase().includes(s))
      );
    }
    if (leadDateFilter) {
      filtered = filtered.filter((l: Lead) => {
        if (!l.createdAt) return false;
        const leadDate = new Date(l.createdAt).toISOString().split('T')[0];
        return leadDate === leadDateFilter;
      });
    }
    if (leadSourceFilter) {
      filtered = filtered.filter((l: Lead) => l.sourcePage === leadSourceFilter);
    }
    return filtered;
  }, [allLeads, leadTab, leadSearch, leadDateFilter, leadSourceFilter]);

  const leadStatusCounts = useMemo(() => {
    if (!allLeads) return { total: 0, NEW: 0, CONTACTED: 0, CONVERTED: 0, NOT_INTERESTED: 0 };
    const tabLeads = leadTab === "ALL" ? allLeads : allLeads.filter((l: Lead) => l.leadType === leadTab);
    return {
      total: tabLeads.length,
      NEW: tabLeads.filter((l: Lead) => l.status === "NEW").length,
      CONTACTED: tabLeads.filter((l: Lead) => l.status === "CONTACTED").length,
      CONVERTED: tabLeads.filter((l: Lead) => l.status === "CONVERTED").length,
      NOT_INTERESTED: tabLeads.filter((l: Lead) => l.status === "NOT_INTERESTED").length,
    };
  }, [allLeads, leadTab]);

  const leadTypeCounts = useMemo(() => {
    if (!allLeads) return {};
    const counts: Record<string, number> = {};
    allLeads.forEach((l: Lead) => {
      counts[l.leadType] = (counts[l.leadType] || 0) + 1;
    });
    return counts;
  }, [allLeads]);

  const leadStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800";
      case "CONTACTED": return "bg-yellow-100 text-yellow-800";
      case "CONVERTED": return "bg-green-100 text-green-800";
      case "NOT_INTERESTED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const parseLeadMetadata = (lead: Lead) => {
    try {
      return lead.metadata ? JSON.parse(lead.metadata) : {};
    } catch { return {}; }
  };

  const leadTypeLabel = (type: string) => {
    switch (type) {
      case "WEBINAR": return "Webinar";
      case "PROGRAM": return "Program";
      case "JOB": return "Job";
      case "CONTACT": return "Contact";
      case "JOB_ALERT": return "Job Alert";
      case "CURRICULUM": return "Curriculum";
      case "NEWSLETTER": return "Newsletter";
      default: return type;
    }
  };

  const leadTypeBadgeColor = (type: string) => {
    switch (type) {
      case "WEBINAR": return "bg-purple-100 text-purple-800";
      case "PROGRAM": return "bg-indigo-100 text-indigo-800";
      case "JOB": return "bg-sky-100 text-sky-800";
      case "CONTACT": return "bg-orange-100 text-orange-800";
      case "JOB_ALERT": return "bg-teal-100 text-teal-800";
      case "CURRICULUM": return "bg-pink-100 text-pink-800";
      case "NEWSLETTER": return "bg-lime-100 text-lime-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMetaExtraInfo = (lead: Lead) => {
    const meta = parseLeadMetadata(lead);
    switch (lead.leadType) {
      case "WEBINAR": return meta.college || meta.interest || "";
      case "PROGRAM": return meta.programSlug || "";
      case "JOB": return meta.jobTitle || "";
      case "CONTACT": return meta.subject || "";
      case "JOB_ALERT": return meta.domain || meta.location || "";
      case "CURRICULUM": return meta.programSlug || "";
      default: return "";
    }
  };

  const downloadLeadsExcel = () => {
    if (!filteredLeads.length) return;
    const rows = filteredLeads.map((lead: Lead) => {
      const meta = parseLeadMetadata(lead);
      const base: Record<string, string> = {
        Name: lead.fullName,
        Email: lead.email,
        Phone: lead.phone || "",
        "Lead Type": leadTypeLabel(lead.leadType),
        Source: lead.sourcePage,
        Status: lead.status,
        Date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "",
      };
      if (lead.leadType === "WEBINAR") {
        base["College"] = meta.college || "";
        base["Graduation Year"] = meta.graduationYear || "";
        base["Interest"] = meta.interest || "";
        base["LinkedIn"] = meta.linkedinProfile || "";
      } else if (lead.leadType === "PROGRAM") {
        base["Program"] = meta.programSlug || "";
        base["Interest / Status"] = meta.interest || meta.currentStatus || "";
      } else if (lead.leadType === "JOB") {
        base["Job Title"] = meta.jobTitle || "";
        base["Company"] = meta.company || "";
      } else if (lead.leadType === "CONTACT") {
        base["Subject"] = meta.subject || "";
        base["Message"] = meta.message || "";
      } else if (lead.leadType === "JOB_ALERT") {
        base["Location"] = meta.location || "";
        base["Domain"] = meta.domain || "";
        base["Experience"] = meta.experienceLevel || "";
      } else if (lead.leadType === "CURRICULUM") {
        base["Program"] = meta.programSlug || "";
        base["Interest"] = meta.interest || "";
      }
      if (lead.notes) base["Notes"] = lead.notes;
      return base;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${leadTab} Leads`);
    XLSX.writeFile(wb, `${leadTab.toLowerCase()}_leads_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderLeads = () => {
    if (leadsLoading) {
      return <div className="py-12 text-center"><p className="text-muted-foreground">Loading leads...</p></div>;
    }

    const metaHeaders = leadTab === "WEBINAR"
      ? ["College", "Grad Year", "Interest"]
      : leadTab === "PROGRAM"
        ? ["Program", "Interest / Status"]
        : leadTab === "JOB"
          ? ["Job Title", "Company"]
          : leadTab === "CONTACT"
            ? ["Subject"]
            : leadTab === "JOB_ALERT"
              ? ["Domain", "Location"]
              : leadTab === "CURRICULUM"
                ? ["Program", "Interest"]
                : leadTab === "NEWSLETTER"
                  ? ["Source"]
                  : ["Type", "Extra Info"];

    const getMetaCells = (lead: Lead) => {
      const meta = parseLeadMetadata(lead);
      switch (lead.leadType) {
        case "WEBINAR":
          return [meta.college || "-", meta.graduationYear || "-", meta.interest || "-"];
        case "PROGRAM":
          return [meta.programSlug || "-", meta.interest || meta.currentStatus || "-"];
        case "JOB":
          return [meta.jobTitle || "-", meta.company || "-"];
        case "CONTACT":
          return [meta.subject || "-"];
        case "JOB_ALERT":
          return [meta.domain || "-", meta.location || "-"];
        case "CURRICULUM":
          return [meta.programSlug || "-", meta.interest || "-"];
        case "NEWSLETTER":
          return [lead.sourcePage || "-"];
        default:
          return [leadTypeLabel(lead.leadType), getMetaExtraInfo(lead) || "-"];
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-2xl font-bold">Leads Management</h2>
          <div className="flex gap-2">
            {selectedLeads.size > 0 && (
              <Button onClick={() => setCampaignModalOpen(true)} size="sm">
                <Send className="h-4 w-4 mr-2" /> Email Campaign ({selectedLeads.size})
              </Button>
            )}
            <Button onClick={downloadLeadsExcel} variant="outline" size="sm" disabled={!filteredLeads.length}>
              <Download className="h-4 w-4 mr-2" /> Download Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{leadStatusCounts.total}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{leadStatusCounts.NEW}</p>
              <p className="text-xs text-muted-foreground">New</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{leadStatusCounts.CONTACTED}</p>
              <p className="text-xs text-muted-foreground">Contacted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{leadStatusCounts.CONVERTED}</p>
              <p className="text-xs text-muted-foreground">Converted</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-1 border-b overflow-x-auto pb-0">
          {[
            { key: "ALL", label: "All" },
            { key: "WEBINAR", label: "Webinar" },
            { key: "PROGRAM", label: "Program" },
            { key: "JOB", label: "Job" },
            { key: "CONTACT", label: "Contact" },
            { key: "JOB_ALERT", label: "Job Alert" },
            { key: "CURRICULUM", label: "Curriculum" },
            { key: "NEWSLETTER", label: "Newsletter" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setLeadTab(tab.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                leadTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs">
                ({tab.key === "ALL" ? (allLeads?.length || 0) : (leadTypeCounts[tab.key] || 0)})
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Input
            type="date"
            value={leadDateFilter}
            onChange={(e) => setLeadDateFilter(e.target.value)}
            className="w-auto"
          />
          <select
            value={leadSourceFilter}
            onChange={(e) => setLeadSourceFilter(e.target.value)}
            className="h-10 px-3 border rounded-md text-sm bg-white"
          >
            <option value="">All Sources</option>
            <option value="hero banner">Hero Banner</option>
            <option value="Webinar Popup">Webinar Popup</option>
            <option value="jobs page">Jobs Page</option>
            <option value="programs page">Programs Page</option>
            <option value="contact page">Contact Page</option>
            <option value="curriculum download">Curriculum Download</option>
            <option value="PGDM Customer Success">PGDM Page</option>
            <option value="pgdm-customer-success">PGDM Apply</option>
            <option value="partner registration">Partner Registration</option>
          </select>
          {(leadDateFilter || leadSourceFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setLeadDateFilter(""); setLeadSourceFilter(""); }}>
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {filteredLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 w-10">
                        <input
                          type="checkbox"
                          checked={filteredLeads.length > 0 && filteredLeads.every((l: Lead) => selectedLeads.has(l.id))}
                          onChange={(e) => {
                            const next = new Set(selectedLeads);
                            filteredLeads.forEach((l: Lead) => {
                              if (e.target.checked) next.add(l.id);
                              else next.delete(l.id);
                            });
                            setSelectedLeads(next);
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Phone</th>
                      {leadTab === "ALL" && <th className="text-left p-3 font-medium">Type</th>}
                      {metaHeaders.map((h) => (
                        <th key={h} className="text-left p-3 font-medium">{h}</th>
                      ))}
                      <th className="text-left p-3 font-medium">Source</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead: Lead) => {
                      return (
                      <tr key={lead.id} className={`border-b hover:bg-muted/30 cursor-pointer ${selectedLeads.has(lead.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedLeads.has(lead.id)}
                            onChange={(e) => {
                              const next = new Set(selectedLeads);
                              if (e.target.checked) next.add(lead.id);
                              else next.delete(lead.id);
                              setSelectedLeads(next);
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3 font-medium" onClick={() => { setSelectedLeadDetail(lead); setLeadDetailNotes(lead.notes || ""); }}>{lead.fullName}</td>
                        <td className="p-3 text-muted-foreground">{lead.email}</td>
                        <td className="p-3 text-muted-foreground">{lead.phone || "-"}</td>
                        {leadTab === "ALL" && (
                          <td className="p-3">
                            <Badge className={`text-xs ${leadTypeBadgeColor(lead.leadType)}`}>{leadTypeLabel(lead.leadType)}</Badge>
                          </td>
                        )}
                        {getMetaCells(lead).map((val, i) => (
                          <td key={i} className="p-3 text-muted-foreground">{val}</td>
                        ))}
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{lead.sourcePage}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={lead.status}
                            onValueChange={(v) => updateLeadStatusMutation.mutate({ id: lead.id, status: v })}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${leadStatusColor(lead.status)}`}>
                                  {lead.status.replace("_", " ")}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">New</SelectItem>
                              <SelectItem value="CONTACTED">Contacted</SelectItem>
                              <SelectItem value="CONVERTED">Converted</SelectItem>
                              <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedLeadDetail(lead); setLeadDetailNotes(lead.notes || ""); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No leads found</p>
                <p className="text-sm text-muted-foreground">Leads will appear here as visitors fill out forms on the site</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedLeadDetail} onOpenChange={(open) => { if (!open) setSelectedLeadDetail(null); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>Full information for this lead</DialogDescription>
            </DialogHeader>
            {selectedLeadDetail && (() => {
              const meta = parseLeadMetadata(selectedLeadDetail);
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{selectedLeadDetail.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedLeadDetail.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedLeadDetail.phone || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Lead Type</Label>
                      <p><Badge className={`text-xs ${leadTypeBadgeColor(selectedLeadDetail.leadType)}`}>{leadTypeLabel(selectedLeadDetail.leadType)}</Badge></p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Source</Label>
                      <p><Badge variant="outline" className="text-xs">{selectedLeadDetail.sourcePage}</Badge></p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <p className="text-sm">{selectedLeadDetail.createdAt ? new Date(selectedLeadDetail.createdAt).toLocaleString() : "-"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                      value={selectedLeadDetail.status}
                      onValueChange={(v) => {
                        updateLeadStatusMutation.mutate({ id: selectedLeadDetail.id, status: v });
                        setSelectedLeadDetail({ ...selectedLeadDetail, status: v });
                      }}
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${leadStatusColor(selectedLeadDetail.status)}`}>
                            {selectedLeadDetail.status.replace("_", " ")}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                        <SelectItem value="CONVERTED">Converted</SelectItem>
                        <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.keys(meta).length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Additional Information</Label>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        {Object.entries(meta).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-medium text-right max-w-[60%] break-words">{String(value) || "-"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Admin Notes</Label>
                    <Textarea
                      value={leadDetailNotes}
                      onChange={(e) => setLeadDetailNotes(e.target.value)}
                      placeholder="Add notes about this lead..."
                      rows={3}
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      disabled={updateLeadNotesMutation.isPending}
                      onClick={() => updateLeadNotesMutation.mutate({ id: selectedLeadDetail.id, notes: leadDetailNotes })}
                    >
                      {updateLeadNotesMutation.isPending ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderCampaigns = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Email Campaigns</h2>
          <Button onClick={() => { setCurrentPage('leads'); }} variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" /> Create from Leads
          </Button>
        </div>

        <Tabs value={campaignsTab} onValueChange={setCampaignsTab}>
          <TabsList>
            <TabsTrigger value="campaigns"><BarChart3 className="h-4 w-4 mr-1" /> Campaigns</TabsTrigger>
            <TabsTrigger value="templates"><Layers className="h-4 w-4 mr-1" /> Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Campaigns</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{campaigns?.reduce((a, c) => a + c.sent, 0) || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Sent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{campaigns?.reduce((a, c) => a + c.opened, 0) || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Opens</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{campaigns?.reduce((a, c) => a + c.clicked, 0) || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                {campaigns && campaigns.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Campaign</th>
                          <th className="text-left p-3 font-medium">Subject</th>
                          <th className="text-center p-3 font-medium">Sent</th>
                          <th className="text-center p-3 font-medium">Opened</th>
                          <th className="text-center p-3 font-medium">Clicked</th>
                          <th className="text-center p-3 font-medium">Open Rate</th>
                          <th className="text-center p-3 font-medium">Click Rate</th>
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((c) => {
                          const openRate = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : "0";
                          const clickRate = c.sent > 0 ? ((c.clicked / c.sent) * 100).toFixed(1) : "0";
                          return (
                            <tr key={c.id} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-medium">{c.campaignName}</td>
                              <td className="p-3 text-muted-foreground max-w-[200px] truncate">{c.subject}</td>
                              <td className="p-3 text-center">
                                <Badge variant="outline">{c.sent}</Badge>
                              </td>
                              <td className="p-3 text-center">
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  <Eye className="h-3 w-3 mr-1" />{c.opened}
                                </Badge>
                              </td>
                              <td className="p-3 text-center">
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  <MousePointerClick className="h-3 w-3 mr-1" />{c.clicked}
                                </Badge>
                              </td>
                              <td className="p-3 text-center font-medium">{openRate}%</td>
                              <td className="p-3 text-center font-medium">{clickRate}%</td>
                              <td className="p-3 text-muted-foreground whitespace-nowrap">
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
                              </td>
                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setViewingCampaignId(c.id);
                                    setCampaignDetailOpen(true);
                                  }}
                                >
                                  <BarChart3 className="h-4 w-4 mr-1" /> Details
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No campaigns yet</p>
                    <p className="text-sm text-muted-foreground">Go to Leads, select recipients, and create your first email campaign</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Create reusable email templates for your campaigns</p>
              <Button onClick={() => {
                setEditingTemplate(null);
                setTemplateName(""); setTemplateSubject(""); setTemplateBody("");
                setTemplateModalOpen(true);
              }} size="sm">
                <Plus className="h-4 w-4 mr-2" /> New Template
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {emailTemplates && emailTemplates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Template Name</th>
                          <th className="text-left p-3 font-medium">Subject</th>
                          <th className="text-left p-3 font-medium">Created</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailTemplates.map((t) => (
                          <tr key={t.id} className="border-b hover:bg-muted/30">
                            <td className="p-3 font-medium">{t.templateName}</td>
                            <td className="p-3 text-muted-foreground max-w-[300px] truncate">{t.subject}</td>
                            <td className="p-3 text-muted-foreground whitespace-nowrap">
                              {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setPreviewHtml(t.emailBody);
                                  setPreviewTemplateOpen(true);
                                }}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setEditingTemplate(t);
                                  setTemplateName(t.templateName);
                                  setTemplateSubject(t.subject);
                                  setTemplateBody(t.emailBody);
                                  setTemplateModalOpen(true);
                                }}>
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{t.templateName}"? This cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteTemplateMutation.mutate(t.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No templates yet</p>
                    <p className="text-sm text-muted-foreground">Create your first reusable email template</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation onNavigate={setCurrentPage} currentPage={currentPage} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && renderDashboard()}
        {currentPage === 'leads' && renderLeads()}
        {currentPage === 'campaigns' && renderCampaigns()}
        {currentPage === 'create-job' && renderCreateJob()}
        {currentPage === 'posted-jobs' && renderPostedJobs()}
        {currentPage === 'alerts' && renderJobAlerts()}
        {currentPage === 'applications' && renderApplications()}
        {currentPage === 'partners' && renderPartnerRegistrations()}
        {currentPage === 'tests' && renderTests()}
        {currentPage === 'candidates' && renderCandidates()}
      </div>

      {/* Campaign Creation Modal */}
      <Dialog open={campaignModalOpen} onOpenChange={(open) => {
        setCampaignModalOpen(open);
        if (!open) { setCampaignMode("new"); setSelectedTemplateId(""); }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>
              Send an email to {selectedLeads.size} selected lead{selectedLeads.size !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 border rounded-lg p-1">
              <button
                onClick={() => { setCampaignMode("new"); setSelectedTemplateId(""); }}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  campaignMode === "new" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create New
              </button>
              <button
                onClick={() => setCampaignMode("template")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  campaignMode === "template" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Use Existing Template
              </button>
            </div>

            {campaignMode === "new" && (
              <div>
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g. March Webinar Follow-up"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
            )}

            {campaignMode === "template" && (
              <div>
                <Label>Select Template</Label>
                {emailTemplates && emailTemplates.length > 0 ? (
                  <Select
                    value={selectedTemplateId}
                    onValueChange={(val) => {
                      setSelectedTemplateId(val);
                      const tmpl = emailTemplates?.find((t) => t.id === parseInt(val));
                      if (tmpl) {
                        setCampaignSubject(tmpl.subject);
                        setCampaignBody(tmpl.emailBody);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.templateName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="border rounded-md p-4 text-center bg-muted/30">
                    <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No templates created yet</p>
                    <Button variant="link" size="sm" className="mt-1" onClick={() => {
                      setCampaignModalOpen(false);
                      setCurrentPage('campaigns');
                      setCampaignsTab('templates');
                    }}>
                      Go to Templates to create one
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Email Subject</Label>
              <Input
                placeholder="e.g. Don't miss our upcoming webinar!"
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
              />
            </div>
            <div>
              <Label>Email Body (HTML)</Label>
              <Textarea
                placeholder="Write your email content here. Use {{name}}, {{email}}, {{college}}, {{graduationYear}}, {{interest}} as variables."
                value={campaignBody}
                onChange={(e) => setCampaignBody(e.target.value)}
                rows={10}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {"{{name}}"}, {"{{email}}"}, {"{{phone}}"}, {"{{college}}"}, {"{{graduationYear}}"}, {"{{interest}}"}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCampaignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const finalCampaignName = campaignMode === "template"
                    ? (emailTemplates?.find(t => t.id === parseInt(selectedTemplateId))?.templateName || "Template Campaign")
                    : campaignName;
                  if ((campaignMode === "new" && !campaignName) || !campaignSubject || !campaignBody) {
                    toast({ title: "Please fill all fields", variant: "destructive" });
                    return;
                  }
                  sendCampaignMutation.mutate({
                    campaignName: finalCampaignName,
                    subject: campaignSubject,
                    body: campaignBody,
                    leadIds: Array.from(selectedLeads),
                  });
                }}
                disabled={sendCampaignMutation.isPending}
              >
                {sendCampaignMutation.isPending ? (
                  <>Sending...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Send Campaign</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Campaign Modal */}
      <Dialog open={candidateCampaignModalOpen} onOpenChange={(open) => {
        setCandidateCampaignModalOpen(open);
        if (!open) {
          setCandidateCampaignMode("new");
          setCandidateSelectedTemplateId("");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Campaign to Candidates</DialogTitle>
            <DialogDescription>
              Send an email to {selectedCandidates.size} selected candidate{selectedCandidates.size !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 border rounded-lg p-1">
              <button
                onClick={() => { setCandidateCampaignMode("new"); setCandidateSelectedTemplateId(""); }}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  candidateCampaignMode === "new" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create New
              </button>
              <button
                onClick={() => setCandidateCampaignMode("template")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  candidateCampaignMode === "template" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Use Existing Template
              </button>
            </div>

            {candidateCampaignMode === "new" && (
              <div>
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g. Hiring Drive April"
                  value={candidateCampaignName}
                  onChange={(e) => setCandidateCampaignName(e.target.value)}
                />
              </div>
            )}

            {candidateCampaignMode === "template" && (
              <div>
                <Label>Select Template</Label>
                {emailTemplates && emailTemplates.length > 0 ? (
                  <Select
                    value={candidateSelectedTemplateId}
                    onValueChange={(val) => {
                      setCandidateSelectedTemplateId(val);
                      const tmpl = emailTemplates?.find((t) => t.id === parseInt(val));
                      if (tmpl) {
                        setCandidateCampaignSubject(tmpl.subject);
                        setCandidateCampaignBody(tmpl.emailBody);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.templateName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="border rounded-md p-4 text-center bg-muted/30">
                    <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No templates created yet</p>
                    <Button variant="link" size="sm" className="mt-1" onClick={() => {
                      setCandidateCampaignModalOpen(false);
                      setCurrentPage('campaigns');
                      setCampaignsTab('templates');
                    }}>
                      Go to Templates to create one
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Email Subject</Label>
              <Input
                placeholder="e.g. Exciting opportunity at SkillVeda"
                value={candidateCampaignSubject}
                onChange={(e) => setCandidateCampaignSubject(e.target.value)}
              />
            </div>
            <div>
              <Label>Email Body (HTML)</Label>
              <Textarea
                placeholder="Write your email content here. Use {{name}}, {{email}}, {{phone}}, {{location}}, {{experience}} as variables."
                value={candidateCampaignBody}
                onChange={(e) => setCandidateCampaignBody(e.target.value)}
                rows={10}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {"{{name}}"}, {"{{email}}"}, {"{{phone}}"}, {"{{location}}"}, {"{{experience}}"}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCandidateCampaignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const finalName = candidateCampaignMode === "template"
                    ? (emailTemplates?.find(t => t.id === parseInt(candidateSelectedTemplateId))?.templateName || "Candidate Campaign")
                    : candidateCampaignName;
                  if ((candidateCampaignMode === "new" && !candidateCampaignName) || !candidateCampaignSubject || !candidateCampaignBody) {
                    toast({ title: "Please fill all fields", variant: "destructive" });
                    return;
                  }
                  sendCandidateCampaignMutation.mutate({
                    campaignName: finalName,
                    subject: candidateCampaignSubject,
                    body: candidateCampaignBody,
                    candidateIds: Array.from(selectedCandidates),
                  });
                }}
                disabled={sendCandidateCampaignMutation.isPending}
              >
                {sendCandidateCampaignMutation.isPending ? (
                  <>Sending...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Send Campaign</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Detail Dialog */}
      <Dialog open={campaignDetailOpen} onOpenChange={(open) => { setCampaignDetailOpen(open); if (!open) setViewingCampaignId(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{campaignDetail?.campaign?.campaignName || "Campaign Details"}</DialogTitle>
            <DialogDescription>
              {campaignDetail?.campaign?.subject || ""}
            </DialogDescription>
          </DialogHeader>
          {campaignDetail?.recipients ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-2xl font-bold">{campaignDetail.recipients.length}</p>
                    <p className="text-xs text-muted-foreground">Recipients</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{campaignDetail.recipients.filter((r: any) => r.opened).length}</p>
                    <p className="text-xs text-muted-foreground">Opened</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{campaignDetail.recipients.filter((r: any) => r.clicked).length}</p>
                    <p className="text-xs text-muted-foreground">Clicked</p>
                  </CardContent>
                </Card>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-center p-3 font-medium">Status</th>
                      <th className="text-center p-3 font-medium">Opened</th>
                      <th className="text-center p-3 font-medium">Clicked</th>
                      <th className="text-left p-3 font-medium">Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignDetail.recipients.map((r: any) => (
                      <tr key={r.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">{r.leadName}</td>
                        <td className="p-3 text-muted-foreground">{r.email}</td>
                        <td className="p-3 text-center">
                          <Badge variant={r.status === "sent" ? "default" : "destructive"} className="text-xs">
                            {r.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {r.opened ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              {r.openedAt ? new Date(r.openedAt).toLocaleString() : "Yes"}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {r.clicked ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                              <MousePointerClick className="h-3 w-3 mr-1" />
                              {r.clickedAt ? new Date(r.clickedAt).toLocaleString() : "Yes"}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {r.sentAt ? new Date(r.sentAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading campaign details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Create/Edit Modal */}
      <Dialog open={templateModalOpen} onOpenChange={(open) => {
        setTemplateModalOpen(open);
        if (!open) { setEditingTemplate(null); setTemplateName(""); setTemplateSubject(""); setTemplateBody(""); }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? "Update your email template" : "Create a reusable email template for campaigns"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                placeholder="e.g. Webinar Invitation"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div>
              <Label>Subject Line</Label>
              <Input
                placeholder="e.g. You're invited to our webinar!"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
              />
            </div>
            <div>
              <Label>Email Body (HTML)</Label>
              <Textarea
                placeholder="Write your email template here. Use {{name}}, {{email}}, {{college}}, {{graduationYear}}, {{interest}} as variables."
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                rows={12}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {"{{name}}"}, {"{{email}}"}, {"{{phone}}"}, {"{{college}}"}, {"{{graduationYear}}"}, {"{{interest}}"}
              </p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                if (templateBody) {
                  setPreviewHtml(templateBody);
                  setPreviewTemplateOpen(true);
                }
              }} disabled={!templateBody}>
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTemplateModalOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    if (!templateName || !templateSubject || !templateBody) {
                      toast({ title: "Please fill all fields", variant: "destructive" });
                      return;
                    }
                    if (editingTemplate) {
                      updateTemplateMutation.mutate({ id: editingTemplate.id, templateName, subject: templateSubject, emailBody: templateBody });
                    } else {
                      createTemplateMutation.mutate({ templateName, subject: templateSubject, emailBody: templateBody });
                    }
                  }}
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                >
                  {editingTemplate ? "Update Template" : "Save Template"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={previewTemplateOpen} onOpenChange={setPreviewTemplateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>Preview of how your email will look</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Results Dialog */}
      <Dialog open={testResultDialogOpen} onOpenChange={setTestResultDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Results & AI Evaluation</DialogTitle>
            <DialogDescription>
              Detailed test performance and AI-powered assessment
            </DialogDescription>
          </DialogHeader>
          
          {testSessionLoading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading test results...</p>
            </div>
          ) : !testSessionData || !testSessionData.session ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No test results available. The candidate may not have completed the test yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Test Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400 capitalize">
                        {testSessionData.session.status}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {testSessionData.session.score}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {testSessionData.session.totalQuestions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Evaluation */}
              {testSessionData.session.llmOverallScore && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI-Powered Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Overall Score */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall AI Score</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {testSessionData.session.llmOverallScore}/10
                        </span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    {testSessionData.session.llmBreakdown && (() => {
                      try {
                        const breakdown = JSON.parse(testSessionData.session.llmBreakdown);
                        return (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Knowledge Depth</p>
                              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                {breakdown.knowledge_depth}/10
                              </p>
                            </div>
                            <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg text-center">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Consistency</p>
                              <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                                {breakdown.consistency}/10
                              </p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Domain Expertise</p>
                              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {breakdown.domain_expertise}/10
                              </p>
                            </div>
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}

                    {/* AI Feedback */}
                    {testSessionData.session.llmFeedback && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">AI Feedback</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {testSessionData.session.llmFeedback}
                        </p>
                      </div>
                    )}

                    {/* Flags */}
                    {testSessionData.session.llmFlags && testSessionData.session.llmFlags.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                          <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Review Flags</h4>
                            <ul className="mt-1 text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
                              {testSessionData.session.llmFlags.map((flag: string, index: number) => (
                                <li key={index}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Review Badge */}
                    {testSessionData.session.manualReviewNeeded && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                            ⚠️ Manual Review Recommended
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Confidence Score */}
                    {testSessionData.session.llmConfidence && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        AI Confidence: {(parseFloat(testSessionData.session.llmConfidence) * 100).toFixed(1)}%
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timing Information */}
              {testSessionData.session.startedAt && testSessionData.session.completedAt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Started At:</span>
                      <span className="font-medium">{new Date(testSessionData.session.startedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Completed At:</span>
                      <span className="font-medium">{new Date(testSessionData.session.completedAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}