import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface TestSession {
  id: number;
  applicationId: number;
  token: string;
  totalQuestions: number;
  status: string;
  score: number | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
}

interface TestResponse {
  questionId: number;
  questionText?: string;
  selectedAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
}

interface AIEvaluation {
  overall_score: number;
  breakdown: {
    knowledge_depth: number;
    consistency: number;
    domain_expertise: number;
  };
  feedback: string;
  flags: string[];
  manual_review_needed: boolean;
}

export default function TestPortal() {
  const [, params] = useRoute("/test/:token");
  const token = params?.token || "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<number, string>>(new Map());
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<AIEvaluation | null>(null);

  // Fetch test session
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery<TestSession>({
    queryKey: ["/api/test", token],
    queryFn: async () => {
      const response = await fetch(`/api/test/${token}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test session");
      }
      return response.json();
    },
    enabled: !!token,
  });

  // Fetch questions
  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/test", token, "questions"],
    queryFn: async () => {
      const response = await fetch(`/api/test/${token}/questions`);
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      return response.json();
    },
    enabled: !!token && testStarted,
  });

  // Start test mutation
  const startTestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/test/${token}/start`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to start test");
      }
      return response.json();
    },
    onSuccess: () => {
      setTestStarted(true);
    },
  });

  // Submit test mutation
  const submitTestMutation = useMutation({
    mutationFn: async (testResponses: TestResponse[]) => {
      const response = await fetch(`/api/test/${token}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses: testResponses,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit test");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setTestCompleted(true);
      
      // Store AI evaluation if available
      if (data.overall_score !== undefined) {
        setAiEvaluation({
          overall_score: data.overall_score,
          breakdown: data.breakdown,
          feedback: data.feedback,
          flags: data.flags || [],
          manual_review_needed: data.manual_review_needed || false,
        });
      }
      
      toast({
        title: "Test submitted successfully!",
        description: data.overall_score 
          ? `Score: ${data.score}% | AI Score: ${data.overall_score}/10`
          : `Your score: ${data.score}%`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartTest = () => {
    startTestMutation.mutate();
  };

  const handleSelectAnswer = (answer: string) => {
    if (questions && questions[currentQuestionIndex]) {
      const newResponses = new Map(responses);
      newResponses.set(questions[currentQuestionIndex].id, answer);
      setResponses(newResponses);
    }
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = () => {
    if (!questions) return;

    const testResponses: TestResponse[] = Array.from(responses.entries()).map(
      ([questionId, selectedAnswer]) => {
        const question = questions.find(q => q.id === questionId);
        const isCorrect = question?.correctAnswer === selectedAnswer;
        
        return {
          questionId,
          questionText: question?.questionText || "",
          selectedAnswer,
          correctAnswer: question?.correctAnswer || "",
          isCorrect,
        };
      }
    );

    submitTestMutation.mutate(testResponses);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg">Loading test session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Invalid Test Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              The test session you're trying to access is invalid or has expired. Please contact the administrator.
            </p>
            <Button 
              onClick={() => setLocation("/")} 
              className="mt-4"
              data-testid="button-home"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === "completed" || testCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Test Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-lg">
                Thank you for completing the assessment!
              </p>
              
              {session.score !== null && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    Score: {session.score}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Your responses have been recorded and will be reviewed by our team.
                  </p>
                </div>
              )}

              {aiEvaluation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI-Powered Assessment</h3>
                  
                  {/* Overall Score */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall AI Score</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {aiEvaluation.overall_score}/10
                      </span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Knowledge Depth</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {aiEvaluation.breakdown.knowledge_depth}/10
                      </p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Consistency</p>
                      <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                        {aiEvaluation.breakdown.consistency}/10
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Domain Expertise</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {aiEvaluation.breakdown.domain_expertise}/10
                      </p>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">AI Feedback</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {aiEvaluation.feedback}
                    </p>
                  </div>

                  {/* Flags */}
                  {aiEvaluation.flags.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Review Flags</h4>
                          <ul className="mt-1 text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
                            {aiEvaluation.flags.map((flag, index) => (
                              <li key={index}>{flag}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={() => setLocation("/")} 
                className="mt-4 w-full"
                data-testid="button-home"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Assessment Test</CardTitle>
            <CardDescription>
              You have been invited to take an assessment test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Total Questions:</strong> {session.totalQuestions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <strong>Instructions:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Read each question carefully</li>
                <li>Select one answer for each question</li>
                <li>You can navigate between questions using Previous/Next buttons</li>
                <li>Submit your test when you're done</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Once you start, you cannot pause the test</p>
            </div>
            <Button 
              onClick={handleStartTest} 
              className="w-full"
              size="lg"
              data-testid="button-start-test"
            >
              <Clock className="mr-2 h-5 w-5" />
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-6 w-6" />
              No Questions Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              There are no questions available for this test. Please contact the administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = responses.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{answeredCount} answered</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">Question {currentQuestionIndex + 1}</CardTitle>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {currentQuestion.difficulty}
              </span>
            </div>
            <CardDescription className="text-base mt-4">
              {currentQuestion.questionText}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={responses.get(currentQuestion.id) || ""}
              onValueChange={handleSelectAnswer}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${index}`}
                      data-testid={`radio-option-${index}`}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                data-testid="button-previous"
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button 
                    onClick={handleNext}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitTest}
                    disabled={submitTestMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit-test"
                  >
                    {submitTestMutation.isPending ? "Submitting..." : "Submit Test"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    aspect-square rounded-md text-sm font-medium transition-colors
                    ${index === currentQuestionIndex
                      ? "bg-blue-600 text-white"
                      : responses.has(questions[index].id)
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }
                    hover:opacity-80
                  `}
                  data-testid={`nav-question-${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
