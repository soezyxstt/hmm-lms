import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  createTryoutSchema,
  startAttemptSchema,
  submitAnswerSchema,
  finishAttemptSchema,
  tryoutIdSchema,
} from "~/lib/schema/tryout";

export const tryoutRouter = createTRPCRouter({
  create: adminProcedure
    .input(createTryoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { questions, ...tryoutData } = input;

      return ctx.db.$transaction(async (prisma) => {
        const newTryout = await prisma.tryout.create({ data: tryoutData });

        for (const q of questions) {
          const { options, ...questionData } = q;
          const newQuestion = await prisma.question.create({
            data: {
              ...questionData,
              tryoutId: newTryout.id,
            },
          });

          if (options && options.length > 0) {
            await prisma.questionOption.createMany({
              data: options.map((opt) => ({
                ...opt,
                questionId: newQuestion.id,
              })),
            });
          }
        }
        return newTryout;
      });
    }),

  getForTaking: protectedProcedure
    .input(tryoutIdSchema)
    .query(async ({ ctx, input }) => {
      // Returns a tryout without correct answers
      return ctx.db.tryout.findUnique({
        where: { id: input.tryoutId },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: {
                select: { id: true, text: true, order: true }, // Exclude isCorrect
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
    }),

  startAttempt: protectedProcedure
    .input(startAttemptSchema)
    .mutation(async ({ ctx, input }) => {
      // Check for existing incomplete attempt
      const existingAttempt = await ctx.db.userAttempt.findFirst({
        where: {
          userId: ctx.session.user.id,
          tryoutId: input.tryoutId,
          isCompleted: false,
        },
      });

      if (existingAttempt) return existingAttempt;

      // Create a new attempt
      return ctx.db.userAttempt.create({
        data: {
          userId: ctx.session.user.id,
          tryoutId: input.tryoutId,
        },
      });
    }),

  submitAnswer: protectedProcedure
    .input(submitAnswerSchema)
    .mutation(async ({ ctx, input }) => {
      // Upsert allows submitting and updating an answer
      return ctx.db.userAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: input.attemptId,
            questionId: input.questionId,
          },
        },
        create: {
          attemptId: input.attemptId,
          questionId: input.questionId,
          answer: input.answer,
        },
        update: {
          answer: input.answer,
        },
      });
    }),

  finishAttempt: protectedProcedure
    .input(finishAttemptSchema)
    .mutation(async ({ ctx, input }) => {
      // This is a complex operation that should be in a transaction
      return ctx.db.$transaction(async (prisma) => {
        const attempt = await prisma.userAttempt.findUnique({
          where: { id: input.attemptId, userId: ctx.session.user.id },
          include: {
            answers: true,
            tryout: { include: { questions: { include: { options: true } } } },
          },
        });

        if (!attempt || attempt.isCompleted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Attempt not found or already completed.",
          });
        }

        let totalScore = 0;
        let maxScore = 0;

        for (const question of attempt.tryout.questions) {
          maxScore += question.points;
          const userAnswer = attempt.answers.find(
            (a) => a.questionId === question.id,
          );
          if (!userAnswer) continue;

          const correctOptions = question.options
            .filter((o) => o.isCorrect)
            .map((o) => o.id);

          let awardedPoints = 0;
          // Simple scoring logic for multiple choice, can be expanded for other types
          if (question.type === "MULTIPLE_CHOICE_SINGLE") {
            if (
              correctOptions.length === 1 &&
              userAnswer.answer === correctOptions[0]
            ) {
              awardedPoints = question.points;
            }
          }
          // Add more complex scoring for other question types here...

          totalScore += awardedPoints;
          await prisma.userAnswer.update({
            where: { id: userAnswer.id },
            data: { points: awardedPoints },
          });
        }

        return prisma.userAttempt.update({
          where: { id: input.attemptId },
          data: {
            score: totalScore,
            maxScore: maxScore,
            isCompleted: true,
            endedAt: new Date(),
          },
        });
      });
    }),
});
