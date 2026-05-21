import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

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

// Main DB (Neon) — HTTP driver so each query wakes the compute even after auto-suspend.
// Do NOT use a WebSocket Pool here: idle pool connections go stale when Neon
// auto-suspends the compute, producing "endpoint disabled" errors on every form submit.
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Hire DB (Supabase, Mumbai region) — Pool is fine here; Supabase never auto-suspends.
neonConfig.webSocketConstructor = ws;
export const hirePool = new Pool({
  connectionString: process.env.HIRE_DB_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 20000,
  max: 5,
});

hirePool.on("error", (err) => {
  console.error("[hireDb] pool client error:", err.message);
});

export const hireDb = drizzleWs({ client: hirePool, schema });
