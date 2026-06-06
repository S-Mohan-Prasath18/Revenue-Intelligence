"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import { markNotificationRead, markAllNotificationsRead } from "@/lib/data"

async function requireUser() {
  const session = await getSession()
  if (!session) throw new Error("You must be signed in.")
  return session
}

export async function markReadAction(formData: FormData) {
  await requireUser()
  const id = String(formData.get("id") || "")
  if (!id) return
  await markNotificationRead(id)
  revalidatePath("/notifications")
}

export async function markAllReadAction() {
  await requireUser()
  await markAllNotificationsRead()
  revalidatePath("/notifications")
}
