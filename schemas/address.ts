import { z } from "zod";

export const addressSchema = z.object({
  id: z.uuid().optional(),
  recipient: z.string().min(1),
  zipCode: z.string().length(8),
  street: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().length(2),
})

export type Address = z.infer<typeof addressSchema>;