"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import {
  createTask,
  updateTask,
  deleteTask,
  createNotification,
} from "@/lib/data"
import type { TaskPriority, TaskStatus } from "@/lib/types"

async function requireUser() {
  const session = await getSession()
  if (!session) throw new Error("You must be signed in.")
  return session
}

export async function createTaskAction(formData: FormData) {
  const session = await requireUser()
  const officeId = String(formData.get("officeId") || "")
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const priority = String(formData.get("priority") || "medium") as TaskPriority
  const assignee = String(formData.get("assignee") || "").trim()
  const deadline = String(formData.get("deadline") || "")

  if (!officeId) throw new Error("Please select an office.")
  if (!title) throw new Error("Task title is required.")
  if (!deadline) throw new Error("A deadline is required.")

  const task = await createTask({
    officeId,
    title,
    description,
    status: "pending",
    priority,
    assignee: assignee || "Unassigned",
    deadline: new Date(deadline).toISOString(),
    createdBy: session.userId,
  })

  await createNotification({
    officeId,
    category: "task",
    title: "New task created",
    message: `"${title}" is due ${new Date(deadline).toLocaleDateString()}.`,
  })

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return task
}

export async function updateTaskStatusAction(formData: FormData) {
  await requireUser()
  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "") as TaskStatus
  if (!id) throw new Error("Missing task id.")

  await updateTask(id, {
    status,
    completedAt: status === "completed" ? new Date().toISOString() : undefined,
  })

  if (status === "completed") {
    await createNotification({
      officeId: null,
      category: "task",
      title: "Task completed",
      message: "A pending work item was marked as completed.",
    })
  }

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
}

export async function deleteTaskAction(formData: FormData) {
  await requireUser()
  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Missing task id.")
  await deleteTask(id)
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
}
