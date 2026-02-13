import { z } from "zod";

export const listProductsSchema = z.object({
  search: z.string().optional()
})

export const productByIdSchema = z.object({
  id: z.uuid()
})