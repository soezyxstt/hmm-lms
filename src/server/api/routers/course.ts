// ~/server/api/routers/course.ts
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { R2_BUCKET, r2Client } from "~/lib/r2-client";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  classCode: z
    .string()
    .min(6, "Class code must be at least 6 characters")
    .max(10),
});

export const updateCourseSchema = createCourseSchema.extend({
  id: z.string().cuid(),
});

export const courseIdSchema = z.object({
  id: z.string().cuid(),
});

export const joinCourseSchema = z.object({
  classCode: z.string(),
});

// New schema for direct enrollment
export const enrollCourseSchema = z.object({
  courseId: z.string().cuid(),
});

export const courseRouter = createTRPCRouter({
  // Existing procedures
  // Admin procedures (updated to use adminProcedure)
  createCourse: adminProcedure
    .input(createCourseSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.course.create({
        data: input,
      });
    }),

  updateCourse: adminProcedure
    .input(updateCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.course.update({
        where: { id },
        data,
      });
    }),

  deleteCourse: adminProcedure
    .input(courseIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.course.delete({
        where: { id: input.id },
      });
    }),

  // Document management procedures for admins
  uploadDocument: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum([
          "EBOOK",
          "PRESENTATION",
          "DOCUMENT",
          "SPREADSHEET",
          "VIDEO",
          "AUDIO",
          "IMAGE",
          "EXAM",
          "MATERIAL",
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      // This would typically be called after the file upload API
      // Return upload URL or instructions
      return {
        uploadUrl: "/api/documents/upload",
        courseId: input.courseId,
      };
    }),

  deleteDocument: adminProcedure
    .input(
      z.object({
        documentId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { id: input.documentId },
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Delete from R2
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: document.key,
        });
        await r2Client.send(deleteCommand);
      } catch (error) {
        console.error("Failed to delete from R2:", error);
        // Continue with database deletion even if R2 deletion fails
      }

      // Delete from database
      await ctx.db.document.delete({
        where: { id: input.documentId },
      });

      return { success: true };
    }),

  getDocumentStats: adminProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.document.aggregate({
        where: { courseId: input.id },
        _sum: {
          views: true,
          downloads: true,
          size: true,
        },
        _count: {
          id: true,
        },
      });

      return {
        totalDocuments: stats._count.id,
        totalViews: stats._sum.views ?? 0,
        totalDownloads: stats._sum.downloads ?? 0,
        totalSize: stats._sum.size ?? 0,
      };
    }),

  getMyCourses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      where: {
        members: {
          some: {
            id: ctx.session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            tryout: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getAllCourses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      include: {
        _count: {
          select: {
            members: true,
            tryout: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // Updated to include enrollment status
  getCourseById: protectedProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          tryout: {
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              isActive: true,
              createdAt: true,
              _count: {
                select: {
                  questions: true,
                  attempts: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          announcements: {
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
              createdBy: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
          _count: {
            select: {
              members: true,
              tryout: true,
              announcements: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      // Check enrollment status
      const isEnrolled = course.members.some(
        (member) => member.id === ctx.session.user.id,
      );
      const isAdmin = ctx.session.user.role === Role.ADMIN;

      return {
        ...course,
        isEnrolled,
        isAdmin,
      };
    }),

  // Get course materials (only for enrolled users)
  // getCourseMaterials: protectedProcedure
  //   .input(courseIdSchema)
  //   .query(async ({ ctx, input }) => {
  //     // Check enrollment first
  //     const course = await ctx.db.course.findUnique({
  //       where: { id: input.id },
  //       include: {
  //         members: {
  //           where: { id: ctx.session.user.id },
  //           select: { id: true },
  //         },
  //       },
  //     });

  //     if (!course) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Course not found",
  //       });
  //     }

  //     const isEnrolled = course.members.length > 0;
  //     const isAdmin = ctx.session.user.role === Role.ADMIN;

  //     if (!isEnrolled && !isAdmin) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "You must be enrolled to access course materials",
  //       });
  //     }

  //     // Mock data - replace with actual material queries
  //     return {
  //       ebooks: [
  //         {
  //           id: "1",
  //           title: "Course Introduction",
  //           type: "PDF",
  //           size: "2.5 MB",
  //           uploadedAt: new Date(),
  //         },
  //         {
  //           id: "2",
  //           title: "Chapter 1: Fundamentals",
  //           type: "PDF",
  //           size: "5.2 MB",
  //           uploadedAt: new Date(),
  //         },
  //       ],
  //       presentations: [
  //         {
  //           id: "1",
  //           title: "Lecture 1: Overview",
  //           type: "PPT",
  //           size: "12.3 MB",
  //           uploadedAt: new Date(),
  //         },
  //         {
  //           id: "2",
  //           title: "Lecture 2: Deep Dive",
  //           type: "PPTX",
  //           size: "8.7 MB",
  //           uploadedAt: new Date(),
  //         },
  //       ],
  //       videos: [
  //         {
  //           id: "1",
  //           title: "Introduction Video",
  //           duration: "15:30",
  //           size: "45.2 MB",
  //           uploadedAt: new Date(),
  //         },
  //         {
  //           id: "2",
  //           title: "Practical Session 1",
  //           duration: "32:15",
  //           size: "120.5 MB",
  //           uploadedAt: new Date(),
  //         },
  //       ],
  //       previousExams: [
  //         {
  //           id: "1",
  //           title: "Midterm Exam 2023",
  //           type: "PDF",
  //           size: "1.2 MB",
  //           uploadedAt: new Date(),
  //         },
  //         {
  //           id: "2",
  //           title: "Final Exam 2023",
  //           type: "PDF",
  //           size: "1.8 MB",
  //           uploadedAt: new Date(),
  //         },
  //       ],
  //     };
  //   }),

  // New: Direct enrollment by course ID
  enrollInCourse: protectedProcedure
    .input(enrollCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.courseId },
        include: {
          members: {
            where: { id: ctx.session.user.id },
            select: { id: true },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (course.members.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already enrolled in this course",
        });
      }

      await ctx.db.course.update({
        where: { id: course.id },
        data: {
          members: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      return {
        success: true,
        message: "Successfully enrolled in the course!",
        courseId: course.id,
      };
    }),

  // Join course by class code (existing)
  joinCourse: protectedProcedure
    .input(joinCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { classCode: input.classCode },
        include: {
          members: {
            where: { id: ctx.session.user.id },
            select: { id: true },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found with this class code",
        });
      }

      if (course.members.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already enrolled in this course",
        });
      }

      await ctx.db.course.update({
        where: { id: course.id },
        data: {
          members: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      return { success: true, courseId: course.id };
    }),
  getCourseMaterials: protectedProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      // Check enrollment first
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          members: {
            where: { id: ctx.session.user.id },
            select: { id: true },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const isEnrolled = course.members.length > 0;
      const isAdmin = ctx.session.user.role === Role.ADMIN;

      if (!isEnrolled && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be enrolled to access course materials",
        });
      }

      // Get actual documents from database
      const documents = await ctx.db.document.findMany({
        where: {
          courseId: input.id,
          isActive: true,
        },
        include: {
          uploadedBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Group documents by type
      const groupedDocuments = {
        ebooks: documents.filter((doc) => doc.type === "EBOOK"),
        presentations: documents.filter((doc) => doc.type === "PRESENTATION"),
        documents: documents.filter((doc) => doc.type === "DOCUMENT"),
        spreadsheets: documents.filter((doc) => doc.type === "SPREADSHEET"),
        videos: documents.filter((doc) => doc.type === "VIDEO"),
        audio: documents.filter((doc) => doc.type === "AUDIO"),
        images: documents.filter((doc) => doc.type === "IMAGE"),
        previousExams: documents.filter((doc) => doc.type === "EXAM"),
        materials: documents.filter((doc) => doc.type === "MATERIAL"),
      };

      return groupedDocuments;
    }),

  getCourseForAdmin: adminProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              nim: true,
              faculty: true,
              program: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
          document: {
            include: {
              uploadedBy: {
                select: { name: true },
              },
              _count: {
                select: {
                  accessLogs: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          tryout: {
            include: {
              _count: {
                select: {
                  questions: true,
                  attempts: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          announcements: {
            include: {
              createdBy: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              members: true,
              document: true,
              tryout: true,
              announcements: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),

  // Remove member from course
  removeMember: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        userId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.course.update({
        where: { id: input.courseId },
        data: {
          members: {
            disconnect: { id: input.userId },
          },
        },
      });

      return { success: true };
    }),

  // Get course analytics
  getCourseAnalytics: adminProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const [memberStats, documentStats, tryoutStats, recentActivity] =
        await Promise.all([
          // Member enrollment over time
          ctx.db.$queryRaw`
          SELECT DATE(u."createdAt") as date, COUNT(*) as count
          FROM "User" u
          JOIN "_CourseToUser" cu ON u.id = cu."B"
          WHERE cu."A" = ${input.id}
          GROUP BY DATE(u."createdAt")
          ORDER BY date DESC
          LIMIT 30
        `,

          // Document access stats
          ctx.db.documentAccess.groupBy({
            by: ["action"],
            where: {
              document: {
                courseId: input.id,
              },
            },
            _count: {
              id: true,
            },
          }),

          // Tryout completion stats
          ctx.db.userAttempt.groupBy({
            by: ["isCompleted"],
            where: {
              tryout: {
                courseId: input.id,
              },
            },
            _count: {
              id: true,
            },
            _avg: {
              score: true,
            },
          }),

          // Recent activity
          ctx.db.documentAccess.findMany({
            where: {
              document: {
                courseId: input.id,
              },
            },
            include: {
              user: {
                select: { name: true },
              },
              document: {
                select: { title: true },
              },
            },
            orderBy: { accessedAt: "desc" },
            take: 10,
          }),
        ]);

      return {
        memberStats,
        documentStats,
        tryoutStats,
        recentActivity,
      };
    }),

  // Bulk operations for admin
  bulkRemoveMembers: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        userIds: z.array(z.string().cuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.course.update({
        where: { id: input.courseId },
        data: {
          members: {
            disconnect: input.userIds.map((id) => ({ id })),
          },
        },
      });

      return {
        success: true,
        removedCount: input.userIds.length,
      };
    }),

  // Get all courses for admin dashboard
  getAllCoursesForAdmin: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      include: {
        _count: {
          select: {
            members: true,
            tryout: true,
            document: true,
            announcements: true,
          },
        },
        members: {
          select: {
            id: true,
          },
          take: 5, // Just for preview
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // Course statistics for admin dashboard
  getCourseStatistics: adminProcedure.query(async ({ ctx }) => {
    const [
      totalCourses,
      totalMembers,
      totalDocuments,
      totalTryouts,
      recentCourses,
    ] = await Promise.all([
      ctx.db.course.count(),
      ctx.db.user.count({
        where: {
          role: "STUDENT",
        },
      }),
      ctx.db.document.count(),
      ctx.db.tryout.count(),
      ctx.db.course.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),
    ]);

    return {
      totalCourses,
      totalMembers,
      totalDocuments,
      totalTryouts,
      recentCourses,
    };
  }),

  // Export course data
  exportCourseData: adminProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              nim: true,
              faculty: true,
              program: true,
              createdAt: true,
            },
          },
          document: {
            select: {
              id: true,
              title: true,
              filename: true,
              type: true,
              size: true,
              views: true,
              downloads: true,
              createdAt: true,
              uploadedBy: {
                select: {
                  name: true,
                },
              },
            },
          },
          tryout: {
            include: {
              _count: {
                select: {
                  questions: true,
                  attempts: true,
                },
              },
              attempts: {
                select: {
                  id: true,
                  score: true,
                  maxScore: true,
                  isCompleted: true,
                  startedAt: true,
                  endedAt: true,
                  user: {
                    select: {
                      name: true,
                      email: true,
                      nim: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),
});
