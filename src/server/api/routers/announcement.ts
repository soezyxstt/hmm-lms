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

export const announcementRouter = createTRPCRouter({
  // CHANGED: Fetches announcements from all courses the user is enrolled in.
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
      include: { createdBy: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

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

  update: adminProcedure
    .input(updateAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.announcement.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(announcementIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.announcement.delete({
        where: { id: input.id },
      });
    }),
});
