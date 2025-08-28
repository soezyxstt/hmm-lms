// ~/app/(student)/tryouts/[id]/attempt/[attemptId]/client.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Flag,
} from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { Tryout, UserAttempt, Question, QuestionOption } from "~/lib/types/tryout";

interface TryoutAttemptClientProps {
  attempt: UserAttempt;
  tryout: Tryout;
  tryoutId: string;
}

export function TryoutAttemptClient({
  attempt,
  tryout,
  tryoutId
}: TryoutAttemptClientProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAnswerMutation = api.tryout.submitAnswer.useMutation();
  const completeAttemptMutation = api.tryout.completeAttempt.useMutation();

  const currentQuestion = tryout.questions[currentQuestionIndex];
  const totalQuestions = tryout.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Initialize answers from existing attempt
  useEffect(() => {
    const existingAnswers: Record<string, string> = {};
    attempt.answers.forEach((answer) => {
      existingAnswers[answer.questionId] = answer.answer;
    });
    setAnswers(existingAnswers);
  }, [attempt.answers]);

  // Timer logic
  useEffect(() => {
    if (!tryout.duration) return;

    const startTime = new Date(attempt.startedAt).getTime();
    const durationMs = tryout.duration * 60 * 1000;
    const endTime = startTime + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);

      if (remaining === 0) {
        void handleAutoSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tryout.duration, attempt.startedAt]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = useCallback(async (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    try {
      await submitAnswerMutation.mutateAsync({
        attemptId: attempt.id,
        questionId,
        answer,
      });
    } catch (error) {
      toast.error("Failed to save answer");
      console.error(error);
    }
  }, [attempt.id, submitAnswerMutation]);

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await completeAttemptMutation.mutateAsync({
        attemptId: attempt.id,
      });
      toast.success("Tryout submitted automatically due to time limit");
      router.push(`/tryouts/${tryoutId}/results/${attempt.id}`);
    } catch {
      toast.error("Failed to submit tryout");
      setIsSubmitting(false);
    }
  }, [attempt.id, completeAttemptMutation, router, tryoutId, isSubmitting]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeAttemptMutation.mutateAsync({
        attemptId: attempt.id,
      });
      toast.success("Tryout submitted successfully!");
      router.push(`/tryouts/${tryoutId}/results/${attempt.id}`);
    } catch {
      toast.error("Failed to submit tryout");
      setIsSubmitting(false);
    }
  };

  const renderMultipleChoiceSingle = (question: Question, questionAnswer: string) => (
    <RadioGroup
      value={questionAnswer}
      onValueChange={(value) => handleAnswerChange(question.id, value)}
      className="space-y-3"
    >
      {question.options.map((option: QuestionOption) => (
        <div key={option.id} className="flex items-center space-x-2">
          <RadioGroupItem value={option.id} id={option.id} />
          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
            {option.text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  const renderMultipleChoiceMultiple = (question: Question, questionAnswer: string) => {
    const selectedOptions: string[] = questionAnswer ? JSON.parse(questionAnswer) as string[] : [];

    return (
      <div className="space-y-3">
        {question.options.map((option: QuestionOption) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={selectedOptions.includes(option.id)}
              onCheckedChange={(checked) => {
                const newSelected = checked
                  ? [...selectedOptions, option.id]
                  : selectedOptions.filter((id: string) => id !== option.id);
                void handleAnswerChange(question.id, JSON.stringify(newSelected));
              }}
            />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  const renderTextAnswer = (question: Question, questionAnswer: string) => (
    <Textarea
      value={questionAnswer}
      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
      placeholder="Type your answer here..."
      className={question.type === "LONG_ANSWER" ? "min-h-32" : ""}
    />
  );

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const questionAnswer = answers[currentQuestion.id] ?? "";

    switch (currentQuestion.type) {
      case "MULTIPLE_CHOICE_SINGLE":
        return renderMultipleChoiceSingle(currentQuestion, questionAnswer);

      case "MULTIPLE_CHOICE_MULTIPLE":
        return renderMultipleChoiceMultiple(currentQuestion, questionAnswer);

      case "SHORT_ANSWER":
      case "LONG_ANSWER":
        return renderTextAnswer(currentQuestion, questionAnswer);

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const answeredQuestions = Object.keys(answers).filter(
    questionId => answers[questionId] && answers[questionId].trim() !== ""
  ).length;

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tryout.title}</h1>
          <p className="text-muted-foreground">
            {tryout.course.title} ({tryout.course.classCode})
          </p>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className={`font-mono text-lg ${timeLeft < 300000 ? 'text-red-600' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{answeredQuestions} of {totalQuestions} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Time Warning */}
      {timeLeft !== null && timeLeft < 300000 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Less than 5 minutes remaining! The tryout will be submitted automatically when time runs out.
          </AlertDescription>
        </Alert>
      )}

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </Badge>
              {answers[currentQuestion.id] && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>{currentQuestion.question}</p>
          </div>
          {renderQuestion()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setShowSubmitDialog(true)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Flag className="h-4 w-4 mr-2" />
              Submit Tryout
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {tryout.questions.map((question: Question, index: number) => (
              <Button
                key={question.id}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 ${answers[question.id]
                    ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                    : ''
                  }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Tryout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your tryout? You have answered {answeredQuestions} out of {totalQuestions} questions.
              {answeredQuestions < totalQuestions && (
                <span className="block mt-2 text-amber-600">
                  You still have {totalQuestions - answeredQuestions} unanswered questions.
                </span>
              )}
              <span className="block mt-2 font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Tryout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}