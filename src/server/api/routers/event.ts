import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  // adminProcedure,
} from "~/server/api/trpc";
import {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
} from "~/lib/schema/event";
import { Role } from "@prisma/client";

export const eventRouter = createTRPCRouter({
  /**
   * Fetches all events relevant to the currently logged-in user:
   * 1. All GLOBAL events.
   * 2. The user's PERSONAL events.
   * 3. All events for courses the user is ENROLLED in.
   */
  getMine: protectedProcedure.query(async ({ ctx }) => {
    const userWithCourses = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { courses: { select: { id: true } } },
    });
    const userCourseIds = userWithCourses?.courses.map((c) => c.id) ?? [];

    return ctx.db.event.findMany({
      where: {
        OR: [
          { userId: null, courseId: null }, // Global events
          { userId: ctx.session.user.id }, // User's personal events
          { courseId: { in: userCourseIds } }, // Events for user's courses
        ],
      },
      include: {
        createdBy: { select: { name: true, image: true } },
        course: { select: { title: true, classCode: true } },
      },
      orderBy: { start: "asc" },
    });
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany({
      orderBy: { start: "asc" },
    });
  }),

  /**
   * Creates an event.
   * - Any authenticated user can create a PERSONAL event.
   * - Only an ADMIN can create a COURSE or GLOBAL event.
   */
  create: protectedProcedure
    .input(createEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { scope, courseId, ...data } = input;
      const { user } = ctx.session;

      // Data for the new event
      const eventData: {
        userId?: string | null;
        courseId?: string | null;
        createdById: string;
        title: string;
        start: Date;
        end: Date;
      } = {
        ...data,
        createdById: user.id,
      };

      if (scope === "PERSONAL") {
        eventData.userId = user.id;
      } else if (scope === "COURSE") {
        if (user.role !== Role.ADMIN) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create course events.",
          });
        }
        eventData.courseId = courseId;
      } else if (scope === "GLOBAL") {
        if (user.role !== Role.ADMIN) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create global events.",
          });
        }
        // For GLOBAL, userId and courseId remain null
      }

      return ctx.db.event.create({
        data: eventData,
      });
    }),

  /**
   * Updates an event.
   * - A user can update their own PERSONAL events.
   * - An ADMIN can update any COURSE or GLOBAL event.
   */
  update: protectedProcedure
    .input(updateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const { user } = ctx.session;

      const eventToUpdate = await ctx.db.event.findUnique({ where: { id } });

      if (!eventToUpdate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found." });
      }

      // Check permissions
      const isPersonal = eventToUpdate.userId !== null;
      const isOwner = eventToUpdate.userId === user.id;
      const isAdmin = user.role === Role.ADMIN;

      if (isPersonal && !isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own personal events.",
        });
      }

      if (!isPersonal && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update course or global events.",
        });
      }

      return ctx.db.event.update({
        where: { id },
        data,
      });
    }),

  /**
   * Deletes an event.
   * - A user can delete their own PERSONAL events.
   * - An ADMIN can delete any COURSE or GLOBAL event.
   */
  delete: protectedProcedure
    .input(eventIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;

      const eventToDelete = await ctx.db.event.findUnique({
        where: { id: input.id },
      });

      if (!eventToDelete) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found." });
      }

      // Check permissions (same logic as update)
      const isPersonal = eventToDelete.userId !== null;
      const isOwner = eventToDelete.userId === user.id;
      const isAdmin = user.role === Role.ADMIN;

      if (isPersonal && !isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own personal events.",
        });
      }

      if (!isPersonal && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete course or global events.",
        });
      }

      return ctx.db.event.delete({ where: { id: input.id } });
    }),
});
