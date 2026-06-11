export type Role = "admin" | "user"

export type OfficeType = "branch" | "headquarters" | "franchise" | "regional"

export type TransactionType = "income" | "expense"

export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue" | "cancelled"

export type TaskPriority = "low" | "medium" | "high"

export type PaymentStatus = "pending" | "paid" | "overdue" | "partial"

export type NotificationCategory =
  | "revenue"
  | "expense"
  | "deadline"
  | "task"
  | "office"
  | "payment"

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
  assigneeUserId?: string
  deadline: string
  createdBy: string
  createdAt: string
  completedAt?: string
}

export interface Payment {
  id: string
  officeId: string
  title: string
  description: string
  amount: number
  dueDate: string
  status: PaymentStatus
  paidAmount: number
  paidAt?: string
  createdBy: string
  createdAt: string
}

export interface DailyWork {
  id: string
  userId: string
  userName: string
  officeId: string
  title: string
  description: string
  date: string
  hoursSpent: number
  status: "done" | "in_progress" | "pending" | "cancelled"
  taskId?: string
  createdAt: string
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
  user: "User",
}

// Module-level access control matrix
export const ACCESS: Record<string, Role[]> = {
  offices: ["admin"],
  transactions: ["admin", "user"],
  reports: ["admin", "user"],
  tasks: ["admin", "user"],
  notifications: ["admin", "user"],
  dashboard: ["admin", "user"],
  users: ["admin"],
  payments: ["admin", "user"],
  dailyworks: ["admin", "user"],
}

export function canAccess(role: Role, module: string): boolean {
  const allowed = ACCESS[module]
  if (!allowed) return false
  return allowed.includes(role)
}
