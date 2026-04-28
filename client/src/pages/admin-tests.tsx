import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { insertQuestionSchema } from "@shared/schema";
import type { InsertQuestion, Question } from "@shared/schema";
import { Plus, X, Trash2, ClipboardList } from "lucide-react";
import { z } from "zod";

const questionFormSchema = insertQuestionSchema;

type QuestionFormData = z.infer<typeof questionFormSchema>;

export default function AdminTests() {
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Check authentication
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isAdmin) {
    setLocation("/secret-admin-portal");
    return null;
  }

  // Fetch existing questions
  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
    queryFn: async () => {
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch("/api/questions", {
        headers: {
          "admin-password": adminPassword || "",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "",
      domain: "",
      options: [],
      correctAnswer: "",
      difficulty: "medium",
      isActive: true,
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-password": adminPassword || "",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create question");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Question created successfully!",
        description: "The question has been added to the test bank.",
      });
      form.reset();
      setOptions(["", "", "", ""]);
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const adminPassword = localStorage.getItem('adminPassword');
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
        headers: {
          "admin-password": adminPassword || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete question");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Question deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    const filteredOptions = options.filter(opt => opt.trim() !== "");
    
    if (filteredOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least 2 options",
        variant: "destructive",
      });
      return;
    }

    if (!filteredOptions.includes(data.correctAnswer)) {
      toast({
        title: "Error",
        description: "Correct answer must be one of the options",
        variant: "destructive",
      });
      return;
    }

    createQuestionMutation.mutate({
      ...data,
      options: filteredOptions,
    });
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Question Management</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create and manage test questions for candidate assessments</p>
          </div>
          <Button onClick={() => setLocation("/admin-dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Question Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-domain">
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="questionText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter the question" data-testid="input-question-text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Options</Label>
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          data-testid={`input-option-${index}`}
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                            data-testid={`button-remove-option-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {options.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="mt-2"
                        data-testid="button-add-option"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter the exact correct answer" data-testid="input-correct-answer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-difficulty">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createQuestionMutation.isPending}
                    data-testid="button-create-question"
                  >
                    {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Question Bank ({questions?.length || 0} questions)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <p>Loading questions...</p>
              ) : questions && questions.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className="p-4 border rounded-lg space-y-2"
                      data-testid={`question-${question.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{question.questionText}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Domain: {question.domain} | Difficulty: {question.difficulty}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-${question.id}`}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteQuestionMutation.mutate(question.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Options:</p>
                        <ul className="text-sm space-y-1">
                          {question.options?.map((opt, idx) => (
                            <li
                              key={idx}
                              className={opt === question.correctAnswer ? "text-green-600 font-medium" : ""}
                            >
                              {idx + 1}. {opt} {opt === question.correctAnswer && "✓"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No questions created yet. Start by creating your first question!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
