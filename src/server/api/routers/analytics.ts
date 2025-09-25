// ~/server/api/routers/analytics.ts

import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const timeRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export const analyticsRouter = createTRPCRouter({
  // Overview stats
  getOverviewStats: adminProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;
      const [
        totalUsers,
        newUsers,
        totalCourses,
        activeCourses,
        totalTryouts,
        activeTryouts,
        totalResources,
        totalEvents,
        totalAnnouncements,
        totalScholarships,
        totalJobVacancies,
      ] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { createdAt: { gte: from, lte: to } } }),
        ctx.db.course.count(),
        ctx.db.course.count({ where: { isActive: true } }),
        ctx.db.tryout.count(),
        ctx.db.tryout.count({ where: { isActive: true } }),
        ctx.db.resource.count({ where: { isActive: true } }),
        ctx.db.event.count({ where: { start: { gte: from, lte: to } } }),
        ctx.db.announcement.count({
          where: { createdAt: { gte: from, lte: to } },
        }),
        ctx.db.scholarship.count({
          where: { createdAt: { gte: from, lte: to } },
        }),
        ctx.db.jobVacancy.count({
          where: { isActive: true, createdAt: { gte: from, lte: to } },
        }),
      ]);

      return {
        totalUsers,
        newUsers,
        totalCourses,
        activeCourses,
        totalTryouts,
        activeTryouts,
        totalResources,
        totalEvents,
        totalAnnouncements,
        totalScholarships,
        totalJobVacancies,
      };
    }),

  // User activity over time
  getUserActivity: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const userRegistrations = await ctx.db.user.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: from, lte: to } },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      });

      const learningSessions = await ctx.db.learningSession.groupBy({
        by: ["date"],
        where: { date: { gte: from, lte: to } },
        _count: { id: true },
        _sum: { duration: true },
        orderBy: { date: "asc" },
      });

      return {
        // ✨ CHANGED: Convert Date objects to ISO strings
        userRegistrations: userRegistrations.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
        learningSessions: learningSessions.map((item) => ({
          ...item,
          date: item.date.toISOString(),
        })),
      };
    }),

  // Tryout performance
  getTryoutPerformance: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      // Get tryout attempts and scores
      const tryoutStats = await ctx.db.tryout.findMany({
        select: {
          id: true,
          title: true,
          attempts: {
            where: {
              startedAt: {
                gte: from,
                lte: to,
              },
              isCompleted: true,
            },
            select: {
              score: true,
              maxScore: true,
            },
          },
        },
      });

      // Calculate average scores and completion rates
      const tryoutPerformance = tryoutStats.map((tryout) => {
        const attempts = tryout.attempts;
        const totalAttempts = attempts.length;
        const avgScore =
          totalAttempts > 0
            ? attempts.reduce(
                (sum, attempt) =>
                  sum + (attempt.score / attempt.maxScore) * 100,
                0,
              ) / totalAttempts
            : 0;

        return {
          id: tryout.id,
          title: tryout.title,
          totalAttempts,
          averageScore: Math.round(avgScore * 100) / 100,
        };
      });

      const attemptsOverTime = await ctx.db.userAttempt.groupBy({
        by: ["startedAt"],
        where: { startedAt: { gte: from, lte: to }, isCompleted: true },
        _count: { id: true },
        _avg: { score: true },
        orderBy: { startedAt: "asc" },
      });

      return {
        tryoutPerformance,
        // ✨ CHANGED: Convert Date objects to ISO strings
        attemptsOverTime: attemptsOverTime.map((item) => ({
          ...item,
          startedAt: item.startedAt.toISOString(),
        })),
      };
    }),

  // Resource analytics (formerly Document analytics)
  getResourceAnalytics: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      // Get resource access stats
      const resources = await ctx.db.resource.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          type: true,
          category: true,
          createdAt: true,
          accessLogs: {
            where: {
              accessedAt: {
                gte: from,
                lte: to,
              },
            },
            select: {
              action: true,
            },
          },
        },
      });

      const resourceStatsRaw = resources.map((resource) => {
        const views = resource.accessLogs.filter(
          (log) => log.action === "VIEW",
        ).length;
        const downloads = resource.accessLogs.filter(
          (log) => log.action === "DOWNLOAD",
        ).length;
        return {
          id: resource.id,
          title: resource.title,
          type: resource.type,
          category: resource.category,
          createdAt: resource.createdAt,
          views,
          downloads,
        };
      });

      const accessOverTime = await ctx.db.resourceAccess.groupBy({
        by: ["accessedAt", "action"],
        where: { accessedAt: { gte: from, lte: to } },
        _count: { id: true },
        orderBy: { accessedAt: "asc" },
      });

      return {
        // ✨ CHANGED: Convert Date objects to ISO strings
        resourceStats: resourceStatsRaw.map((resource) => ({
          ...resource,
          createdAt: resource.createdAt.toISOString(),
        })),
        accessOverTime: accessOverTime.map((item) => ({
          ...item,
          accessedAt: item.accessedAt.toISOString(),
        })),
      };
    }),

  // Course analytics
  getCourseAnalytics: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      const courseStats = await ctx.db.course.findMany({
        select: {
          id: true,
          title: true,
          classCode: true,
          createdAt: true,
          _count: {
            select: { members: true },
          },
          // This is the only relation needed for session data
          learningSession: {
            where: {
              date: {
                gte: from,
                lte: to,
              },
            },
            select: {
              duration: true,
              userId: true,
            },
          },
        },
      });

      const courseAnalyticsRaw = courseStats.map((course) => {
        const totalMembers = course._count.members;
        const activeLearners = new Set(
          course.learningSession.map((session) => session.userId),
        ).size;
        const totalDuration = course.learningSession.reduce(
          (sum, session) => sum + session.duration,
          0,
        );
        const avgDurationPerMember =
          totalMembers > 0 ? totalDuration / totalMembers : 0;

        return {
          id: course.id,
          title: course.title,
          classCode: course.classCode,
          totalMembers,
          activeLearners,
          engagementRate:
            totalMembers > 0 ? (activeLearners / totalMembers) * 100 : 0,
          avgDurationPerMember: Math.round(avgDurationPerMember),
          totalDuration,
        };
      });

      return courseAnalyticsRaw.map((course) => ({
        ...course,
        createdAt: courseStats
          .find((c) => c.id === course.id)!
          .createdAt.toISOString(),
      }));
    }),
});
