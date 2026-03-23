import { TRPCError } from "@trpc/server";
import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const discountTypeSchema = z.enum(["percentage", "fixed"]);

const promotionCodeSchema = z.string();

const promotionCreateSchema = z.object({
  code: z.string(),
  description: z.string().optional(),
  discountType: discountTypeSchema,
  discountAmount: z.number(),
  freeShipping: z.boolean().optional(),
  freeShippingMaxAmount: z.number().optional(),
  allowOnDiscountedItems: z.boolean().optional(),
  limit: z.number().optional(),
  userLimit: z.number().optional(),
  minOrderAmount: z.number().optional(),
  maxOrderAmount: z.number().optional(),
  expiresAt: z.date().optional(),
});

const promotionUpdateSchema = promotionCreateSchema.extend({
  code: z.string(),
});

export const promotionRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.promotion.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  byId: publicProcedure
    .input(promotionCodeSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.promotion.findUnique({
        where: { id: input },
      });
    }),

  byCode: publicProcedure
    .input(promotionCodeSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.promotion.findUnique({
        where: { code: input },
      });
    }),

  /**
   * Validates a promo code against all business rules and returns the promotion
   * if applicable. Accepts an optional orderAmount to check min/max constraints.
   * Authenticated users also get their per-user usage limit checked.
   */
  validate: publicProcedure
    .input(
      z.object({
        code: z.string(),
        orderAmount: z.number().optional(),
        cartItems: z
          .array(
            z.object({
              hasDiscount: z.boolean(),
              subtotal: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.prisma.promotion.findUnique({
        where: { code: input.code.toUpperCase().trim() },
        include: { productPromotions: { include: { product: true } } },
      });

      if (!promotion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cupom não encontrado",
        });
      }

      if (!promotion.active) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este cupom não está mais ativo",
        });
      }

      if (promotion.expiresAt && promotion.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este cupom expirou",
        });
      }

      // Check global usage limit by counting completed orders that used this promotion
      if (promotion.limit !== null) {
        const usageCount = await ctx.prisma.order.count({
          where: { promotionId: promotion.id },
        });
        if (usageCount >= promotion.limit) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Este cupom atingiu o limite máximo de usos",
          });
        }
      }

      // Check per-user usage limit for authenticated users
      if (promotion.userLimit !== null && ctx.session?.user?.id) {
        const userUsage = await ctx.prisma.userPromotion.findUnique({
          where: {
            userId_promotionId: {
              userId: ctx.session.user.id,
              promotionId: promotion.id,
            },
          },
        });
        if (userUsage && userUsage.usageCount >= promotion.userLimit) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Você já utilizou este cupom o número máximo de vezes",
          });
        }
      }

      // Check order amount constraints
      if (input.orderAmount !== undefined) {
        if (
          promotion.minOrderAmount !== null &&
          input.orderAmount < Number(promotion.minOrderAmount)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Pedido mínimo de ${Number(promotion.minOrderAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para usar este cupom`,
          });
        }

        if (
          promotion.maxOrderAmount !== null &&
          input.orderAmount > Number(promotion.maxOrderAmount)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Este cupom é válido apenas para pedidos até ${Number(promotion.maxOrderAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
          });
        }
      }

      // Compute which subtotal the coupon actually applies to
      // If allowOnDiscountedItems=false, exclude cart items that already have a product discount
      let applicableSubtotal: number | null = null;
      if (!promotion.allowOnDiscountedItems && input.cartItems) {
        applicableSubtotal = input.cartItems.reduce(
          (sum, item) => (item.hasDiscount ? sum : sum + item.subtotal),
          0
        );
      }

      return {
        id: promotion.id,
        code: promotion.code,
        description: promotion.description,
        discountType: promotion.discountType,
        discountAmount: Number(promotion.discountAmount),
        freeShipping: promotion.freeShipping,
        freeShippingMaxAmount: promotion.freeShippingMaxAmount
          ? Number(promotion.freeShippingMaxAmount)
          : null,
        allowOnDiscountedItems: promotion.allowOnDiscountedItems,
        applicableSubtotal,
        minOrderAmount: promotion.minOrderAmount
          ? Number(promotion.minOrderAmount)
          : null,
        maxOrderAmount: promotion.maxOrderAmount
          ? Number(promotion.maxOrderAmount)
          : null,
        productIds:
          promotion.productPromotions.length > 0
            ? promotion.productPromotions.map((pp) => pp.productId)
            : null,
      };
    }),

  create: protectedProcedure
    .input(promotionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.promotion.create({
        data: {
          ...input,
          active: true,
        },
        include: { userPromotions: true },
      });
    }),

  update: protectedProcedure
    .input(promotionUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const promotion = await ctx.prisma.promotion.findUnique({
        where: { code: input.code },
      });
      if (!promotion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Promotion not found",
        });
      }
      return await ctx.prisma.promotion.update({
        where: { id: promotion.id },
        data: { ...input },
        include: { userPromotions: true },
      });
    }),

  delete: protectedProcedure
    .input(promotionCodeSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.promotion.delete({
        where: { id: input },
      });
    }),
});
