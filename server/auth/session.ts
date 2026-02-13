import {cookies} from "next/headers"

const COOKIE_NAME = "session_user"

export async function setSession(userId: string) {
  (await cookies()).set(COOKIE_NAME, userId, {
    httpOnly: true,
    path: "/",
  })
}

export async function getSession() {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME)
}