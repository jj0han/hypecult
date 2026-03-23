import { z } from "zod";
import { addressSchema } from "./address";
import { shippingOptionSchema } from "./shipping";

export const orderStatusEnum = z.enum(["pending",
  "paid",
  "production",
  "shipped",
  "delivered",
  "cancelled",]);

export const createOrderItemSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1),
  address: addressSchema,
  shipping: shippingOptionSchema,
  paymentIntentId: z.string().optional(),
  cpf: z.string(),
  promoCode: z.string().optional(),
});

export const orderSchema = createOrderSchema.extend({
  id: z.uuid(),
  userId: z.uuid(),
  status: orderStatusEnum,
  total: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof orderSchema>;