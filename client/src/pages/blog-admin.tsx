import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Plus, Pencil, Trash2, Upload, Eye, FileText, Lock, Tag, X } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

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
  cover_image: string | null;
  author_name: string;
  author_avatar: string | null;
  status: string;
  read_time: number;
  created_at: string;
  updated_at: string;
}

function generateSlugPreview(title: string): string {
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

function getToken(): string | null {
  return localStorage.getItem("blog_admin_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blog/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("blog_admin_token", data.token);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6C2BD9 0%, #8B5CF6 50%, #A78BFA 100%)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#6C2BD9] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Enter password to manage blog posts</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full h-12 bg-[#6C2BD9] hover:bg-[#5b24b8]" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function PostForm({
  post,
  onSave,
  onCancel,
  saving,
  categories,
}: {
  post: BlogPost | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
  categories: string[];
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [category, setCategory] = useState(post?.category || categories[0] || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [body, setBody] = useState(post?.body || "");
  const [coverImage, setCoverImage] = useState(post?.cover_image || "");
  const [authorName, setAuthorName] = useState(post?.author_name || "SkillVeda Team");
  const [authorAvatar, setAuthorAvatar] = useState(post?.author_avatar || "");
  const [isPublished, setIsPublished] = useState(post?.status === "published");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const slugPreview = useMemo(() => generateSlugPreview(title), [title]);
  const readTime = useMemo(() => calculateReadTime(body), [body]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/blog/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setCoverImage(data.url);
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !excerpt.trim() || !body.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    onSave({
      title,
      category,
      excerpt,
      body,
      cover_image: coverImage || null,
      author_name: authorName,
      author_avatar: authorAvatar || null,
      status: isPublished ? "published" : "draft",
    });
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
  }), []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter post title" className="h-11" />
            {title && (
              <p className="text-xs text-gray-400 mt-1">Slug: <span className="font-mono">{slugPreview}</span></p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Excerpt *</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary of the post" rows={3} />
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Body *</Label>
            <div className="border rounded-lg overflow-hidden">
              <ReactQuill theme="snow" value={body} onChange={setBody} modules={quillModules} style={{ minHeight: 300 }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Read time: ~{readTime} min</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Cover Image</Label>
            <div className="space-y-2">
              {coverImage && (
                <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
              )}
              <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Image URL or upload" />
              <label className="flex items-center gap-2 cursor-pointer">
                <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-1" />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </span>
                </Button>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Author Name</Label>
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Author name" />
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Author Avatar URL</Label>
            <Input value={authorAvatar} onChange={(e) => setAuthorAvatar(e.target.value)} placeholder="https://..." />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label className="text-sm font-medium">
              {isPublished ? "Published" : "Draft"}
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-[#6C2BD9] hover:bg-[#5b24b8]" disabled={saving}>
          {saving ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
    queryFn: async () => {
      const res = await fetch("/api/blog/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const categoryNames = useMemo(() => (categoriesData || []).map(c => c.name), [categoriesData]);

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/blog/admin/categories", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/categories"] });
      setNewCategoryName("");
      toast({ title: "Category created" });
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/blog/admin/categories/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/categories"] });
      toast({ title: "Category deleted" });
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/admin/posts"],
    queryFn: async () => {
      const res = await fetch("/api/blog/admin/posts", { headers: authHeaders() });
      if (res.status === 401) {
        localStorage.removeItem("blog_admin_token");
        onLogout();
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/blog/admin/posts", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setShowForm(false);
      toast({ title: "Post created successfully" });
    },
    onError: () => toast({ title: "Failed to create post", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/blog/admin/posts/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setShowForm(false);
      setEditingPost(null);
      toast({ title: "Post updated successfully" });
    },
    onError: () => toast({ title: "Failed to update post", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/blog/admin/posts/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setDeleteId(null);
      toast({ title: "Post deleted successfully" });
    },
    onError: () => toast({ title: "Failed to delete post", variant: "destructive" }),
  });

  const handleSave = (data: any) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#6C2BD9] rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Blog Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/blog" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" /> View Blog
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingPost ? "Edit Post" : "New Post"}
            </h2>
            <PostForm
              post={editingPost}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={createMutation.isPending || updateMutation.isPending}
              categories={categoryNames}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "posts" ? "bg-[#6C2BD9] text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
              >
                <FileText className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                Posts ({posts?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "categories" ? "bg-[#6C2BD9] text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
              >
                <Tag className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                Categories ({categoriesData?.length || 0})
              </button>
              {activeTab === "posts" && (
                <div className="ml-auto">
                  <Button onClick={handleNewPost} className="bg-[#6C2BD9] hover:bg-[#5b24b8]">
                    <Plus className="h-4 w-4 mr-1" /> New Post
                  </Button>
                </div>
              )}
            </div>

            {activeTab === "categories" ? (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="max-w-xs h-11"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCategoryName.trim()) {
                        createCategoryMutation.mutate(newCategoryName.trim());
                      }
                    }}
                  />
                  <Button
                    onClick={() => newCategoryName.trim() && createCategoryMutation.mutate(newCategoryName.trim())}
                    className="bg-[#6C2BD9] hover:bg-[#5b24b8] h-11"
                    disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
                  </Button>
                </div>

                {categoriesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : categoriesData && categoriesData.length > 0 ? (
                  <div className="space-y-2">
                    {categoriesData.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Tag className="h-4 w-4 text-[#6C2BD9]" />
                          <span className="font-medium text-gray-900">{cat.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteCategoryMutation.mutate(cat.id)}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No categories yet. Add your first one above.</p>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900 line-clamp-1">{post.title}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={post.status === "published" ? "bg-green-100 text-green-700 border-0" : "bg-yellow-100 text-yellow-700 border-0"}>
                              {post.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.created_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(post.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No posts yet. Create your first post!</p>
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BlogAdmin() {
  const [authenticated, setAuthenticated] = useState(!!getToken());

  const handleLogout = useCallback(() => {
    localStorage.removeItem("blog_admin_token");
    setAuthenticated(false);
  }, []);

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
