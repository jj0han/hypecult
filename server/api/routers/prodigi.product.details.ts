import { z } from "zod";
import { bySku } from "@/server/integrations/prodigi/prodigi.product.details.service";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const prodigiProductDetailsRouter = createTRPCRouter({
  bySku: publicProcedure.input(z.custom<string>()).query(async ({ input }) => {
    return await bySku(input);
  }),
});
