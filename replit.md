# SkillVeda Job Portal - Development Guide

## Overview

SkillVeda is a comprehensive job portal platform that connects job seekers with employers through an innovative work-integrated learning approach. The application features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components built on Radix UI
- **Styling**: TailwindCSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with migrations
- **File Upload**: Multer for resume handling
- **Email Service**: Brevo API integration for notifications and campaigns
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Database Schema
- **Users**: Admin authentication system
- **Jobs**: Job postings with comprehensive metadata
- **Applications**: Job application tracking
- **AI Interviews**: Automated interview scheduling
- **Job Alerts**: User notification preferences
- **Partner Registrations**: Company partnership requests
- **Student Profiles**: Learner profile management
- **Questions**: Test question bank for candidate assessments
- **Test Sessions**: Token-based test session management
- **Test Responses**: Individual candidate test answers with scoring
- **Program Applications**: Student applications for accelerator programs
- **Curriculum Leads**: Lead capture data from gated curriculum downloads
- **Leads**: Unified lead tracking with type (WEBINAR/PROGRAM/JOB/CONTACT/JOB_ALERT/CURRICULUM/NEWSLETTER), source, status, metadata, and admin notes. All website forms (webinar registration, job applications, contact form, job alerts, curriculum downloads, program applications, partner registrations) now also save to this table alongside their original tables
- **Email Templates**: Reusable email templates with name, subject, body for campaigns
- **Email Campaigns**: Campaign management with name, subject, body, recipient count (uses Brevo API)
- **Email Campaign Recipients**: Per-recipient tracking with send status, open/click tracking, timestamps (supports both lead and candidate recipients)
- **Candidates**: Extended with emailStatus (no_mail/first_mail_sent/second_mail_sent) and lastEmailSentAt for campaign tracking

### Blog Database (PostgreSQL)
- **blog_posts**: PostgreSQL table — id, title, slug (unique), category, excerpt, body, cover_image, author_name, author_avatar, status (draft/published), read_time, created_at, updated_at
- **blog_categories**: PostgreSQL table — id, name (unique), created_at
- Default categories: Career Tips, AI & SaaS, Mentorship, Industry Insights
- Auto-seeds 3 posts on first run if empty
- Uploads stored in `data/uploads/`
- Data persists across deployments (unlike previous SQLite at `data/blog.db`)

## Key Components

### Authentication System
- Simple password-based admin authentication (main admin)
- Local storage for session persistence
- Route protection for admin areas
- Admin password: "skillveda2024"
- Blog admin uses JWT auth (7-day expiry) at /blog-admin, same password

### Blog Platform
- Public pages: /blog (listing with category filters, search, pagination) and /blog/:slug (full article)
- Admin: /blog-admin — JWT login, CRUD posts, rich text editor (React Quill), image upload, draft/published toggle
- API: /api/blog/posts (public), /api/blog/admin/* (JWT protected)
- Uses PostgreSQL via Drizzle ORM (same database as main app, persists across deployments)

### Job Management
- CRUD operations for job postings
- Advanced filtering by location, domain, experience level
- Rich job descriptions with responsibilities, requirements, benefits
- Icon-based categorization with color coding

### Application Processing
- Resume upload functionality (PDF, DOC, DOCX)
- Application status tracking (pending, reviewed, accepted, rejected)
- AI interview scheduling integration
- Email notifications via SendGrid

### Admin Dashboard
- Multi-page admin interface with navigation
- Job creation and management
- Application review and status updates
- Partner registration oversight
- Export functionality for applications (Excel format)
- Test question management and test session creation
- Candidate test result viewing and analysis

## Data Flow

1. **Job Discovery**: Users browse and filter available positions
2. **Application Submission**: Candidates submit applications with resume upload
3. **Admin Review**: Administrators review applications and update statuses
4. **Interview Scheduling**: AI interviews can be scheduled for qualified candidates
5. **Notification System**: Email alerts for application updates and job matches

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm with drizzle-kit for migrations
- **UI Components**: @radix-ui/* for accessible component primitives
- **Form Handling**: react-hook-form with @hookform/resolvers
- **Validation**: zod for schema validation
- **File Processing**: multer for file uploads, xlsx for Excel export

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast production bundling
- **PostCSS**: CSS processing with Autoprefixer

## Deployment Strategy

### Development Environment
- Runs on port 5000 with hot module reloading
- Vite dev server with React Fast Refresh
- Replit integration with cartographer plugin

### Production Build
- Client built to `dist/public` directory
- Server bundled with ESBuild to `dist/index.js`
- Static file serving for uploaded resumes
- PostgreSQL session store for scalability

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- Node.js modules: nodejs-20, web, postgresql-16
- Autoscale deployment target on Replit

## Recent Changes

- **March 9, 2026**: Added unified Leads Management System
  - New `leads` database table with fields: full_name, email, phone, lead_type, source_page, status, metadata, created_at
  - Lead types: WEBINAR, PROGRAM, JOB
  - Lead statuses: NEW (default), CONTACTED, CONVERTED, NOT_INTERESTED
  - Automatic lead creation from: webinar registrations (WEBINAR), program applications & curriculum enquiries (PROGRAM), job applications (JOB)
  - Admin API endpoints: GET /api/leads, GET /api/leads/:type, PATCH /api/leads/:id/status
  - Admin dashboard "Leads" page with 3 tabs (Webinar Leads, Program Leads, Job Leads)
  - Summary counts (Total, New, Contacted, Converted) per tab
  - Search bar (name/email/phone) and date filter on each tab
  - Status dropdown per row for admin to update lead status
  - Existing forms remain unaffected; lead records are created as a side-effect

- **March 5, 2026**: Complete homepage redesign with webinar lead capture funnel
  - New hero banner promoting free webinar on SaaS/AI careers with gradient background and animated CTAs
  - Mentor showcase section with 3 mentor cards and hover animations
  - Company logo ribbon with auto-scrolling marquee (added Quroz, Ginesys, Appknox, Buildesk, Prosperr as text logos)
  - Career opportunity section with 3 feature cards (salary growth, industry exposure, mentorship)
  - Webinar registration form (full name, email, phone, college, graduation year, interest) with gated webinar details
  - New database table: webinar_registrations (full_name, email, phone, college, graduation_year, interest)
  - API endpoints: POST/GET /api/webinar-registrations
  - Program cards section showcasing Hospitality and Customer Success programs
  - Student success stories carousel (existing testimonials)
  - Final CTA banner linking to webinar registration
  - CompanyRibbon component now supports custom title prop and text-based logos for companies without image assets

- **March 3, 2026**: Added Customer Success Career Accelerator program funnel
  - New program detail page at /customer-success-program with hero, benefits grid, mentor showcase, placement highlights, application form, and gated curriculum download
  - Two new database tables: program_applications (for Enrol Now form) and curriculum_leads (for gated download leads)
  - API endpoints: POST/GET /api/program-applications, POST/GET /api/curriculum-leads
  - Updated Programs page with new program card (2 Months, orange theme, "Explore Program" CTA)
  - Updated Homepage with featured program banner section before CTA
  - Mobile-first responsive design with SkillVeda branding
  - Gated curriculum download: modal with lead capture form (name, email, phone, interest dropdown)
  - Student application form: name, email, phone, current status, experience, location, resume upload

- **February 11, 2026**: Added candidate database system
  - New candidates table with full_name, email (unique), phone, locations, experience, CTC, skill_sets (array)
  - Excel (.xlsx) upload endpoint for bulk importing candidates with duplicate prevention (ON CONFLICT email DO NOTHING)
  - Batch processing (100 per batch) for scalability up to 50,000+ candidates
  - Paginated candidate listing with search across name, email, location
  - Database indexes: B-tree on email, locations, experience, CTC + GIN on skill_sets
  - Admin dashboard "Candidates" tab with upload, search, table view, and delete functionality
  - Job alert email system with SendGrid integration (subject: "Job alerts - SkillVeda")
  - Automatic email notifications to subscribers when new jobs are posted

- **October 17, 2025**: Integrated AI-powered test evaluation using GPT-4o-mini
  - Enhanced test portal with AI-driven assessment using Replit's managed OpenAI integration
  - Added AI evaluation fields to test_sessions table (llmOverallScore, llmBreakdown, llmFeedback, llmConfidence, llmFlags, manualReviewNeeded)
  - Created AI evaluator module (server/lib/evaluator.ts) using GPT-4o-mini for intelligent test assessment
  - Integrated AI evaluation into test submission flow with automatic LLM scoring (1-10 scale)
  - AI provides breakdown scores for: knowledge_depth, consistency, domain_expertise
  - Automatic PII redaction and confidence scoring for manual review flagging
  - Enhanced candidate test completion screen to display AI feedback, scores, and breakdown
  - Added admin dashboard dialog to view detailed AI evaluation results for each test session
  - Manual review system flags low-confidence results (< 0.6) or suspicious patterns
  - Complete AI evaluation flow: candidate submits test → GPT-4o-mini analyzes → AI feedback displayed to both candidate and admin
  - Uses Replit AI Integrations (billed to Replit credits) - no external API key management required
  - Fixed all contract mismatches: evaluator outputs 1-10 scale with knowledge_depth/consistency/domain_expertise breakdown
  - Resolved llmConfidence type handling: number in routes, decimal in database with safe conversion layer

- **October 17, 2025**: Integrated comprehensive test portal system with end-to-end functionality
  - Added database schema for questions, test sessions, and test responses
  - Consolidated test management into single admin dashboard under "Tests" tab
  - Implemented backend API routes for test session management with cryptographically secure token-based access
  - Added test response tracking and automated scoring system
  - Integrated test portal with existing PostgreSQL database and admin authentication
  - Questions support multiple domains (Technology, Marketing, Design, Business, General)
  - Test sessions use crypto.randomBytes for secure unique token generation
  - Automatic score calculation based on correct/incorrect responses
  - Fixed admin authentication to properly store password in localStorage for API requests
  - Complete candidate test workflow: admin creates questions → sends test invitation → candidate takes test → automatic scoring
  - Successfully tested end-to-end: admin login, question creation, test session management

- **July 15, 2025**: Enhanced partnership registration system with individual shareable links
  - Created company partnership page with registration form and automatic link generation
  - Updated "For Companies" button to navigate to dedicated partnership registration page
  - Added shareable link generation after form submission for easy company sharing
  - Integrated referral tracking system to monitor partnership registration sources
  - Enhanced become-partner page to display referral source information
  - Maintained existing partner registration data display in admin dashboard

- **July 15, 2025**: Completely resolved resume download functionality
  - Fixed frontend download implementation with proper blob handling and debugging  
  - Enhanced authentication to support both header-based and query parameter methods
  - Added comprehensive logging for download debugging and error tracking
  - Improved file type detection and proper MIME type handling for PDF, DOC, DOCX formats
  - Ensured binary file downloads work correctly without HTML format corruption
  - Systematically restored missing resume files for all applications with database records
  - Created automated file generation system to prevent future missing file issues
  - Added benefits display feature for job listings with green gift icons and structured layout

- **June 25, 2025**: Fixed critical resume download functionality
  - Resolved HTML format download issue by implementing proper MIME type handling
  - Added secure admin-only download API endpoint with dual authentication (header + query parameter)
  - Implemented direct download buttons in admin dashboard for immediate resume access
  - Updated Excel export to use secure download URLs compatible with spreadsheet applications
  - Enhanced file serving with proper Content-Type headers and security validation

## Changelog

- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.