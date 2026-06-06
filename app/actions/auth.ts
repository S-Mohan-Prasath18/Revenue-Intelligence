"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { createSession, destroySession, getSession } from "@/lib/session"
import { findUserByEmail, createUser, countUsers } from "@/lib/data"
import type { Role, User, UserDoc } from "@/lib/types"

export interface AuthResult {
  error?: string
}

const VALID_ROLES: Role[] = ["admin", "manager", "employee"]

export async function signupAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")
  let role = String(formData.get("role") || "employee") as Role

  if (!name || !email || !password) {
    return { error: "All fields are required." }
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." }
  }
  if (!VALID_ROLES.includes(role)) role = "employee"

  const existing = await findUserByEmail(email)
  if (existing) {
    return { error: "An account with this email already exists." }
  }

  // First user is always promoted to admin to bootstrap the system
  const total = await countUsers()
  if (total === 0) role = "admin"

  const passwordHash = await bcrypt.hash(password, 10)
  const doc: UserDoc = {
    _id: `user-${Date.now().toString(36)}`,
    name,
    email,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  }
  await createUser(doc)

  const user: User = { id: doc._id, name, email, role, createdAt: doc.createdAt }
  await createSession(user)
  redirect("/dashboard")
}

export async function loginAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const doc = await findUserByEmail(email)
  if (!doc) {
    return { error: "Invalid email or password." }
  }
  const ok = await bcrypt.compare(password, doc.passwordHash)
  if (!ok) {
    return { error: "Invalid email or password." }
  }

  const user: User = {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    createdAt: doc.createdAt,
  }
  await createSession(user)
  redirect("/dashboard")
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect("/login")
}

export async function requireSession() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}
