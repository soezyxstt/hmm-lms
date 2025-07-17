import { TRPCError } from "@trpc/server";
// import { z } from "zod";
import { hashPassword } from "~/lib/utils";
import { signUpSchema } from "~/lib/schema/auth";

import {
  createTRPCRouter,
  // protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const { name, email, password, nim } = input;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Throw a specific tRPC error for existing email
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        nim,
      },
    });

    if (!newUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user. Please try again later.",
      });
    }

    return {
      success: true,
      message: "Registration successful. You can now sign in.",
      userId: newUser.id,
    };
  }),
});
