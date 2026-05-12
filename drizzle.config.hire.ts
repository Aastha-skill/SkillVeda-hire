import { defineConfig } from "drizzle-kit";

// Drizzle config for the Hire DB (Supabase, Mumbai). All tables in the
// `customers` and `candidates` schemas live here; everything else lives
// in DATABASE_URL (Neon) and uses drizzle.config.ts.

if (!process.env.HIRE_DB_URL) {
  throw new Error("HIRE_DB_URL must be set to run db:push:hire");
}

export default defineConfig({
  out: "./migrations-hire",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.HIRE_DB_URL,
  },
  schemaFilter: ["customers", "candidates"],
});
