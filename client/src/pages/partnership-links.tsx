import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, ExternalLink, Trash2, Building, Link2, Calendar, CheckCircle, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const createLinkSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
});

type CreateLinkData = z.infer<typeof createLinkSchema>;

interface PartnershipLink {
  id: string;
  companyName: string;
  description?: string;
  linkId: string;
  createdAt: string;
  clicks: number;
  registrations: number;
}

export default function PartnershipLinks() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateLinkData>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      companyName: "",
      description: "",
    },
  });

  // Mock data for now - in a real app this would come from API
  const { data: partnershipLinks, isLoading } = useQuery<PartnershipLink[]>({
    queryKey: ["/api/partnership-links"],
    queryFn: () => {
      // Mock data - replace with actual API call
      return Promise.resolve([
        {
          id: "1",
          companyName: "Tech Corp",
          description: "Technology partnership for internships",
          linkId: "tech-corp-2025",
          createdAt: new Date().toISOString(),
          clicks: 15,
          registrations: 3,
        },
        {
          id: "2", 
          companyName: "FinanceHub",
          description: "Finance sector collaboration",
          linkId: "financehub-partnership",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          clicks: 8,
          registrations: 1,
        },
      ]);
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: CreateLinkData) => {
      // Generate unique link ID
      const linkId = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
      
      // In a real app, this would be an API call
      return Promise.resolve({
        id: Date.now().toString(),
        ...data,
        linkId,
        createdAt: new Date().toISOString(),
        clicks: 0,
        registrations: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partnership-links"] });
      setIsCreating(false);
      form.reset();
      toast({
        title: "Link Created!",
        description: "Partnership link has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create partnership link.",
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      // Mock deletion - replace with actual API call
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partnership-links"] });
      toast({
        title: "Link Deleted",
        description: "Partnership link has been deleted.",
      });
    },
  });

  const onSubmit = (data: CreateLinkData) => {
    createLinkMutation.mutate(data);
  };

  const copyLink = (linkId: string) => {
    const fullLink = `${window.location.origin}/become-partner?ref=${linkId}`;
    navigator.clipboard.writeText(fullLink);
    toast({
      title: "Link Copied!",
      description: "Partnership link has been copied to clipboard",
    });
  };

  const generateQuickLink = () => {
    const linkId = `quick-link-${Date.now()}`;
    const quickLink = `${window.location.origin}/become-partner?ref=${linkId}`;
    navigator.clipboard.writeText(quickLink);
    toast({
      title: "Quick Link Generated!",
      description: "A new partnership link has been created and copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Partnership Links</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create and manage individual shareable partnership links for different companies and track their performance.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={generateQuickLink}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Generate Quick Link
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsCreating(true)}
              disabled={isCreating}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Link
            </Button>
          </div>

          {/* Create New Link Form */}
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Partnership Link</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., TechCorp, FinanceHub" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Technology partnership for internships" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        disabled={createLinkMutation.isPending}
                      >
                        {createLinkMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Link
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsCreating(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Partnership Links List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Partnership Links ({partnershipLinks?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partnershipLinks && partnershipLinks.length > 0 ? (
                <div className="space-y-4">
                  {partnershipLinks.map((link) => (
                    <div key={link.id} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{link.companyName}</h3>
                          {link.description && (
                            <p className="text-muted-foreground text-sm">{link.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{link.clicks} clicks</span>
                          </Badge>
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{link.registrations} registrations</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg mb-3">
                        <code className="flex-1 text-sm">
                          {window.location.origin}/become-partner?ref={link.linkId}
                        </code>
                        <Button
                          onClick={() => copyLink(link.linkId)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </Button>
                        <Button
                          onClick={() => window.open(`/become-partner?ref=${link.linkId}`, '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Open</span>
                        </Button>
                      </div>

                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Created {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          onClick={() => deleteLinkMutation.mutate(link.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No partnership links created yet</p>
                  <p className="text-sm text-muted-foreground">Create your first partnership link to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}