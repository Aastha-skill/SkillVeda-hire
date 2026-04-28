import path from "path";
import fs from "fs";
import { db } from "../db";
import { blogCategories } from "@shared/schema";
import { count } from "drizzle-orm";

const uploadsDir = path.join(process.cwd(), "data", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function seedBlogData() {
  try {
    const [catCount] = await db.select({ cnt: count() }).from(blogCategories);
    if (catCount.cnt === 0) {
      const defaultCategories = ["Career Tips", "AI & SaaS", "Mentorship", "Industry Insights", "CS Playbooks", "Frameworks"];
      for (const name of defaultCategories) {
        await db.insert(blogCategories).values({ name }).onConflictDoNothing();
      }
      console.log("Blog categories seeded");
    }
  } catch (err) {
    console.warn("Failed to seed blog data (will retry when DB is available):", (err as Error).message);
  }
}
