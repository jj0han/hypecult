import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getShippingOptions } from "@/server/services/shipping.service";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const shippingRouter = createTRPCRouter({
  calculate: protectedProcedure
    .input(
      z.object({
        addressId: z.uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const address = await ctx.prisma.address.findUnique({
        where: {
          id: input.addressId,
          userId: ctx.session.user.id,
        },
      });

      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ADDRESS_NOT_FOUND",
        });
      }

      // MVP: fixed shipping table until provider integration.
      return getShippingOptions();
    }),
});
