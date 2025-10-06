import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  announcementSchema,
  updateAnnouncementSchema,
  announcementIdSchema,
} from "~/lib/schema/announcement";
import { AnnouncementScope } from "@prisma/client";
import { z } from "zod";

export const announcementRouter = createTRPCRouter({
  createDraft: adminProcedure.mutation(async ({ ctx }) => {
    const data = await ctx.db.announcement.create({
      data: {
        title: "Untitled Announcement",
        content: "",
        scope: AnnouncementScope.GLOBAL,
        createdById: ctx.session.user.id,
      },
    });
    
    return data;
  }),

  // Get all announcements for the user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userWithCourses = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { courses: { select: { id: true } } },
    });

    const userCourseIds = userWithCourses?.courses.map((c) => c.id) ?? [];

    return ctx.db.announcement.findMany({
      where: {
        OR: [
          { scope: AnnouncementScope.GLOBAL },
          {
            scope: AnnouncementScope.COURSE,
            courseId: { in: userCourseIds },
          },
        ],
      },
      include: {
        createdBy: { select: { name: true, image: true } },
        course: { select: { title: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get single announcement with replies
  getById: protectedProcedure
    .input(announcementIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.announcement.findUnique({
        where: { id: input.id },
        include: {
          createdBy: { select: { name: true, image: true } },
          course: { select: { title: true } },
          replies: {
            include: {
              user: { select: { name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }),

  // Create announcement (admin only)
  create: adminProcedure
    .input(announcementSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.announcement.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),

  // Update announcement (admin only)
  update: adminProcedure
    .input(updateAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.announcement.update({
        where: { id },
        data,
      });
    }),

  // Delete announcement (admin only)
  delete: adminProcedure
    .input(announcementIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.announcement.delete({
        where: { id: input.id },
      });
    }),

  // Add reply to announcement
  addReply: protectedProcedure
    .input(
      z.object({
        announcementId: z.string(),
        content: z.string().min(1, "Reply cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.announcementReply.create({
        data: {
          announcementId: input.announcementId,
          userId: ctx.session.user.id,
          content: input.content,
        },
        include: {
          user: { select: { name: true, image: true } },
        },
      });
    }),

  // Delete reply
  deleteReply: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reply = await ctx.db.announcementReply.findUnique({
        where: { id: input.id },
      });

      if (!reply) {
        throw new Error("Reply not found");
      }

      // Only allow user to delete their own reply or admin
      if (reply.userId !== ctx.session.user.id && ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      return ctx.db.announcementReply.delete({
        where: { id: input.id },
      });
    }),
});
