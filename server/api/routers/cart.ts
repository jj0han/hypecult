import { z } from "zod";
import type { Cart } from "@/schemas/cart";
import { cartSchema } from "@/schemas/cart";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

function normalizeCartItems(input: Cart) {
  const byVariant = new Map<string, Cart[number]>();
  for (const item of input) {
    const existing = byVariant.get(item.variantId);
    if (!existing) {
      byVariant.set(item.variantId, item);
      continue;
    }

    byVariant.set(item.variantId, {
      ...existing,
      quantity: existing.quantity + item.quantity,
    });
  }

  return Array.from(byVariant.values());
}

const refreshInputSchema = z.array(
  z.object({
    variantId: z.uuid(),
    productId: z.uuid(),
    quantity: z.number().int().min(1),
  })
);

export const cartRouter = createTRPCRouter({
  refresh: publicProcedure
    .input(refreshInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.length === 0) {
        return { items: [], removedVariantIds: [] };
      }

      const variants = await ctx.prisma.productVariant.findMany({
        where: { id: { in: input.map((i) => i.variantId) } },
        include: {
          product: {
            include: { images: { orderBy: { order: "asc" } } },
          },
        },
      });

      const variantMap = new Map(variants.map((v) => [v.id, v]));
      const removedVariantIds: string[] = [];
      const items: {
        productId: string;
        variantId: string;
        name: string;
        sku: string;
        color: string;
        price: number;
        originalPrice?: number;
        image: string;
        quantity: number;
        size?: string;
      }[] = [];

      for (const cartInput of input) {
        const variant = variantMap.get(cartInput.variantId);

        if (!variant || !variant.product.active) {
          removedVariantIds.push(cartInput.variantId);
          continue;
        }

        const product = variant.product;
        const basePrice = Number(variant.price ?? product.price);
        const finalPrice = Number(
          variant.finalPrice ?? product.finalPrice ?? basePrice
        );
        const hasDiscount = finalPrice < basePrice;

        items.push({
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          sku: product.sku,
          color: variant.color,
          price: finalPrice,
          originalPrice: hasDiscount ? basePrice : undefined,
          image: product.images[0]?.url ?? "",
          quantity: cartInput.quantity,
          size: variant.size ?? undefined,
        });
      }

      return { items, removedVariantIds };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.cartItem.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      color: item.color,
      name: item.name,
      image: item.image,
      price: Number(item.price),
      originalPrice: item.originalPrice
        ? Number(item.originalPrice)
        : undefined,
      quantity: item.quantity,
      size: item.size ?? undefined,
    }));
  }),
  replace: protectedProcedure
    .input(cartSchema)
    .mutation(async ({ ctx, input }) => {
      const normalizedInput = normalizeCartItems(input);

      await ctx.prisma.$transaction(async (tx) => {
        await tx.cartItem.deleteMany({
          where: { userId: ctx.session.user.id },
        });

        if (normalizedInput.length === 0) {
          return;
        }

        await tx.cartItem.createMany({
          data: normalizedInput.map((item) => ({
            userId: ctx.session.user.id,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            color: item.color,
            name: item.name,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice ?? null,
            quantity: item.quantity,
            size: item.size,
          })),
        });
      });

      return { ok: true };
    }),
});
