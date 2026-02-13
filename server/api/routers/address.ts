import { create, list, remove, update } from "@/server/services/address.service";
import { addressCreateSchema, addressSchema } from "@/server/schemas/address";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const addressRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await list(ctx.session.user.id);
  }),
  create: protectedProcedure
    .input(addressCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return await create(ctx.session.user.id, input);
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await remove(ctx.session.user.id, input.id);
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ADDRESS_NOT_FOUND",
        });
      }
    }),
  update: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await update(ctx.session.user.id, input.id, input);
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ADDRESS_NOT_FOUND",
        });
      }
    }),
});