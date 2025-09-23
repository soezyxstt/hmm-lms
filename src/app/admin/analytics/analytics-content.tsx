// ~/components/admin/analytics-content.tsx
"use client";

import { useState } from "react";
import { subDays, format } from "date-fns";
import { Download, TrendingUp, Users, BookOpen, FileText, Eye } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TimeRangePicker } from "~/components/admin/time-range-picker";
import { LineChartComponent } from "~/components/admin/line-chart";
import { MultiLineChart } from "~/components/admin/multi-line-chart";
import { StatCard } from './stat-card';
import { exportAnalyticsData } from '~/lib/export-analytics';
import type { TimeRange } from "~/lib/types/analytics";

export function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const { data: overviewStats, isLoading: isLoadingOverview } =
    api.analytic.getOverviewStats.useQuery(timeRange, {
      refetchInterval: 60000, // Refresh every minute
    });

  const { data: userActivity, isLoading: isLoadingActivity } =
    api.analytic.getUserActivity.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: tryoutPerformance, isLoading: isLoadingTryouts } =
    api.analytic.getTryoutPerformance.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: resourceAnalytics, isLoading: isLoadingDocuments } =
    api.analytic.getResourceAnalytics.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: courseAnalytics, isLoading: isLoadingCourses } =
    api.analytic.getCourseAnalytics.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  // ✨ CHANGED: Remove .toISOString() calls as data is now a string
  const userRegistrationData = userActivity?.userRegistrations.map(item => ({
    date: item.createdAt, // Was item.createdAt.toISOString()
    value: item._count.id,
  })) ?? [];

  const learningActivityData = userActivity?.learningSessions.map(item => ({
    date: item.date, // Was item.date.toISOString()
    value: item._count.id,
  })) ?? [];

  const tryoutAttemptsData = tryoutPerformance?.attemptsOverTime.map(item => ({
    date: item.startedAt, // Was item.startedAt.toISOString()
    value: item._count.id,
  })) ?? [];

  const documentViewsData = resourceAnalytics?.accessOverTime
    .filter(item => item.action === "VIEW")
    .map(item => ({
      date: item.accessedAt, // Was item.accessedAt.toISOString()
      value: item._count.id,
    })) ?? [];

  const documentDownloadsData = resourceAnalytics?.accessOverTime
    .filter(item => item.action === "DOWNLOAD")
    .map(item => ({
      date: item.accessedAt, // Was item.accessedAt.toISOString()
      value: item._count.id,
    })) ?? [];

  const handleExport = async () => {
    if (!overviewStats || !userActivity || !tryoutPerformance || !resourceAnalytics || !courseAnalytics) {
      return;
    }

    setIsExporting(true);
    try {
      await exportAnalyticsData({
        timeRange,
        overviewStats,
        userActivity,
        tryoutPerformance,
        resourceAnalytics,
        courseAnalytics,
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = isLoadingOverview || isLoadingActivity || isLoadingTryouts || isLoadingDocuments || isLoadingCourses;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Picker and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Detailed Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive insights from {format(timeRange.from, "MMM dd, yyyy")} to {format(timeRange.to, "MMM dd, yyyy")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <TimeRangePicker value={timeRange} onChange={setTimeRange} />
          <Button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            variant="outline"
            size="default"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="tryouts">Tryouts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={overviewStats?.totalUsers ?? 0}
              description={`+${overviewStats?.newUsers ?? 0} new`}
              icon={Users}
            />
            <StatCard
              title="Active Courses"
              value={overviewStats?.activeCourses ?? 0}
              description={`${overviewStats?.totalCourses ?? 0} total`}
              icon={BookOpen}
            />
            <StatCard
              title="Active Tryouts"
              value={overviewStats?.activeTryouts ?? 0}
              description={`${overviewStats?.totalTryouts ?? 0} total`}
              icon={FileText}
            />
            <StatCard
              title="Documents"
              value={overviewStats?.totalResources ?? 0}
              description="Available"
              icon={FileText}
            />
          </div>

          {/* Activity Overview Chart */}
          <MultiLineChart
            title="Platform Activity Overview"
            series={[
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
            ]}
            height={400}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <LineChartComponent
              title="User Registrations"
              data={userRegistrationData}
              color="#3b82f6"
              height={350}
            />
            <LineChartComponent
              title="Learning Activity"
              data={learningActivityData}
              color="#10b981"
              height={350}
            />
          </div>

          {/* User Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="New Users"
              value={overviewStats?.newUsers ?? 0}
              description="In selected period"
              icon={Users}
            />
            <StatCard
              title="Total Learning Sessions"
              value={userActivity?.learningSessions.reduce((sum, item) => sum + item._count.id, 0) ?? 0}
              description="In selected period"
              icon={BookOpen}
            />
            <StatCard
              title="Avg. Session Duration"
              value={`${Math.round((userActivity?.learningSessions.reduce((sum, item) => sum + (item._sum.duration ?? 0), 0) ?? 0) / Math.max(userActivity?.learningSessions.length ?? 1, 1))}min`}
              description="Per session"
              icon={TrendingUp}
            />
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6">
            {/* Course Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseAnalytics?.slice(0, 10).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.classCode} • {course.totalMembers} members
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={course.engagementRate > 50 ? "default" : "secondary"}>
                            {Math.round(course.engagementRate)}% engagement
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {course.activeLearners} active learners
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tryouts" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <LineChartComponent
              title="Tryout Attempts"
              data={tryoutAttemptsData}
              color="#f59e0b"
              height={350}
            />

            {/* Top Performing Tryouts */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Tryouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tryoutPerformance?.tryoutPerformance
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 8)
                    .map((tryout) => (
                      <div key={tryout.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{tryout.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {tryout.totalAttempts} attempts
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-semibold text-sm">
                            {tryout.averageScore.toFixed(1)}%
                          </div>
                          <Progress
                            value={tryout.averageScore}
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <MultiLineChart
              title="Document Activity"
              series={[
                {
                  key: "views",
                  name: "Views",
                  color: "#3b82f6",
                  data: documentViewsData,
                },
                {
                  key: "downloads",
                  name: "Downloads",
                  color: "#10b981",
                  data: documentDownloadsData,
                },
              ]}
              height={350}
            />

            {/* Most Accessed Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Most Accessed Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resourceAnalytics?.resourceStats
                    .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads))
                    .slice(0, 8)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{doc.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {doc.type.toLowerCase().replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-right space-y-1 ml-4">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {doc.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {doc.downloads}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}