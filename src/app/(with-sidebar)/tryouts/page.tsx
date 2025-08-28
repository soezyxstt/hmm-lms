// ~/app/(student)/tryouts/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Users,
  Trophy,
  Calendar,
  PlayCircle,
} from "lucide-react";

export default async function TryoutsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const courses = await api.tryout.getMyTryouts();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
            <p className="text-muted-foreground text-center">
              You need to be enrolled in courses to access tryouts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {courses.map((course) => (
            <div key={course.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Class Code: {course.classCode}
                  </p>
                </div>
                <Badge variant="outline">
                  {course.tryout.length} tryout{course.tryout.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {course.tryout.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No tryouts available for this course
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.tryout
                    .filter((tryout) => tryout.isActive)
                    .map((tryout) => (
                      <TryoutCard key={tryout.id} tryout={tryout} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface TryoutCardProps {
  tryout: {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    isActive: boolean;
    createdAt: Date;
    _count: {
      questions: number;
      attempts: number;
    };
  };
}

function TryoutCard({ tryout }: TryoutCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{tryout.title}</CardTitle>
          <Badge variant={tryout.isActive ? "default" : "secondary"} className="shrink-0 ml-2">
            {tryout.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        {tryout.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {tryout.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>{tryout._count.questions} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{tryout._count.attempts} attempts</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{tryout.duration ? `${tryout.duration}m` : "No limit"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(tryout.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href={`/tryouts/${tryout.id}`}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Tryout
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export const metadata = {
  title: "Tryouts",
};