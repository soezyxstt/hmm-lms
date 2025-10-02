import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { format } from 'date-fns';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { User, Calendar, MessageSquare } from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";

type Submission = RouterOutputs["form"]["getSubmissions"]["submissions"][number];

function formatAnswer(answer: Submission['answers'][number]): string {
  const value = answer.jsonValue as unknown; // Value is stored as JSON
  if (value === null || value === undefined) return "No answer";
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value as string);
}

export default async function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [form, submissionsData] = await Promise.all([
    api.form.getById({ id }),
    api.form.getSubmissions({ formId: id, limit: 100 }), // Fetching up to 100 submissions
  ]);

  if (!form) {
    notFound();
  }

  const { submissions } = submissionsData;
  const questionMap = new Map(form.questions.map(q => [q.id, q.title]));

  return (
    <div className="container mx-auto max-w-5xl">
      <header className="mb-8">
        <Badge variant="secondary">Responses</Badge>
        <h1 className="text-3xl font-bold tracking-tight mt-2">{form.title}</h1>
        <p className="text-muted-foreground">{form.description}</p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="font-bold text-2xl">{submissions.length}</p>
              <p className="text-sm text-muted-foreground">Total Responses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="font-bold text-2xl">{form.questions.length}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Individual Responses</h2>
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No responses have been submitted for this form yet.</p>
            </CardContent>
          </Card>
        ) : (
          submissions.map((submission, index) => (
            <Card key={submission.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Response #{index + 1}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{submission.submitter?.name ?? 'Anonymous'}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(new Date(submission.submittedAt), "PPP 'at' p")}</span>
                  </CardDescription>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-4">
                {submission.answers.map(answer => (
                  <div key={answer.id}>
                    <p className="font-semibold">{questionMap.get(answer.questionId) ?? 'Unknown Question'}</p>
                    <p className="text-muted-foreground bg-muted p-3 rounded-md mt-1">{formatAnswer(answer)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}