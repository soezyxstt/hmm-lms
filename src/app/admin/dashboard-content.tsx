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
} from "lucide-react";
import { api } from "~/trpc/react";
import { StatCard } from './analytics/stat-card';
import { LineChartComponent } from "~/components/admin/line-chart";
import { MultiLineChart } from "~/components/admin/multi-line-chart";
import { TimeRangePicker } from "~/components/admin/time-range-picker";
import type { TimeRange } from "~/lib/types/analytics";

export function DashboardContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Queries
  const { data: overviewStats, isLoading: isLoadingOverview } =
    api.analytic.getOverviewStats.useQuery(timeRange, {
      refetchInterval: 30000, // Refresh every 30 seconds
    });

  const { data: userActivity } =
    api.analytic.getUserActivity.useQuery(timeRange, {
      refetchInterval: 30000,
    });

  const { data: tryoutPerformance } =
    api.analytic.getTryoutPerformance.useQuery(timeRange, {
      refetchInterval: 30000,
    });

  // Transform data for charts
  const userRegistrationData = userActivity?.userRegistrations.map(item => ({
    date: item.createdAt.toISOString(),
    value: item._count.id,
  })) ?? [];

  const learningActivityData = userActivity?.learningSessions.map(item => ({
    date: item.date.toISOString(),
    value: item._count.id,
  })) ?? [];

  const tryoutAttemptsData = tryoutPerformance?.attemptsOverTime.map(item => ({
    date: item.startedAt.toISOString(),
    value: item._count.id,
  })) ?? [];

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
  ];

  if (isLoadingOverview) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Range Picker */}
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
        <StatCard
          title="Total Users"
          value={overviewStats?.totalUsers ?? 0}
          description={`+${overviewStats?.newUsers ?? 0} new users`}
          icon={Users}
        />
        <StatCard
          title="Active Courses"
          value={overviewStats?.activeCourses ?? 0}
          description={`${overviewStats?.totalCourses ?? 0} total courses`}
          icon={BookOpen}
        />
        <StatCard
          title="Active Tryouts"
          value={overviewStats?.activeTryouts ?? 0}
          description={`${overviewStats?.totalTryouts ?? 0} total tryouts`}
          icon={FileText}
        />
        <StatCard
          title="Documents"
          value={overviewStats?.totalDocuments ?? 0}
          description="Active documents"
          icon={FileText}
        />
        <StatCard
          title="Events"
          value={overviewStats?.totalEvents ?? 0}
          description="In selected period"
          icon={Calendar}
        />
        <StatCard
          title="Announcements"
          value={overviewStats?.totalAnnouncements ?? 0}
          description="In selected period"
          icon={Megaphone}
        />
        <StatCard
          title="Scholarships"
          value={overviewStats?.totalScholarships ?? 0}
          description="In selected period"
          icon={GraduationCap}
        />
        <StatCard
          title="Job Vacancies"
          value={overviewStats?.totalJobVacancies ?? 0}
          description="Active positions"
          icon={Briefcase}
        />
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
      {tryoutPerformance?.tryoutPerformance && tryoutPerformance.tryoutPerformance.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tryoutPerformance.tryoutPerformance.slice(0, 6).map((tryout) => (
            <StatCard
              key={tryout.id}
              title={tryout.title}
              value={`${tryout.averageScore}%`}
              description={`${tryout.totalAttempts} attempts`}
              icon={Activity}
            />
          ))}
        </div>
      )}
    </div>
  );
}