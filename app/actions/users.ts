"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { createUser, deleteUser as deleteUserData, updateUser, findUserByEmail } from "@/lib/data"
import { requireSession } from "./auth"
import type { Role, UserDoc } from "@/lib/types"

export async function createUserAction(formData: FormData) {
  const session = await requireSession()
  if (session.role !== "admin") throw new Error("Unauthorized")

  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")
  const role = String(formData.get("role") || "user") as Role

  if (!name || !email || !password) throw new Error("All fields are required.")
  if (password.length < 6) throw new Error("Password must be at least 6 characters.")
  
  const existing = await findUserByEmail(email)
  if (existing) throw new Error("A user with this email already exists.")

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
  revalidatePath("/users")
  revalidatePath("/dashboard")
}

export async function updateUserAction(formData: FormData) {
  const session = await requireSession()
  if (session.role !== "admin") throw new Error("Unauthorized")

  const id = String(formData.get("id"))
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const role = String(formData.get("role") || "user") as Role

  if (!id || !name || !email) throw new Error("Missing required fields.")

  const updates: Partial<UserDoc> = { name, email, role }
  
  const password = String(formData.get("password") || "")
  if (password) {
    if (password.length < 6) throw new Error("Password must be at least 6 characters.")
    updates.passwordHash = await bcrypt.hash(password, 10)
  }

  await updateUser(id, updates)
  revalidatePath("/users")
  revalidatePath("/dashboard")
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireSession()
  if (session.role !== "admin") throw new Error("Unauthorized")

  const id = String(formData.get("id"))
  if (!id) throw new Error("User ID required")
  if (id === session.userId) throw new Error("You cannot delete yourself.")
  
  await deleteUserData(id)
  revalidatePath("/users")
  revalidatePath("/dashboard")
}
