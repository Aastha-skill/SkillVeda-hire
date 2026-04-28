import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, ArrowRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/footer";

interface BlogCategory {
  id: number;
  name: string;
  created_at: string;
}

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

interface BlogResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categoriesData } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
    queryFn: async () => {
      const res = await fetch("/api/blog/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const categoryTabs = ["All", ...(categoriesData || []).map(c => c.name)];

  useEffect(() => {
    document.title = "Blog & Insights | SkillVeda";
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
    setMeta("description", "Expert advice on careers, AI, SaaS, and professional growth from industry mentors and thought leaders at SkillVeda.");
    setMeta("og:title", "Blog & Insights | SkillVeda", true);
    setMeta("og:description", "Expert advice on careers, AI, SaaS, and professional growth from industry mentors and thought leaders at SkillVeda.", true);
    setMeta("og:type", "website", true);
    setMeta("og:url", window.location.href, true);
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", "Blog & Insights | SkillVeda");
    setMeta("twitter:description", "Expert advice on careers, AI, SaaS, and professional growth from industry mentors and thought leaders at SkillVeda.");
    return () => { document.title = "SkillVeda"; };
  }, []);

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(currentPage));
  if (activeCategory !== "All") queryParams.set("category", activeCategory);
  if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());

  const { data, isLoading } = useQuery<BlogResponse>({
    queryKey: ["/api/blog/posts", activeCategory, searchQuery, currentPage],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F9F9FB" }}>
      <section className="py-16 lg:py-20" style={{ background: "linear-gradient(135deg, #6C2BD9 0%, #8B5CF6 50%, #A78BFA 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20 mb-6">
            <BookOpen className="h-4 w-4 mr-2" />
            Blog & Resources
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
            SkillVeda Insights
          </h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto">
            Expert advice on careers, AI, SaaS, and professional growth from industry mentors and thought leaders.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex flex-wrap gap-2 flex-1">
            {categoryTabs.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#6C2BD9] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-full border-gray-200"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.posts && data.posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                    <div className="relative overflow-hidden h-48">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#6C2BD9] to-[#A78BFA] flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white/40" />
                        </div>
                      )}
                      <Badge className={`absolute top-4 left-4 ${categoryColor(post.category)} border-0 font-medium`}>
                        {post.category}
                      </Badge>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#6C2BD9] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C2BD9] to-[#8B5CF6] flex items-center justify-center overflow-hidden">
                            {post.author_avatar ? (
                              <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <span className="text-white text-xs font-bold">{post.author_name?.[0] || "S"}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">{post.author_name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-full"
                >
                  Previous
                </Button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-full w-10 h-10 ${page === currentPage ? "bg-[#6C2BD9] hover:bg-[#5b24b8]" : ""}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= data.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-full"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}