"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import {
  createOffice,
  updateOffice,
  deleteOffice,
  createNotification,
} from "@/lib/data"
import type { OfficeType } from "@/lib/types"
import { canAccess } from "@/lib/types"

async function assertAdmin() {
  const session = await getSession()
  if (!session || !canAccess(session.role, "offices")) {
    throw new Error("Not authorized to manage offices.")
  }
  return session
}

export async function createOfficeAction(formData: FormData) {
  await assertAdmin()
  const name = String(formData.get("name") || "").trim()
  const type = String(formData.get("type") || "branch") as OfficeType
  const location = String(formData.get("location") || "").trim()
  const contactName = String(formData.get("contactName") || "").trim()
  const contactEmail = String(formData.get("contactEmail") || "").trim()
  const contactPhone = String(formData.get("contactPhone") || "").trim()

  if (!name) throw new Error("Office name is required.")

  const office = await createOffice({
    name,
    type,
    location,
    contactName,
    contactEmail,
    contactPhone,
  })

  await createNotification({
    officeId: office.id,
    category: "office",
    title: "New office added",
    message: `${office.name} was registered in the system.`,
  })

  revalidatePath("/", "layout")
  revalidatePath("/offices")
  revalidatePath("/dashboard")
}

export async function updateOfficeAction(formData: FormData) {
  await assertAdmin()
  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Missing office id.")

  await updateOffice(id, {
    name: String(formData.get("name") || "").trim(),
    type: String(formData.get("type") || "branch") as OfficeType,
    location: String(formData.get("location") || "").trim(),
    contactName: String(formData.get("contactName") || "").trim(),
    contactEmail: String(formData.get("contactEmail") || "").trim(),
    contactPhone: String(formData.get("contactPhone") || "").trim(),
  })

  revalidatePath("/", "layout")
  revalidatePath("/offices")
  revalidatePath("/dashboard")
}

export async function deleteOfficeAction(formData: FormData) {
  await assertAdmin()
  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Missing office id.")
  await deleteOffice(id)
  revalidatePath("/", "layout")
  revalidatePath("/offices")
  revalidatePath("/dashboard")
}
