"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

import { api, type RouterOutputs } from "~/trpc/react";
import { submitFormSchema } from "~/lib/types/forms";
import { QuestionRenderer } from "~/app/admin/forms/question-renderer";

import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle, Loader2 } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import { useSession } from 'next-auth/react';

import { Switch } from "~/components/ui/switch";

type FormWithQuestions = RouterOutputs["form"]["getById"];

interface FormSubmitClientProps {
  form: FormWithQuestions;
}

// Create a dynamic Zod schema based on the form's required questions
const createSubmissionSchema = (form: FormWithQuestions) => {
  const answerShape: Record<string, z.ZodTypeAny> = {};
  form.questions.forEach(q => {
    if (q.required) {
      answerShape[q.id] = z.any().refine(val => val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0), {
        message: "This field is required.",
      });
    }
  });
  return z.object({
    answers: z.object(answerShape),
  });
};

export function FormSubmitClient({ form: initialForm }: FormSubmitClientProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Check if user has already submitted this form
  const { data: submissionStatus, isLoading: isLoadingStatus } = api.form.getUserSubmissionStatus.useQuery(
    { formId: initialForm.id },
    { enabled: initialForm.requireAuth && sessionStatus === 'authenticated' }
  );

  const submitMutation = api.form.submit.useMutation();

  const formSchema = React.useMemo(() => createSubmissionSchema(initialForm), [initialForm]);

  const form = useForm<{ answers: Record<string, unknown> }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: {},
    },
  });

  const onSubmit = async (data: { answers: Record<string, unknown> }) => {
    const formattedAnswers = Object.entries(data.answers).map(([questionId, value]) => ({
      questionId,
      value: value,
    }));

    toast.promise(
      submitMutation.mutateAsync({
        formId: initialForm.id,
        answers: formattedAnswers,
      }),
      {
        loading: 'Submitting your response...',
        success: () => {
          router.push(`/forms/${initialForm.id}/result`);
          return 'Your response has been submitted!';
        },
        error: (err: Error) => err.message ?? "Failed to submit response.",
      }
    );
  };

  if (isLoadingStatus || sessionStatus === 'loading') {
    return <Card><CardContent className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /><p className="mt-2 text-muted-foreground">Loading form...</p></CardContent></Card>;
  }

  if (!initialForm.allowMultipleSubmissions && submissionStatus) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
          <CardTitle className="mt-4">You&apos;ve Already Responded</CardTitle>
          <CardDescription>
            You submitted this form on {format(new Date(submissionStatus.submittedAt), "PPP")}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{initialForm.title}</CardTitle>
        {initialForm.description && (
          <CardDescription>{initialForm.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {initialForm.requireAuth && sessionStatus === 'unauthenticated' ? (
          <Alert variant="destructive">
            <AlertDescription>
              You must be signed in to submit this form. <Link href="/api/auth/signin" className="font-bold underline">Sign In</Link>
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {initialForm.questions.map((question) => (
                <QuestionRenderer key={question.id} question={question} form={form} />
              ))}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitMutation.isPending}>
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}