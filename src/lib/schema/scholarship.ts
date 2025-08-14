import { z } from "zod";

export const scholarshipSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  provider: z.string().min(2, "Provider is required"),
  deadline: z.date(),
  link: z.string().url("Must be a valid URL"),
});

export const updateScholarshipSchema = scholarshipSchema.extend({
  id: z.string().cuid(),
});

export const scholarshipIdSchema = z.object({
  id: z.string().cuid(),
});
