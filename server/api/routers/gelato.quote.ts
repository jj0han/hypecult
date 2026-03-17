import z from "zod";
import { create } from "@/server/integrations/gelato/gelato.quote.service";
import type { GelatoCreateQuoteRequest } from "@/server/integrations/gelato/gelato.types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const gelatoQuoteRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.custom<GelatoCreateQuoteRequest>())
    .mutation(async ({ input }) => {
      return await create(input);
    }),
});
