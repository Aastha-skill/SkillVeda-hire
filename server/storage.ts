import { users, jobs, applications, aiInterviews, jobAlerts, partnerRegistrations, studentProfiles, questions, testSessions, testResponses, candidates, programApplications, curriculumLeads, webinarRegistrations, leads, emailTemplates, emailCampaigns, emailCampaignRecipients, type User, type InsertUser, type Job, type InsertJob, type Application, type InsertApplication, type AiInterview, type InsertAiInterview, type JobAlert, type InsertJobAlert, type PartnerRegistration, type InsertPartnerRegistration, type StudentProfile, type InsertStudentProfile, type Question, type InsertQuestion, type TestSession, type InsertTestSession, type TestResponse, type InsertTestResponse, type Candidate, type InsertCandidate, type ProgramApplication, type InsertProgramApplication, type CurriculumLead, type InsertCurriculumLead, type WebinarRegistration, type InsertWebinarRegistration, type Lead, type InsertLead, type EmailTemplate, type InsertEmailTemplate, type EmailCampaign, type InsertEmailCampaign, type EmailCampaignRecipient, type InsertEmailCampaignRecipient } from "@shared/schema";
import { db } from "./db";
import { eq, sql, ilike, desc, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Job methods
  getAllJobs(): Promise<Job[]>;
  getJobById(id: number): Promise<Job | undefined>;
  getJobsByFilters(filters: { search?: string; location?: string; domain?: string; experienceLevel?: string }): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: InsertJob): Promise<Job | undefined>;

  // Application methods
  getApplicationById(id: number): Promise<Application | undefined>;
  getApplicationsByJobId(jobId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;

  // AI Interview methods
  getAiInterviewById(id: number): Promise<AiInterview | undefined>;
  getAiInterviewByApplicationId(applicationId: number): Promise<AiInterview | undefined>;
  createAiInterview(interview: InsertAiInterview): Promise<AiInterview>;
  updateAiInterviewStatus(id: number, status: string, feedback?: string, score?: number): Promise<AiInterview | undefined>;

  // Job deletion
  deleteJob(id: number): Promise<boolean>;

  // Job Alert methods
  getAllJobAlerts(): Promise<JobAlert[]>;
  getJobAlertById(id: number): Promise<JobAlert | undefined>;
  createJobAlert(jobAlert: InsertJobAlert): Promise<JobAlert>;
  deleteJobAlert(id: number): Promise<boolean>;

  // Partner Registration methods
  getAllPartnerRegistrations(): Promise<PartnerRegistration[]>;
  getPartnerRegistrationById(id: number): Promise<PartnerRegistration | undefined>;
  createPartnerRegistration(partnerRegistration: InsertPartnerRegistration): Promise<PartnerRegistration>;
  deletePartnerRegistration(id: number): Promise<boolean>;

  // Student Profile methods
  getStudentProfileByEmail(email: string): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(email: string, profile: Partial<InsertStudentProfile>): Promise<StudentProfile | undefined>;

  // Question methods
  getAllQuestions(): Promise<Question[]>;
  getQuestionsByDomain(domain: string): Promise<Question[]>;
  getQuestionsByJobId(jobId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  deleteQuestion(id: number): Promise<boolean>;

  // Test Session methods
  getTestSessionByToken(token: string): Promise<TestSession | undefined>;
  getTestSessionByApplicationId(applicationId: number): Promise<TestSession | undefined>;
  getAllTestSessions(): Promise<TestSession[]>;
  getTestSessionsForManualReview(): Promise<TestSession[]>;
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  updateTestSession(id: number, data: Partial<{
    status: string;
    startedAt: Date;
    completedAt: Date;
    score: number;
    llmOverallScore: number;
    llmBreakdown: string;
    llmFeedback: string;
    llmConfidence: number;
    llmFlags: string[];
    manualReviewNeeded: boolean;
    manualReviewDone: boolean;
    ipAddress: string;
    userAgent: string;
  }>): Promise<TestSession | undefined>;

  // Test Response methods
  getTestResponsesBySessionId(sessionId: number): Promise<TestResponse[]>;
  createTestResponse(response: InsertTestResponse): Promise<TestResponse>;

  // Candidate methods
  getCandidates(options: { page?: number; pageSize?: number; search?: string }): Promise<{ candidates: Candidate[]; total: number }>;
  bulkInsertCandidates(candidateData: InsertCandidate[]): Promise<{ inserted: number; skipped: number }>;
  deleteCandidate(id: number): Promise<boolean>;

  // Program Application methods
  createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication>;
  getAllProgramApplications(): Promise<ProgramApplication[]>;

  // Curriculum Lead methods
  createCurriculumLead(lead: InsertCurriculumLead): Promise<CurriculumLead>;
  getAllCurriculumLeads(): Promise<CurriculumLead[]>;

  // Webinar Registration methods
  createWebinarRegistration(registration: InsertWebinarRegistration): Promise<WebinarRegistration>;
  getAllWebinarRegistrations(): Promise<WebinarRegistration[]>;

  // Lead methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadsByType(leadType: string): Promise<Lead[]>;
  getAllLeads(): Promise<Lead[]>;
  updateLeadStatus(id: number, status: string): Promise<Lead | undefined>;
  updateLeadNotes(id: number, notes: string): Promise<Lead | undefined>;
  getLeadById(id: number): Promise<Lead | undefined>;

  // Email Template methods
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateById(id: number): Promise<EmailTemplate | undefined>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<void>;

  // Email Campaign methods
  createCampaign(campaign: InsertEmailCampaign & { totalRecipients?: number }): Promise<EmailCampaign>;
  getAllCampaigns(): Promise<EmailCampaign[]>;
  getCampaignById(id: number): Promise<EmailCampaign | undefined>;
  createCampaignRecipient(recipient: InsertEmailCampaignRecipient): Promise<EmailCampaignRecipient>;
  getCampaignRecipients(campaignId: number): Promise<EmailCampaignRecipient[]>;
  updateRecipientStatus(id: number, status: string): Promise<void>;
  updateRecipientOpened(id: number): Promise<void>;
  updateRecipientClicked(id: number): Promise<void>;
  getEngagementByLeadIds(leadIds: number[]): Promise<Map<number, { opened: boolean; clicked: boolean }>>;
  updateLeadEmailStatus(id: number, emailStatus: string): Promise<void>;
  updateCandidateEmailStatus(id: number, emailStatus: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeJobs();
  }

  private async initializeJobs() {
    try {
    const existingJobs = await this.getAllJobs();
    if (existingJobs.length > 0) return;

    const sampleJobs: InsertJob[] = [
      {
        title: "Software Engineer - Work Integrated Learning",
        company: "TechCorp Solutions",
        location: "Bangalore, India",
        type: "Full-time",
        salary: "₹4-6 LPA + Education",
        description: "Join our team as a Software Engineer while pursuing your Computer Science degree through our partner university. This unique work-integrated learning program allows you to earn a competitive salary while gaining real industry experience and completing your degree with no student debt.",
        responsibilities: [
          "Develop and maintain web applications using modern JavaScript frameworks",
          "Collaborate with senior developers on real client projects",
          "Participate in code reviews and agile development processes",
          "Attend university classes (integrated into work schedule)",
          "Complete industry-relevant projects as part of your degree curriculum"
        ],
        requirements: [
          "12th grade completed or equivalent",
          "Basic understanding of programming concepts",
          "Willingness to learn and adapt to new technologies",
          "Strong communication and collaboration skills",
          "Commitment to 3-4 year program duration"
        ],
        benefits: [
          "Competitive salary + annual increments",
          "Fully sponsored degree program",
          "Latest development tools & equipment",
          "Mentorship from senior developers",
          "Flexible work-study schedule",
          "Industry certifications"
        ],
        skills: ["JavaScript", "React", "Node.js", "Degree Program"],
        domain: "Technology",
        experienceLevel: "Fresher",
        isActive: true,
        icon: "fas fa-code",
        iconColor: "blue"
      },
      {
        title: "Digital Marketing Specialist - WIL Program",
        company: "GrowthHub Marketing",
        location: "Mumbai, India",
        type: "Full-time",
        salary: "₹3.5-5 LPA + Education",
        description: "Launch your marketing career while earning your MBA in Marketing through our partner university. Work on real campaigns, analyze data, and build your portfolio with industry-leading brands while completing your degree with practical experience.",
        responsibilities: [
          "Execute digital marketing campaigns across multiple channels",
          "Analyze campaign performance and optimize for better results",
          "Create content for social media and marketing materials",
          "Attend MBA classes (integrated into work schedule)",
          "Work on real client projects as part of degree curriculum"
        ],
        requirements: [
          "12th grade completed or Bachelor's degree",
          "Interest in digital marketing and analytics",
          "Creative thinking and problem-solving skills",
          "Good written and verbal communication",
          "Commitment to MBA program duration"
        ],
        benefits: [
          "Competitive salary with performance bonuses",
          "Fully sponsored MBA program",
          "Access to premium marketing tools",
          "Industry mentorship and networking",
          "Flexible work-study arrangement",
          "Professional certifications"
        ],
        skills: ["SEO/SEM", "Social Media", "Analytics", "MBA Program"],
        domain: "Marketing",
        experienceLevel: "Fresher",
        isActive: true,
        icon: "fas fa-bullhorn",
        iconColor: "purple"
      },
      {
        title: "UX Designer - Learning & Earning Track",
        company: "DesignForward Studio",
        location: "Remote",
        type: "Full-time",
        salary: "₹4-7 LPA + Education",
        description: "Create beautiful, user-centered designs while pursuing your Bachelor's in Design through our partner university. Work with startups and enterprises to build your design portfolio and skills while earning your degree with real-world experience.",
        responsibilities: [
          "Design user interfaces for web and mobile applications",
          "Conduct user research and create wireframes",
          "Collaborate with development teams on implementation",
          "Attend design degree classes (flexible schedule)",
          "Build portfolio through real client projects"
        ],
        requirements: [
          "12th grade completed with creative aptitude",
          "Basic understanding of design principles",
          "Familiarity with design tools (Figma, Adobe Creative Suite)",
          "Strong visual communication skills",
          "Commitment to design degree program"
        ],
        benefits: [
          "Competitive salary based on portfolio growth",
          "Fully sponsored design degree",
          "Access to premium design software",
          "Mentorship from senior designers",
          "Remote work flexibility",
          "Industry portfolio development"
        ],
        skills: ["Figma", "User Research", "Prototyping", "Design Degree"],
        domain: "Design",
        experienceLevel: "Fresher",
        isActive: true,
        icon: "fas fa-paint-brush",
        iconColor: "pink"
      }
    ];

    for (const job of sampleJobs) {
      await this.createJob(job);
    }
    } catch (err) {
      console.warn("initializeJobs: DB not ready, skipping seed:", (err as Error).message);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Job methods
  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.isActive, true));
  }

  async getJobById(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async getJobsByFilters(filters: { search?: string; location?: string; domain?: string; experienceLevel?: string }): Promise<Job[]> {
    let query = db.select().from(jobs).where(eq(jobs.isActive, true));

    const allJobs = await query;
    let filteredJobs = allJobs;

    // Search functionality - filter by job title, company name, or skills
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase().trim();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
      );
    }

    if (filters.location && filters.location !== "All Locations") {
      filteredJobs = filteredJobs.filter(job => job.location.includes(filters.location!));
    }

    if (filters.domain && filters.domain !== "All Domains") {
      filteredJobs = filteredJobs.filter(job => job.domain === filters.domain);
    }

    if (filters.experienceLevel && filters.experienceLevel !== "Experience Level") {
      filteredJobs = filteredJobs.filter(job => job.experienceLevel === filters.experienceLevel);
    }

    return filteredJobs;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async updateJob(id: number, insertJob: InsertJob): Promise<Job | undefined> {
    const [job] = await db
      .update(jobs)
      .set(insertJob)
      .where(eq(jobs.id, id))
      .returning();
    return job || undefined;
  }

  // Application methods
  async getApplicationById(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationsByJobId(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  // AI Interview methods
  async getAiInterviewById(id: number): Promise<AiInterview | undefined> {
    const [interview] = await db.select().from(aiInterviews).where(eq(aiInterviews.id, id));
    return interview || undefined;
  }

  async getAiInterviewByApplicationId(applicationId: number): Promise<AiInterview | undefined> {
    const [interview] = await db.select().from(aiInterviews).where(eq(aiInterviews.applicationId, applicationId));
    return interview || undefined;
  }

  async createAiInterview(insertInterview: InsertAiInterview): Promise<AiInterview> {
    const [interview] = await db
      .insert(aiInterviews)
      .values(insertInterview)
      .returning();
    return interview;
  }

  async updateAiInterviewStatus(id: number, status: string, feedback?: string, score?: number): Promise<AiInterview | undefined> {
    const updateData: any = { status };
    if (feedback) updateData.feedback = feedback;
    if (score) updateData.score = score;

    const [interview] = await db
      .update(aiInterviews)
      .set(updateData)
      .where(eq(aiInterviews.id, id))
      .returning();
    return interview || undefined;
  }

  async deleteJob(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(jobs)
        .where(eq(jobs.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting job:", error);
      return false;
    }
  }

  async getAllJobAlerts(): Promise<JobAlert[]> {
    return await db.select().from(jobAlerts);
  }

  async getJobAlertById(id: number): Promise<JobAlert | undefined> {
    const [jobAlert] = await db.select().from(jobAlerts).where(eq(jobAlerts.id, id));
    return jobAlert || undefined;
  }

  async createJobAlert(insertJobAlert: InsertJobAlert): Promise<JobAlert> {
    const [jobAlert] = await db
      .insert(jobAlerts)
      .values(insertJobAlert)
      .returning();
    return jobAlert;
  }

  async deleteJobAlert(id: number): Promise<boolean> {
    try {
      await db.delete(jobAlerts).where(eq(jobAlerts.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting job alert:", error);
      return false;
    }
  }

  // Partner Registration methods
  async getAllPartnerRegistrations(): Promise<PartnerRegistration[]> {
    return await db.select().from(partnerRegistrations);
  }

  async getPartnerRegistrationById(id: number): Promise<PartnerRegistration | undefined> {
    const [registration] = await db.select().from(partnerRegistrations).where(eq(partnerRegistrations.id, id));
    return registration || undefined;
  }

  async createPartnerRegistration(insertRegistration: InsertPartnerRegistration): Promise<PartnerRegistration> {
    const [registration] = await db
      .insert(partnerRegistrations)
      .values(insertRegistration)
      .returning();
    return registration;
  }

  async deletePartnerRegistration(id: number): Promise<boolean> {
    try {
      await db.delete(partnerRegistrations).where(eq(partnerRegistrations.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting partner registration:", error);
      return false;
    }
  }

  // Student Profile methods
  async getStudentProfileByEmail(email: string): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.email, email));
    return profile || undefined;
  }

  async createStudentProfile(insertProfile: InsertStudentProfile): Promise<StudentProfile> {
    const [profile] = await db
      .insert(studentProfiles)
      .values({
        ...insertProfile,
        updatedAt: new Date(),
      })
      .returning();
    return profile;
  }

  async updateStudentProfile(email: string, profileData: Partial<InsertStudentProfile>): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .update(studentProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.email, email))
      .returning();
    return profile || undefined;
  }

  // Question methods
  async getAllQuestions(): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.isActive, true));
  }

  async getQuestionsByDomain(domain: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.domain, domain));
  }

  async getQuestionsByJobId(jobId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.jobId, jobId));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    try {
      await db.delete(questions).where(eq(questions.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      return false;
    }
  }

  // Test Session methods
  async getTestSessionByToken(token: string): Promise<TestSession | undefined> {
    const [session] = await db.select().from(testSessions).where(eq(testSessions.token, token));
    return session || undefined;
  }

  async getTestSessionByApplicationId(applicationId: number): Promise<TestSession | undefined> {
    const [session] = await db.select().from(testSessions).where(eq(testSessions.applicationId, applicationId));
    return session || undefined;
  }

  async createTestSession(insertSession: InsertTestSession): Promise<TestSession> {
    const [session] = await db
      .insert(testSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getAllTestSessions(): Promise<TestSession[]> {
    return await db.select().from(testSessions);
  }

  async getTestSessionsForManualReview(): Promise<TestSession[]> {
    return await db.select().from(testSessions).where(eq(testSessions.manualReviewNeeded, true));
  }

  async updateTestSession(id: number, data: Partial<{
    status: string;
    startedAt: Date;
    completedAt: Date;
    score: number;
    llmOverallScore: number;
    llmBreakdown: string;
    llmFeedback: string;
    llmConfidence: number;
    llmFlags: string[];
    manualReviewNeeded: boolean;
    manualReviewDone: boolean;
    ipAddress: string;
    userAgent: string;
  }>): Promise<TestSession | undefined> {
    // Convert llmConfidence number to string for decimal column if present
    const updateData: any = { ...data };
    if (typeof updateData.llmConfidence === 'number') {
      updateData.llmConfidence = updateData.llmConfidence.toString();
    }
    
    const [session] = await db
      .update(testSessions)
      .set(updateData)
      .where(eq(testSessions.id, id))
      .returning();
    return session || undefined;
  }

  // Test Response methods
  async getTestResponsesBySessionId(sessionId: number): Promise<TestResponse[]> {
    return await db.select().from(testResponses).where(eq(testResponses.sessionId, sessionId));
  }

  async createTestResponse(insertResponse: InsertTestResponse): Promise<TestResponse> {
    const [response] = await db
      .insert(testResponses)
      .values(insertResponse)
      .returning();
    return response;
  }

  // Candidate methods
  async getCandidates(options: { page?: number; pageSize?: number; search?: string }): Promise<{ candidates: Candidate[]; total: number }> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 50;
    const offset = (page - 1) * pageSize;

    let conditions: any[] = [];
    if (options.search && options.search.trim()) {
      const searchTerm = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(candidates.fullName, searchTerm),
          ilike(candidates.email, searchTerm),
          ilike(candidates.currentLocation, searchTerm),
          ilike(candidates.preferredLocation, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? conditions[0] : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(candidates)
      .where(whereClause);

    const results = await db
      .select()
      .from(candidates)
      .where(whereClause)
      .orderBy(desc(candidates.createdAt))
      .limit(pageSize)
      .offset(offset);

    return { candidates: results, total: countResult.count };
  }

  async bulkInsertCandidates(candidateData: InsertCandidate[]): Promise<{ inserted: number; skipped: number }> {
    let inserted = 0;
    let skipped = 0;

    const BATCH_SIZE = 100;
    for (let i = 0; i < candidateData.length; i += BATCH_SIZE) {
      const batch = candidateData.slice(i, i + BATCH_SIZE);
      try {
        const result = await db
          .insert(candidates)
          .values(batch)
          .onConflictDoNothing({ target: candidates.email })
          .returning();
        inserted += result.length;
        skipped += batch.length - result.length;
      } catch (error) {
        console.error(`Error inserting batch at index ${i}:`, error);
        skipped += batch.length;
      }
    }

    return { inserted, skipped };
  }

  async deleteCandidate(id: number): Promise<boolean> {
    try {
      await db.delete(candidates).where(eq(candidates.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting candidate:", error);
      return false;
    }
  }

  async createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication> {
    const [result] = await db.insert(programApplications).values(application).returning();
    return result;
  }

  async getAllProgramApplications(): Promise<ProgramApplication[]> {
    return await db.select().from(programApplications).orderBy(desc(programApplications.createdAt));
  }

  async createCurriculumLead(lead: InsertCurriculumLead): Promise<CurriculumLead> {
    const [result] = await db.insert(curriculumLeads).values(lead).returning();
    return result;
  }

  async getAllCurriculumLeads(): Promise<CurriculumLead[]> {
    return await db.select().from(curriculumLeads).orderBy(desc(curriculumLeads.createdAt));
  }

  async createWebinarRegistration(registration: InsertWebinarRegistration): Promise<WebinarRegistration> {
    const [result] = await db.insert(webinarRegistrations).values(registration).returning();
    return result;
  }

  async getAllWebinarRegistrations(): Promise<WebinarRegistration[]> {
    return await db.select().from(webinarRegistrations).orderBy(desc(webinarRegistrations.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [result] = await db.insert(leads).values(lead).returning();
    return result;
  }

  async getLeadsByType(leadType: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.leadType, leadType)).orderBy(desc(leads.createdAt));
  }

  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    const [result] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
    return result;
  }

  async updateLeadNotes(id: number, notes: string): Promise<Lead | undefined> {
    const [result] = await db.update(leads).set({ notes }).where(eq(leads.id, id)).returning();
    return result;
  }

  async getLeadById(id: number): Promise<Lead | undefined> {
    const [result] = await db.select().from(leads).where(eq(leads.id, id));
    return result;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [result] = await db.insert(emailTemplates).values(template).returning();
    return result;
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
  }

  async getEmailTemplateById(id: number): Promise<EmailTemplate | undefined> {
    const [result] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return result;
  }

  async updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [result] = await db.update(emailTemplates).set(template).where(eq(emailTemplates.id, id)).returning();
    return result;
  }

  async deleteEmailTemplate(id: number): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  async createCampaign(campaign: InsertEmailCampaign & { totalRecipients?: number }): Promise<EmailCampaign> {
    const [result] = await db.insert(emailCampaigns).values(campaign).returning();
    return result;
  }

  async getAllCampaigns(): Promise<EmailCampaign[]> {
    return await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
  }

  async getCampaignById(id: number): Promise<EmailCampaign | undefined> {
    const [result] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return result;
  }

  async createCampaignRecipient(recipient: InsertEmailCampaignRecipient): Promise<EmailCampaignRecipient> {
    const [result] = await db.insert(emailCampaignRecipients).values(recipient).returning();
    return result;
  }

  async getCampaignRecipients(campaignId: number): Promise<EmailCampaignRecipient[]> {
    return await db.select().from(emailCampaignRecipients).where(eq(emailCampaignRecipients.campaignId, campaignId));
  }

  async updateRecipientStatus(id: number, status: string): Promise<void> {
    const updates: any = { status };
    if (status === "sent") updates.sentAt = new Date();
    await db.update(emailCampaignRecipients).set(updates).where(eq(emailCampaignRecipients.id, id));
  }

  async updateRecipientOpened(id: number): Promise<void> {
    await db.update(emailCampaignRecipients).set({ opened: true, openedAt: new Date() }).where(eq(emailCampaignRecipients.id, id));
  }

  async updateRecipientClicked(id: number): Promise<void> {
    await db.update(emailCampaignRecipients).set({ clicked: true, clickedAt: new Date() }).where(eq(emailCampaignRecipients.id, id));
  }

  async getEngagementByLeadIds(leadIds: number[]): Promise<Map<number, { opened: boolean; clicked: boolean }>> {
    const result = new Map<number, { opened: boolean; clicked: boolean }>();
    if (leadIds.length === 0) return result;
    const recipients = await db.select().from(emailCampaignRecipients).where(
      sql`${emailCampaignRecipients.leadId} IN (${sql.join(leadIds.map(id => sql`${id}`), sql`, `)})`
    );
    for (const r of recipients) {
      const existing = result.get(r.leadId);
      result.set(r.leadId, {
        opened: (existing?.opened || false) || r.opened,
        clicked: (existing?.clicked || false) || r.clicked,
      });
    }
    return result;
  }

  async updateLeadEmailStatus(id: number, emailStatus: string): Promise<void> {
    await db.update(leads).set({ emailStatus }).where(eq(leads.id, id));
  }

  async updateCandidateEmailStatus(id: number, emailStatus: string): Promise<void> {
    await db.update(candidates).set({ emailStatus, lastEmailSentAt: new Date() }).where(eq(candidates.id, id));
  }
}

export const storage = new DatabaseStorage();
