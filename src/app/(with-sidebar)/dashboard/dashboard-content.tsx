// ~/app/(student)/dashboard/dashboard-content.tsx
"use client";

import { api } from "~/trpc/react";
import { DashboardChart } from "./dashboard-chart";
import { DashboardCalendar } from './dashboard-calendar'
import CoursesItem from "../courses/course-item";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { BookOpen } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function DashboardContent() {
  const { data: courses, isLoading: coursesLoading } =
    api.studentDashboard.getEnrolledCourses.useQuery();

  const { data: stats, isLoading: statsLoading } =
    api.studentDashboard.getDashboardStats.useQuery();

  if (coursesLoading || statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Courses Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/courses">View All</Link>
            </Button>
          </div> */}

          {courses && courses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((course, index) => (
                <CoursesItem
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  numberOfMaterials={course.totalMinutes}
                  numberOfVideos={course.totalSessions} // You can adjust this based on your schema
                  image={`/images/course-${(index % 4) + 1}.png`} // Placeholder
                  subject={course.classCode}
                  href={'/courses/' + course.id}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center space-y-2">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-semibold">No courses yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start learning by enrolling in a course
                </p>
                <Button asChild className="mt-4">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Activity Chart */}
          <div className="mt-6">
            <DashboardChart />
          </div>
        </div>

        {/* Calendar Section - Takes 1 column */}
        <div className="space-y-4">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="h-9 w-[250px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-3 w-[80px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-8 w-[150px] mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-8 w-[150px] mb-4" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    </div>
  );
}
