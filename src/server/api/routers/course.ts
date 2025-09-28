import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  AttachableType,
  Role,
  ResourceCategory,
  LinkSource,
  ResourceType,
} from "@prisma/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "~/lib/s3-client";
import { NotificationTriggers } from "~/server/services/notification-triggers";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  classCode: z
    .string()
    .min(6, "Class code must be at least 6 characters")
    .max(10),
});

export const unenrollCourseSchema = z.object({
  courseId: z.string().cuid(),
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

export const enrollCourseSchema = z.object({
  courseId: z.string().cuid(),
});

// Define Zod schemas for both file and link data
const fileInputSchema = z.object({
  type: z.literal(ResourceType.FILE),
  file: z.object({
    key: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
  }),
});

const linkInputSchema = z.object({
  type: z.literal(ResourceType.LINK),
  link: z.object({
    url: z.string().url(),
    source: z.nativeEnum(LinkSource),
  }),
});

// Combine the schemas for the main input
const createResourceSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.nativeEnum(ResourceCategory).optional(),
    attachableId: z.string().cuid(),
    attachableType: z.nativeEnum(AttachableType),
  })
  .and(z.union([fileInputSchema, linkInputSchema]));

export const courseRouter = createTRPCRouter({
  createCourse: adminProcedure
    .input(createCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.course.create({
        data: input,
      });

      if (data) {
        await NotificationTriggers.onCourseCreated(data.id);
      }

      return data;
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

  createResource: adminProcedure
    .input(createResourceSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, description, category, attachableId, attachableType } =
        input;

      return ctx.db.resource.create({
        data: {
          title,
          description,
          category,
          type: input.type,
          attachableId,
          attachableType,
          uploadedById: ctx.session.user.id,
          ...(input.type === "FILE" && {
            attachment: {
              create: {
                filename: input.file.name,
                key: input.file.key,
                mimeType: input.file.type,
                size: input.file.size,
              },
            },
          }),
          ...(input.type === "LINK" && {
            link: {
              create: {
                url: input.link.url,
                source: input.link.source,
              },
            },
          }),
        },
      });
    }),

  deleteResource: adminProcedure
    .input(z.object({ resourceId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const resource = await ctx.db.resource.findUnique({
        where: { id: input.resourceId },
        include: { attachment: true },
      });

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      // If the resource is a file, delete it from DigitalOcean Spaces
      if (resource.type === ResourceType.FILE && resource.attachment) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: resource.attachment.key,
          });
          await s3Client.send(deleteCommand);
        } catch (error) {
          console.error("Failed to delete from DigitalOcean Spaces:", error);
          // Decide whether to throw an error or just log it.
          // For a robust system, you might want to handle this gracefully
          // to allow the DB entry to still be deleted.
        }
      }

      // Delete the resource record and related data from the database
      await ctx.db.resource.delete({
        where: { id: input.resourceId },
      });

      return { success: true };
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

  getCourseById: protectedProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          members: {
            select: { id: true, name: true, email: true, role: true },
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
          testimonial: {
            include: {
              user: true,
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

      const resourceCount = await ctx.db.resource.count({
        where: {
          attachableId: input.id,
          attachableType: AttachableType.COURSE,
        },
      });

      const isEnrolled = course.members.some(
        (member) => member.id === ctx.session.user.id,
      );
      const isAdmin = ctx.session.user.role === Role.ADMIN;

      return {
        ...course,
        _count: {
          ...course._count,
          resources: resourceCount,
        },
        isEnrolled,
        isAdmin,
      };
    }),

  updateResourceStatus: adminProcedure
    .input(
      z.object({
        resourceId: z.string().cuid(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.resource.update({
        where: { id: input.resourceId },
        data: { isActive: input.isActive },
      });
    }),

  // ... (createResource, deleteResource, getMyCourses, etc. are the same)

  getCourseMaterials: protectedProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      const courseMembership = await ctx.db.course.findFirst({
        where: { id: input.id, members: { some: { id: ctx.session.user.id } } },
        select: { id: true },
      });
      const isAdmin = ctx.session.user.role === Role.ADMIN;

      if (!courseMembership && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be enrolled to access course materials",
        });
      }

      const resources = await ctx.db.resource.findMany({
        where: {
          attachableId: input.id,
          attachableType: AttachableType.COURSE,
          isActive: true, // This correctly filters for active resources
        },
        include: {
          attachment: true,
          link: true,
          uploadedBy: {
            select: { name: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return resources.reduce(
        (acc, resource) => {
          const category = resource.category ?? "OTHER";
          (acc[category] = acc[category] || []).push(resource);
          return acc;
        },
        {} as Record<ResourceCategory, typeof resources>,
      );
    }),

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

  unenrollFromCourse: protectedProcedure
    .input(unenrollCourseSchema)
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
          message: "Course not found.",
        });
      }

      if (course.members.length === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are not currently enrolled in this course.",
        });
      }

      await ctx.db.course.update({
        where: { id: input.courseId },
        data: {
          members: {
            disconnect: { id: ctx.session.user.id },
          },
        },
      });

      return {
        success: true,
        message: `You have successfully unenrolled from "${course.title}".`,
        courseId: course.id,
      };
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

      const resources = await ctx.db.resource.findMany({
        where: {
          attachableId: input.id,
          attachableType: AttachableType.COURSE,
        },
        include: {
          attachment: true,
          link: true,
          uploadedBy: { select: { name: true } },
          _count: { select: { accessLogs: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        ...course,
        resources,
        _count: {
          ...course._count,
          resources: resources.length,
        },
      };
    }),

  getCourseAnalytics: adminProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      // Get detailed stats on resource views and downloads
      const documentStats = await ctx.db.resourceAccess.groupBy({
        by: ["action"],
        where: {
          resource: {
            attachableId: input.id,
            attachableType: AttachableType.COURSE,
          },
        },
        _count: {
          _all: true,
        },
      });

      // Get stats on tryout attempts
      const tryoutStats = await ctx.db.userAttempt.groupBy({
        by: ["isCompleted"],
        where: { tryout: { courseId: input.id } },
        _count: { _all: true },
        _avg: { score: true },
      });

      // Get recent activity
      const recentActivity = await ctx.db.resourceAccess.findMany({
        where: {
          resource: {
            attachableId: input.id,
            attachableType: AttachableType.COURSE,
          },
        },
        include: {
          user: { select: { name: true } },
          resource: { select: { title: true } },
        },
        orderBy: {
          accessedAt: "desc",
        },
        take: 10,
      });

      // Get member growth stats (group by creation date)
      //   const memberStats = await ctx.db.$queryRaw`
      //   SELECT
      //     DATE("T1"."createdAt") as date,
      //     COUNT("T2"."id")::int as count
      //   FROM "_CourseToUser" AS "T1"
      //   JOIN "User" AS "T2" ON "T1"."B" = "T2"."id"
      //   WHERE "T1"."A" = ${input.id}
      //   GROUP BY 1
      //   ORDER BY 1 ASC
      // `;

      return {
        documentStats,
        tryoutStats,
        recentActivity,
        // memberStats: memberStats as { date: string; count: number }[],
      };
    }),
  // New procedure to remove a single member
  removeMember: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        userId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId, userId } = input;

      const course = await ctx.db.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found.",
        });
      }

      await ctx.db.course.update({
        where: { id: courseId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
      });

      return { success: true };
    }),

  // New procedure to remove multiple members
  bulkRemoveMembers: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        userIds: z.array(z.string().cuid()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId, userIds } = input;

      const course = await ctx.db.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found.",
        });
      }

      await ctx.db.course.update({
        where: { id: courseId },
        data: {
          members: {
            disconnect: userIds.map((id) => ({ id })),
          },
        },
      });

      return {
        success: true,
        removedCount: userIds.length,
      };
    }),

  removeCourseMembers: adminProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId } = input;
      const course = await ctx.db.course.findUnique({
        where: { id: courseId },
        include: { members: true },
      });
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found.",
        });
      }
      const memberIds = course.members.map((member) => member.id);
      await ctx.db.course.update({
        where: { id: courseId },
        data: {
          members: {
            disconnect: memberIds.map((id) => ({ id })),
          },
        },
      });
      return { success: true, removedCount: memberIds.length };
    }),

  getCoursesForSelection: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    });
  }),
});
