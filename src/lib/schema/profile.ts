import { z } from "zod";

export const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  faculty: z.string().optional(),
  program: z.string().optional(),
  image: z.string().optional(),
});

export type EditProfileInput = z.infer<typeof editProfileSchema>;
