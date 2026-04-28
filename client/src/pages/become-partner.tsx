import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertPartnerRegistrationSchema } from "@shared/schema";
import type { InsertPartnerRegistration } from "@shared/schema";
import { Building, Mail, Phone, CheckCircle, ArrowLeft } from "lucide-react";

// Helper function to get URL parameters
const getUrlParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const partnerFormSchema = insertPartnerRegistrationSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  contactDetails: z.string().min(10, "Contact details must be at least 10 characters"),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

export default function BecomePartner() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  // Get the referral parameter from URL
  const referralId = getUrlParam('ref');

  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      contactDetails: "",
    },
  });

  const submitPartnerRegistration = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      const response = await apiRequest("POST", "/api/partner-registrations", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Registration Submitted!",
        description: "Thank you for your interest in partnering with SkillVeda. We'll be in touch soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PartnerFormData) => {
    submitPartnerRegistration.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Thank You!
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Your partnership registration has been submitted successfully. Our team will review your application and get back to you within 48 hours.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  In the meantime, feel free to explore our current job opportunities.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => window.location.href = '/jobs'}>
                    Browse Jobs
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/'}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Home</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Building className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Become a Partner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join SkillVeda's network of partner companies and help shape the future of work-integrated learning. Connect with talented students and build lasting partnerships.
          </p>
          {referralId && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You were invited through partnership link: <code className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{referralId}</code>
              </p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Partnership Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john.doe@company.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company Ltd." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Phone number, additional email, or other contact information..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitPartnerRegistration.isPending}
                >
                  {submitPartnerRegistration.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Building className="h-4 w-4 mr-2" />
                      Submit Partnership Registration
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Have questions? Contact us at{" "}
            <a href="mailto:aastha@skillveda.ai" className="text-primary hover:underline">
              aastha@skillveda.ai
            </a>{" "}
            or call{" "}
            <a href="tel:+918076746450" className="text-primary hover:underline">
              +91 80767 46450
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}