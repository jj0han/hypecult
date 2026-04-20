import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Prisma } from "@/server/db/generated/prisma/client";
import { adminProcedure, createTRPCRouter } from "../trpc";

const listSchema = z.object({
  search: z.string().optional(),
});

const createSchema = z.object({
  name: z.string().min(1).trim(),
  slug: z.string().optional(),
});

const updateSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).trim(),
  slug: z.string().optional(),
});

const deleteSchema = z.object({
  id: z.uuid(),
});

function normalizeSlug(slug: string | undefined): string | null {
  const t = slug?.trim();
  return t && t.length > 0 ? t : null;
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  );
}

export const taxonomyRouter = createTRPCRouter({
  adminSummary: adminProcedure.query(async ({ ctx }) => {
    const [categories, subcategories] = await Promise.all([
      ctx.prisma.productCategory.count(),
      ctx.prisma.subcategory.count(),
    ]);
    return { categories, subcategories };
  }),

  adminListCategories: adminProcedure
    .input(listSchema.optional())
    .query(async ({ ctx, input }) => {
      const search = input?.search?.trim();
      const where: Prisma.ProductCategoryWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      return ctx.prisma.productCategory.findMany({
        where,
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      });
    }),

  adminListSubcategories: adminProcedure
    .input(listSchema.optional())
    .query(async ({ ctx, input }) => {
      const search = input?.search?.trim();
      const where: Prisma.SubcategoryWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      return ctx.prisma.subcategory.findMany({
        where,
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      });
    }),

  adminCreateCategory: adminProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.productCategory.create({
          data: {
            name: input.name,
            slug: normalizeSlug(input.slug),
          },
        });
      } catch (e) {
        if (isUniqueViolation(e)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe uma categoria com este nome.",
          });
        }
        throw e;
      }
    }),

  adminUpdateCategory: adminProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.productCategory.update({
          where: { id: input.id },
          data: {
            name: input.name,
            slug: normalizeSlug(input.slug),
          },
        });
      } catch (e) {
        if (isUniqueViolation(e)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe uma categoria com este nome.",
          });
        }
        throw e;
      }
    }),

  adminDeleteCategory: adminProcedure
    .input(deleteSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.productCategory.delete({ where: { id: input.id } });
      return { success: true as const };
    }),

  adminCreateSubcategory: adminProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.subcategory.create({
          data: {
            name: input.name,
            slug: normalizeSlug(input.slug),
          },
        });
      } catch (e) {
        if (isUniqueViolation(e)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um tema com este nome.",
          });
        }
        throw e;
      }
    }),

  adminUpdateSubcategory: adminProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.subcategory.update({
          where: { id: input.id },
          data: {
            name: input.name,
            slug: normalizeSlug(input.slug),
          },
        });
      } catch (e) {
        if (isUniqueViolation(e)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um tema com este nome.",
          });
        }
        throw e;
      }
    }),

  adminDeleteSubcategory: adminProcedure
    .input(deleteSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.subcategory.delete({ where: { id: input.id } });
      return { success: true as const };
    }),
});
