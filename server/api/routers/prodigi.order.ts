import z from "zod";
import { create } from "@/server/integrations/prodigi/prodigi.order.service";
import type { ProdigiCreateOrderRequest } from "@/server/integrations/prodigi/prodigi.types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const prodigiOrderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.custom<ProdigiCreateOrderRequest>())
    .mutation(async ({ input }) => {
      return await create(input);
    }),
});
