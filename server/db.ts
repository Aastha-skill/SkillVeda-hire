import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

if (!process.env.HIRE_DB_URL) {
  throw new Error(
    "HIRE_DB_URL must be set (Supabase connection for Hire dashboard).",
  );
}

// Default DB (Neon) — for blog, jobs, applications, candidates, leads, etc.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 20000,
  max: 5,
});

pool.on("error", (err) => {
  console.error("[db] pool client error:", err.message);
});

export const db = drizzle({ client: pool, schema });

// Hire DB (Supabase, Mumbai region) — for Hire dashboard only
export const hirePool = new Pool({
  connectionString: process.env.HIRE_DB_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 20000,
  max: 5,
});

hirePool.on("error", (err) => {
  console.error("[hireDb] pool client error:", err.message);
});

export const hireDb = drizzle({ client: hirePool, schema });
