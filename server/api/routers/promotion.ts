import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Prisma } from "@/server/db/generated/prisma/client";
import type { DiscountType } from "@/server/db/generated/prisma/enums";
import { validatePromotionBusinessRules } from "@/server/lib/promotion-validation";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

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

export const adminListPromotionsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  discountType: z.enum(["all", "percentage", "fixed"]).default("all"),
});

export const adminUpdatePromotionSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  description: z.string().nullish(),
  discountType: discountTypeSchema.optional(),
  discountAmount: z.number().optional(),
  freeShipping: z.boolean().optional(),
  freeShippingMaxAmount: z.number().nullish(),
  allowOnDiscountedItems: z.boolean().optional(),
  limit: z.number().int().nullish(),
  userLimit: z.number().int().nullish(),
  minOrderAmount: z.number().nullish(),
  maxOrderAmount: z.number().nullish(),
  expiresAt: z.date().nullish(),
  active: z.boolean().optional(),
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
              productId: z.string().optional(),
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

      const usageCount =
        promotion.limit !== null
          ? await ctx.prisma.order.count({
              where: { promotionId: promotion.id },
            })
          : 0;
      const userUsage =
        promotion.userLimit !== null && ctx.session?.user?.id
          ? await ctx.prisma.userPromotion.findUnique({
              where: {
                userId_promotionId: {
                  userId: ctx.session.user.id,
                  promotionId: promotion.id,
                },
              },
            })
          : null;

      return validatePromotionBusinessRules({
        promotion,
        orderAmount: input.orderAmount,
        cartItems: input.cartItems,
        usageCount,
        userUsageCount: userUsage?.usageCount,
      });
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

  adminList: adminProcedure
    .input(adminListPromotionsSchema.optional())
    .query(async ({ ctx, input }) => {
      const i = adminListPromotionsSchema.parse(input ?? {});
      const search = i.search?.trim();

      const where: Prisma.PromotionWhereInput = {};

      if (i.status === "active") where.active = true;
      else if (i.status === "inactive") where.active = false;

      if (i.discountType !== "all") {
        where.discountType = i.discountType as DiscountType;
      }

      if (search) {
        where.code = { contains: search, mode: "insensitive" };
      }

      return ctx.prisma.promotion.findMany({
        where,
        select: {
          id: true,
          code: true,
          description: true,
          discountType: true,
          discountAmount: true,
          freeShipping: true,
          active: true,
          expiresAt: true,
          limit: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  adminById: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.promotion.findUnique({
      where: { id: input },
    });
  }),

  adminUpdate: adminProcedure
    .input(adminUpdatePromotionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.promotion.update({
        where: { id },
        data,
      });
    }),
});
