import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  userIdSchema,
  updateUserRoleSchema,
  updateUserSchema,
  deleteUserSchema,
  getUsersSchema,
} from "~/lib/schema/user";
import { editProfileSchema } from '~/lib/schema/profile';

export const userRouter = createTRPCRouter({
  getAll: adminProcedure.input(getUsersSchema).query(async ({ ctx, input }) => {
    const { page, limit, search, role, faculty } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { nim: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(role && { role }),
      ...(faculty && {
        faculty: { contains: faculty, mode: "insensitive" as const },
      }),
    };

    const [users, total] = await Promise.all([
      ctx.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              courses: true,
              userAttempts: true,
              learningSessions: true,
            },
          },
        },
      }),
      ctx.db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }),

  getById: adminProcedure.input(userIdSchema).query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: input.id },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            classCode: true,
          },
        },
        userAttempts: {
          select: {
            id: true,
            score: true,
            maxScore: true,
            isCompleted: true,
            startedAt: true,
            tryout: {
              select: {
                title: true,
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { startedAt: "desc" },
          take: 10,
        },
        learningSessions: {
          select: {
            id: true,
            date: true,
            duration: true,
            course: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { date: "desc" },
          take: 10,
        },
        _count: {
          select: {
            courses: true,
            userAttempts: true,
            learningSessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found.",
      });
    }

    return user;
  }),

  updateRole: adminProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ ctx, input }) => {
      // Prevent admin from changing their own role
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot change your own role.",
        });
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: { role: input.role },
      });
    }),

  update: adminProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.db.user.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(deleteUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Prevent admin from deleting themselves
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot delete your own account.",
        });
      }

      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        faculty: true,
        program: true,
        position: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(editProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;

      const updatedUser = await db.user.update({
        where: { id: session.user.id },
        data: {
          name: input.name,
          faculty: input.faculty ?? null,
          program: input.program ?? null,
          image: input.image ?? null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          nim: true,
          faculty: true,
          program: true,
          position: true,
          role: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    }),

  getFaculties: adminProcedure.query(async ({ ctx }) => {
    const faculties = await ctx.db.user.findMany({
      select: { faculty: true },
      where: { faculty: { not: null } },
      distinct: ["faculty"],
    });

    return faculties
      .map((f) => f.faculty)
      .filter(Boolean)
      .sort();
  }),
});
