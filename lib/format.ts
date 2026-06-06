export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompact(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 1,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export type DeadlineLevel = "overdue" | "today" | "upcoming" | "later"

export interface DeadlineInfo {
  level: DeadlineLevel
  days: number // negative if past, 0 today, positive upcoming
  label: string
}

export function deadlineInfo(deadline: string, completed = false): DeadlineInfo {
  const now = new Date()
  const d = new Date(deadline)
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDeadline = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const days = Math.round((+startDeadline - +startToday) / 86400000)

  if (completed) {
    return { level: "later", days, label: `Due ${formatDate(deadline)}` }
  }
  if (days < 0) {
    return { level: "overdue", days, label: `Overdue by ${Math.abs(days)}d` }
  }
  if (days === 0) {
    return { level: "today", days, label: "Due today" }
  }
  if (days <= 3) {
    return { level: "upcoming", days, label: `Due in ${days}d` }
  }
  return { level: "later", days, label: `Due ${formatDate(deadline)}` }
}
