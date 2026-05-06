import { pgTable, text, serial, integer, boolean, timestamp, decimal, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  salary: text("salary").notNull(),
  description: text("description").notNull(),
  responsibilities: text("responsibilities").array(),
  requirements: text("requirements").array(),
  benefits: text("benefits").array(),
  skills: text("skills").array(),
  domain: text("domain").notNull(),
  experienceLevel: text("experience_level").notNull(),
  isActive: boolean("is_active").default(true),
  postedDate: timestamp("posted_date").defaultNow(),
  icon: text("icon").notNull(),
  iconColor: text("icon_color").notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  educationLevel: text("education_level").notNull(),
  resumeUrl: text("resume_url"),
  experience: text("experience").notNull(),
  currentCtc: text("current_ctc").notNull(),
  status: text("status").default("pending"),
  appliedDate: timestamp("applied_date").defaultNow(),
  assessmentSentAt: timestamp("assessment_sent_at"),
});

export const aiInterviews = pgTable("ai_interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  status: text("status").default("scheduled"),
  feedback: text("feedback"),
  score: integer("score"),
  createdDate: timestamp("created_date").defaultNow(),
});

export const jobAlerts = pgTable("job_alerts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  location: text("location"),
  domain: text("domain"),
  experienceLevel: text("experience_level"),
  isActive: boolean("is_active").default(true),
  subscribedDate: timestamp("subscribed_date").defaultNow(),
});

export const partnerRegistrations = pgTable("partner_registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  companyName: text("company_name").notNull(),
  contactDetails: text("contact_details").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  educationLevel: text("education_level").notNull(),
  experience: text("experience").notNull(),
  currentCtc: text("current_ctc").notNull(),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id"),
  domain: text("domain").notNull(),
  questionText: text("question_text").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  difficulty: text("difficulty").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testSessions = pgTable("test_sessions", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  token: text("token").notNull().unique(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  llmOverallScore: integer("llm_overall_score"),
  llmBreakdown: text("llm_breakdown"),
  llmFeedback: text("llm_feedback"),
  llmConfidence: decimal("llm_confidence"),
  llmFlags: text("llm_flags").array(),
  manualReviewNeeded: boolean("manual_review_needed").default(false),
  manualReviewDone: boolean("manual_review_done").default(false),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const testResponses = pgTable("test_responses", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedAnswer: text("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  currentLocation: text("current_location"),
  preferredLocation: text("preferred_location"),
  totalExperience: numeric("total_experience", { precision: 4, scale: 2 }).default("0"),
  saasExperience: numeric("saas_experience", { precision: 4, scale: 2 }).default("0"),
  currentCtc: integer("current_ctc"),
  expectedCtc: integer("expected_ctc"),
  skillSets: text("skill_sets").array(),
  emailStatus: text("email_status").default("no_mail"),
  lastEmailSentAt: timestamp("last_email_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const programApplications = pgTable("program_applications", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  currentStatus: text("current_status").notNull(),
  yearsOfExperience: text("years_of_experience"),
  currentLocation: text("current_location"),
  resumeUrl: text("resume_url"),
  programSlug: text("program_slug").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const curriculumLeads = pgTable("curriculum_leads", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  interest: text("interest").notNull(),
  programSlug: text("program_slug").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webinarRegistrations = pgTable("webinar_registrations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  college: text("college").notNull(),
  graduationYear: text("graduation_year").notNull(),
  interest: text("interest").notNull(),
  linkedinProfile: text("linkedin_profile"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  leadType: text("lead_type").notNull(),
  sourcePage: text("source_page").notNull(),
  status: text("status").default("NEW").notNull(),
  emailStatus: text("email_status").default("no_mail_sent").notNull(),
  metadata: text("metadata"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  templateName: text("template_name").notNull(),
  subject: text("subject").notNull(),
  emailBody: text("email_body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  campaignName: text("campaign_name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  totalRecipients: integer("total_recipients").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by").default("admin"),
});

export const emailCampaignRecipients = pgTable("email_campaign_recipients", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  leadId: integer("lead_id"),
  candidateId: integer("candidate_id"),
  email: text("email").notNull(),
  status: text("status").default("pending").notNull(),
  opened: boolean("opened").default(false).notNull(),
  clicked: boolean("clicked").default(false).notNull(),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
});

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  coverImage: text("cover_image"),
  authorName: text("author_name").notNull().default("SkillVeda Team"),
  authorAvatar: text("author_avatar"),
  status: text("status").notNull().default("draft"),
  readTime: integer("read_time").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── HIRING DASHBOARD TABLES ──────────────────────────

// Note: `credits` is now the SEARCH credit count (was previously a generic
// pool used for unlocks/emails too). New companies get 5 free searches.
// Each cache-miss search deducts 1 credit; cache hits are free.
export const hiringCompanies = pgTable("hiring_companies", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone"),
  credits: integer("credits").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  googleId: text("google_id"),
  resetCode: text("reset_code"),
  resetCodeExpiry: timestamp("reset_code_expiry"),
  profilePhoto: text("profile_photo"),
});

// Kept for future use when contact data becomes reliable.
// No active routes write to this table currently.
export const unlockedContacts = pgTable("unlocked_contacts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  candidateId: text("candidate_id").notNull(),
  candidateName: text("candidate_name"),
  jobTitle: text("job_title"),
  employer: text("employer"),
  email: text("email"),
  phone: text("phone"),
  aiSummary: text("ai_summary"),
  experienceYears: text("experience_years"),
  estimatedSalary: text("estimated_salary"),
  noticePeriod: text("notice_period"),
  matchScore: text("match_score"),
  linkedinUrl: text("linkedin_url"),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const hiringCreditTransactions = pgTable("hiring_credit_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  transactionType: text("transaction_type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hiringSavedCandidates = pgTable("hiring_saved_candidates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  candidateId: text("candidate_id").notNull(),
  candidateName: text("candidate_name"),
  jobTitle: text("job_title"),
  employer: text("employer"),
  matchScore: text("match_score"),
  savedAt: timestamp("saved_at").defaultNow(),
});

export const hiringSearchHistory = pgTable("hiring_search_history", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  searchTitle: text("search_title"),
  // Legacy field — was used to store JSON.stringify(filters) before the
  // searchFilters/searchParagraph split. New rows still write to this for
  // back-compat (mirroring searchParagraph if available), but reads should
  // prefer searchFilters and searchParagraph.
  jobDescription: text("job_description").notNull(),
  // The original paragraph the user typed (locked once parsed).
  searchParagraph: text("search_paragraph"),
  // Structured filter state — what the wizard's review screen edits.
  searchFilters: jsonb("search_filters"),
  // Soft criteria used for ranking (skills, comp, notice period, etc.)
  searchCriteria: jsonb("search_criteria"),
  resultsCount: integer("results_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  filterHash: text("filter_hash"),
  cachedCandidates: jsonb("cached_candidates"),
  cachedUntil: timestamp("cached_until"),
});

export const hiringEmailSettings = pgTable("hiring_email_settings", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  senderEmail: text("sender_email").notNull(),
  senderName: text("sender_name"),
  reachout1Subject: text("reachout1_subject").default("Interested in your profile"),
  reachout1Body: text("reachout1_body").default("Hi {{FIRST_NAME}},\n\nWe came across your profile and really liked your experience.\n\nWe are currently hiring and would love to consider your profile.\n\nLooking forward to hearing from you.\n\nRegards,\nRecruitment Team"),
  reachout2Subject: text("reachout2_subject").default("Following up on our previous email"),
  reachout2Body: text("reachout2_body").default("Hi {{FIRST_NAME}},\n\nJust checking in regarding the role we reached out about.\n\nRegards,\nRecruitment Team"),
  reachout3Subject: text("reachout3_subject").default("Last follow up"),
  reachout3Body: text("reachout3_body").default("Hi {{FIRST_NAME}},\n\nThis is my last follow up. Would love to hear from you.\n\nRegards,\nRecruitment Team"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hiringEmailLogs = pgTable("hiring_email_logs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  candidateId: text("candidate_id").notNull(),
  candidateName: text("candidate_name"),
  candidateEmail: text("candidate_email").notNull(),
  reachoutNumber: integer("reachout_number").default(1),
  subject: text("subject"),
  body: text("body"),
  status: text("status").default("sent"),
  sentAt: timestamp("sent_at").defaultNow(),
});

// ── INSERT SCHEMAS ───────────────────────────────────

export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, postedDate: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedDate: true, status: true });
export const insertAiInterviewSchema = createInsertSchema(aiInterviews).omit({ id: true, createdDate: true, status: true, feedback: true, score: true });
export const insertJobAlertSchema = createInsertSchema(jobAlerts).omit({ id: true, subscribedDate: true, isActive: true }).partial({ phone: true, location: true, domain: true, experienceLevel: true });
export const insertPartnerRegistrationSchema = createInsertSchema(partnerRegistrations).omit({ id: true, createdAt: true, status: true });
export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true, createdAt: true });
export const insertTestSessionSchema = createInsertSchema(testSessions).omit({ id: true, createdAt: true, startedAt: true, completedAt: true, score: true, status: true });
export const insertTestResponseSchema = createInsertSchema(testResponses).omit({ id: true, answeredAt: true });
export const insertProgramApplicationSchema = createInsertSchema(programApplications).omit({ id: true, createdAt: true });
export const insertCurriculumLeadSchema = createInsertSchema(curriculumLeads).omit({ id: true, createdAt: true });
export const insertWebinarRegistrationSchema = createInsertSchema(webinarRegistrations).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, status: true, emailStatus: true, notes: true });
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true });
export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({ id: true, createdAt: true, totalRecipients: true, createdBy: true });
export const insertEmailCampaignRecipientSchema = createInsertSchema(emailCampaignRecipients).omit({ id: true, status: true, opened: true, clicked: true, sentAt: true, openedAt: true, clickedAt: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true, createdAt: true }).partial({ phone: true, currentLocation: true, preferredLocation: true, totalExperience: true, saasExperience: true, currentCtc: true, expectedCtc: true, skillSets: true });
export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({ id: true, createdAt: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });

// ── TYPES ────────────────────────────────────────────

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type AiInterview = typeof aiInterviews.$inferSelect;
export type InsertAiInterview = z.infer<typeof insertAiInterviewSchema>;
export type JobAlert = typeof jobAlerts.$inferSelect;
export type InsertJobAlert = z.infer<typeof insertJobAlertSchema>;
export type PartnerRegistration = typeof partnerRegistrations.$inferSelect;
export type InsertPartnerRegistration = z.infer<typeof insertPartnerRegistrationSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type TestResponse = typeof testResponses.$inferSelect;
export type InsertTestResponse = z.infer<typeof insertTestResponseSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type ProgramApplication = typeof programApplications.$inferSelect;
export type InsertProgramApplication = z.infer<typeof insertProgramApplicationSchema>;
export type CurriculumLead = typeof curriculumLeads.$inferSelect;
export type InsertCurriculumLead = z.infer<typeof insertCurriculumLeadSchema>;
export type WebinarRegistration = typeof webinarRegistrations.$inferSelect;
export type InsertWebinarRegistration = z.infer<typeof insertWebinarRegistrationSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaignRecipient = typeof emailCampaignRecipients.$inferSelect;
export type InsertEmailCampaignRecipient = z.infer<typeof insertEmailCampaignRecipientSchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type HiringCompany = typeof hiringCompanies.$inferSelect;
export type InsertHiringCompany = typeof hiringCompanies.$inferInsert;
export type UnlockedContact = typeof unlockedContacts.$inferSelect;
export type InsertUnlockedContact = typeof unlockedContacts.$inferInsert;
export type HiringCreditTransaction = typeof hiringCreditTransactions.$inferSelect;
export type HiringSavedCandidate = typeof hiringSavedCandidates.$inferSelect;
export type HiringSearchHistory = typeof hiringSearchHistory.$inferSelect;
export type HiringEmailSettings = typeof hiringEmailSettings.$inferSelect;
export type HiringEmailLog = typeof hiringEmailLogs.$inferSelect;