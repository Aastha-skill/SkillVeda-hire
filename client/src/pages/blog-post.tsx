import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/footer";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  cover_image: string;
  author_name: string;
  author_avatar: string;
  status: string;
  read_time: number;
  created_at: string;
  updated_at: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function decodeEntities(text: string): string {
  const el = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (el) {
    el.innerHTML = text;
    return el.value;
  }
  return text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function extractHeadings(html: string): TocItem[] {
  const regex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  const headings: TocItem[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[2].replace(/<[^>]*>/g, "").trim();
    const text = decodeEntities(raw);
    if (text) {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ id, text, level: parseInt(match[1]) });
    }
  }
  return headings;
}

function addIdsToHeadings(html: string): string {
  return html.replace(/<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/gi, (_match, level, attrs, content) => {
    const raw = content.replace(/<[^>]*>/g, "").trim();
    const text = decodeEntities(raw);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeHeading, setActiveHeading] = useState("");

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog/posts", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts/${slug}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: relatedData } = useQuery<{ posts: BlogPost[] }>({
    queryKey: ["/api/blog/posts", "related", post?.category],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts?category=${encodeURIComponent(post!.category)}`);
      if (!res.ok) throw new Error("Failed to fetch related");
      return res.json();
    },
    enabled: !!post?.category,
  });

  const relatedPosts = relatedData?.posts?.filter((p) => p.slug !== slug)?.slice(0, 3) || [];

  const headings = useMemo(() => (post ? extractHeadings(post.body) : []), [post]);
  const processedBody = useMemo(() => (post ? addIdsToHeadings(post.body) : ""), [post]);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | SkillVeda Blog`;
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", post.excerpt);
    setMeta("og:title", `${post.title} | SkillVeda Blog`, true);
    setMeta("og:description", post.excerpt, true);
    setMeta("og:type", "article", true);
    setMeta("og:url", window.location.href, true);
    if (post.cover_image) setMeta("og:image", post.cover_image, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", post.title);
    setMeta("twitter:description", post.excerpt);
    if (post.cover_image) setMeta("twitter:image", post.cover_image);
    return () => { document.title = "SkillVeda"; };
  }, [post]);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    const timer = setTimeout(() => {
      headings.forEach((h) => {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      });
    }, 300);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [headings]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "Career Tips": return "bg-blue-100 text-blue-700";
      case "AI & SaaS": return "bg-purple-100 text-purple-700";
      case "Mentorship": return "bg-green-100 text-green-700";
      case "Industry Insights": return "bg-orange-100 text-orange-700";
      case "CS Playbooks": return "bg-teal-100 text-teal-700";
      case "Frameworks": return "bg-indigo-100 text-indigo-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12 w-full">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <span className="inline-flex items-center gap-2 text-[#6C2BD9] font-medium hover:underline cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/blog">
            <span className="inline-flex items-center gap-2 text-gray-500 hover:text-[#6C2BD9] transition-colors cursor-pointer text-sm">
              <ArrowLeft className="h-4 w-4" />
              Blog
            </span>
          </Link>
        </div>
      </div>

      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug mb-5" style={{ fontFamily: "Inter, sans-serif", overflowWrap: "break-word", wordBreak: "normal" }}>
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge className={`${categoryColor(post.category)} border-0 font-medium text-xs px-3 py-1`}>
              {post.category}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C2BD9] to-[#8B5CF6] flex items-center justify-center overflow-hidden">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-white text-sm font-bold">{post.author_name?.[0] || "S"}</span>
                )}
              </div>
              <span className="font-semibold text-gray-900">{post.author_name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {post.cover_image && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={post.cover_image}
              alt={post.title}
              loading="lazy"
              className="w-full h-auto max-h-[450px] object-cover"
            />
          </div>
        </div>
      )}

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 lg:py-14">
        {headings.length > 0 && (
          <aside className="hidden 2xl:block absolute left-0 top-14 w-56" style={{ marginLeft: "-20px" }}>
            <div className="sticky top-24 pr-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Contents</h3>
              <nav className="space-y-1">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`block text-xs py-1.5 transition-colors border-l-2 leading-snug ${
                      activeHeading === h.id
                        ? "border-[#6C2BD9] text-[#6C2BD9] font-medium"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                    } ${h.level === 3 ? "pl-6" : "pl-4"}`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <article className="max-w-3xl mx-auto">
          <div
            className="prose prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-xl prose-h2:lg:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:lg:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-800 prose-p:leading-relaxed prose-p:mb-5 prose-li:text-gray-800 prose-strong:text-gray-900 prose-a:text-[#6C2BD9] prose-a:underline prose-a:decoration-[#6C2BD9]/30 hover:prose-a:decoration-[#6C2BD9] prose-img:rounded-xl prose-img:max-w-full prose-blockquote:border-l-[#6C2BD9] prose-blockquote:text-gray-700 prose-blockquote:bg-gray-50 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-ol:text-gray-800 prose-ul:text-gray-800"
            style={{ color: '#1f2937', overflowWrap: 'break-word', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedBody) }}
          />
        </article>
      </div>

      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: "Inter, sans-serif" }}>
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`}>
                  <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border border-gray-100">
                    <div className="relative overflow-hidden h-40">
                      <img
                        src={related.cover_image}
                        alt={related.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <Badge className={`${categoryColor(related.category)} border-0 font-medium text-xs mb-2`}>
                        {related.category}
                      </Badge>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#6C2BD9] transition-colors line-clamp-2 mb-2">
                        {related.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{formatDate(related.created_at)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
