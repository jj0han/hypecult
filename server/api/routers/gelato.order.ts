import z from "zod";
import * as gelatoOrderService from "@/server/integrations/gelato/gelato.order.service";
import type { GelatoCreateOrderRequest } from "@/server/integrations/gelato/gelato.types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gelatoOrderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.custom<GelatoCreateOrderRequest>())
    .mutation(async ({ input }) => {
      return await gelatoOrderService.create(input);
    }),
  list: protectedProcedure.query(async () => {
    return await gelatoOrderService.list();
  }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await gelatoOrderService.byId(input.id);
    }),
});
