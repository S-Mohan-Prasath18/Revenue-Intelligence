import type { TaskStatus, Task } from "./types"

// No seed data — the system starts with a clean slate.
export const seedOffices: never[] = []
export const seedTransactions: never[] = []
export const seedTasks: never[] = []
export const seedNotifications: never[] = []

// Compute live status for a task based on its deadline
export function resolveStatus(task: Task): TaskStatus {
  if (task.status === "completed") return "completed"
  const now = Date.now()
  const deadline = new Date(task.deadline).getTime()
  if (deadline < now) return "overdue"
  return task.status
}
