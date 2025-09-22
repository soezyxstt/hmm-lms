// ~/lib/schema/tryout.ts
import { z } from "zod";
import { QuestionType } from "@prisma/client";

const questionRefinement = (
  data: {
    type: QuestionType;
    options?: {isCorrect: boolean}[];
    shortAnswer?: string | null;
  },
  ctx: z.RefinementCtx,
) => {
  // Rule 1: Multiple choice questions must have at least 2 options
  if (
    (data.type === QuestionType.MULTIPLE_CHOICE_SINGLE ||
      data.type === QuestionType.MULTIPLE_CHOICE_MULTIPLE) &&
    (!data.options || (data.options.length < 2))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Multiple choice questions must have at least 2 options.",
      path: ["options"],
    });
  }

  // Rule 2: Single choice questions must have exactly one correct answer
  if (data.type === QuestionType.MULTIPLE_CHOICE_SINGLE && data.options) {
    const correctAnswers = data.options.filter((opt) => opt.isCorrect).length;
    if (correctAnswers !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Single choice questions must have exactly one correct option.",
        path: ["options"],
      });
    }
  }

  // Rule 3: Short answer questions must have a correct answer for auto-grading
  if (
    data.type === QuestionType.SHORT_ANSWER &&
    (!data.shortAnswer || data.shortAnswer.trim() === "")
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A correct answer is required for short answer questions.",
      path: ["shortAnswer"],
    });
  }
};

export const questionOptionSchema = z.object({
  id: z.string().cuid().optional(),
  text: z.string().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean(),
  explanation: z.string().nullable().optional(),
});

export const questionSchema = z
  .object({
    type: z.nativeEnum(QuestionType),
    question: z.string().min(1, "Question text cannot be empty."),
    points: z.number().min(1, "Points must be at least 1."),
    required: z.boolean(),
    images: z.array(z.string()).optional(),
    options: z.array(questionOptionSchema).optional(),
    shortAnswer: z.string().optional().nullable(), // Allow null
  })
  .superRefine(questionRefinement);

export const createTryoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  courseId: z.string().cuid("Course is required"),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

export const updateQuestionSchema = z.object({
  id: z.string().optional(), // Existing questions will have an ID
  type: z.nativeEnum(QuestionType),
  question: z.string().min(1, "Question text cannot be empty."),
  points: z.number().min(1, "Points must be at least 1."),
  required: z.boolean(),
  images: z.array(z.string()).optional(),
  options: z.array(questionOptionSchema).optional(),
  shortAnswer: z.string().optional().nullable(),
}).superRefine(questionRefinement); // Apply the same validation rules

export const updateTryoutSchema = z.object({
  id: z.string().cuid(),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long.")
    .optional(),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute.").optional(),
  isActive: z.boolean().optional(),
  courseId: z.string().cuid("Please select a valid course.").optional(),
  // Use the new updateQuestionSchema here
  questions: z
    .array(updateQuestionSchema)
    .min(1, "At least one question is required.")
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
