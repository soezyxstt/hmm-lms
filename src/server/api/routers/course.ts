import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  createCourseSchema,
  joinCourseSchema,
  courseIdSchema,
} from "~/lib/schema/course";

export const courseRouter = createTRPCRouter({
  create: adminProcedure
    .input(createCourseSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.course.create({ data: input });
    }),

  // CHANGED: Now gets all courses the user is enrolled in.
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
          select: { members: true, tryout: true },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          members: { select: { id: true, name: true, image: true } },
          announcements: { orderBy: { createdAt: "desc" }, take: 5 },
          tryout: { select: { id: true, title: true, isActive: true } },
        },
      });
    }),

  // CHANGED: Logic updated for many-to-many relationship using 'connect'.
  join: protectedProcedure
    .input(joinCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db.course.findFirst({
        where: { classCode: input.classCode },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid class code.",
        });
      }

      return ctx.db.course.update({
        where: { id: course.id },
        data: {
          members: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),

  // CHANGED: Logic updated for many-to-many relationship using 'disconnect'.
  leave: protectedProcedure
    .input(courseIdSchema)
    .mutation(async ({ ctx, input }) => {
      // Optional: Check if user is in the course before trying to leave
      const isMember = await ctx.db.course.findFirst({
        where: { id: input.id, members: { some: { id: ctx.session.user.id } } },
      });

      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this course.",
        });
      }

      return ctx.db.course.update({
        where: { id: input.id },
        data: {
          members: {
            disconnect: { id: ctx.session.user.id },
          },
        },
      });
    }),
});
