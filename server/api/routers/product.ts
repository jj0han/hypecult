import {
  listProductsSchema,
  productByIdSchema,
} from "@/server/schemas/product";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const productRouter = createTRPCRouter({
  list: publicProcedure
    .input(listProductsSchema.optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where: {
          active: true,
          name: input?.search
            ? { contains: input.search, mode: "insensitive" }
            : undefined,
        },
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
          variants: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  byId: publicProcedure
    .input(productByIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.prisma.product.findUnique({
        where: {
          id: input.id,
        },
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
          variants: true,
        },
      });
    }),
});
