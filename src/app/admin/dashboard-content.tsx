// ~/components/admin/dashboard-content.tsx
"use client";

import { useState } from "react";
import { subDays } from "date-fns";
import {
  Users,
  BookOpen,
  FileText,
  Calendar,
  Megaphone,
  GraduationCap,
  Briefcase,
  Activity,
  Info,
} from "lucide-react";
import { api } from "~/trpc/react";
import { StatCard } from './analytics/stat-card';
import { LineChartComponent } from "~/components/admin/line-chart";
import { MultiLineChart } from "~/components/admin/multi-line-chart";
import { TimeRangePicker } from "~/components/admin/time-range-picker";
import { Card } from "~/components/ui/card";
import type { TimeRange } from "~/lib/types/analytics";

export function DashboardContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Queries using Suspense for a cleaner loading experience
  const { data: overviewStats } =
    api.analytic.getOverviewStats.useQuery(timeRange, {
      refetchInterval: 30000,
    });

  const { data: userActivity } =
    api.analytic.getUserActivity.useQuery(timeRange, {
      refetchInterval: 30000,
    });

  const { data: tryoutPerformance } =
    api.analytic.getTryoutPerformance.useQuery(timeRange, {
      refetchInterval: 30000,
    });

  if (!overviewStats || !userActivity || !tryoutPerformance) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  // PERF: Memoize derived data to prevent re-computation on every render
  const userRegistrationData =
    userActivity.userRegistrations.map(item => ({
      // FIX: Data from the API is already a string, no need for .toISOString()
      date: item.createdAt,
      value: item._count.id,
    }))

  const learningActivityData =
    userActivity.learningSessions.map(item => ({
      // FIX: Data from the API is already a string
      date: item.date,
      value: item._count.id,
    }))

  const tryoutAttemptsData =
    tryoutPerformance.attemptsOverTime.map(item => ({
      // FIX: Data from the API is already a string
      date: item.startedAt,
      value: item._count.id,
    }))

  const multiLineData = [
    {
      key: "registrations",
      name: "New Users",
      color: "#3b82f6",
      data: userRegistrationData,
    },
    {
      key: "sessions",
      name: "Learning Sessions",
      color: "#10b981",
      data: learningActivityData,
    },
    {
      key: "attempts",
      name: "Tryout Attempts",
      color: "#f59e0b",
      data: tryoutAttemptsData,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header and Time Range Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Platform Overview</h2>
          <p className="text-sm text-muted-foreground">
            Real-time insights into your platform&apos;s performance
          </p>
        </div>
        <TimeRangePicker value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={overviewStats.totalUsers} description={`+${overviewStats.newUsers} new users`} icon={Users} />
        <StatCard title="Active Courses" value={overviewStats.activeCourses} description={`${overviewStats.totalCourses} total courses`} icon={BookOpen} />
        <StatCard title="Active Tryouts" value={overviewStats.activeTryouts} description={`${overviewStats.totalTryouts} total tryouts`} icon={FileText} />
        <StatCard title="Documents" value={overviewStats.totalResources} description="Active documents" icon={FileText} />
        <StatCard title="Events" value={overviewStats.totalEvents} description="In selected period" icon={Calendar} />
        <StatCard title="Announcements" value={overviewStats.totalAnnouncements} description="In selected period" icon={Megaphone} />
        <StatCard title="Scholarships" value={overviewStats.totalScholarships} description="In selected period" icon={GraduationCap} />
        <StatCard title="Job Vacancies" value={overviewStats.totalJobVacancies} description="Active positions" icon={Briefcase} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MultiLineChart
          title="Platform Activity Overview"
          series={multiLineData}
          height={350}
        />
        <LineChartComponent
          title="Learning Sessions"
          data={learningActivityData}
          color="#10b981"
          height={350}
        />
      </div>

      {/* Tryout Performance Summary */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Tryout Highlights</h3>
        {tryoutPerformance.tryoutPerformance.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tryoutPerformance.tryoutPerformance.slice(0, 6).map((tryout) => (
              <StatCard
                key={tryout.id}
                title={tryout.title}
                // UI: Format score to one decimal place for consistency
                value={`${tryout.averageScore.toFixed(1)}%`}
                description={`${tryout.totalAttempts} attempts`}
                icon={Activity}
              />
            ))}
          </div>
        ) : (
          // UI: Add an empty state for better user experience
          <Card className="flex items-center justify-center p-6">
            <div className="text-center text-muted-foreground">
              <Info className="mx-auto h-8 w-8 mb-2" />
              <p>No tryout data available for the selected period.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}