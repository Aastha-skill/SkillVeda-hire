import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/footer";
import { CheckCircle, Sparkles } from "lucide-react";
import CompanyRibbon from "@/components/company-ribbon";

const experienceOptions = [
  "Fresher",
  "0–1 years",
  "1–3 years",
  "3–5 years",
  "5+ years",
];

export default function CustomerSuccessEnrol() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    designation: "",
    yearsOfExperience: "",
    currentCompany: "",
    programPreference: "Customer Success Career Accelerator Program",
  });

  const mutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const res = await fetch("/api/program-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          currentStatus: formData.designation || "Not specified",
          yearsOfExperience: formData.yearsOfExperience,
          currentLocation: formData.currentCompany,
          programSlug: "customer-success-enrol-lead",
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Enrolment Submitted!", description: "Our team will reach out to you shortly." });
      setSubmitted(true);
    },
    onError: () => {
      toast({ title: "Submission Failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone) return;
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
            SkillVeda
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Join thousands of professionals<br className="hidden sm:block" />
            who have transformed their careers<br className="hidden sm:block" />
            and landed in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              world-class companies.
            </span>
          </h1>
        </div>
      </section>

      <CompanyRibbon title="Our Partner Companies" />

      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Upgrade Your Skills to Achieve Your Dream Job
            </h2>
            <p className="text-gray-600">Fill in your details and our team will guide you through the next steps.</p>
          </div>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">You're In!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Thank you for enrolling. Our team will reach out to you within 24 hours with the next steps.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="enrol-name">Full Name *</Label>
                    <Input
                      id="enrol-name"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrol-email">Email Address *</Label>
                    <Input
                      id="enrol-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrol-phone">Contact Number *</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-gray-100 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium">
                        +91
                      </div>
                      <Input
                        id="enrol-phone"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="XXXXX XXXXX"
                        className="rounded-xl h-11 flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrol-designation">Designation</Label>
                    <Input
                      id="enrol-designation"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      placeholder="e.g. Associate, Analyst, Student"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrol-experience">Years of Experience</Label>
                    <Select
                      value={form.yearsOfExperience}
                      onValueChange={(v) => setForm({ ...form, yearsOfExperience: v })}
                    >
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrol-company">Current Company / College Name</Label>
                    <Input
                      id="enrol-company"
                      value={form.currentCompany}
                      onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                      placeholder="e.g. ABC Corp, XYZ University"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrol-program">Program Preference *</Label>
                    <Select
                      value={form.programPreference}
                      onValueChange={(v) => setForm({ ...form, programPreference: v })}
                    >
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Customer Success Career Accelerator Program">Customer Success Career Accelerator Program</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={mutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-full text-base mt-2"
                  >
                    {mutation.isPending ? "Submitting..." : "Enrol Now"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
