import { TRPCError } from "@trpc/server";
import z from "zod";
import { createOrderSchema } from "@/schemas/order";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const shipping = input.shipping;
      if (!shipping) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "INVALID_SHIPPING_METHOD",
        });
      }

      if (shipping.price !== input.shipping.price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "INVALID_SHIPPING_PRICE",
        });
      }

      const requestedVariants = await ctx.prisma.productVariant.findMany({
        where: {
          id: { in: input.items.map((item) => item.variantId) },
        },
        include: {
          product: true,
        },
      });

      const variantById = new Map(requestedVariants.map((v) => [v.id, v]));
      const validatedItems = input.items.map((item) => {
        const variant = variantById.get(item.variantId);
        if (!variant || variant.productId !== item.productId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ITEM_NOT_FOUND",
          });
        }

        if (variant.stock < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "INSUFFICIENT_STOCK",
          });
        }

        const unitPrice = Number(variant.price ?? variant.product.price);
        return {
          item,
          variant,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        };
      });

      const subtotal = validatedItems.reduce(
        (acc, item) => acc + item.lineTotal,
        0
      );
      const totalQuantity = validatedItems.reduce(
        (acc, item) => acc + item.item.quantity,
        0
      );
      const total = subtotal + shipping.price;

      return await ctx.prisma.$transaction(async (tx) => {
        for (const { item, variant } of validatedItems) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return await tx.order.create({
          data: {
            userId: ctx.session.user.id,
            orderId: crypto.randomUUID(),
            paymentIntentId: input.paymentIntentId,
            subtotal,
            totalQuantity,
            shippingPrice: shipping.price,
            total,
            items: {
              createMany: {
                data: validatedItems.map(({ item, variant, unitPrice }) => ({
                  productType: variant.product.type,
                  productId: item.productId,
                  variantId: item.variantId,
                  name: variant.product.name,
                  size: variant.size ?? undefined,
                  quantity: item.quantity,
                  price: unitPrice,
                })),
              },
            },
            address: {
              create: {
                recipient: input.address.recipient,
                street: input.address.street,
                number: input.address.number,
                complement: input.address.complement,
                district: input.address.neighborhood,
                city: input.address.city,
                state: input.address.state,
                zipCode: input.address.zipCode,
              },
            },
            shipping: {
              create: {
                method: shipping.label,
                price: shipping.price,
              },
            },
          },
        });
      });
    }),
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.order.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  byId: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.order.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          items: true,
          address: true,
        },
      });
    }),
});
