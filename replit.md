# SkillVeda Job Portal

SkillVeda is a job portal connecting job seekers with employers through work-integrated learning, featuring job listings, application management, and AI-powered assessments.

## Run & Operate

To run the application: `npm run dev`
To build the application: `npm run build`
To run type checking: `npm run typecheck`
To generate Drizzle migrations: `npx drizzle-kit generate:pg`
To push Drizzle migrations: `npx drizzle-kit push:pg`

Required Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string.

## Stack

- **Frontend**: React 18, TypeScript, Wouter, TanStack Query, Shadcn/ui (Radix UI), TailwindCSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Build Tool**: Vite (frontend), ESBuild (backend)
- **Runtime**: Node.js 20

## Where things live

- **Frontend Source**: `src/`
- **Backend Source**: `server/`
- **Database Schema**: `server/db/schema.ts`
- **Drizzle Migrations**: `server/db/migrations/`
- **API Routes**: `server/routes/`
- **UI Components**: `src/components/ui/`, `src/components/custom/`
- **Styling**: `src/index.css` (TailwindCSS configuration)
- **Public Assets**: `public/`
- **Uploaded Files**: `data/uploads/` (for blog images), `uploads/resumes/` (for job application resumes)

## Architecture decisions

- **Unified Lead Management**: All website form submissions (webinar, program, job, contact, job alert, curriculum, newsletter) now also create a record in the `leads` table for centralized tracking.
- **Drizzle ORM for PostgreSQL**: Chosen for type-safety and robust migration management with PostgreSQL.
- **AI-powered Test Evaluation**: Integrated Replit's managed OpenAI (GPT-4o-mini) for automated assessment of candidate tests, including scoring, feedback, and PII redaction.
- **PostgreSQL Session Storage**: Uses `connect-pg-simple` for scalable and persistent user session management on the backend.
- **Serverless Database**: Leverages Neon serverless PostgreSQL for efficient scaling and cost management.

## Product

- **Job Listings**: Browse and filter jobs by location, domain, experience.
- **Job Application**: Submit applications with resume upload and track status.
- **AI-Powered Assessments**: Candidates take tests evaluated by AI with instant feedback.
- **Admin Dashboard**: Manage jobs, applications, partners, leads, tests, and candidates.
- **Blog Platform**: Public blog with categories, search, and pagination; admin interface for CRUD operations.
- **Lead Capture Funnels**: Dedicated pages and forms for webinar registrations, program applications, and curriculum downloads.
- **Candidate Management**: Bulk import and manage candidate profiles, including job alert subscriptions.
- **Email Campaigns**: Admin-managed email template creation and campaign sending via Brevo.

## User preferences

Preferred communication style: Simple, everyday language.

## Gotchas

- Always run `npx drizzle-kit generate:pg` after schema changes and `npx drizzle-kit push:pg` to apply migrations.
- Resume downloads require proper authentication (header or query param) and MIME type handling; ensure the server is running and files exist.
- AI evaluation flags low-confidence results for manual review.
- Blog images and resumes are stored on the file system; ensure `data/uploads/` and `uploads/resumes/` are persistent.

## Pointers

- [React Documentation](https://react.dev/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Zod Documentation](https://zod.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Replit AI Integrations](https://docs.replit.com/ai/getting-started)