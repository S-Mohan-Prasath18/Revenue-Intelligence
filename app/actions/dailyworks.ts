"use server"

import { revalidatePath } from "next/cache"
import {
  createDailyWork,
  updateDailyWork,
  deleteDailyWork as deleteDailyWorkData,
  updateTask,
  listDailyWorks,
} from "@/lib/data"
import { requireSession } from "./auth"

export async function createDailyWorkAction(formData: FormData) {
  const session = await requireSession()

  const officeId = String(formData.get("officeId") || "")
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const hoursSpent = parseFloat(String(formData.get("hoursSpent") || "0"))
  const date = String(formData.get("date") || new Date().toISOString().split("T")[0])
  const status = String(formData.get("status") || "in_progress") as "done" | "in_progress" | "pending" | "cancelled"
  const taskId = String(formData.get("taskId") || "")

  // Admin can assign work to other users
  const assignedUserId = String(formData.get("assignedUserId") || "")
  const assignedUserName = String(formData.get("assignedUserName") || "")

  if (!officeId) throw new Error("Office is required.")
  if (!title) throw new Error("Work title is required.")

  const userId = assignedUserId || session.userId
  const userName = assignedUserName || session.name

  // Only admins can assign work to others
  if (assignedUserId && assignedUserId !== session.userId && session.role !== "admin") {
    throw new Error("Unauthorized: Only admins can assign work to other users.")
  }

  await createDailyWork({
    userId,
    userName,
    officeId,
    title,
    description,
    date,
    hoursSpent: isNaN(hoursSpent) ? 0 : hoursSpent,
    status,
    taskId: taskId || undefined,
  })

  if (taskId && status === "done") {
    await updateTask(taskId, { status: "completed" })
  } else if (taskId && status === "cancelled") {
    await updateTask(taskId, { status: "cancelled" })
  }

  revalidatePath("/dashboard")
  revalidatePath("/daily-works")
  revalidatePath("/tasks")
}

export async function updateDailyWorkAction(formData: FormData) {
  const session = await requireSession()

  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Work ID is required.")

  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const hoursSpent = parseFloat(String(formData.get("hoursSpent") || "0"))
  const status = String(formData.get("status") || "") as "done" | "in_progress" | "pending" | "cancelled"
  const officeId = String(formData.get("officeId") || "")
  const date = String(formData.get("date") || "")
  const taskId = String(formData.get("taskId") || "")

  const updates: Record<string, unknown> = {}
  if (title) updates.title = title
  if (description !== undefined) updates.description = description
  if (!isNaN(hoursSpent)) updates.hoursSpent = hoursSpent
  if (status) updates.status = status
  if (officeId) updates.officeId = officeId
  if (date) updates.date = date
  if (taskId) updates.taskId = taskId

  // Admin can assign to different user
  const assignedUserId = String(formData.get("assignedUserId") || "")
  const assignedUserName = String(formData.get("assignedUserName") || "")
  if (assignedUserId && session.role === "admin") {
    updates.userId = assignedUserId
    updates.userName = assignedUserName
  }

  await updateDailyWork(id, updates)
  
  if (taskId && status === "done") {
    await updateTask(taskId, { status: "completed" })
  } else if (taskId && status === "cancelled") {
    await updateTask(taskId, { status: "cancelled" })
  }

  revalidatePath("/dashboard")
  revalidatePath("/daily-works")
  revalidatePath("/tasks")
}

export async function updateDailyWorkStatusAction(formData: FormData) {
  await requireSession()

  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "") as "done" | "in_progress" | "pending" | "cancelled"
  if (!id) throw new Error("Work ID is required.")

  const works = await listDailyWorks()
  const work = works.find(w => w.id === id)
  const taskId = work?.taskId

  await updateDailyWork(id, { status })

  if (taskId && status === "done") {
    await updateTask(taskId, { status: "completed" })
  } else if (taskId && status === "cancelled") {
    await updateTask(taskId, { status: "cancelled" })
  }

  revalidatePath("/dashboard")
  revalidatePath("/daily-works")
  revalidatePath("/tasks")
}

export async function deleteDailyWorkAction(formData: FormData) {
  const session = await requireSession()

  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Work ID required.")

  // Admin can delete any; user can only delete their own
  await deleteDailyWorkData(id)
  revalidatePath("/dashboard")
}
