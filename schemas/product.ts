import { z } from "zod";

export const productTypeEnum = z.enum(["tshirt", "hoodie", "mug", "sticker", "other"]);

export const productSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  type: productTypeEnum,
  active: z.boolean(),
})

export type Product = z.infer<typeof productSchema>;