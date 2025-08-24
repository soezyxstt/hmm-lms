// ~/server/api/routers/tryout.ts
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  createTryoutSchema,
  updateTryoutSchema,
  tryoutIdSchema,
  courseIdSchema,
} from "~/lib/schema/tryout";
import z from 'zod';

export const tryoutRouter = createTRPCRouter({
  create: adminProcedure
    .input(createTryoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { questions, ...tryoutData } = input;

      return ctx.db.tryout.create({
        data: {
          ...tryoutData,
          questions: {
            create: questions.map((question, index) => ({
              type: question.type,
              question: question.question,
              points: question.points,
              required: question.required,
              order: index + 1,
              options: question.options
                ? {
                    create: question.options.map((option, optionIndex) => ({
                      text: option.text,
                      isCorrect: option.isCorrect,
                      explanation: option.explanation,
                      order: optionIndex + 1,
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: { order: "asc" },
          },
          course: {
            select: { title: true, classCode: true },
          },
        },
      });
    }),

  update: adminProcedure
    .input(updateTryoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, questions, ...updateData } = input;

      // Check if tryout exists
      const existingTryout = await ctx.db.tryout.findUnique({
        where: { id },
        include: { questions: { include: { options: true } } },
      });

      if (!existingTryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found",
        });
      }

      // If questions are provided, update them
      if (questions) {
        // Delete existing questions and their options
        await ctx.db.question.deleteMany({
          where: { tryoutId: id },
        });

        // Create new questions
        await ctx.db.question.createMany({
          data: questions.map((question, index) => ({
            tryoutId: id,
            type: question.type,
            question: question.question,
            points: question.points,
            required: question.required,
            order: index + 1,
          })),
        });

        // Create options for questions that have them
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          if (question?.options && question.options.length > 0) {
            const createdQuestion = await ctx.db.question.findFirst({
              where: { tryoutId: id, order: i + 1 },
            });

            if (createdQuestion) {
              await ctx.db.questionOption.createMany({
                data: question.options.map((option, optionIndex) => ({
                  questionId: createdQuestion.id,
                  text: option.text,
                  isCorrect: option.isCorrect,
                  explanation: option.explanation,
                  order: optionIndex + 1,
                })),
              });
            }
          }
        }
      }

      return ctx.db.tryout.update({
        where: { id },
        data: updateData,
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: { order: "asc" },
          },
          course: {
            select: { title: true, classCode: true },
          },
        },
      });
    }),

  getById: protectedProcedure
    .input(tryoutIdSchema)
    .query(async ({ ctx, input }) => {
      const tryout = await ctx.db.tryout.findUnique({
        where: { id: input.id },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          course: {
            select: { title: true, classCode: true },
          },
          _count: {
            select: { attempts: true },
          },
        },
      });

      if (!tryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found",
        });
      }

      return tryout;
    }),

  getByCourse: protectedProcedure
    .input(courseIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.tryout.findMany({
        where: { courseId: input.courseId },
        include: {
          _count: {
            select: { questions: true, attempts: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  delete: adminProcedure
    .input(tryoutIdSchema)
    .mutation(async ({ ctx, input }) => {
      const tryout = await ctx.db.tryout.findUnique({
        where: { id: input.id },
      });

      if (!tryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found",
        });
      }

      return ctx.db.tryout.delete({
        where: { id: input.id },
      });
    }),

  toggleActive: adminProcedure
    .input(tryoutIdSchema)
    .mutation(async ({ ctx, input }) => {
      const tryout = await ctx.db.tryout.findUnique({
        where: { id: input.id },
        select: { isActive: true },
      });

      if (!tryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found",
        });
      }

      return ctx.db.tryout.update({
        where: { id: input.id },
        data: { isActive: !tryout.isActive },
      });
    }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.tryout.findMany({
      include: {
        course: {
          select: { title: true, classCode: true },
        },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getDetailedById: adminProcedure
    .input(tryoutIdSchema)
    .query(async ({ ctx, input }) => {
      const tryout = await ctx.db.tryout.findUnique({
        where: { id: input.id },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { order: "asc" },
              },
              _count: {
                select: { answers: true },
              },
            },
            orderBy: { order: "asc" },
          },
          course: {
            select: {
              id: true,
              title: true,
              classCode: true,
              members: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          attempts: {
            include: {
              user: {
                select: { id: true, name: true, email: true, nim: true },
              },
              answers: {
                include: {
                  question: {
                    select: { question: true, points: true },
                  },
                },
              },
            },
            orderBy: { startedAt: "desc" },
          },
          _count: {
            select: {
              attempts: true,
              questions: true,
            },
          },
        },
      });

      if (!tryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found",
        });
      }

      // Calculate statistics
      const completedAttempts = tryout.attempts.filter((a) => a.isCompleted);
      const averageScore =
        completedAttempts.length > 0
          ? completedAttempts.reduce(
              (sum, attempt) => sum + (attempt.score / attempt.maxScore) * 100,
              0,
            ) / completedAttempts.length
          : 0;

      const highestScore =
        completedAttempts.length > 0
          ? Math.max(
              ...completedAttempts.map((a) => (a.score / a.maxScore) * 100),
            )
          : 0;

      const lowestScore =
        completedAttempts.length > 0
          ? Math.min(
              ...completedAttempts.map((a) => (a.score / a.maxScore) * 100),
            )
          : 0;

      return {
        ...tryout,
        statistics: {
          totalAttempts: tryout.attempts.length,
          completedAttempts: completedAttempts.length,
          averageScore: Math.round(averageScore * 100) / 100,
          highestScore: Math.round(highestScore * 100) / 100,
          lowestScore: Math.round(lowestScore * 100) / 100,
        },
      };
    }),

  // Get tryout for editing (without sensitive data)
  getForEdit: adminProcedure
    .input(tryoutIdSchema)
    .query(async ({ ctx, input }) => {
      const tryout = await ctx.db.tryout.findUnique({
        where: { id: input.id },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          course: {
            select: { id: true, title: true, classCode: true },
          },
        },
      });

      if (!tryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found",
        });
      }

      return tryout;
    }),

  // Duplicate a tryout
  duplicate: adminProcedure
    .input(tryoutIdSchema)
    .mutation(async ({ ctx, input }) => {
      const originalTryout = await ctx.db.tryout.findUnique({
        where: { id: input.id },
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!originalTryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found",
        });
      }

      return ctx.db.tryout.create({
        data: {
          title: `${originalTryout.title} (Copy)`,
          description: originalTryout.description,
          duration: originalTryout.duration,
          courseId: originalTryout.courseId,
          isActive: false, // Duplicated tryouts start as inactive
          questions: {
            create: originalTryout.questions.map((question, index) => ({
              type: question.type,
              question: question.question,
              points: question.points,
              required: question.required,
              order: index + 1,
              options:
                question.options.length > 0
                  ? {
                      create: question.options.map((option, optionIndex) => ({
                        text: option.text,
                        isCorrect: option.isCorrect,
                        explanation: option.explanation,
                        order: optionIndex + 1,
                      })),
                    }
                  : undefined,
            })),
          },
        },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
          course: {
            select: { title: true, classCode: true },
          },
        },
      });
    }),

  // Get attempt details for review
  getAttemptDetails: adminProcedure
    .input(z.object({ attemptId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: { id: input.attemptId },
        include: {
          user: {
            select: { id: true, name: true, email: true, nim: true },
          },
          tryout: {
            select: { id: true, title: true, duration: true },
          },
          answers: {
            include: {
              question: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attempt not found",
        });
      }

      return attempt;
    }),
});
