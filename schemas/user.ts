import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  email: z.email(),
  createdAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
