import { z } from "zod";

export const shippingOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  price: z.number(),
  deadline: z.string(),
});

export type ShippingOption = z.infer<typeof shippingOptionSchema>;