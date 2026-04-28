import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { insertAiInterviewSchema } from "@shared/schema";
import type { InsertAiInterview } from "@shared/schema";
import { Bot, Clock, Mic, Brain, TrendingUp, CheckCircle } from "lucide-react";
import { z } from "zod";

interface AiInterviewModalProps {
  applicationId: number;
  isOpen: boolean;
  onClose: () => void;
}

const interviewFormSchema = insertAiInterviewSchema.extend({
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
});

type InterviewFormData = z.infer<typeof interviewFormSchema>;

export default function AiInterviewModal({ applicationId, isOpen, onClose }: AiInterviewModalProps) {
  const [interviewScheduled, setInterviewScheduled] = useState(false);
  const { toast } = useToast();

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      applicationId,
      scheduledDate: new Date(),
      scheduledTime: "",
    },
  });

  const scheduleInterview = useMutation({
    mutationFn: async (data: InterviewFormData) => {
      const response = await apiRequest("POST", "/api/ai-interviews", data);
      return response.json();
    },
    onSuccess: () => {
      setInterviewScheduled(true);
      toast({
        title: "AI Interview scheduled successfully!",
        description: "You'll receive a confirmation email with interview details shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to schedule interview",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InterviewFormData) => {
    scheduleInterview.mutate(data);
  };

  const handleClose = () => {
    setInterviewScheduled(false);
    form.reset();
    onClose();
  };

  // Generate time options
  const timeOptions = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (interviewScheduled) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Interview Scheduled!</h2>
              <p className="text-muted-foreground">
                Your AI interview has been scheduled successfully. You'll receive a confirmation email with all the details.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Bot className="h-8 w-8 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground mb-2">AI Interview Scheduler</DialogTitle>
              <p className="text-muted-foreground">
                Complete a quick AI-powered interview to fast-track your application process.
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">What to Expect:</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>15-20 minute conversation with our AI interviewer</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mic className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>Voice-based questions about your background and interests</span>
              </li>
              <li className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>AI-powered assessment of communication skills and fit</span>
              </li>
              <li className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>Instant feedback and next steps in your application</span>
              </li>
            </ul>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label className="text-base font-medium text-foreground">Preferred Interview Time</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="date" 
                            min={minDate}
                            {...field} 
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduledTime"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={scheduleInterview.isPending}
                >
                  {scheduleInterview.isPending ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
