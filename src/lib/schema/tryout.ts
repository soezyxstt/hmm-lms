// ~/lib/schema/tryout.ts
import { z } from "zod";
import { QuestionType } from "@prisma/client";

export const questionOptionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean().default(false),
  explanation: z.string().optional(),
});

export const questionSchema = z.object({
  type: z.nativeEnum(QuestionType),
  question: z.string().min(1, "Question is required"),
  points: z.number().min(1).default(1),
  required: z.boolean().default(true),
  options: z.array(questionOptionSchema).optional(),
});

export const createTryoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  duration: z.number().min(1).optional(),
  courseId: z.string().cuid(),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

export const updateTryoutSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  questions: z
    .array(questionSchema.extend({ id: z.string().optional() }))
    .optional(),
});

export const tryoutIdSchema = z.object({
  id: z.string().cuid(),
});

export const courseIdSchema = z.object({
  courseId: z.string().cuid(),
});

// Export the inferred types
export type CreateTryoutInput = z.infer<typeof createTryoutSchema>;
export type UpdateTryoutInput = z.infer<typeof updateTryoutSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionSchema>;
