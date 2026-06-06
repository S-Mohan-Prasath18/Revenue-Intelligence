import type {
  Office,
  Transaction,
  Task,
  Notification,
  TaskStatus,
} from "./types"

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

function monthsAgoDay(monthsAgo: number, day: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  d.setDate(day)
  return d.toISOString()
}

export const seedOffices: Office[] = [
  {
    id: "office-a",
    name: "Office A — Chennai",
    type: "headquarters",
    location: "Chennai, Tamil Nadu",
    contactName: "Arjun Mehta",
    contactEmail: "arjun@rioms.co",
    contactPhone: "+91 98400 11223",
    createdAt: monthsAgoDay(8, 1),
  },
  {
    id: "office-b",
    name: "Office B — Coimbatore",
    type: "branch",
    location: "Coimbatore, Tamil Nadu",
    contactName: "Priya Nair",
    contactEmail: "priya@rioms.co",
    contactPhone: "+91 99520 44556",
    createdAt: monthsAgoDay(6, 5),
  },
]

const incomeCategories = ["Consulting", "Product Sales", "Subscriptions", "Services", "Licensing"]
const expenseCategories = ["Salaries", "Rent", "Marketing", "Utilities", "Software", "Travel"]

function buildTransactions(): Transaction[] {
  const txns: Transaction[] = []
  let counter = 0
  const offices = ["office-a", "office-b"]

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    for (const officeId of offices) {
      const officeFactor = officeId === "office-a" ? 1.35 : 1
      // a few income entries per month
      const incomeEntries = 4
      for (let i = 0; i < incomeEntries; i++) {
        const base = 180000 + Math.round(Math.random() * 120000)
        const growth = 1 + (5 - monthsAgo) * 0.04
        txns.push({
          id: `txn-${counter++}`,
          officeId,
          type: "income",
          category: incomeCategories[i % incomeCategories.length],
          description: `${incomeCategories[i % incomeCategories.length]} revenue`,
          amount: Math.round(base * officeFactor * growth),
          date: monthsAgoDay(monthsAgo, 4 + i * 6),
          createdBy: "seed",
          createdAt: monthsAgoDay(monthsAgo, 4 + i * 6),
        })
      }
      const expenseEntries = 4
      for (let i = 0; i < expenseEntries; i++) {
        const base = 90000 + Math.round(Math.random() * 70000)
        txns.push({
          id: `txn-${counter++}`,
          officeId,
          type: "expense",
          category: expenseCategories[i % expenseCategories.length],
          description: `${expenseCategories[i % expenseCategories.length]} cost`,
          amount: Math.round(base * officeFactor),
          date: monthsAgoDay(monthsAgo, 6 + i * 6),
          createdBy: "seed",
          createdAt: monthsAgoDay(monthsAgo, 6 + i * 6),
        })
      }
    }
  }
  return txns
}

export const seedTransactions: Transaction[] = buildTransactions()

export const seedTasks: Task[] = [
  {
    id: "task-1",
    officeId: "office-a",
    title: "Finalize Q3 financial audit",
    description: "Coordinate with external auditors and compile ledgers.",
    status: "in_progress",
    priority: "high",
    assignee: "Arjun Mehta",
    deadline: daysFromNow(1),
    createdBy: "seed",
    createdAt: daysFromNow(-6),
  },
  {
    id: "task-2",
    officeId: "office-a",
    title: "Renew office lease agreement",
    description: "Lease expires soon; negotiate new terms.",
    status: "pending",
    priority: "high",
    assignee: "Priya Nair",
    deadline: daysFromNow(-2),
    createdBy: "seed",
    createdAt: daysFromNow(-10),
  },
  {
    id: "task-3",
    officeId: "office-b",
    title: "Onboard 3 new sales hires",
    description: "Complete paperwork and system access.",
    status: "in_progress",
    priority: "medium",
    assignee: "Karthik R",
    deadline: daysFromNow(3),
    createdBy: "seed",
    createdAt: daysFromNow(-4),
  },
  {
    id: "task-4",
    officeId: "office-b",
    title: "Submit GST filing",
    description: "Monthly compliance submission.",
    status: "completed",
    priority: "high",
    assignee: "Priya Nair",
    deadline: daysFromNow(-5),
    createdBy: "seed",
    createdAt: daysFromNow(-12),
    completedAt: daysFromNow(-6),
  },
  {
    id: "task-5",
    officeId: "office-a",
    title: "Launch new marketing campaign",
    description: "Coordinate creative and media buying.",
    status: "pending",
    priority: "medium",
    assignee: "Divya S",
    deadline: daysFromNow(7),
    createdBy: "seed",
    createdAt: daysFromNow(-2),
  },
  {
    id: "task-6",
    officeId: "office-b",
    title: "Quarterly inventory reconciliation",
    description: "Match physical stock against records.",
    status: "pending",
    priority: "low",
    assignee: "Karthik R",
    deadline: daysFromNow(12),
    createdBy: "seed",
    createdAt: daysFromNow(-1),
  },
]

export const seedNotifications: Notification[] = [
  {
    id: "notif-1",
    officeId: "office-a",
    category: "deadline",
    title: "Deadline today",
    message: "Task 'Finalize Q3 financial audit' is due today.",
    read: false,
    createdAt: daysFromNow(0),
  },
  {
    id: "notif-2",
    officeId: "office-a",
    category: "deadline",
    title: "Overdue task",
    message: "Task 'Renew office lease agreement' is overdue.",
    read: false,
    createdAt: daysFromNow(-1),
  },
  {
    id: "notif-3",
    officeId: "office-b",
    category: "revenue",
    title: "Revenue milestone",
    message: "Office B crossed monthly revenue target.",
    read: true,
    createdAt: daysFromNow(-2),
  },
]

// Compute live status for a task based on its deadline
export function resolveStatus(task: Task): TaskStatus {
  if (task.status === "completed") return "completed"
  const now = Date.now()
  const deadline = new Date(task.deadline).getTime()
  if (deadline < now) return "overdue"
  return task.status
}
