import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword } from "../auth/password";
import { prisma } from "../db/prisma";

export async function signUp({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Email já está em uso",
    });
  }

  const hashed = await hashPassword(password);

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  });
}

export async function logIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Credenciais inválidas",
    });
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Credenciais inválidas",
    });
  }

  return user;
}
