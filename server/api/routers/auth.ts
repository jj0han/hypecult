import { TRPCError } from "@trpc/server";
import { clearSession, setSession } from "@/server/auth/session";
import { logIn, signUp } from "@/server/services/auth.service";
import { logInSchema, signUpSchema } from "../../schemas/auth";
import { createTRPCRouter, publicProcedure } from "../trpc";

function toAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return new TRPCError({
        code: "CONFLICT",
        message: "EMAIL_ALREADY_EXISTS",
      });
    }
    if (error.message === "INVALID_CREDENTIALS") {
      return new TRPCError({
        code: "UNAUTHORIZED",
        message: "INVALID_CREDENTIALS",
      });
    }
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "AUTH_UNEXPECTED_ERROR",
  });
}

export const authRouter = createTRPCRouter({
  signup: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    try {
      const user = await signUp(input);
      await setSession(user.id);
      return { user };
    } catch (error) {
      throw toAuthError(error);
    }
  }),
  login: publicProcedure.input(logInSchema).mutation(async ({ input }) => {
    try {
      const user = await logIn(input);
      await setSession(user.id);
      return { user };
    } catch (error) {
      throw toAuthError(error);
    }
  }),
  logout: publicProcedure.mutation(async () => {
    await clearSession();
    return {
      ok: true,
    };
  }),
});
