// ~/app/(student)/dashboard/dashboard-content.tsx
"use client";

import { api } from "~/trpc/react";
import { DashboardChart } from "./dashboard-chart";
import { DashboardCalendar } from './dashboard-calendar'
import CoursesItem from "../courses/course-item";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { BookOpen } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "~/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from 'react';

export function DashboardContent() {
  const { data: courses, isLoading: coursesLoading } =
    api.studentDashboard.getEnrolledCourses.useQuery();

  const { data: stats, isLoading: statsLoading } =
    api.studentDashboard.getDashboardStats.useQuery();

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  if (coursesLoading || statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 w-full">
        {/* Courses Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4 w-full">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Course</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/courses">View All</Link>
            </Button>
          </div>

          {courses && courses.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[plugin.current]}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {courses.map((course, index) => (
                  <CarouselItem
                    key={course.id}
                    className="pl-2 md:pl-4 basis-2/3 md:basis-2/5"
                  >
                    <CoursesItem
                      id={course.id}
                      title={course.title}
                      numberOfMaterials={course.totalMinutes}
                      numberOfVideos={course.totalSessions}
                      image={`/course/${(index % 4) + 1}.png`}
                      subject={course.classCode}
                      href={'/courses/' + course.id}
                      orientation='horizontal'
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
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
          <div className="space-y-4 md:hidden">
            <DashboardCalendar />
          </div>
          {/* Activity Chart */}
          <div className="mt-6">
            <DashboardChart />
          </div>
        </div>

        {/* Calendar Section - Takes 1 column */}
        <div className="space-y-4 max-sm:hidden">
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
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[60px] mt-2" />
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
