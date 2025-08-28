// ~/app/(student)/tryouts/[id]/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Users,
  Trophy,
  PlayCircle,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TryoutDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TryoutDetailPage({ params }: TryoutDetailPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  try {
    const [tryout, userAttempts, activeAttempt] = await Promise.all([
      api.tryout.getForStudent({ id }),
      api.tryout.getUserAttempts({ id }),
      api.tryout.getActiveAttempt({ id }),
    ]);

    const completedAttempts = userAttempts.filter((attempt) => attempt.isCompleted);
    const bestScore = completedAttempts.length > 0
      ? Math.max(...completedAttempts.map(a => (a.score / a.maxScore) * 100))
      : 0;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/tryouts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Tryout Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{tryout.title}</CardTitle>
                  <p className="text-muted-foreground">
                    {tryout.course.title} ({tryout.course.classCode})
                  </p>
                </div>
                <Badge variant={tryout.isActive ? "default" : "secondary"}>
                  {tryout.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tryout.description && (
                <p className="text-muted-foreground">{tryout.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {tryout.questions.length} Question{tryout.questions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {tryout.duration ? `${tryout.duration} minutes` : "No time limit"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {tryout.questions.reduce((sum, q) => sum + q.points, 0)} Total Points
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Attempt Alert */}
          {activeAttempt && (
            <Card className="border-warning bg-secondary ">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-lg text-warning">
                    Attempt in Progress
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-warning">
                  You have an incomplete attempt started {formatDistanceToNow(activeAttempt.startedAt)} ago.
                  You can continue where you left off or start a new attempt.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/tryouts/${id}/attempt/${activeAttempt.id}`}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Continue Attempt
                    </Link>
                  </Button>
                  <StartNewAttemptButton tryoutId={id} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start New Attempt */}
          {!activeAttempt && (
            <Card>
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Make sure you have enough time to complete the tryout.
                    {tryout.duration && ` You'll have ${tryout.duration} minutes once you start.`}
                  </p>
                  {tryout.duration && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Timer will start immediately when you begin the tryout.</span>
                    </div>
                  )}
                </div>
                <StartNewAttemptButton tryoutId={id} />
              </CardContent>
            </Card>
          )}

          {/* Previous Attempts */}
          {userAttempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Attempts ({userAttempts.length})
                </CardTitle>
                {bestScore > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Best Score: {Math.round(bestScore * 100) / 100}%
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAttempts.map((attempt, index) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Attempt #{userAttempts.length - index}
                          </span>
                          {attempt.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Started {formatDistanceToNow(attempt.startedAt)} ago
                          {attempt.endedAt && (
                            <> • Completed {formatDistanceToNow(attempt.endedAt)} ago</>
                          )}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        {attempt.isCompleted ? (
                          <div className="font-semibold">
                            {Math.round((attempt.score / attempt.maxScore) * 100 * 100) / 100}%
                          </div>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {attempt.score}/{attempt.maxScore} points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Question Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tryout.questions.map((question, index) => (
                  <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">Question {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {question.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        {question.options.length > 0 && ` • ${question.options.length} options`}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tryout Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The tryout you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button asChild>
              <Link href="/tryouts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tryouts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function StartNewAttemptButton({ tryoutId }: { tryoutId: string }) {
  return (
    <form action={`/tryouts/${tryoutId}/start`} method="POST">
      <Button type="submit" className="w-full sm:w-auto">
        <PlayCircle className="h-4 w-4 mr-2" />
        Start New Attempt
      </Button>
    </form>
  );
}

export const metadata = {
  title: "Tryout Details",
};