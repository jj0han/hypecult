import { z } from "zod";

export const sizeEnum = z.enum(["PP", "P", "M", "G", "GG"]);

export const orderCartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().min(1),
  variant: z.object({
    size: sizeEnum,
    color: z.string(),
  }),
});

export const orderCartSchema = z.array(orderCartItemSchema);

export const cartItemSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid(),
  productUid: z.union([z.string().min(1), z.null()]).optional(),
  sku: z.string().min(1),
  color: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  image: z.string().min(1),
  quantity: z.number().int().min(1),
  size: z.string().optional(),
});

export const cartSchema = z.array(cartItemSchema);

export type Size = z.infer<typeof sizeEnum>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;