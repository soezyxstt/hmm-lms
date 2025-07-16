import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// How often the frontend sends a heartbeat, in seconds.
// This should match the interval on the client.
const HEARTBEAT_INTERVAL_SECONDS = 15;

// We consider a session "dead" if we haven't received a heartbeat for 3x the interval.
const SESSION_TIMEOUT_SECONDS = HEARTBEAT_INTERVAL_SECONDS * 3;

export const trackingRouter = createTRPCRouter({
  /**
   * Receives a heartbeat from the client, indicating the user is still active
   * on a specific course. It finds an existing session for the day or creates a new one,
   * then adds the interval duration to it.
   */
  heartbeat: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const { courseId } = input;
      const userId = session.user.id;

      // Get the start of the current day in UTC.
      // Storing and querying in UTC avoids timezone headaches.
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // 1. Find the most recent session for this user, course, and date.
      const recentSession = await db.learningSession.findFirst({
        where: {
          userId,
          courseId,
          date: today,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const now = new Date();

      // 2. Check if the recent session is still "alive".
      if (
        recentSession &&
        (now.getTime() - recentSession.updatedAt.getTime()) / 1000 <
          SESSION_TIMEOUT_SECONDS
      ) {
        // 3a. If it's alive, update it by adding the heartbeat interval.
        return db.learningSession.update({
          where: {
            id: recentSession.id,
          },
          data: {
            duration: {
              increment: HEARTBEAT_INTERVAL_SECONDS,
            },
            // updatedAt is automatically updated by db
          },
        });
      } else {
        // 3b. If no session exists or the last one is "dead", create a new one.
        // This starts a new "chunk" of learning time.
        return db.learningSession.create({
          data: {
            userId,
            courseId,
            date: today,
            duration: HEARTBEAT_INTERVAL_SECONDS, // Start with the first interval
          },
        });
      }
    }),

  /**
   * Queries the total learning duration for the current user for a specific date.
   */
  getDailySummary: protectedProcedure
    .input(
      z.object({
        date: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const userId = session.user.id;

      // Default to today if no date is provided.
      const targetDate = input.date ?? new Date();
      targetDate.setUTCHours(0, 0, 0, 0);

      const summary = await db.learningSession.aggregate({
        where: {
          userId,
          date: targetDate,
        },
        _sum: {
          duration: true,
        },
      });

      return {
        totalDurationSeconds: summary._sum.duration ?? 0,
      };
    }),
});
