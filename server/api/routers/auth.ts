import { TRPCError } from "@trpc/server";
import z from "zod";
import { hashPassword } from "@/server/auth/password";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
});

const updateSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  password: z.string().optional(),
  image: z.string().optional(),
  cpf: z.string().optional(),
});

export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (user) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já está em uso",
        });
      }

      const hashed = await hashPassword(input.password);

      return await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashed,
        },
      });
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
