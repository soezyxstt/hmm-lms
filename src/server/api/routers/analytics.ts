// ~/server/api/routers/analytics.ts
/* eslint-disable */
// @ts-nocheck
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const timeRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export const analyticsRouter = createTRPCRouter({
  // Overview stats
  getOverviewStats: protectedProcedure
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
        totalDocuments,
        totalEvents,
        totalAnnouncements,
        totalScholarships,
        totalJobVacancies,
      ] = await Promise.all([
        // Total users
        ctx.db.user.count(),
        // New users in time range
        ctx.db.user.count({
          where: {
            createdAt: {
              gte: from,
              lte: to,
            },
          },
        }),
        // Total courses
        ctx.db.course.count(),
        // Active courses (with recent activity)
        ctx.db.course.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
        // Total tryouts
        ctx.db.tryout.count(),
        // Active tryouts
        ctx.db.tryout.count({
          where: { isActive: true },
        }),
        // Total documents
        ctx.db.document.count({
          where: { isActive: true },
        }),
        // Total events
        ctx.db.event.count({
          where: {
            start: {
              gte: from,
              lte: to,
            },
          },
        }),
        // Total announcements
        ctx.db.announcement.count({
          where: {
            createdAt: {
              gte: from,
              lte: to,
            },
          },
        }),
        // Total scholarships
        ctx.db.scholarship.count({
          where: {
            createdAt: {
              gte: from,
              lte: to,
            },
          },
        }),
        // Total job vacancies
        ctx.db.jobVacancy.count({
          where: {
            isActive: true,
            createdAt: {
              gte: from,
              lte: to,
            },
          },
        }),
      ]);

      return {
        totalUsers,
        newUsers,
        totalCourses,
        activeCourses,
        totalTryouts,
        activeTryouts,
        totalDocuments,
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

      // Get user registrations over time
      const userRegistrations = await ctx.db.user.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: from,
            lte: to,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Get learning sessions over time
      const learningSessions = await ctx.db.learningSession.groupBy({
        by: ["date"],
        where: {
          date: {
            gte: from,
            lte: to,
          },
        },
        _count: {
          id: true,
        },
        _sum: {
          duration: true,
        },
        orderBy: {
          date: "asc",
        },
      });

      return {
        userRegistrations,
        learningSessions,
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
          _count: {
            attempts: {
              where: {
                startedAt: {
                  gte: from,
                  lte: to,
                },
                isCompleted: true,
              },
            },
          },
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
              startedAt: true,
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

      // Get attempts over time
      const attemptsOverTime = await ctx.db.userAttempt.groupBy({
        by: ["startedAt"],
        where: {
          startedAt: {
            gte: from,
            lte: to,
          },
          isCompleted: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          score: true,
        },
        orderBy: {
          startedAt: "asc",
        },
      });

      return {
        tryoutPerformance,
        attemptsOverTime,
      };
    }),

  // Document analytics
  getDocumentAnalytics: protectedProcedure
    .input(timeRangeSchema)
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SUPERADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { from, to } = input;

      // Get document access stats
      const documentStats = await ctx.db.document.findMany({
        select: {
          id: true,
          title: true,
          type: true,
          views: true,
          downloads: true,
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
              accessedAt: true,
            },
          },
        },
        where: {
          isActive: true,
        },
      });

      // Get access over time
      const accessOverTime = await ctx.db.documentAccess.groupBy({
        by: ["accessedAt", "action"],
        where: {
          accessedAt: {
            gte: from,
            lte: to,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          accessedAt: "asc",
        },
      });

      return {
        documentStats,
        accessOverTime,
      };
    }),

  // Course completion rates
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
            members: true,
          },
          members: {
            select: {
              id: true,
              learningSessions: {
                where: {
                  date: {
                    gte: from,
                    lte: to,
                  },
                },
                select: {
                  duration: true,
                  date: true,
                },
              },
            },
          },
          learningSession: {
            where: {
              date: {
                gte: from,
                lte: to,
              },
            },
            select: {
              duration: true,
              date: true,
              userId: true,
            },
          },
        },
      });

      const courseAnalytics = courseStats.map((course) => {
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

      return courseAnalytics;
    }),
});
