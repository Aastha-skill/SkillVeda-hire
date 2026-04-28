import { registerHiringRoutes } from "./hiring-routes";
import { registerDiagnosticRoutes } from "./lib/diagnose-search";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApplicationSchema, insertAiInterviewSchema, insertJobSchema, insertJobAlertSchema, insertPartnerRegistrationSchema, insertStudentProfileSchema, insertQuestionSchema, insertTestSessionSchema, insertTestResponseSchema, insertProgramApplicationSchema, insertCurriculumLeadSchema, insertWebinarRegistrationSchema, insertLeadSchema, insertEmailCampaignSchema, insertEmailTemplateSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { evaluateAnswerBatch } from "./lib/evaluator";
import { sendJobAlertEmail } from "./lib/jobAlertEmail";
import { sendCampaignEmail, personalizeEmail, wrapLinksWithTracking, addTrackingPixel } from "./lib/campaignEmail";
import { db } from "./db";
import { applications } from "@shared/schema";
import { eq } from "drizzle-orm";
import blogRouter from "./blog/routes";
import { seedBlogData } from "./blog/db";

const CANDIDATE_JWT_SECRET = process.env.JWT_SECRET || "skillveda_jwt_2024";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/resumes';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(fileExt)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
      }
    }
  });

  // Admin authentication middleware
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const adminPassword = req.headers['admin-password'] || req.query.admin_key;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'skillveda2024'; // Default for backward compatibility
    if (adminPassword !== expectedPassword) {
      return res.status(401).json({ error: "Unauthorized: Admin access required" });
    }
    next();
  };

  // Candidate registration — creates student profile + lead, returns JWT
  app.post("/api/candidate/register", async (req, res) => {
    try {
      const schema = z.object({
        fullName: z.string().trim().min(2),
        email: z.string().trim().email(),
        phone: z.string().trim().min(7),
      });
      const { fullName, email, phone } = schema.parse(req.body);

      const existing = await storage.getStudentProfileByEmail(email);
      if (!existing) {
        await storage.createStudentProfile({
          email,
          fullName,
          phone,
          educationLevel: "Not specified",
          experience: "Not specified",
          currentCtc: "Not specified",
        });
      }

      try {
        await storage.createLead({
          fullName,
          email,
          phone,
          leadType: "JOB",
          sourcePage: "jobs-page",
        });
      } catch (e) {
        console.error("Lead creation in candidate register (may be dup):", e);
      }

      const token = jwt.sign({ email, name: fullName }, CANDIDATE_JWT_SECRET, { expiresIn: "30d" });
      res.json({ token, candidate: { name: fullName, email, phone } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error in candidate register:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Candidate token verification
  app.get("/api/candidate/verify-token", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.json({ valid: false });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, CANDIDATE_JWT_SECRET) as { email: string; name: string };
      res.json({ valid: true, candidate: { name: decoded.name, email: decoded.email } });
    } catch {
      res.json({ valid: false });
    }
  });

  // Send application confirmation email via Brevo
  app.post("/api/candidate/send-apply-email", async (req, res) => {
    try {
      const { email, name, jobTitle, company } = req.body;
      if (!email || !name || !jobTitle || !company) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const htmlBody = `<p>Hi ${name},</p><p>We received your application for <strong>${jobTitle}</strong> at <strong>${company}</strong>. Our team will reach out within 48 hours.</p><p>— Team Skillveda</p>`;
      const result = await sendCampaignEmail(email, `Application Received — ${jobTitle}`, htmlBody);
      res.json(result);
    } catch (error: any) {
      console.error("Error sending apply email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Send assessment email to applicant
  app.post("/api/applications/:id/send-assessment", authenticateAdmin, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      const firstName = (application.fullName || "").split(" ")[0] || "there";
      const htmlBody = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;"><tr><td style="padding-bottom:32px;"><span style="font-size:18px;font-weight:700;color:#0A0A0F;">Skill Veda</span></td></tr><tr><td style="padding-bottom:20px;"><p style="font-size:16px;color:#0A0A0F;margin:0;line-height:1.6;">Hey ${firstName},</p></td></tr><tr><td style="padding-bottom:20px;"><p style="font-size:16px;color:#0A0A0F;margin:0;line-height:1.6;font-weight:600;">You applied. Respect. 🙌</p></td></tr><tr><td style="padding-bottom:24px;"><p style="font-size:15px;color:#3D3D4E;margin:0;line-height:1.8;">Real talk — AI is flipping Customer Success upside down and the people who move now are the ones who'll look back and say <strong style="color:#0A0A0F;">"yeah, I saw that coming."</strong></p></td></tr><tr><td style="padding-bottom:16px;"><p style="font-size:15px;color:#0A0A0F;margin:0;font-weight:600;">Your move: a 25-min assessment. That's it.</p></td></tr><tr><td style="padding-bottom:28px;"><p style="font-size:14px;color:#3D3D4E;margin:0 0 8px 0;line-height:1.7;">→ Quick MCQ on CS basics</p><p style="font-size:14px;color:#3D3D4E;margin:0;line-height:1.7;">→ Short video (just talk like a human, you've got this)</p></td></tr><tr><td style="padding-bottom:28px;"><p style="font-size:14px;color:#3D3D4E;margin:0;line-height:1.7;">Do it within <strong style="color:#0A0A0F;">48 hours</strong> and you're in — a community of CS people sharing what actually works, not just LinkedIn fluff.</p></td></tr><tr><td style="padding-bottom:32px;"><a href="https://app.goodfit.so/jobs/skill-veda/Customer-Success-Skill-Veda-Assessment?id=Vlfk1AU6" target="_blank" style="display:inline-block;background:#0A0A0F;color:#ffffff;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;">👉 Take the Assessment</a></td></tr><tr><td style="padding-bottom:24px;"><hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:0;" /></td></tr><tr><td><p style="font-size:14px;color:#0A0A0F;margin:0 0 4px 0;font-weight:600;">Prerit Choudhary</p><p style="font-size:13px;color:#0A0A0F;margin:0 0 2px 0;">CEO, Skill Veda</p><p style="font-size:13px;color:#8888A0;margin:0;">skillveda.ai</p></td></tr></table></td></tr></table></body></html>`;
      await sendCampaignEmail(application.email, "no pressure but… this is kind of a big deal 👀", htmlBody);
      await db.update(applications).set({ assessmentSentAt: new Date() }).where(eq(applications.id, applicationId));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending assessment:", error);
      res.status(500).json({ error: "Failed to send assessment email" });
    }
  });

  // Download resume endpoint with proper security
  app.get('/api/download/resume/:applicationId', authenticateAdmin, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      if (!application.resumeUrl) {
        return res.status(404).json({ message: 'No resume uploaded for this application' });
      }
      
      // Extract filename from resumeUrl (remove /uploads/resumes/ prefix)
      const filename = application.resumeUrl.replace('/uploads/resumes/', '');
      const filepath = path.join(process.cwd(), 'uploads', 'resumes', filename);
      
      // Check if file exists
      if (!fs.existsSync(filepath)) {
        console.error(`Resume file not found: ${filepath} for application ${applicationId}`);
        return res.status(404).json({ 
          message: 'Resume file not found on server',
          details: `File ${filename} is missing from server storage`
        });
      }
      
      // Get file extension to set proper MIME type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.doc':
          contentType = 'application/msword';
          break;
        case '.docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
      }
      
      // Create a user-friendly filename
      const candidateName = application.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const userFriendlyFilename = `${candidateName}_resume${ext}`;
      
      // Set proper headers for file download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${userFriendlyFilename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Send file
      res.sendFile(filepath);
    } catch (error) {
      console.error('Error downloading resume:', error);
      res.status(500).json({ message: 'Error downloading resume file' });
    }
  });

  // Legacy route for direct file access (kept for backward compatibility)
  app.get('/uploads/resumes/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      
      // Basic security check - ensure filename doesn't contain path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }
      
      const filepath = path.join(process.cwd(), 'uploads', 'resumes', filename);
      
      // Check if file exists
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Get file extension to set proper MIME type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.doc':
          contentType = 'application/msword';
          break;
        case '.docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
      }
      
      // Set proper headers for file download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Send file
      res.sendFile(filepath);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ message: 'Error downloading file' });
    }
  });

  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const { search, location, domain, experienceLevel } = req.query;
      
      const filters = {
        search: search as string,
        location: location as string,
        domain: domain as string,
        experienceLevel: experienceLevel as string
      };

      const jobs = await storage.getJobsByFilters(filters);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Create a new job (admin only)
  app.post("/api/jobs", authenticateAdmin, async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const newJob = await storage.createJob(jobData);
      
      // Send job alert emails to all active subscribers
      try {
        const subscribers = await storage.getAllJobAlerts();
        const activeSubscribers = subscribers.filter(s => s.isActive);
        
        if (activeSubscribers.length > 0) {
          const baseUrl = process.env.REPLIT_DEV_DOMAIN 
            ? `https://${process.env.REPLIT_DEV_DOMAIN}`
            : process.env.REPLIT_DOMAINS 
              ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
              : `${req.protocol}://${req.get('host')}`;
          
          const jobDetails = {
            id: newJob.id,
            title: newJob.title,
            location: newJob.location,
            compensation: newJob.salary,
            company: newJob.company
          };
          
          const result = await sendJobAlertEmail(activeSubscribers, jobDetails, baseUrl);
          console.log(`Job alert emails sent: ${result.sentCount}/${activeSubscribers.length}`);
          if (result.errors.length > 0) {
            console.error('Some emails failed:', result.errors);
          }
        }
      } catch (emailError) {
        console.error('Failed to send job alert emails:', emailError);
      }
      
      res.status(201).json(newJob);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid job data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create job" });
      }
    }
  });

  // Update a job (admin only)
  app.put("/api/jobs/:id", authenticateAdmin, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const validatedData = insertJobSchema.parse(req.body);
      
      const updatedJob = await storage.updateJob(jobId, validatedData);
      
      if (updatedJob) {
        res.json(updatedJob);
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid job data", 
          details: error.errors 
        });
      }
      console.error("Error updating job:", error);
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  // Delete a job (admin only)
  app.delete("/api/jobs/:id", authenticateAdmin, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const deleted = await storage.deleteJob(jobId);
      
      if (deleted) {
        res.status(200).json({ message: "Job deleted successfully" });
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Get job by ID
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Submit job application with resume upload
  app.post("/api/applications", upload.single('resume'), async (req, res) => {
    try {
      const applicationData = {
        ...req.body,
        jobId: parseInt(req.body.jobId),
        resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : undefined
      };
      
      const validatedData = insertApplicationSchema.parse(applicationData);
      
      // Check if job exists
      const job = await storage.getJobById(validatedData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const application = await storage.createApplication(validatedData);

      try {
        const firstName = (validatedData.fullName || "").split(" ")[0] || "there";
        const jobTitle = req.body.jobTitle || job.title || "";
        const companyName = req.body.company || job.company || "";
        const confirmHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;"><tr><td style="padding-bottom:32px;"><span style="font-size:18px;font-weight:700;color:#0A0A0F;">Skill Veda</span></td></tr><tr><td style="padding-bottom:20px;"><p style="font-size:22px;font-weight:700;color:#0A0A0F;margin:0;line-height:1.4;">ngl, this might be the best thing you did today. ✅</p></td></tr><tr><td style="padding-bottom:20px;"><p style="font-size:15px;color:#3D3D4E;margin:0;line-height:1.8;">Hey ${firstName}, your application for <strong style="color:#0A0A0F;">${jobTitle}</strong> at <strong style="color:#0A0A0F;">${companyName}</strong> just hit our inbox. We see you. 👀</p></td></tr><tr><td style="padding-bottom:28px;"><div style="background:#F4F4F6;border-radius:12px;padding:24px;"><p style="font-size:12px;font-weight:600;color:#8888A0;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 14px 0;">what happens next</p><p style="font-size:14px;color:#3D3D4E;margin:0 0 10px 0;line-height:1.7;">📋 Our team reviews your profile</p><p style="font-size:14px;color:#3D3D4E;margin:0 0 10px 0;line-height:1.7;">📩 We'll send you an assessment link</p><p style="font-size:14px;color:#3D3D4E;margin:0;line-height:1.7;">🚀 Top scorers get fast-tracked to partner companies</p></div></td></tr><tr><td style="padding-bottom:28px;"><div style="background:#F0FDF4;border:1px solid #A7F3D0;border-radius:12px;padding:24px;"><p style="font-size:15px;font-weight:600;color:#0A0A0F;margin:0 0 8px 0;">while you wait — join the gang 🤝</p><p style="font-size:14px;color:#3D3D4E;margin:0 0 16px 0;line-height:1.7;">Real CS folks. Real talk. Free webinars, job drops, and zero LinkedIn corporate energy. Just people actually trying to grow in Customer Success.</p><a href="https://chat.whatsapp.com/B74yk0TlvFi3FeC9UZckdx?mode=gi_t" target="_blank" style="display:inline-block;background:#25D366;color:#ffffff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">💬 Join Customer Success Community</a></div></td></tr><tr><td style="padding-bottom:28px;"><p style="font-size:14px;color:#3D3D4E;margin:0;line-height:1.8;">got questions? just reply to this email. we're real people, we promise. 😄</p></td></tr><tr><td style="padding-bottom:24px;"><hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:0;"/></td></tr><tr><td><p style="font-size:14px;font-weight:600;color:#0A0A0F;margin:0 0 4px 0;">Prerit Choudhary</p><p style="font-size:13px;color:#8888A0;margin:0 0 2px 0;">CEO, Skill Veda</p><p style="font-size:13px;color:#8888A0;margin:0;">skillveda.ai</p></td></tr></table></td></tr></table></body></html>`;
        await sendCampaignEmail(validatedData.email, "ok so your application just landed 🛬", confirmHtml);
      } catch (emailErr) {
        console.error("Error sending application confirmation email:", emailErr);
      }

      try {
        await storage.createLead({
          fullName: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone,
          leadType: "JOB",
          sourcePage: "jobs page",
          metadata: JSON.stringify({ jobId: validatedData.jobId, jobTitle: req.body.jobTitle || req.body.company || "", company: req.body.company || "", experience: validatedData.experience || "", educationLevel: validatedData.educationLevel || "" }),
        });
      } catch (e) {
        console.error("Error creating lead from job application:", e);
      }

      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Get application by ID
  app.get("/api/applications/:id", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // Schedule AI interview
  app.post("/api/ai-interviews", async (req, res) => {
    try {
      const validatedData = insertAiInterviewSchema.parse(req.body);
      
      // Check if application exists
      const application = await storage.getApplicationById(validatedData.applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if interview already exists for this application
      const existingInterview = await storage.getAiInterviewByApplicationId(validatedData.applicationId);
      if (existingInterview) {
        return res.status(409).json({ message: "Interview already scheduled for this application" });
      }

      const interview = await storage.createAiInterview(validatedData);
      res.status(201).json(interview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to schedule interview" });
    }
  });

  // Get AI interview by application ID
  app.get("/api/ai-interviews/application/:applicationId", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const interview = await storage.getAiInterviewByApplicationId(applicationId);
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      res.json(interview);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interview" });
    }
  });

  // Update AI interview status
  app.patch("/api/ai-interviews/:id", async (req, res) => {
    try {
      const interviewId = parseInt(req.params.id);
      const { status, feedback, score } = req.body;
      
      const interview = await storage.updateAiInterviewStatus(interviewId, status, feedback, score);
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      res.json(interview);
    } catch (error) {
      res.status(500).json({ message: "Failed to update interview" });
    }
  });

  // Job Alerts API
  app.get("/api/job-alerts", authenticateAdmin, async (req, res) => {
    try {
      const jobAlerts = await storage.getAllJobAlerts();
      res.json(jobAlerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job alerts" });
    }
  });

  app.post("/api/job-alerts", async (req, res) => {
    try {
      const validatedData = insertJobAlertSchema.parse(req.body);
      const jobAlert = await storage.createJobAlert(validatedData);

      try {
        await storage.createLead({
          fullName: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone || undefined,
          leadType: "JOB_ALERT",
          sourcePage: "jobs page",
          metadata: JSON.stringify({ location: validatedData.location || "", domain: validatedData.domain || "", experienceLevel: validatedData.experienceLevel || "" }),
        });
      } catch (e) {
        console.error("Error creating lead from job alert:", e);
      }

      res.status(201).json(jobAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid job alert data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create job alert" });
    }
  });

  app.delete("/api/job-alerts/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteJobAlert(id);
      
      if (!success) {
        return res.status(404).json({ message: "Job alert not found" });
      }
      
      res.json({ message: "Job alert deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job alert" });
    }
  });

  // Create partner registration
  app.post("/api/partner-registrations", async (req, res) => {
    try {
      const validatedData = insertPartnerRegistrationSchema.parse(req.body);
      const registration = await storage.createPartnerRegistration(validatedData);

      try {
        await storage.createLead({
          fullName: validatedData.name,
          email: validatedData.email,
          phone: validatedData.contactDetails,
          leadType: "CONTACT",
          sourcePage: "partner registration",
          metadata: JSON.stringify({ companyName: validatedData.companyName, contactDetails: validatedData.contactDetails }),
        });
      } catch (e) {
        console.error("Error creating lead from partner registration:", e);
      }

      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid partner registration data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to submit partner registration" });
    }
  });

  // Get all partner registrations (admin only)
  app.get("/api/partner-registrations", authenticateAdmin, async (req, res) => {
    try {
      const registrations = await storage.getAllPartnerRegistrations();
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partner registrations" });
    }
  });

  // Get all applications (for admin)
  app.get("/api/applications", authenticateAdmin, async (req, res) => {
    try {
      // Get all jobs and their applications
      const jobs = await storage.getAllJobs();
      const applicationsWithJobInfo = [];
      
      for (const job of jobs) {
        const applications = await storage.getApplicationsByJobId(job.id);
        for (const application of applications) {
          applicationsWithJobInfo.push({
            ...application,
            jobTitle: job.title,
            jobCompany: job.company
          });
        }
      }
      
      res.json(applicationsWithJobInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Student Authentication API
  app.post("/api/students/login", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const profile = await storage.getStudentProfileByEmail(email);
      
      if (profile) {
        res.json({ profile, isNewUser: false });
      } else {
        res.json({ profile: null, isNewUser: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to authenticate student" });
    }
  });

  app.post("/api/students/profile", async (req, res) => {
    try {
      const validatedData = insertStudentProfileSchema.parse(req.body);
      
      // Check if profile already exists
      const existingProfile = await storage.getStudentProfileByEmail(validatedData.email);
      
      if (existingProfile) {
        // Update existing profile
        const updatedProfile = await storage.updateStudentProfile(validatedData.email, validatedData);
        res.json(updatedProfile);
      } else {
        // Create new profile
        const newProfile = await storage.createStudentProfile(validatedData);
        res.status(201).json(newProfile);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid profile data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to save student profile" });
    }
  });

  app.get("/api/students/profile/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const profile = await storage.getStudentProfileByEmail(email);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().min(10, "Please enter a valid phone number"),
        subject: z.string().min(5, "Subject must be at least 5 characters"),
        message: z.string().min(10, "Message must be at least 10 characters")
      });

      const validatedData = contactSchema.parse(req.body);
      
      console.log('Contact form submission:', {
        timestamp: new Date().toISOString(),
        ...validatedData
      });

      try {
        await storage.createLead({
          fullName: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          leadType: "CONTACT",
          sourcePage: "contact page",
          metadata: JSON.stringify({ subject: validatedData.subject, message: validatedData.message }),
        });
      } catch (e) {
        console.error("Error creating lead from contact form:", e);
      }
      
      res.status(201).json({ 
        success: true, 
        message: "Your message has been received. We'll get back to you within 24 hours." 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error('Contact form error:', error);
      res.status(500).json({ message: "Failed to send message. Please try again." });
    }
  });

  // ====== TEST PORTAL ROUTES ======
  
  // Get all questions (Admin only)
  app.get("/api/questions", authenticateAdmin, async (req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get questions by test session token (Candidate access - requires valid token)
  app.get("/api/test/:token/questions", async (req, res) => {
    try {
      const session = await storage.getTestSessionByToken(req.params.token);
      if (!session) {
        return res.status(404).json({ message: "Invalid or expired test session" });
      }

      if (session.status === 'completed') {
        return res.status(400).json({ message: "Test already completed" });
      }

      // Get application to determine domain/job
      const application = await storage.getApplicationById(session.applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const job = await storage.getJobById(application.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Get questions for the job's domain
      const questions = await storage.getQuestionsByDomain(job.domain);
      
      // Randomly select questions up to totalQuestions
      const selectedQuestions = questions
        .sort(() => 0.5 - Math.random())
        .slice(0, session.totalQuestions);

      // Don't send correct answers to candidates
      const sanitized = selectedQuestions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        difficulty: q.difficulty
      }));
      
      res.json(sanitized);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Create a question (Admin only)
  app.post("/api/questions", authenticateAdmin, async (req, res) => {
    try {
      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Delete a question (Admin only)
  app.delete("/api/questions/:id", authenticateAdmin, async (req, res) => {
    try {
      const success = await storage.deleteQuestion(parseInt(req.params.id));
      if (success) {
        res.json({ message: "Question deleted successfully" });
      } else {
        res.status(404).json({ message: "Question not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Create a test session (Admin only)
  app.post("/api/test-sessions", authenticateAdmin, async (req, res) => {
    try {
      const { applicationId, totalQuestions } = req.body;
      
      // Generate cryptographically secure unique token
      const token = crypto.randomBytes(32).toString('hex');
      
      const sessionData = {
        applicationId,
        token,
        totalQuestions,
      };
      
      const validatedData = insertTestSessionSchema.parse(sessionData);
      const session = await storage.createTestSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create test session" });
    }
  });

  // Get test session by token (Candidate access)
  app.get("/api/test/:token", async (req, res) => {
    try {
      const session = await storage.getTestSessionByToken(req.params.token);
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test session" });
    }
  });

  // Start a test (Candidate)
  app.post("/api/test/:token/start", async (req, res) => {
    try {
      const session = await storage.getTestSessionByToken(req.params.token);
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      if (session.status !== 'pending') {
        return res.status(400).json({ message: "Test already started or completed" });
      }
      
      const updated = await storage.updateTestSession(session.id, {
        status: 'in_progress',
        startedAt: new Date()
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to start test" });
    }
  });

  // Submit test responses (Candidate) - with AI Evaluation
  app.post("/api/test/:token/submit", async (req, res) => {
    try {
      const session = await storage.getTestSessionByToken(req.params.token);
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      const { responses } = req.body;
      
      let score = 0;
      const totalQuestions = responses.length;
      const answersForEvaluation: any[] = [];
      
      // Save each response and calculate score
      for (const response of responses) {
        const responseData = {
          sessionId: session.id,
          questionId: response.questionId,
          selectedAnswer: response.selectedAnswer,
          isCorrect: response.isCorrect
        };
        
        const validatedResponse = insertTestResponseSchema.parse(responseData);
        await storage.createTestResponse(validatedResponse);
        
        // Collect data for AI evaluation
        answersForEvaluation.push({
          questionId: response.questionId,
          questionText: response.questionText || "",
          selectedAnswer: response.selectedAnswer,
          correctAnswer: response.correctAnswer || ""
        });
        
        if (response.isCorrect) {
          score++;
        }
      }
      
      const percentageScore = Math.round((score / totalQuestions) * 100);
      
      // Capture IP and User Agent for logging
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '';
      const userAgent = req.headers['user-agent'] || '';
      
      // Perform AI Evaluation
      let aiEvaluation;
      let manualReviewNeeded = false;
      
      try {
        aiEvaluation = await evaluateAnswerBatch(
          session.id,
          { totalQuestions, token: req.params.token },
          answersForEvaluation
        );
        
        // Check if manual review is needed
        if (aiEvaluation.confidence < 0.6 || aiEvaluation.flags.length > 0) {
          manualReviewNeeded = true;
        }
        
        // Update session with AI evaluation results
        const updated = await storage.updateTestSession(session.id, {
          status: 'completed',
          completedAt: new Date(),
          score: percentageScore,
          llmOverallScore: aiEvaluation.overall_score,
          llmBreakdown: JSON.stringify(aiEvaluation.breakdown),
          llmFeedback: aiEvaluation.feedback,
          llmConfidence: aiEvaluation.confidence,
          llmFlags: aiEvaluation.flags,
          manualReviewNeeded,
          ipAddress,
          userAgent
        });
        
        res.json({ 
          message: "Test submitted successfully", 
          score: percentageScore,
          overall_score: aiEvaluation.overall_score,
          breakdown: aiEvaluation.breakdown,
          feedback: aiEvaluation.feedback,
          flags: aiEvaluation.flags,
          manual_review_needed: manualReviewNeeded,
          session: updated 
        });
      } catch (evalError) {
        console.error('AI evaluation error:', evalError);
        
        // Still save the test but without AI evaluation
        const updated = await storage.updateTestSession(session.id, {
          status: 'completed',
          completedAt: new Date(),
          score: percentageScore,
          manualReviewNeeded: true,
          llmFeedback: "AI evaluation failed. Manual review required.",
          llmFlags: ["evaluation_error"],
          ipAddress,
          userAgent
        });
        
        res.json({ 
          message: "Test submitted successfully (AI evaluation unavailable)", 
          score: percentageScore,
          manual_review_needed: true,
          session: updated 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('Test submission error:', error);
      res.status(500).json({ message: "Failed to submit test" });
    }
  });

  // Get test session by application ID (Admin)
  app.get("/api/test-sessions/application/:applicationId", authenticateAdmin, async (req, res) => {
    try {
      const session = await storage.getTestSessionByApplicationId(parseInt(req.params.applicationId));
      if (!session) {
        return res.status(404).json({ message: "No test session found for this application" });
      }
      
      // Get test responses
      const responses = await storage.getTestResponsesBySessionId(session.id);
      
      res.json({
        session,
        responses
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test session" });
    }
  });

  // Get all test sessions (Admin)
  app.get("/api/test-sessions", authenticateAdmin, async (req, res) => {
    try {
      const sessions = await storage.getAllTestSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test sessions" });
    }
  });

  // Get test sessions for manual review (Admin)
  app.get("/api/test-sessions/manual-review", authenticateAdmin, async (req, res) => {
    try {
      const sessions = await storage.getTestSessionsForManualReview();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch manual review sessions" });
    }
  });

  // Mark manual review as done (Admin)
  app.patch("/api/test-sessions/:id/review-done", authenticateAdmin, async (req, res) => {
    try {
      const updated = await storage.updateTestSession(parseInt(req.params.id), {
        manualReviewDone: true
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update review status" });
    }
  });

  // ============ CANDIDATE DATABASE ROUTES ============

  // Upload candidates via Excel file (admin only)
  const candidateUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.xlsx', '.xls'];
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(fileExt)) {
        cb(null, true);
      } else {
        cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
      }
    }
  });

  app.post("/api/candidates/upload", authenticateAdmin, candidateUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const XLSX = await import('xlsx');
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (rawRows.length === 0) {
        return res.status(400).json({ error: "Excel file is empty" });
      }

      const candidateData = rawRows.map((row: any) => {
        const skillString = row['skill_sets'] || row['skills'] || row['Skill Sets'] || row['Skills'] || '';
        const skillArray = typeof skillString === 'string'
          ? skillString.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
          : Array.isArray(skillString) ? skillString : [];

        return {
          fullName: String(row['full_name'] || row['Full Name'] || row['name'] || row['Name'] || '').trim(),
          email: String(row['email'] || row['Email'] || '').trim().toLowerCase(),
          phone: String(row['phone'] || row['Phone'] || row['phone_number'] || '').trim() || undefined,
          currentLocation: String(row['current_location'] || row['Current Location'] || row['location'] || '').trim() || undefined,
          preferredLocation: String(row['preferred_location'] || row['Preferred Location'] || '').trim() || undefined,
          totalExperience: row['total_experience'] != null ? String(parseFloat(row['total_experience']) || 0) : "0",
          saasExperience: row['saas_experience'] != null ? String(parseFloat(row['saas_experience']) || 0) : "0",
          currentCtc: row['current_ctc'] != null ? parseInt(row['current_ctc']) || undefined : undefined,
          expectedCtc: row['expected_ctc'] != null ? parseInt(row['expected_ctc']) || undefined : undefined,
          skillSets: skillArray.length > 0 ? skillArray : undefined,
        };
      }).filter((c: any) => c.fullName && c.email);

      if (candidateData.length === 0) {
        return res.status(400).json({ error: "No valid candidate rows found. Ensure columns include 'full_name' and 'email'." });
      }

      const result = await storage.bulkInsertCandidates(candidateData);

      res.json({
        message: "Upload completed",
        totalRows: rawRows.length,
        validRows: candidateData.length,
        inserted: result.inserted,
        skipped: result.skipped,
      });
    } catch (error: any) {
      console.error("Error uploading candidates:", error);
      res.status(500).json({ error: error.message || "Failed to process upload" });
    }
  });

  // Get candidates with pagination and search (admin only)
  app.get("/api/candidates", authenticateAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 50;
      const search = (req.query.search as string) || '';

      const result = await storage.getCandidates({ page, pageSize, search });
      res.json(result);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  // Delete a candidate (admin only)
  app.delete("/api/candidates/:id", authenticateAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCandidate(parseInt(req.params.id));
      if (success) {
        res.json({ message: "Candidate deleted" });
      } else {
        res.status(404).json({ error: "Candidate not found" });
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
      res.status(500).json({ error: "Failed to delete candidate" });
    }
  });

  app.post("/api/program-applications", upload.single('resume'), async (req, res) => {
    try {
      const data = {
        ...req.body,
        resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : undefined,
      };
      const validated = insertProgramApplicationSchema.parse(data);
      const application = await storage.createProgramApplication(validated);

      try {
        await storage.createLead({
          fullName: validated.fullName,
          email: validated.email,
          phone: validated.phone,
          leadType: "PROGRAM",
          sourcePage: "programs page",
          metadata: JSON.stringify({ programSlug: validated.programSlug, currentStatus: validated.currentStatus, yearsOfExperience: validated.yearsOfExperience || "", currentLocation: validated.currentLocation || "" }),
        });
      } catch (e) {
        console.error("Error creating lead from program application:", e);
      }

      res.status(201).json(application);
    } catch (error: any) {
      console.error("Error creating program application:", error);
      res.status(400).json({ error: error.message || "Failed to submit application" });
    }
  });

  app.get("/api/program-applications", authenticateAdmin, async (_req, res) => {
    try {
      const applications = await storage.getAllProgramApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching program applications:", error);
      res.status(500).json({ error: "Failed to fetch program applications" });
    }
  });

  app.post("/api/curriculum-leads", async (req, res) => {
    try {
      const validated = insertCurriculumLeadSchema.parse(req.body);
      const lead = await storage.createCurriculumLead(validated);

      try {
        await storage.createLead({
          fullName: validated.fullName,
          email: validated.email,
          phone: validated.phone,
          leadType: "CURRICULUM",
          sourcePage: "curriculum download",
          metadata: JSON.stringify({ interest: validated.interest, programSlug: validated.programSlug }),
        });
      } catch (e) {
        console.error("Error creating lead from curriculum download:", e);
      }

      res.status(201).json(lead);
    } catch (error: any) {
      console.error("Error creating curriculum lead:", error);
      res.status(400).json({ error: error.message || "Failed to submit lead" });
    }
  });

  app.get("/api/curriculum-leads", authenticateAdmin, async (_req, res) => {
    try {
      const leads = await storage.getAllCurriculumLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching curriculum leads:", error);
      res.status(500).json({ error: "Failed to fetch curriculum leads" });
    }
  });

  app.post("/api/webinar-registrations", async (req, res) => {
    try {
      const validated = insertWebinarRegistrationSchema.parse(req.body);
      const registration = await storage.createWebinarRegistration(validated);

      try {
        const isWebinarPopup = validated.interest === "webinar-popup";
        await storage.createLead({
          fullName: validated.fullName,
          email: validated.email,
          phone: validated.phone,
          leadType: "WEBINAR",
          sourcePage: isWebinarPopup ? "Webinar Popup" : "hero banner",
          metadata: JSON.stringify({ college: validated.college, graduationYear: validated.graduationYear, interest: validated.interest, linkedinProfile: validated.linkedinProfile || "" }),
        });
      } catch (e) {
        console.error("Error creating lead from webinar registration:", e);
      }

      res.status(201).json(registration);
    } catch (error: any) {
      console.error("Error creating webinar registration:", error);
      res.status(400).json({ error: error.message || "Failed to register" });
    }
  });

  app.get("/api/webinar-registrations", authenticateAdmin, async (_req, res) => {
    try {
      const registrations = await storage.getAllWebinarRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching webinar registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const publicLeadSchema = insertLeadSchema.extend({
        fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
        email: z.string().trim().email("Invalid email address").max(200),
        phone: z.string().trim().min(7, "Phone number too short").max(20).optional().or(z.literal("")),
        leadType: z.enum(["PROGRAM", "JOB", "WEBINAR", "CONTACT", "JOB_ALERT", "CURRICULUM", "NEWSLETTER"]),
        sourcePage: z.string().trim().max(100),
        metadata: z.string().max(2000).optional(),
      });
      const validated = publicLeadSchema.parse(req.body);
      const lead = await storage.createLead(validated);
      res.status(201).json(lead);
    } catch (error: any) {
      console.error("Error creating lead:", error);
      res.status(400).json({ error: error.message || "Failed to create lead" });
    }
  });

  app.get("/api/leads", authenticateAdmin, async (_req, res) => {
    try {
      const allLeads = await storage.getAllLeads();
      res.json(allLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/engagement", authenticateAdmin, async (_req, res) => {
    try {
      const allLeads = await storage.getAllLeads();
      const leadIds = allLeads.map(l => l.id);
      const engagement = await storage.getEngagementByLeadIds(leadIds);
      const engagementObj: Record<number, { opened: boolean; clicked: boolean }> = {};
      engagement.forEach((v, k) => { engagementObj[k] = v; });
      res.json(engagementObj);
    } catch (error) {
      console.error("Error fetching engagement:", error);
      res.status(500).json({ error: "Failed to fetch engagement data" });
    }
  });

  app.get("/api/leads/detail/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLeadById(id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead detail:", error);
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  app.get("/api/leads/:type", authenticateAdmin, async (req, res) => {
    try {
      const leadType = req.params.type.toUpperCase();
      const filteredLeads = await storage.getLeadsByType(leadType);
      res.json(filteredLeads);
    } catch (error) {
      console.error("Error fetching leads by type:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.patch("/api/leads/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!["NEW", "CONTACTED", "CONVERTED", "NOT_INTERESTED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateLeadStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating lead status:", error);
      res.status(500).json({ error: "Failed to update lead status" });
    }
  });

  app.patch("/api/leads/:id/notes", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      if (typeof notes !== "string") {
        return res.status(400).json({ error: "Notes must be a string" });
      }
      const updated = await storage.updateLeadNotes(id, notes);
      if (!updated) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating lead notes:", error);
      res.status(500).json({ error: "Failed to update lead notes" });
    }
  });

  app.get("/api/email-templates", authenticateAdmin, async (_req, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/email-templates/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getEmailTemplateById(id);
      if (!template) return res.status(404).json({ error: "Template not found" });
      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/email-templates", authenticateAdmin, async (req, res) => {
    try {
      const parsed = insertEmailTemplateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid template data", details: parsed.error.errors });
      }
      const template = await storage.createEmailTemplate(parsed.data);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.patch("/api/email-templates/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { templateName, subject, emailBody } = req.body;
      const updates: any = {};
      if (templateName) updates.templateName = templateName;
      if (subject) updates.subject = subject;
      if (emailBody) updates.emailBody = emailBody;
      const updated = await storage.updateEmailTemplate(id, updates);
      if (!updated) return res.status(404).json({ error: "Template not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/email-templates/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmailTemplate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  app.post("/api/campaigns", authenticateAdmin, async (req, res) => {
    try {
      const { campaignName, subject, body, leadIds } = req.body;
      if (!campaignName || !subject || !body || !leadIds?.length) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const uniqueLeadIds = [...new Set(leadIds.map(Number).filter((id: number) => !isNaN(id)))];
      if (uniqueLeadIds.length === 0) {
        return res.status(400).json({ error: "No valid lead IDs provided" });
      }

      const campaign = await storage.createCampaign({
        campaignName,
        subject,
        body,
        totalRecipients: uniqueLeadIds.length,
      });

      const allLeads = await storage.getAllLeads();
      const leadMap = new Map(allLeads.map(l => [l.id, l]));

      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['host'] || 'localhost:5000';
      const baseUrl = `${protocol}://${host}`;

      let sentCount = 0;
      const errors: string[] = [];

      for (const leadId of uniqueLeadIds) {
        const lead = leadMap.get(leadId);
        if (!lead) continue;

        const recipient = await storage.createCampaignRecipient({
          campaignId: campaign.id,
          leadId: lead.id,
          email: lead.email,
        });

        let meta: Record<string, string> = {};
        try { meta = lead.metadata ? JSON.parse(lead.metadata) : {}; } catch {}

        const variables: Record<string, string> = {
          name: lead.fullName,
          email: lead.email,
          phone: lead.phone || '',
          college: meta.college || '',
          graduationYear: meta.graduationYear || '',
          interest: meta.interest || '',
        };

        let personalizedBody = personalizeEmail(body, variables);
        personalizedBody = wrapLinksWithTracking(personalizedBody, baseUrl, campaign.id, recipient.id);
        personalizedBody = addTrackingPixel(personalizedBody, baseUrl, campaign.id, recipient.id);

        const emailResult = await sendCampaignEmail(lead.email, subject, personalizedBody);
        if (emailResult.success) {
          await storage.updateRecipientStatus(recipient.id, "sent");
          sentCount++;
          const currentStatus = lead.emailStatus || "no_mail_sent";
          const nextStatus = currentStatus === "no_mail_sent" ? "first_mail_sent" : currentStatus === "first_mail_sent" ? "second_mail_sent" : currentStatus;
          await storage.updateLeadEmailStatus(lead.id, nextStatus);
        } else {
          await storage.updateRecipientStatus(recipient.id, "failed");
          errors.push(`${lead.email}: ${emailResult.error}`);
        }
      }

      res.status(201).json({ campaign, sentCount, errors });
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.post("/api/campaigns/candidates", authenticateAdmin, async (req, res) => {
    try {
      const { campaignName, subject, body, candidateIds } = req.body;
      if (!campaignName || !subject || !body || !candidateIds?.length) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const uniqueIds = [...new Set(candidateIds.map(Number).filter((id: number) => !isNaN(id)))];
      if (uniqueIds.length === 0) {
        return res.status(400).json({ error: "No valid candidate IDs provided" });
      }

      const campaign = await storage.createCampaign({
        campaignName,
        subject,
        body,
        totalRecipients: uniqueIds.length,
      });

      const allCandidates = await storage.getCandidates({ page: 1, pageSize: 100000 });
      const candidateMap = new Map(allCandidates.candidates.map(c => [c.id, c]));

      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['host'] || 'localhost:5000';
      const baseUrl = `${protocol}://${host}`;

      let sentCount = 0;
      const errors: string[] = [];

      for (const candidateId of uniqueIds) {
        const candidate = candidateMap.get(candidateId);
        if (!candidate) continue;

        const recipient = await storage.createCampaignRecipient({
          campaignId: campaign.id,
          candidateId: candidate.id,
          email: candidate.email,
        });

        const variables: Record<string, string> = {
          name: candidate.fullName,
          email: candidate.email,
          phone: candidate.phone || '',
          location: candidate.currentLocation || '',
          experience: candidate.totalExperience || '0',
        };

        let personalizedBody = personalizeEmail(body, variables);
        personalizedBody = wrapLinksWithTracking(personalizedBody, baseUrl, campaign.id, recipient.id);
        personalizedBody = addTrackingPixel(personalizedBody, baseUrl, campaign.id, recipient.id);

        const emailResult = await sendCampaignEmail(candidate.email, subject, personalizedBody);
        if (emailResult.success) {
          await storage.updateRecipientStatus(recipient.id, "sent");
          sentCount++;
          const currentStatus = candidate.emailStatus || "no_mail";
          const nextStatus = currentStatus === "no_mail" ? "first_mail_sent" : currentStatus === "first_mail_sent" ? "second_mail_sent" : currentStatus;
          await storage.updateCandidateEmailStatus(candidate.id, nextStatus);
        } else {
          await storage.updateRecipientStatus(recipient.id, "failed");
          errors.push(`${candidate.email}: ${emailResult.error}`);
        }
      }

      res.status(201).json({ campaign, sentCount, errors });
    } catch (error: any) {
      console.error("Error creating candidate campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.get("/api/campaigns", authenticateAdmin, async (_req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      const campaignsWithStats = await Promise.all(
        campaigns.map(async (c) => {
          const recipients = await storage.getCampaignRecipients(c.id);
          const sent = recipients.filter(r => r.status === "sent").length;
          const opened = recipients.filter(r => r.opened).length;
          const clicked = recipients.filter(r => r.clicked).length;
          return { ...c, sent, opened, clicked };
        })
      );
      res.json(campaignsWithStats);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaignById(id);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      const recipients = await storage.getCampaignRecipients(id);
      const allLeads = await storage.getAllLeads();
      const leadMap = new Map(allLeads.map(l => [l.id, l]));
      const allCandidates = await storage.getCandidates({ page: 1, pageSize: 100000 });
      const candidateMap = new Map(allCandidates.candidates.map(c => [c.id, c]));
      const recipientsWithNames = recipients.map(r => ({
        ...r,
        leadName: r.leadId ? (leadMap.get(r.leadId)?.fullName || "Unknown") :
                  r.candidateId ? (candidateMap.get(r.candidateId)?.fullName || "Unknown") :
                  "Unknown",
      }));
      res.json({ campaign, recipients: recipientsWithNames });
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  }); 

  app.get("/api/email/open/:campaignId/:recipientId", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const recipientId = parseInt(req.params.recipientId);
      const recipients = await storage.getCampaignRecipients(campaignId);
      if (recipients.some(r => r.id === recipientId)) {
        await storage.updateRecipientOpened(recipientId);
      }
    } catch (e) {
      console.error("Error tracking email open:", e);
    }
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.send(pixel);
  });

  app.get("/api/email/click/:campaignId/:recipientId", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const recipientId = parseInt(req.params.recipientId);
      const recipients = await storage.getCampaignRecipients(campaignId);
      if (recipients.some(r => r.id === recipientId)) {
        await storage.updateRecipientClicked(recipientId);
      }
    } catch (e) {
      console.error("Error tracking email click:", e);
    }
    const redirect = req.query.redirect as string;
    if (redirect && (redirect.startsWith('https://') || redirect.startsWith('/'))) {
      res.redirect(redirect);
    } else {
      res.redirect('/');
    }
  });

  app.use(blogRouter);
  app.use("/data/uploads", express.static(path.join(process.cwd(), "data", "uploads")));

  seedBlogData().catch(err => console.error("Failed to seed blog data:", err));
  
  registerHiringRoutes(app);
    registerDiagnosticRoutes(app);

    const httpServer = createServer(app);
    return httpServer;
  }
