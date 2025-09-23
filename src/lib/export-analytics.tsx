// ~/lib/utils/export-analytics.ts
import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { TimeRange, OverviewStats } from "~/lib/types/analytics";

interface ExportData {
  timeRange: TimeRange;
  overviewStats: OverviewStats;
  userActivity: {
    // CHANGED: Date objects are now ISO strings from the API
    userRegistrations: Array<{ createdAt: string; _count: { id: number } }>;
    learningSessions: Array<{ date: string; _count: { id: number }; _sum: { duration: number | null } }>;
  };
  tryoutPerformance: {
    tryoutPerformance: Array<{
      id: string;
      title: string;
      totalAttempts: number;
      averageScore: number;
    }>;
    // CHANGED: Date objects are now ISO strings from the API
    attemptsOverTime: Array<{ startedAt: string; _count: { id: number } }>;
  };
  resourceAnalytics: {
    resourceStats: Array<{
      id: string;
      title: string;
      type: string;
      views: number;
      downloads: number;
    }>;
    // CHANGED: Date objects are now ISO strings from the API
    accessOverTime: Array<{ accessedAt: string; action: string; _count: { id: number } }>;
  };
  courseAnalytics: Array<{
    id: string;
    title: string;
    classCode: string;
    totalMembers: number;
    activeLearners: number;
    engagementRate: number;
    avgDurationPerMember: number;
    totalDuration: number;
  }>;
}

export async function exportAnalyticsData(data: ExportData) {
  const workbook = XLSX.utils.book_new();

  // Overview Sheet
  const overviewData = [
    ["Metric", "Value"],
    ["Export Date", format(new Date(), "yyyy-MM-dd HH:mm:ss")],
    // NOTE: timeRange still uses Date objects, as it comes from the client state directly
    ["Period From", format(data.timeRange.from, "yyyy-MM-dd")],
    ["Period To", format(data.timeRange.to, "yyyy-MM-dd")],
    [""],
    ["Total Users", data.overviewStats.totalUsers],
    ["New Users", data.overviewStats.newUsers],
    ["Total Courses", data.overviewStats.totalCourses],
    ["Active Courses", data.overviewStats.activeCourses],
    ["Total Tryouts", data.overviewStats.totalTryouts],
    ["Active Tryouts", data.overviewStats.activeTryouts],
    ["Total Documents", data.overviewStats.totalResources],
    ["Total Events", data.overviewStats.totalEvents],
    ["Total Announcements", data.overviewStats.totalAnnouncements],
    ["Total Scholarships", data.overviewStats.totalScholarships],
    ["Total Job Vacancies", data.overviewStats.totalJobVacancies],
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

  // User Registrations Sheet
  const userRegistrationsData = [
    ["Date", "New Users"],
    ...data.userActivity.userRegistrations.map(item => [
      // CHANGED: Parse the string back to a Date for formatting
      format(new Date(item.createdAt), "yyyy-MM-dd"),
      item._count.id,
    ]),
  ];
  const userRegistrationsSheet = XLSX.utils.aoa_to_sheet(userRegistrationsData);
  XLSX.utils.book_append_sheet(workbook, userRegistrationsSheet, "User Registrations");

  // Learning Sessions Sheet
  const learningSessionsData = [
    ["Date", "Sessions", "Total Duration (minutes)"],
    ...data.userActivity.learningSessions.map(item => [
      // CHANGED: Parse the string back to a Date for formatting
      format(new Date(item.date), "yyyy-MM-dd"),
      item._count.id,
      item._sum.duration ?? 0,
    ]),
  ];
  const learningSessionsSheet = XLSX.utils.aoa_to_sheet(learningSessionsData);
  XLSX.utils.book_append_sheet(workbook, learningSessionsSheet, "Learning Sessions");

  // Tryout Performance Sheet
  const tryoutPerformanceData = [
    ["Tryout Title", "Total Attempts", "Average Score (%)"],
    ...data.tryoutPerformance.tryoutPerformance.map(item => [
      item.title,
      item.totalAttempts,
      item.averageScore,
    ]),
  ];
  const tryoutPerformanceSheet = XLSX.utils.aoa_to_sheet(tryoutPerformanceData);
  XLSX.utils.book_append_sheet(workbook, tryoutPerformanceSheet, "Tryout Performance");

  // Document Analytics Sheet
  const documentAnalyticsData = [
    ["Document Title", "Type", "Views", "Downloads", "Total Access"],
    ...data.resourceAnalytics.resourceStats.map(item => [
      item.title,
      item.type,
      item.views,
      item.downloads,
      item.views + item.downloads,
    ]),
  ];
  const documentAnalyticsSheet = XLSX.utils.aoa_to_sheet(documentAnalyticsData);
  XLSX.utils.book_append_sheet(workbook, documentAnalyticsSheet, "Document Analytics");

  // Course Analytics Sheet
  const courseAnalyticsData = [
    ["Course Title", "Class Code", "Total Members", "Active Learners", "Engagement Rate (%)", "Avg Duration per Member (min)", "Total Duration (min)"],
    ...data.courseAnalytics.map(item => [
      item.title,
      item.classCode,
      item.totalMembers,
      item.activeLearners,
      Math.round(item.engagementRate * 100) / 100,
      item.avgDurationPerMember,
      item.totalDuration,
    ]),
  ];
  const courseAnalyticsSheet = XLSX.utils.aoa_to_sheet(courseAnalyticsData);
  XLSX.utils.book_append_sheet(workbook, courseAnalyticsSheet, "Course Analytics");

  // Generate filename
  const filename = `analytics-${format(data.timeRange.from, "yyyy-MM-dd")}-to-${format(data.timeRange.to, "yyyy-MM-dd")}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}