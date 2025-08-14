import { z } from "zod";
import { EventColor } from "@prisma/client";

// Base schema for common event fields
const eventBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.nativeEnum(EventColor).default(EventColor.SKY),
});

// Schema for creating a new event
export const createEventSchema = eventBaseSchema
  .extend({
    scope: z.enum(["PERSONAL", "COURSE", "GLOBAL"]),
    // courseId is only needed when the scope is 'COURSE'
    courseId: z.string().cuid().optional(),
  })
  .refine(
    (data) => {
      // If the scope is 'COURSE', a courseId must be provided.
      if (data.scope === "COURSE" && !data.courseId) {
        return false;
      }
      // If the scope is 'PERSONAL' or 'GLOBAL', a courseId should NOT be provided.
      if (
        (data.scope === "PERSONAL" || data.scope === "GLOBAL") &&
        data.courseId
      ) {
        return false;
      }
      return true;
    },
    {
      // This message is generic; the router will provide a more specific error.
      message:
        "Course ID is required for course events and must be absent for others.",
      path: ["courseId"],
    },
  );

// Schema for updating an existing event
export const updateEventSchema = eventBaseSchema.extend({
  id: z.string().cuid(),
});

// Schema for identifying an event by its ID (for deletion, etc.)
export const eventIdSchema = z.object({
  id: z.string().cuid(),
});
