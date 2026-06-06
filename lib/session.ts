import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { Role, User } from "./types"

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me"
const key = new TextEncoder().encode(SECRET)
const COOKIE = "rioms_session"

export interface SessionPayload {
  userId: string
  name: string
  email: string
  role: Role
}

export async function createSession(user: User): Promise<void> {
  const token = await new SignJWT({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)

  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE)
}
