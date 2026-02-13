import z from "zod";

export const addressSchema = z.object({
  id: z.uuid(),
  recipient: z.string().min(2),
  street: z.string().min(3),
  number: z.string(),
  complement: z.string().optional(),
  district: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zipCode: z.string().min(8),
})

export const addressCreateSchema = addressSchema.omit({id: true});

export type Address = z.infer<typeof addressSchema>;

export type AddressCreate = z.infer<typeof addressCreateSchema>;