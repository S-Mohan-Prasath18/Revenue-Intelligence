import "server-only"
import { supabase } from "./supabase"
import { resolveStatus } from "./seed"
import type {
  Office,
  Transaction,
  Task,
  Notification as AppNotification,
  UserDoc,
  User,
  Payment,
  DailyWork,
} from "./types"

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ====================== OFFICES ======================
export async function listOffices(): Promise<Office[]> {
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .order("name")
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location ?? "",
    contactName: row.contact_name ?? "",
    contactEmail: row.contact_email ?? "",
    contactPhone: row.contact_phone ?? "",
    createdAt: row.created_at,
  }))
}

export async function createOffice(input: Omit<Office, "id" | "createdAt">): Promise<Office> {
  const { data, error } = await supabase
    .from("offices")
    .insert({
      id: uid("office"),
      name: input.name,
      type: input.type,
      location: input.location,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    location: data.location ?? "",
    contactName: data.contact_name ?? "",
    contactEmail: data.contact_email ?? "",
    contactPhone: data.contact_phone ?? "",
    createdAt: data.created_at,
  }
}

export async function updateOffice(id: string, input: Partial<Office>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (input.name !== undefined) updates.name = input.name
  if (input.type !== undefined) updates.type = input.type
  if (input.location !== undefined) updates.location = input.location
  if (input.contactName !== undefined) updates.contact_name = input.contactName
  if (input.contactEmail !== undefined) updates.contact_email = input.contactEmail
  if (input.contactPhone !== undefined) updates.contact_phone = input.contactPhone
  const { error } = await supabase.from("offices").update(updates).eq("id", id)
  if (error) throw error
}

export async function deleteOffice(id: string): Promise<void> {
  const { error } = await supabase.from("offices").delete().eq("id", id)
  if (error) throw error
}

// ====================== TRANSACTIONS ======================
export async function listTransactions(officeId?: string): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
  if (officeId) query = query.eq("office_id", officeId)
  const { data, error } = await query
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    officeId: row.office_id,
    type: row.type,
    category: row.category,
    description: row.description ?? "",
    amount: Number(row.amount),
    date: row.date,
    createdBy: row.created_by ?? "",
    createdAt: row.created_at,
  }))
}

export async function createTransaction(
  input: Omit<Transaction, "id" | "createdAt">,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      id: uid("txn"),
      office_id: input.officeId,
      type: input.type,
      category: input.category,
      description: input.description,
      amount: input.amount,
      date: input.date,
      created_by: input.createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    officeId: data.office_id,
    type: data.type,
    category: data.category,
    description: data.description ?? "",
    amount: Number(data.amount),
    date: data.date,
    createdBy: data.created_by ?? "",
    createdAt: data.created_at,
  }
}

export async function updateTransaction(id: string, input: Partial<Transaction>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (input.type !== undefined) updates.type = input.type
  if (input.category !== undefined) updates.category = input.category
  if (input.description !== undefined) updates.description = input.description
  if (input.amount !== undefined) updates.amount = input.amount
  if (input.date !== undefined) updates.date = input.date
  const { error } = await supabase.from("transactions").update(updates).eq("id", id)
  if (error) throw error
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id)
  if (error) throw error
}

// ====================== TASKS ======================
export async function listTasks(officeId?: string): Promise<Task[]> {
  let query = supabase
    .from("tasks")
    .select("*")
    .order("deadline", { ascending: true })
  if (officeId) query = query.eq("office_id", officeId)
  const { data, error } = await query
  if (error) throw error
  return data.map((row) => {
    const task: Task = {
      id: row.id,
      officeId: row.office_id,
      title: row.title,
      description: row.description ?? "",
      status: row.status,
      priority: row.priority,
      assignee: row.assignee ?? "",
      assigneeUserId: row.assignee_user_id ?? undefined,
      deadline: row.deadline,
      createdBy: row.created_by ?? "",
      createdAt: row.created_at,
      completedAt: row.completed_at ?? undefined,
    }
    return { ...task, status: resolveStatus(task) }
  })
}

export async function createTask(input: Omit<Task, "id" | "createdAt">): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      id: uid("task"),
      office_id: input.officeId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assignee: input.assignee,
      assignee_user_id: input.assigneeUserId,
      deadline: input.deadline,
      created_by: input.createdBy,
      completed_at: input.completedAt,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    officeId: data.office_id,
    title: data.title,
    description: data.description ?? "",
    status: data.status,
    priority: data.priority,
    assignee: data.assignee ?? "",
    assigneeUserId: data.assignee_user_id ?? undefined,
    deadline: data.deadline,
    createdBy: data.created_by ?? "",
    createdAt: data.created_at,
    completedAt: data.completed_at ?? undefined,
  }
}

export async function updateTask(id: string, input: Partial<Task>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.status !== undefined) updates.status = input.status
  if (input.priority !== undefined) updates.priority = input.priority
  if (input.assignee !== undefined) updates.assignee = input.assignee
  if (input.assigneeUserId !== undefined) updates.assignee_user_id = input.assigneeUserId
  if (input.deadline !== undefined) updates.deadline = input.deadline
  if (input.completedAt !== undefined) updates.completed_at = input.completedAt
  const { error } = await supabase.from("tasks").update(updates).eq("id", id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) throw error
}

// ====================== NOTIFICATIONS ======================
export async function listNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    officeId: row.office_id ?? null,
    category: row.category,
    title: row.title,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  }))
}

export async function createNotification(
  input: Omit<AppNotification, "id" | "createdAt" | "read">,
): Promise<AppNotification> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      id: uid("notif"),
      office_id: input.officeId,
      category: input.category,
      title: input.title,
      message: input.message,
      read: false,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    officeId: data.office_id ?? null,
    category: data.category,
    title: data.title,
    message: data.message,
    read: data.read,
    createdAt: data.created_at,
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
  if (error) throw error
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false)
  if (error) throw error
}

// ====================== USERS ======================
export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    _id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role,
    createdAt: data.created_at,
  }
}

export async function createUser(user: UserDoc): Promise<void> {
  const { error } = await supabase.from("users").insert({
    id: user._id,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    role: user.role,
    created_at: user.createdAt,
  })
  if (error) throw error
}

export async function countUsers(): Promise<number> {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
  if (error) throw error
  return count ?? 0
}

export async function listUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  }))
}

export async function updateUser(id: string, updates: Partial<UserDoc>): Promise<void> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.role !== undefined) dbUpdates.role = updates.role
  if (updates.passwordHash !== undefined) dbUpdates.password_hash = updates.passwordHash
  const { error } = await supabase.from("users").update(dbUpdates).eq("id", id)
  if (error) throw error
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", id)
  if (error) throw error
}

// ====================== PAYMENTS ======================
export async function listPayments(officeId?: string): Promise<Payment[]> {
  let query = supabase
    .from("payments")
    .select("*")
    .order("due_date", { ascending: true })
  if (officeId) query = query.eq("office_id", officeId)
  const { data, error } = await query
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    officeId: row.office_id,
    title: row.title,
    description: row.description ?? "",
    amount: Number(row.amount),
    dueDate: row.due_date,
    status: row.status,
    paidAmount: Number(row.paid_amount),
    paidAt: row.paid_at ?? undefined,
    createdBy: row.created_by ?? "",
    createdAt: row.created_at,
  }))
}

export async function createPayment(
  input: Omit<Payment, "id" | "createdAt">,
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      id: uid("pay"),
      office_id: input.officeId,
      title: input.title,
      description: input.description,
      amount: input.amount,
      due_date: input.dueDate,
      status: input.status,
      paid_amount: input.paidAmount,
      paid_at: input.paidAt,
      created_by: input.createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    officeId: data.office_id,
    title: data.title,
    description: data.description ?? "",
    amount: Number(data.amount),
    dueDate: data.due_date,
    status: data.status,
    paidAmount: Number(data.paid_amount),
    paidAt: data.paid_at ?? undefined,
    createdBy: data.created_by ?? "",
    createdAt: data.created_at,
  }
}

export async function updatePayment(id: string, input: Partial<Payment>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.amount !== undefined) updates.amount = input.amount
  if (input.dueDate !== undefined) updates.due_date = input.dueDate
  if (input.status !== undefined) updates.status = input.status
  if (input.paidAmount !== undefined) updates.paid_amount = input.paidAmount
  if (input.paidAt !== undefined) updates.paid_at = input.paidAt
  const { error } = await supabase.from("payments").update(updates).eq("id", id)
  if (error) throw error
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from("payments").delete().eq("id", id)
  if (error) throw error
}

// ====================== DAILY WORKS ======================
export async function listDailyWorks(options?: {
  officeId?: string
  userId?: string
  date?: string
}): Promise<DailyWork[]> {
  let query = supabase
    .from("daily_works")
    .select("*")
    .order("created_at", { ascending: false })
  if (options?.officeId) query = query.eq("office_id", options.officeId)
  if (options?.userId) query = query.eq("user_id", options.userId)
  if (options?.date) query = query.eq("date", options.date)
  const { data, error } = await query
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    userId: row.user_id ?? "",
    userName: row.user_name,
    officeId: row.office_id,
    title: row.title,
    description: row.description ?? "",
    date: row.date,
    hoursSpent: Number(row.hours_spent),
    status: row.status,
    taskId: row.task_id ?? undefined,
    createdAt: row.created_at,
  }))
}

export async function createDailyWork(
  input: Omit<DailyWork, "id" | "createdAt">,
): Promise<DailyWork> {
  const { data, error } = await supabase
    .from("daily_works")
    .insert({
      id: uid("dw"),
      user_id: input.userId,
      user_name: input.userName,
      office_id: input.officeId,
      title: input.title,
      description: input.description,
      date: input.date,
      hours_spent: input.hoursSpent,
      status: input.status,
      task_id: input.taskId,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id ?? "",
    userName: data.user_name,
    officeId: data.office_id,
    title: data.title,
    description: data.description ?? "",
    date: data.date,
    hoursSpent: Number(data.hours_spent),
    status: data.status,
    taskId: data.task_id ?? undefined,
    createdAt: data.created_at,
  }
}

export async function updateDailyWork(id: string, input: Partial<DailyWork>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.status !== undefined) updates.status = input.status
  if (input.hoursSpent !== undefined) updates.hours_spent = input.hoursSpent
  if (input.date !== undefined) updates.date = input.date
  const { error } = await supabase.from("daily_works").update(updates).eq("id", id)
  if (error) throw error
}

export async function deleteDailyWork(id: string): Promise<void> {
  const { error } = await supabase.from("daily_works").delete().eq("id", id)
  if (error) throw error
}
