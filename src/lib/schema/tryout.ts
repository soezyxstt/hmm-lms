import { z } from "zod";
import { QuestionType } from "@prisma/client";

const questionOptionSchema = z.object({
  text: z.string().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean().default(false),
  order: z.number().int(),
});

const questionSchema = z.object({
  question: z.string().min(5, "Question text is too short"),
  type: z.nativeEnum(QuestionType),
  points: z.number().int().min(1).default(1),
  order: z.number().int(),
  required: z.boolean().default(true),
  options: z.array(questionOptionSchema).optional(),
});

export const createTryoutSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  duration: z.number().int().optional(), // In minutes
  isActive: z.boolean().default(true),
  courseId: z.string().cuid(),
  questions: z
    .array(questionSchema)
    .min(1, "A tryout must have at least one question"),
});

export const tryoutIdSchema = z.object({
  tryoutId: z.string().cuid(),
});

export const startAttemptSchema = z.object({
  tryoutId: z.string().cuid(),
});

export const submitAnswerSchema = z.object({
  attemptId: z.string().cuid(),
  questionId: z.string().cuid(),
  answer: z.string(), // Could be a single value or a JSON stringified array
});

export const finishAttemptSchema = z.object({
  attemptId: z.string().cuid(),
});
