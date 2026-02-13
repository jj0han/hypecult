import { hashPassword, verifyPassword } from "../auth/password";
import { prisma } from "../db/prisma";

export async function signUp({email, password, name} : {email: string, password: string, name: string}) {
  const user = await prisma.user.findUnique({where: {email}})

  if (user) {
    throw new Error("EMAIL_ALREADY_EXISTS")
  }

  const hashed = await hashPassword(password)

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    }
  })
}

export async function logIn({email, password} : {email: string, password: string}) {
  const user = await prisma.user.findUnique({where: {email}})

  if (!user || !user.password) {
    throw new Error("INVALID_CREDENTIALS")
  }

  const valid = await verifyPassword(password, user.password)

  if (!valid) {
    throw new Error("INVALID_CREDENTIALS")
  }

  return user
}