import "server-only"
import { getDb, isDbConfigured } from "./mongodb"
import {
  seedOffices,
  seedTransactions,
  seedTasks,
  seedNotifications,
  resolveStatus,
} from "./seed"
import type {
  Office,
  Transaction,
  Task,
  Notification,
  UserDoc,
} from "./types"

// ----- In-memory fallback store (used when MONGODB_URI is absent) -----
type MemStore = {
  offices: Office[]
  transactions: Transaction[]
  tasks: Task[]
  notifications: Notification[]
  users: UserDoc[]
  seeded: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var _riomsMem: MemStore | undefined
}

function mem(): MemStore {
  if (!global._riomsMem) {
    global._riomsMem = {
      offices: [...seedOffices],
      transactions: [...seedTransactions],
      tasks: [...seedTasks],
      notifications: [...seedNotifications],
      users: [],
      seeded: true,
    }
  }
  return global._riomsMem
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ----- Mongo seeding -----
async function ensureSeeded() {
  const db = await getDb()
  const officeCount = await db.collection("offices").countDocuments()
  if (officeCount === 0) {
    await db.collection<Office>("offices").insertMany(seedOffices.map((o) => ({ ...o })))
    await db
      .collection<Transaction>("transactions")
      .insertMany(seedTransactions.map((t) => ({ ...t })))
    await db.collection<Task>("tasks").insertMany(seedTasks.map((t) => ({ ...t })))
    await db
      .collection<Notification>("notifications")
      .insertMany(seedNotifications.map((n) => ({ ...n })))
    // Indexes
    await db.collection("transactions").createIndex({ officeId: 1, date: -1 })
    await db.collection("tasks").createIndex({ officeId: 1, deadline: 1, status: 1 })
    await db.collection("notifications").createIndex({ createdAt: -1 })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
  }
}

function strip<T extends Record<string, unknown>>(doc: T): Omit<T, "_id"> {
  const { _id, ...rest } = doc as T & { _id?: unknown }
  void _id
  return rest
}

// ====================== OFFICES ======================
export async function listOffices(): Promise<Office[]> {
  if (!isDbConfigured()) return mem().offices
  await ensureSeeded()
  const db = await getDb()
  const docs = await db.collection<Office>("offices").find().sort({ createdAt: 1 }).toArray()
  return docs.map((d) => strip(d) as Office)
}

export async function createOffice(input: Omit<Office, "id" | "createdAt">): Promise<Office> {
  const office: Office = { ...input, id: uid("office"), createdAt: new Date().toISOString() }
  if (!isDbConfigured()) {
    mem().offices.push(office)
    return office
  }
  const db = await getDb()
  await db.collection<Office>("offices").insertOne({ ...office })
  return office
}

export async function updateOffice(id: string, input: Partial<Office>): Promise<void> {
  if (!isDbConfigured()) {
    const o = mem().offices.find((x) => x.id === id)
    if (o) Object.assign(o, input)
    return
  }
  const db = await getDb()
  const { id: _omit, ...rest } = input
  void _omit
  await db.collection<Office>("offices").updateOne({ id }, { $set: rest })
}

export async function deleteOffice(id: string): Promise<void> {
  if (!isDbConfigured()) {
    const m = mem()
    m.offices = m.offices.filter((o) => o.id !== id)
    m.transactions = m.transactions.filter((t) => t.officeId !== id)
    m.tasks = m.tasks.filter((t) => t.officeId !== id)
    return
  }
  const db = await getDb()
  await db.collection("offices").deleteOne({ id })
  await db.collection("transactions").deleteMany({ officeId: id })
  await db.collection("tasks").deleteMany({ officeId: id })
}

// ====================== TRANSACTIONS ======================
export async function listTransactions(officeId?: string): Promise<Transaction[]> {
  if (!isDbConfigured()) {
    const all = mem().transactions
    return (officeId ? all.filter((t) => t.officeId === officeId) : all).sort(
      (a, b) => +new Date(b.date) - +new Date(a.date),
    )
  }
  await ensureSeeded()
  const db = await getDb()
  const filter = officeId ? { officeId } : {}
  const docs = await db
    .collection<Transaction>("transactions")
    .find(filter)
    .sort({ date: -1 })
    .toArray()
  return docs.map((d) => strip(d) as Transaction)
}

export async function createTransaction(
  input: Omit<Transaction, "id" | "createdAt">,
): Promise<Transaction> {
  const txn: Transaction = { ...input, id: uid("txn"), createdAt: new Date().toISOString() }
  if (!isDbConfigured()) {
    mem().transactions.push(txn)
    return txn
  }
  const db = await getDb()
  await db.collection<Transaction>("transactions").insertOne({ ...txn })
  return txn
}

export async function deleteTransaction(id: string): Promise<void> {
  if (!isDbConfigured()) {
    const m = mem()
    m.transactions = m.transactions.filter((t) => t.id !== id)
    return
  }
  const db = await getDb()
  await db.collection("transactions").deleteOne({ id })
}

export async function updateTransaction(id: string, input: Partial<Transaction>): Promise<void> {
  if (!isDbConfigured()) {
    const t = mem().transactions.find((x) => x.id === id)
    if (t) Object.assign(t, input)
    return
  }
  const db = await getDb()
  const { id: _omit, ...rest } = input
  void _omit
  await db.collection<Transaction>("transactions").updateOne({ id }, { $set: rest })
}

// ====================== TASKS ======================
export async function listTasks(officeId?: string): Promise<Task[]> {
  let tasks: Task[]
  if (!isDbConfigured()) {
    tasks = officeId ? mem().tasks.filter((t) => t.officeId === officeId) : mem().tasks
  } else {
    await ensureSeeded()
    const db = await getDb()
    const filter = officeId ? { officeId } : {}
    const docs = await db.collection<Task>("tasks").find(filter).sort({ deadline: 1 }).toArray()
    tasks = docs.map((d) => strip(d) as Task)
  }
  // resolve live overdue status
  return tasks
    .map((t) => ({ ...t, status: resolveStatus(t) }))
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))
}

export async function createTask(input: Omit<Task, "id" | "createdAt">): Promise<Task> {
  const task: Task = { ...input, id: uid("task"), createdAt: new Date().toISOString() }
  if (!isDbConfigured()) {
    mem().tasks.push(task)
    return task
  }
  const db = await getDb()
  await db.collection<Task>("tasks").insertOne({ ...task })
  return task
}

export async function updateTask(id: string, input: Partial<Task>): Promise<void> {
  if (!isDbConfigured()) {
    const t = mem().tasks.find((x) => x.id === id)
    if (t) Object.assign(t, input)
    return
  }
  const db = await getDb()
  const { id: _omit, ...rest } = input
  void _omit
  await db.collection<Task>("tasks").updateOne({ id }, { $set: rest })
}

export async function deleteTask(id: string): Promise<void> {
  if (!isDbConfigured()) {
    const m = mem()
    m.tasks = m.tasks.filter((t) => t.id !== id)
    return
  }
  const db = await getDb()
  await db.collection("tasks").deleteOne({ id })
}

// ====================== NOTIFICATIONS ======================
export async function listNotifications(): Promise<Notification[]> {
  if (!isDbConfigured()) {
    return [...mem().notifications].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    )
  }
  await ensureSeeded()
  const db = await getDb()
  const docs = await db
    .collection<Notification>("notifications")
    .find()
    .sort({ createdAt: -1 })
    .toArray()
  return docs.map((d) => strip(d) as Notification)
}

export async function createNotification(
  input: Omit<Notification, "id" | "createdAt" | "read">,
): Promise<Notification> {
  const notif: Notification = {
    ...input,
    id: uid("notif"),
    read: false,
    createdAt: new Date().toISOString(),
  }
  if (!isDbConfigured()) {
    mem().notifications.push(notif)
    return notif
  }
  const db = await getDb()
  await db.collection<Notification>("notifications").insertOne({ ...notif })
  return notif
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isDbConfigured()) {
    const n = mem().notifications.find((x) => x.id === id)
    if (n) n.read = true
    return
  }
  const db = await getDb()
  await db.collection("notifications").updateOne({ id }, { $set: { read: true } })
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!isDbConfigured()) {
    mem().notifications.forEach((n) => (n.read = true))
    return
  }
  const db = await getDb()
  await db.collection("notifications").updateMany({ read: false }, { $set: { read: true } })
}

// ====================== USERS ======================
export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  if (!isDbConfigured()) {
    return mem().users.find((u) => u.email === email) || null
  }
  const db = await getDb()
  const doc = await db.collection<UserDoc>("users").findOne({ email })
  return doc ? (strip(doc) as UserDoc) : null
}

export async function createUser(user: UserDoc): Promise<void> {
  if (!isDbConfigured()) {
    mem().users.push(user)
    return
  }
  const db = await getDb()
  await db.collection<UserDoc>("users").insertOne({ ...user })
}

export async function countUsers(): Promise<number> {
  if (!isDbConfigured()) return mem().users.length
  const db = await getDb()
  return db.collection("users").countDocuments()
}
