import { TRPCError } from "@trpc/server";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const addressSchema = z.object({
  id: z.uuid(),
  recipient: z.string().min(2),
  street: z.string().min(3),
  number: z.string(),
  complement: z.string().optional(),
  district: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zipCode: z.string().min(8),
});

export const addressCreateSchema = addressSchema.omit({ id: true });

export type Address = z.infer<typeof addressSchema>;

export type AddressCreate = z.infer<typeof addressCreateSchema>;

export const addressRouter = createTRPCRouter({
  list: protectedProcedure.query(
    async ({ ctx }) =>
      await ctx.prisma.address.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
  ),
  create: protectedProcedure.input(addressCreateSchema).mutation(
    async ({ ctx, input }) =>
      await ctx.prisma.address.create({
        data: { userId: ctx.session.user.id, ...input },
      })
  ),
  remove: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.session.user;

      const address = await ctx.prisma.address.findUnique({
        where: { id: input.id, userId: id },
      });

      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ADDRESS_NOT_FOUND",
        });
      }

      return await ctx.prisma.address.delete({
        where: { id: input.id, userId: id },
      });
    }),
  update: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.session.user;

      const address = await ctx.prisma.address.findUnique({
        where: { id: input.id, userId: id },
      });

      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ADDRESS_NOT_FOUND",
        });
      }

      return await ctx.prisma.address.update({
        where: { id: input.id, userId: id },
        data: input,
      });
    }),
});
