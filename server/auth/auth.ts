import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { GetServerSidePropsContext } from "next";
import {
  type DefaultSession,
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { UserRole } from "../db/generated/prisma/enums";
import { prisma } from "../db/prisma";
import { env } from "../env";

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      cpf: string | null;
      role: UserRole;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    cpf: string | null;
    role: UserRole;
    // ...other properties
    // role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    cpf?: string | null;
    role?: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }

      const userId =
        user?.id ??
        (typeof token.id === "string" ? token.id : undefined) ??
        (typeof token.sub === "string" ? token.sub : undefined);

      // `user.cpf` is often missing for OAuth (profile/adapter user shape). Stale
      // JWTs may also lack `cpf` — load from DB on sign-in and once to backfill.
      // `trigger === "update"` runs when the client calls `useSession().update()`.
      const needsCpfFromDb =
        user != null ||
        trigger === "update" ||
        (userId != null && token.cpf === undefined);

      if (userId && needsCpfFromDb) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { cpf: true, role: true },
        });
        token.cpf = dbUser?.cpf ?? null;
        token.role = dbUser?.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.cpf = token.cpf ?? null;
        if (token.role) {
          session.user.role = token.role;
        }
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {}, cpf: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          return null;
        }

        if (!user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          role: user.role,
        };
      },
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     **/
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export const getAppRouterAuthSession = () => {
  return getServerSession(authOptions);
};
