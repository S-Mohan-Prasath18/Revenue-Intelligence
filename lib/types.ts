export type Role = "admin" | "manager" | "employee"

export type OfficeType = "branch" | "headquarters" | "franchise" | "regional"

export type TransactionType = "income" | "expense"

export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue"

export type TaskPriority = "low" | "medium" | "high"

export type NotificationCategory =
  | "revenue"
  | "expense"
  | "deadline"
  | "task"
  | "office"

export interface UserDoc {
  _id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface Office {
  id: string
  name: string
  type: OfficeType
  location: string
  contactName: string
  contactEmail: string
  contactPhone: string
  createdAt: string
}

export interface Transaction {
  id: string
  officeId: string
  type: TransactionType
  category: string
  description: string
  amount: number
  date: string
  createdBy: string
  createdAt: string
}

export interface Task {
  id: string
  officeId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  deadline: string
  createdBy: string
  createdAt: string
  completedAt?: string
}

export interface Notification {
  id: string
  officeId: string | null
  category: NotificationCategory
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
}

// Module-level access control matrix
export const ACCESS: Record<string, Role[]> = {
  offices: ["admin"],
  transactions: ["admin", "manager"],
  reports: ["admin", "manager", "employee"],
  tasks: ["admin", "manager", "employee"],
  notifications: ["admin", "manager", "employee"],
  dashboard: ["admin", "manager", "employee"],
}

export function canAccess(role: Role, module: string): boolean {
  const allowed = ACCESS[module]
  if (!allowed) return false
  return allowed.includes(role)
}
