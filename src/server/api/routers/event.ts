import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Role, EventColor } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const timelineItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional().default(false),
});

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.nativeEnum(EventColor).default(EventColor.SKY),
  rsvp: z.string().url().optional().or(z.literal("")),
  hasTimeline: z.boolean().default(false),
  timeline: z.array(timelineItemSchema).optional(),
  scope: z.enum(["personal", "course", "global"]),
  courseId: z.string().optional(),
  userId: z.string().optional(),
});

export const eventRouter = createTRPCRouter({
  // Get user's personal events
  getMyEvents: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
      orderBy: { start: "asc" },
    });
  }),

  // Get course events for user's enrolled courses
  getCourseEvents: protectedProcedure.query(async ({ ctx }) => {
    const userCourses = await ctx.db.course.findMany({
      where: {
        members: {
          some: { id: ctx.session.user.id },
        },
      },
      select: { id: true },
    });

    const courseIds = userCourses.map((course) => course.id);

    return ctx.db.event.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
      orderBy: { start: "asc" },
    });
  }),

  // Get all public events (global events + course events for enrolled courses)
  getAllEvents: protectedProcedure.query(async ({ ctx }) => {
    const userCourses = await ctx.db.course.findMany({
      where: {
        members: {
          some: { id: ctx.session.user.id },
        },
      },
      select: { id: true },
    });

    const courseIds = userCourses.map((course) => course.id);

    return ctx.db.event.findMany({
      where: {
        OR: [
          { courseId: null, userId: null }, // Global events
          { courseId: { in: courseIds } }, // Course events for enrolled courses
        ],
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true, classCode: true },
        },
      },
      orderBy: { start: "asc" },
    });
  }),

  // Get all events for admin
  getAllEventsAdmin: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== Role.ADMIN) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.event.findMany({
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
          course: {
            select: { title: true, classCode: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get single event by ID
  getEventById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
          course: {
            select: { title: true, classCode: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      // Check if user has access to this event
      if (ctx.session) {
        const hasAccess =
          (event.userId === null && event.courseId === null) || // Global event
          event.userId === ctx.session.user.id || // Personal event
          event.createdById === ctx.session.user.id || // Created by user
          ctx.session.user.role === Role.ADMIN; // Admin access

        if (event.courseId && !hasAccess) {
          // Check if user is enrolled in the course
          const enrollment = await ctx.db.course.findFirst({
            where: {
              id: event.courseId,
              members: {
                some: { id: ctx.session.user.id },
              },
            },
          });

          if (!enrollment) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Access denied",
            });
          }
        }
      }

      return event;
    }),

  // Create event
  createEvent: protectedProcedure
    .input(createEventSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.scope !== "personal" && ctx.session.user.role !== Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create course or global events",
        });
      }

      if (input.end <= input.start) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End time must be after start time",
        });
      }

      // Build the event data object based on scope
      let eventData;

      if (input.scope === "personal") {
        eventData = {
          title: input.title,
          description: input.description,
          start: input.start,
          end: input.end,
          allDay: input.allDay,
          location: input.location,
          color: input.color,
          rsvp: input.rsvp ?? null,
          hasTimeline: input.hasTimeline,
          timeline: input.hasTimeline && input.timeline ? input.timeline : undefined,
          createdById: ctx.session.user.id,
          userId: ctx.session.user.id,
          courseId: null,
        };
      } else if (input.scope === "course" && input.courseId) {
        eventData = {
          title: input.title,
          description: input.description,
          start: input.start,
          end: input.end,
          allDay: input.allDay,
          location: input.location,
          color: input.color,
          rsvp: input.rsvp ?? null,
          hasTimeline: input.hasTimeline,
          timeline: input.hasTimeline && input.timeline ? input.timeline : undefined,
          createdById: ctx.session.user.id,
          userId: null,
          courseId: input.courseId,
        };
      } else {
        // Global event
        eventData = {
          title: input.title,
          description: input.description,
          start: input.start,
          end: input.end,
          allDay: input.allDay,
          location: input.location,
          color: input.color,
          rsvp: input.rsvp ?? null,
          hasTimeline: input.hasTimeline,
          timeline: input.hasTimeline && input.timeline ? input.timeline : undefined,
          createdById: ctx.session.user.id,
          userId: null,
          courseId: null,
        };
      }

      return ctx.db.event.create({
        data: eventData,
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
          course: {
            select: { title: true, classCode: true },
          },
        },
      });
    }),

  // Update event
  updateEvent: protectedProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .merge(createEventSchema.partial()),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, scope, courseId, ...updateData } = input;

      const existingEvent = await ctx.db.event.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      // Check permissions
      const canEdit =
        existingEvent.createdById === ctx.session.user.id ||
        ctx.session.user.role === Role.ADMIN;

      if (!canEdit) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      if (
        updateData.end &&
        updateData.start &&
        updateData.end <= updateData.start
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End time must be after start time",
        });
      }

      // Build update data based on scope
      let eventUpdateData;

      if (scope === "personal") {
        eventUpdateData = {
          ...updateData,
          userId: ctx.session.user.id,
          courseId: null,
        };
      } else if (scope === "course" && courseId) {
        eventUpdateData = {
          ...updateData,
          courseId: courseId,
          userId: null,
        };
      } else if (scope === "global") {
        eventUpdateData = {
          ...updateData,
          userId: null,
          courseId: null,
        };
      } else {
        // No scope change, just update other fields
        eventUpdateData = updateData;
      }

      // Handle timeline
      if (updateData.hasTimeline !== undefined) {
        if (!updateData.hasTimeline) {
          eventUpdateData.timeline = undefined;
        } else if (updateData.timeline) {
          eventUpdateData.timeline = updateData.timeline;
        }
      }

      return ctx.db.event.update({
        where: { id },
        data: eventUpdateData,
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
          course: {
            select: { title: true, classCode: true },
          },
        },
      });
    }),

  // Delete event
  deleteEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      const canDelete =
        event.createdById === ctx.session.user.id ||
        ctx.session.user.role === Role.ADMIN;

      if (!canDelete) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return ctx.db.event.delete({
        where: { id: input.id },
      });
    }),

  // Get courses for event creation (admin only)
  getCoursesForEvent: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== Role.ADMIN) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return ctx.db.course.findMany({
      select: {
        id: true,
        title: true,
        classCode: true,
      },
      orderBy: { title: "asc" },
    });
  }),
});
