import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  scholarshipSchema,
  updateScholarshipSchema,
  scholarshipIdSchema,
} from "~/lib/schema/scholarship";

export const scholarshipRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.scholarship.findMany({
      orderBy: { deadline: "asc" },
      include: { createdBy: { select: { name: true } } },
    });
  }),

  create: adminProcedure
    .input(scholarshipSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.scholarship.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),

  update: adminProcedure
    .input(updateScholarshipSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.scholarship.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(scholarshipIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.scholarship.delete({
        where: { id: input.id },
      });
    }),
});
