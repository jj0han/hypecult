import { z } from "zod";
import { create } from "@/server/integrations/prodigi/prodigi.quote.service";
import type { ProdigiCreateQuoteRequest } from "@/server/integrations/prodigi/prodigi.types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const prodigiQuoteRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.custom<ProdigiCreateQuoteRequest>())
    .mutation(async ({ input }) => {
      return await create(input);
    }),
  list: publicProcedure
    .input(z.custom<ProdigiCreateQuoteRequest>())
    .query(async ({ input }) => {
      return await create(input);
    }),
});
