import { z } from "zod";
import { Role } from "@prisma/client";

export const userIdSchema = z.object({
  id: z.string(),
});

export const updateUserRoleSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(Role),
});

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  nim: z.string().min(1),
  faculty: z.string().optional(),
  program: z.string().optional(),
  position: z.string().optional(),
  role: z.nativeEnum(Role),
});

export const deleteUserSchema = z.object({
  id: z.string(),
});

export const getUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  faculty: z.string().optional(),
});
