import { TRPCError } from "@trpc/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import type { Prisma } from "@/server/db/generated/prisma/client";
import { ProductType } from "@/server/db/generated/prisma/enums";
import { env } from "@/server/env";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const listProductsSchema = z.object({
  search: z.string().optional(),
  type: z.enum(ProductType).optional(),
  subcategoryIds: z.array(z.uuid()).optional(), // OR filter: product has any of these subcategories
  sort: z
    .enum(["newest", "price_asc", "price_desc", "name_asc"])
    .default("newest"),
});

export const adminListProductsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  type: z.enum(ProductType).optional(),
  gelato: z.enum(["all", "synced", "not_synced"]).default("all"),
});

export const productByIdSchema = z.object({
  id: z.uuid(),
});

export const productUpdateSchema = z.object({
  id: z.uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  price: z.number().positive().optional(),
  discountType: z.enum(["percentage", "fixed"]).nullable().optional(),
  discountAmount: z.number().nonnegative().nullable().optional(),
  finalPrice: z.number().nonnegative().nullable().optional(),
  categoryId: z.uuid().nullable().optional(),
  subcategoryIds: z.array(z.uuid()).optional(), // replace all associated subcategories
  aliases: z.array(z.string().min(1).trim()).optional(), // replace all aliases
  images: z
    .array(
      z.object({
        id: z.uuid(),
        alt: z.string().optional(),
        order: z.number().nonnegative(),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.uuid(),
        stock: z.number().int().nonnegative().optional(),
        price: z.number().positive().nullable().optional(),
        discountType: z.enum(["percentage", "fixed"]).nullable().optional(),
        discountAmount: z.number().nonnegative().nullable().optional(),
        finalPrice: z.number().nonnegative().nullable().optional(),
      })
    )
    .optional(),
});

export const productAddImageSchema = z.object({
  productId: z.uuid(),
  publicId: z.string().min(1),
  url: z.url(),
  alt: z.string().optional(),
});

export const productRemoveImageSchema = z.object({
  imageId: z.uuid(),
});

export const productRouter = createTRPCRouter({
  adminSummary: adminProcedure.query(async ({ ctx }) => {
    const [products, promotions] = await Promise.all([
      ctx.prisma.product.count(),
      ctx.prisma.promotion.count(),
    ]);
    return { products, promotions };
  }),

  adminList: adminProcedure
    .input(adminListProductsSchema.optional())
    .query(async ({ ctx, input }) => {
      const i = adminListProductsSchema.parse(input ?? {});
      const search = i.search?.trim();

      const where: Prisma.ProductWhereInput = {};

      if (i.status === "active") {
        where.active = true;
      } else if (i.status === "inactive") {
        where.active = false;
      }

      if (i.type) {
        where.type = i.type;
      }

      if (i.gelato === "synced") {
        where.gelatoProductId = { not: null };
      } else if (i.gelato === "not_synced") {
        where.gelatoProductId = null;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          {
            aliases: {
              some: { alias: { contains: search, mode: "insensitive" } },
            },
          },
        ];
      }

      return ctx.prisma.product.findMany({
        where,
        select: {
          id: true,
          gelatoProductId: true,
          sku: true,
          name: true,
          type: true,
          price: true,
          finalPrice: true,
          active: true,
          updatedAt: true,
          images: {
            orderBy: { order: "asc" },
            take: 1,
            select: { url: true, alt: true, publicId: true },
          },
          variants: {
            select: { id: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }),

  list: publicProcedure
    .input(listProductsSchema.optional())
    .query(async ({ ctx, input }) => {
      const sort = input?.sort ?? "newest";

      const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
        switch (sort) {
          case "price_asc":
            return { finalPrice: "asc" };
          case "price_desc":
            return { finalPrice: "desc" };
          case "name_asc":
            return { name: "asc" };
          default:
            return { createdAt: "desc" };
        }
      })();

      const where: Prisma.ProductWhereInput = {
        active: true,
        type: input?.type ?? undefined,
      };

      // Search: name OR any alias (case-insensitive)
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          {
            aliases: {
              some: { alias: { contains: input.search, mode: "insensitive" } },
            },
          },
        ];
      }

      // Subcategory filter (OR: product has any of the selected subcategories)
      if (input?.subcategoryIds && input.subcategoryIds.length > 0) {
        where.subcategories = {
          some: { id: { in: input.subcategoryIds } },
        };
      }

      return ctx.prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
          variants: true,
          category: true,
          subcategories: true,
          aliases: true,
        },
        orderBy,
      });
    }),
  byId: publicProcedure
    .input(productByIdSchema)
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
          variants: true,
          category: true,
          subcategories: true,
          aliases: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),
  update: adminProcedure
    .input(productUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, images, variants, subcategoryIds, aliases, ...productData } =
        input;

      const product = await ctx.prisma.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { order: "asc" } },
          variants: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const updated = await ctx.prisma.product.update({
        where: { id: product.id },
        data: {
          ...productData,
          images: {
            updateMany: images?.map((image) => ({
              where: { id: image.id },
              data: {
                order: image.order,
                alt: image.alt,
              },
            })),
          },
          // Replace subcategories
          subcategories:
            subcategoryIds !== undefined
              ? {
                  set: subcategoryIds.map((subcategoryId) => ({
                    id: subcategoryId,
                  })),
                }
              : undefined,
          // Replace aliases
          aliases:
            aliases !== undefined
              ? {
                  deleteMany: {},
                  create: aliases
                    .filter((alias) => alias.trim().length > 0)
                    .map((alias) => ({
                      alias: alias.trim(),
                    })),
                }
              : undefined,
          updatedAt: new Date(),
        },
      });

      if (variants?.length) {
        await Promise.all(
          variants.map(({ id: variantId, ...variantData }) =>
            ctx.prisma.productVariant.update({
              where: { id: variantId },
              data: variantData,
            })
          )
        );
      }

      return updated;
    }),

  addImage: adminProcedure
    .input(productAddImageSchema)
    .mutation(async ({ ctx, input }) => {
      const { productId, publicId, url, alt } = input;

      const product = await ctx.prisma.product.findUnique({
        where: { id: productId },
        include: { images: true },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (product.images.length >= 6) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Máximo de 6 imagens por produto",
        });
      }

      const maxOrder = product.images.reduce(
        (max, img) => Math.max(max, img.order),
        -1
      );

      return ctx.prisma.productImage.create({
        data: {
          productId,
          publicId,
          url,
          alt: alt ?? null,
          order: maxOrder + 1,
        },
      });
    }),

  removeImage: adminProcedure
    .input(productRemoveImageSchema)
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.prisma.productImage.findUnique({
        where: { id: input.imageId },
      });

      if (!image) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Image not found" });
      }

      await ctx.prisma.productImage.delete({ where: { id: input.imageId } });

      try {
        await cloudinary.uploader.destroy(image.publicId ?? image.url, {
          invalidate: true, // Recommended: removes the image from CDN cache immediately
        });
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cloudinary error deleting image",
        });
      }

      return { success: true };
    }),

  listCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    });
  }),

  listSubcategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.subcategory.findMany({
      orderBy: { name: "asc" },
    });
  }),
});
