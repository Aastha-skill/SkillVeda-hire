import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertStudentProfileSchema } from "@shared/schema";
import { z } from "zod";
import { User, Mail, Phone, GraduationCap, Briefcase, DollarSign } from "lucide-react";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const profileFormSchema = insertStudentProfileSchema.extend({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginFormSchema>;
type ProfileFormData = z.infer<typeof profileFormSchema>;

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (profile: any) => void;
}

export default function StudentLoginModal({ isOpen, onClose, onLogin }: StudentLoginModalProps) {
  const [step, setStep] = useState<"login" | "profile">("login");
  const [studentEmail, setStudentEmail] = useState("");
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      educationLevel: "",
      experience: "",
      currentCtc: "",
      resumeUrl: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/students/login", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.isNewUser) {
        setStudentEmail(loginForm.getValues("email"));
        profileForm.setValue("email", loginForm.getValues("email"));
        setStep("profile");
        toast({
          title: "Welcome!",
          description: "Please complete your profile to get started.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        onLogin?.(data.profile);
        localStorage.setItem("studentProfile", JSON.stringify(data.profile));
        onClose();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("POST", "/api/students/profile", data);
      return await response.json();
    },
    onSuccess: (profile) => {
      toast({
        title: "Profile saved!",
        description: "Your profile has been created successfully.",
      });
      onLogin?.(profile);
      localStorage.setItem("studentProfile", JSON.stringify(profile));
      onClose();
      setStep("login");
      loginForm.reset();
      profileForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onProfileSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    setStep("login");
    loginForm.reset();
    profileForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>{step === "login" ? "Student Login" : "Complete Your Profile"}</span>
          </DialogTitle>
        </DialogHeader>

        {step === "login" ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email address" 
                        {...field} 
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Checking..." : "Continue"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field}
                        disabled={profileMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your phone number" 
                        {...field}
                        disabled={profileMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Education Level</span>
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={profileMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Experience Level</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your work experience (e.g., '2 years in software development', 'Fresh graduate', etc.)"
                        {...field}
                        disabled={profileMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="currentCtc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Current/Expected Salary</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., $50,000 per year, ₹5,00,000 LPA" 
                        {...field}
                        disabled={profileMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Link to your resume (Google Drive, LinkedIn, etc.)" 
                        {...field}
                        value={field.value || ""}
                        disabled={profileMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep("login")}
                  disabled={profileMutation.isPending}
                >
                  Back
                </Button>
                <Button type="submit" disabled={profileMutation.isPending}>
                  {profileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}