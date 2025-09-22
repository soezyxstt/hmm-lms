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
import z from "zod";

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
              images: question.images,
              points: question.points,
              required: question.required,
              order: index + 1,
              // --- FIX: Add shortAnswer to the create operation ---
              shortAnswer: question.shortAnswer,
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

  getMyTryouts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // 1. Find all courses the user is enrolled in.
    const coursesWithTryouts = await ctx.db.course.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      // 2. For each course, include its tryouts with specific conditions.
      include: {
        tryout: {
          // Only include tryouts that are active.
          where: {
            isActive: true,
          },
          // Sort the tryouts within each course.
          orderBy: {
            createdAt: "desc",
          },
          // Include the same details for each tryout as before.
          include: {
            attempts: {
              where: {
                userId: userId,
              },
              orderBy: {
                startedAt: "desc",
              },
            },
            _count: {
              select: {
                questions: true,
                attempts: true,
              },
            },
          },
        },
      },
      orderBy: {
        title: "asc", // Sort the courses alphabetically by title.
      },
    });

    // 3. (Optional) Filter out courses that have no active tryouts.
    // This provides a cleaner response for the frontend.
    return coursesWithTryouts.filter((course) => course.tryout.length > 0);
  }),

  update: adminProcedure
    .input(updateTryoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, questions, ...updateData } = input;

      return ctx.db.$transaction(async (tx) => {
        // First, update the simple fields of the tryout itself
        await tx.tryout.update({
          where: { id },
          data: updateData,
        });

        // If questions were included in the update payload, replace them
        if (questions) {
          // 1. Delete all old questions associated with this tryout
          await tx.question.deleteMany({
            where: { tryoutId: id },
          });

          // 2. Create the new questions with all their data
          // Note: We use a loop with 'create' instead of 'createMany' to handle nested options correctly.
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i]!;
            await tx.question.create({
              data: {
                tryoutId: id,
                type: question.type,
                question: question.question,
                images: question.images,
                points: question.points,
                required: question.required,
                order: i + 1,
                // --- FIX: Add shortAnswer to the update/re-create operation ---
                shortAnswer: question.shortAnswer,
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
              },
            });
          }
        }

        // Return the fully updated tryout with all relations
        return tx.tryout.findUnique({
          where: { id },
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

  // New: Get tryout for student with limited info (no correct answers)
  getForStudent: protectedProcedure
    .input(tryoutIdSchema)
    .query(async ({ ctx, input }) => {
      const tryout = await ctx.db.tryout.findUnique({
        where: { id: input.id, isActive: true },
        include: {
          questions: {
            include: {
              options: {
                select: {
                  id: true,
                  text: true,
                  order: true,
                },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          course: {
            select: { title: true, classCode: true },
          },
        },
      });

      if (!tryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found or not active",
        });
      }

      // Check if user is enrolled in the course
      const enrollment = await ctx.db.course.findFirst({
        where: {
          id: tryout.courseId,
          members: {
            some: { id: ctx.session.user.id },
          },
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not enrolled in this course",
        });
      }

      return tryout;
    }),

  // New: Start a tryout attempt
  startAttempt: protectedProcedure
    .input(tryoutIdSchema)
    .mutation(async ({ ctx, input }) => {
      const tryout = await ctx.db.tryout.findUnique({
        where: { id: input.id, isActive: true },
        include: {
          questions: true,
          course: {
            select: {
              members: {
                where: { id: ctx.session.user.id },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!tryout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tryout not found or not active",
        });
      }

      if (tryout.course.members.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not enrolled in this course",
        });
      }

      // Check for existing incomplete attempt
      const existingAttempt = await ctx.db.userAttempt.findFirst({
        where: {
          userId: ctx.session.user.id,
          tryoutId: input.id,
          isCompleted: false,
        },
      });

      if (existingAttempt) {
        return existingAttempt;
      }

      // Calculate max score
      const maxScore = tryout.questions.reduce((sum, q) => sum + q.points, 0);

      return ctx.db.userAttempt.create({
        data: {
          userId: ctx.session.user.id,
          tryoutId: input.id,
          maxScore,
        },
      });
    }),

  // New: Submit answers for a question
  submitAnswer: protectedProcedure
    .input(
      z.object({
        attemptId: z.string().cuid(),
        questionId: z.string().cuid(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: {
          id: input.attemptId,
          userId: ctx.session.user.id,
          isCompleted: false,
        },
        include: {
          tryout: {
            include: {
              questions: {
                include: { options: true },
              },
            },
          },
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attempt not found or already completed",
        });
      }

      const question = attempt.tryout.questions.find(
        (q) => q.id === input.questionId,
      );
      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      // --- SCORING LOGIC ---
      let points = 0;
      if (question.type === "MULTIPLE_CHOICE_SINGLE") {
        const selectedOption = question.options.find(
          (opt) => opt.id === input.answer,
        );
        if (selectedOption?.isCorrect) {
          points = question.points;
        }
      } else if (question.type === "MULTIPLE_CHOICE_MULTIPLE") {
        try {
          const selectedOptions = JSON.parse(input.answer) as string[];
          const correctOptions = question.options.filter(
            (opt) => opt.isCorrect,
          );
          const selectedCorrectOptions = selectedOptions.filter((optId) =>
            correctOptions.some((opt) => opt.id === optId),
          );

          if (
            selectedCorrectOptions.length === correctOptions.length &&
            selectedOptions.length === correctOptions.length
          ) {
            points = question.points;
          }
        } catch {
          // Invalid JSON answer, score is 0
          points = 0;
        }
        // --- FIX: ADDED AUTO-SCORING FOR SHORT ANSWER ---
      } else if (question.type === "SHORT_ANSWER") {
        // Check if the correct answer exists and compare case-insensitively
        if (
          question.shortAnswer &&
          input.answer.trim().toLowerCase() ===
            question.shortAnswer.trim().toLowerCase()
        ) {
          points = question.points;
        }
      }
      // LONG_ANSWER questions will default to 0 points for manual grading.

      return ctx.db.userAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: input.attemptId,
            questionId: input.questionId,
          },
        },
        update: {
          answer: input.answer,
          points,
        },
        create: {
          attemptId: input.attemptId,
          questionId: input.questionId,
          answer: input.answer,
          points,
        },
      });
    }),

  // New: Complete attempt
  completeAttempt: protectedProcedure
    .input(z.object({ attemptId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: {
          id: input.attemptId,
          userId: ctx.session.user.id,
          isCompleted: false,
        },
        include: {
          answers: true,
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attempt not found or already completed",
        });
      }

      const totalScore = attempt.answers.reduce(
        (sum, answer) => sum + answer.points,
        0,
      );

      return ctx.db.userAttempt.update({
        where: { id: input.attemptId },
        data: {
          score: totalScore,
          isCompleted: true,
          endedAt: new Date(),
        },
      });
    }),

  // New: Get user's attempts for a tryout
  getUserAttempts: protectedProcedure
    .input(tryoutIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.userAttempt.findMany({
        where: {
          userId: ctx.session.user.id,
          tryoutId: input.id,
        },
        include: {
          tryout: {
            select: { title: true, duration: true },
          },
        },
        orderBy: { startedAt: "desc" },
      });
    }),

  // New: Get attempt details with results
  getAttemptResults: protectedProcedure
    .input(z.object({ attemptId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const attempt = await ctx.db.userAttempt.findUnique({
        where: {
          id: input.attemptId,
          userId: ctx.session.user.id,
        },
        include: {
          tryout: {
            select: { title: true, duration: true },
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

  // New: Get active attempt
  getActiveAttempt: protectedProcedure
    .input(tryoutIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.userAttempt.findFirst({
        where: {
          userId: ctx.session.user.id,
          tryoutId: input.id,
          isCompleted: false,
        },
        include: {
          answers: true,
          tryout: {
            select: {
              title: true,
              duration: true,
              questions: {
                select: { id: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
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
