import type { Cart } from "@/schemas/cart";
import { cartSchema } from "@/schemas/cart";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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

export const cartRouter = createTRPCRouter({
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
            quantity: item.quantity,
            size: item.size,
          })),
        });
      });

      return { ok: true };
    }),
});
