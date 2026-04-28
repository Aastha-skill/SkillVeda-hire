import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertPartnerRegistrationSchema } from "@shared/schema";
import { Building, CheckCircle, ArrowLeft, Users, TrendingUp, Target, Award, Clock, DollarSign, Briefcase, HeadphonesIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import Footer from "@/components/footer";

const partnerFormSchema = insertPartnerRegistrationSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  contactDetails: z.string().min(10, "Contact details must be at least 10 characters"),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

export default function CompanyPartnership() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

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
        description: "Your partnership registration has been submitted successfully.",
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
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Partnership Registration Submitted!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for your interest in partnering with SkillVeda. Our team will contact you shortly.
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <Button onClick={() => window.location.href = '/'}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight font-heading" data-testid="text-partner-title">
              Partner With SkillVeda
            </h1>
            <p className="text-xl text-white/90 mt-4 max-w-3xl">
              Build your workforce with skilled, motivated, and career-ready talent
            </p>
          </div>
        </div>
      </section>

      {/* Why Companies Choose SkillVeda */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-heading">
              Why Companies Choose SkillVeda
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Access a pipeline of motivated students who are learning while working. Our work-integrated model ensures you get talent that's trained, committed, and ready to contribute from day one.
            </p>
          </div>

          {/* Zero-Cost Hiring - Main USP Highlight */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-emerald-500 to-green-600 border-0 rounded-3xl shadow-xl overflow-hidden">
              <CardContent className="p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <DollarSign className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center lg:text-left">
                      <h3 className="text-3xl lg:text-4xl font-bold text-white mb-2">Zero-Cost Hiring</h3>
                      <p className="text-lg text-white/90">Our main USP — No recruitment fees, no hidden charges</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center lg:items-end gap-2">
                    <span className="text-5xl lg:text-6xl font-bold text-white">₹0</span>
                    <span className="text-white/80 font-medium">Hiring Cost</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="text-white">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-white/90" />
                      <span className="text-sm">No Recruitment Fees</span>
                    </div>
                    <div className="text-white">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-white/90" />
                      <span className="text-sm">No Commission Charges</span>
                    </div>
                    <div className="text-white">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-white/90" />
                      <span className="text-sm">No Hidden Costs</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-purple-50 border-0 rounded-2xl">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">Pre-Vetted Talent</h3>
                <p className="text-sm text-gray-600">Students screened for skills, attitude, and commitment</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-0 rounded-2xl">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900">Long-Term Commitment</h3>
                <p className="text-sm text-gray-600">Students stay for 2-3 years, reducing turnover</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-0 rounded-2xl">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Quick Onboarding</h3>
                <p className="text-sm text-gray-600">Fast hiring process with ready-to-work candidates</p>
              </CardContent>
            </Card>

            <Card className="bg-pink-50 border-0 rounded-2xl">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900">Skilled & Ready</h3>
                <p className="text-sm text-gray-600">Continuous training ensures job-ready professionals</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How The Partnership Works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-12">
                How The Partnership Works
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Define Requirements</h3>
                  <p className="text-sm text-gray-600">Tell us about your hiring needs, roles, and skill requirements</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Match & Place</h3>
                  <p className="text-sm text-gray-600">We match pre-screened students with your requirements</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Continuous Support</h3>
                  <p className="text-sm text-gray-600">We provide ongoing training and support throughout the program</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">What You Get</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Access to Talent Pool</h4>
                    <p className="text-sm text-gray-600">Connect with hundreds of motivated students across multiple programs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Flexible Engagement</h4>
                    <p className="text-sm text-gray-600">Choose full-time, part-time, or project-based engagement models</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Reduced Hiring Costs</h4>
                    <p className="text-sm text-gray-600">No recruitment fees, competitive compensation structure</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Brand Building</h4>
                    <p className="text-sm text-gray-600">Enhance your employer brand and social impact credentials</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Ongoing Training</h4>
                    <p className="text-sm text-gray-600">Students receive continuous education aligned with your needs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Dedicated Support</h4>
                    <p className="text-sm text-gray-600">Our team ensures smooth operations and resolves any issues</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partnership Registration Form */}
      <section className="py-16 bg-white" id="registration-form">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partner with SkillVeda</h2>
            <p className="text-gray-600">
              Join our network of partner companies and help shape the future of work-integrated learning. Submit your partnership registration and receive a shareable link to invite other companies.
            </p>
          </div>

          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl text-center">Partnership Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-name" />
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
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company Ltd." {...field} data-testid="input-company" />
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
                            data-testid="input-contact"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full py-6"
                    disabled={submitPartnerRegistration.isPending}
                    data-testid="button-submit"
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 font-heading">
            Ready to Build Your Team?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join 50+ companies who are already hiring skilled talent through SkillVeda
          </p>
          <Button 
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full shadow-lg"
            onClick={() => {
              if ((window as any).Calendly) {
                (window as any).Calendly.initPopupWidget({ url: 'https://calendly.com/aastha-skillveda/30min' });
              }
            }}
            data-testid="button-schedule-call"
          >
            Schedule a Partnership Call
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
