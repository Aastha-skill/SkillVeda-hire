import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";
import { blogPosts, blogCategories } from "@shared/schema";
import { eq, sql, and, desc, count } from "drizzle-orm";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "skillveda_jwt_2024";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "skillveda2024";

const uploadsDir = path.join(process.cwd(), "data", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const blogUploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const blogUpload = multer({
  storage: blogUploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculateReadTime(body: string): number {
  const text = body.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function authenticateBlogAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

router.get("/api/blog/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await db.select().from(blogCategories).orderBy(blogCategories.name);
    res.json(categories.map(c => ({ id: c.id, name: c.name, created_at: c.createdAt })));
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/api/blog/admin/categories", authenticateBlogAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }
    const existing = await db.select().from(blogCategories).where(eq(blogCategories.name, name.trim()));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Category already exists" });
    }
    const [category] = await db.insert(blogCategories).values({ name: name.trim() }).returning();
    res.status(201).json({ id: category.id, name: category.name, created_at: category.createdAt });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.delete("/api/blog/admin/categories/:id", authenticateBlogAdmin, async (req: Request, res: Response) => {
  try {
    const catId = parseInt(req.params.id);
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, catId));
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    const [postsUsing] = await db.select({ cnt: count() }).from(blogPosts).where(eq(blogPosts.category, category.name));
    if (postsUsing.cnt > 0) {
      return res.status(400).json({ error: `Cannot delete: ${postsUsing.cnt} post(s) use this category` });
    }
    await db.delete(blogCategories).where(eq(blogCategories.id, catId));
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

router.post("/api/blog/login", (req: Request, res: Response) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

router.get("/api/blog/posts", async (req: Request, res: Response) => {
  try {
    const { category, search, page } = req.query;
    const perPage = 12;
    const currentPage = Math.max(1, parseInt(page as string) || 1);
    const offset = (currentPage - 1) * perPage;

    const conditions = [eq(blogPosts.status, "published")];

    if (category && category !== "All") {
      conditions.push(eq(blogPosts.category, category as string));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        sql`(${blogPosts.title} ILIKE ${searchTerm} OR ${blogPosts.excerpt} ILIKE ${searchTerm} OR ${blogPosts.body} ILIKE ${searchTerm})`
      );
    }

    const whereClause = and(...conditions);

    const [countResult] = await db.select({ total: count() }).from(blogPosts).where(whereClause);

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        category: blogPosts.category,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        authorName: blogPosts.authorName,
        authorAvatar: blogPosts.authorAvatar,
        status: blogPosts.status,
        readTime: blogPosts.readTime,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .where(whereClause)
      .orderBy(desc(blogPosts.createdAt))
      .limit(perPage)
      .offset(offset);

    const mappedPosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      excerpt: p.excerpt,
      cover_image: p.coverImage,
      author_name: p.authorName,
      author_avatar: p.authorAvatar,
      status: p.status,
      read_time: p.readTime,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }));

    res.json({
      posts: mappedPosts,
      total: countResult.total,
      page: currentPage,
      totalPages: Math.ceil(countResult.total / perPage),
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/api/blog/posts/:slug", async (req: Request, res: Response) => {
  try {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, req.params.slug), eq(blogPosts.status, "published")));

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.coverImage,
      author_name: post.authorName,
      author_avatar: post.authorAvatar,
      status: post.status,
      read_time: post.readTime,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

router.get("/api/blog/admin/posts", authenticateBlogAdmin, async (_req: Request, res: Response) => {
  try {
    const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    const mappedPosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      excerpt: p.excerpt,
      body: p.body,
      cover_image: p.coverImage,
      author_name: p.authorName,
      author_avatar: p.authorAvatar,
      status: p.status,
      read_time: p.readTime,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }));
    res.json(mappedPosts);
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.post("/api/blog/admin/posts", authenticateBlogAdmin, async (req: Request, res: Response) => {
  try {
    const { title, category, excerpt, body, cover_image, author_name, author_avatar, status } = req.body;

    if (!title || !category || !excerpt || !body) {
      return res.status(400).json({ error: "title, category, excerpt, and body are required" });
    }

    let slug = generateSlug(title);
    const readTime = calculateReadTime(body);

    const existing = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug));
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [post] = await db
      .insert(blogPosts)
      .values({
        title,
        slug,
        category,
        excerpt,
        body,
        coverImage: cover_image || null,
        authorName: author_name || "SkillVeda Team",
        authorAvatar: author_avatar || null,
        status: status || "draft",
        readTime: readTime,
      })
      .returning();

    res.status(201).json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.coverImage,
      author_name: post.authorName,
      author_avatar: post.authorAvatar,
      status: post.status,
      read_time: post.readTime,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.put("/api/blog/admin/posts/:id", authenticateBlogAdmin, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, category, excerpt, body, cover_image, author_name, author_avatar, status } = req.body;

    const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId));
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    let slug = title ? generateSlug(title) : existing.slug;
    const readTime = body ? calculateReadTime(body) : existing.readTime;

    if (title) {
      const slugConflict = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), sql`${blogPosts.id} != ${postId}`));
      if (slugConflict.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const [updated] = await db
      .update(blogPosts)
      .set({
        title: title || existing.title,
        slug,
        category: category || existing.category,
        excerpt: excerpt || existing.excerpt,
        body: body || existing.body,
        coverImage: cover_image !== undefined ? cover_image : existing.coverImage,
        authorName: author_name || existing.authorName,
        authorAvatar: author_avatar !== undefined ? author_avatar : existing.authorAvatar,
        status: status || existing.status,
        readTime: readTime,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, postId))
      .returning();

    res.json({
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      category: updated.category,
      excerpt: updated.excerpt,
      body: updated.body,
      cover_image: updated.coverImage,
      author_name: updated.authorName,
      author_avatar: updated.authorAvatar,
      status: updated.status,
      read_time: updated.readTime,
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/api/blog/admin/posts/:id", authenticateBlogAdmin, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const [existing] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.id, postId));

    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, postId));
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

router.post(
  "/api/blog/admin/upload",
  authenticateBlogAdmin,
  (req: Request, res: Response) => {
    blogUpload.single("image")(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
        }
        if (err.message === "Only image files are allowed" || err.message === "Invalid file type") {
          return res.status(400).json({ error: "Invalid file type. Allowed: jpg, jpeg, png, gif, webp" });
        }
        console.error("Upload error:", err);
        return res.status(500).json({ error: "Failed to upload image" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const url = `/data/uploads/${req.file.filename}`;
      res.json({ url });
    });
  }
);

export default router;
