import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
})

export const logInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})