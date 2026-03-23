import { TRPCError } from "@trpc/server";
import z from "zod";
import { signUp } from "@/server/services/auth.service";
import { signUpSchema } from "../../schemas/auth";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const updateSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  password: z.string().optional(),
  image: z.string().optional(),
  cpf: z.string().optional(),
});

export const authRouter = createTRPCRouter({
  signup: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const user = await signUp(input);
    return { user };
  }),
  update: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não encontrado",
        });
      }

      return await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),
});
