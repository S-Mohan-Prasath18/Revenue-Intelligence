import type { Transaction, Task, Office } from "./types"

export interface OfficeMetrics {
  officeId: string
  revenue: number
  expenses: number
  profit: number
  transactionCount: number
}

export interface MonthPoint {
  month: string // "Jan 2026"
  monthKey: string // "2026-00"
  revenue: number
  expenses: number
  profit: number
}

export interface RevenueSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  margin: number // percentage
  avgDailyRevenue: number
  growthRate: number // percentage month-over-month (latest vs previous)
  isProfit: boolean
}

function monthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

export function summarize(transactions: Transaction[]): RevenueSummary {
  let totalRevenue = 0
  let totalExpenses = 0
  const days = new Set<string>()

  for (const t of transactions) {
    if (t.type === "income") totalRevenue += t.amount
    else totalExpenses += t.amount
    days.add(t.date.slice(0, 10))
  }

  const netProfit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const avgDailyRevenue = days.size > 0 ? totalRevenue / days.size : 0

  // growth: compare latest month revenue to previous month revenue
  const monthly = monthlySeries(transactions)
  let growthRate = 0
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1].revenue
    const prev = monthly[monthly.length - 2].revenue
    if (prev > 0) growthRate = ((last - prev) / prev) * 100
  }

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    margin,
    avgDailyRevenue,
    growthRate,
    isProfit: netProfit >= 0,
  }
}

export function monthlySeries(transactions: Transaction[]): MonthPoint[] {
  const map = new Map<string, MonthPoint>()
  for (const t of transactions) {
    const key = monthKey(t.date)
    if (!map.has(key)) {
      map.set(key, {
        month: monthLabel(t.date),
        monthKey: key,
        revenue: 0,
        expenses: 0,
        profit: 0,
      })
    }
    const p = map.get(key)!
    if (t.type === "income") p.revenue += t.amount
    else p.expenses += t.amount
    p.profit = p.revenue - p.expenses
  }
  return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey))
}

export function officeMetrics(transactions: Transaction[], officeId: string): OfficeMetrics {
  const subset = transactions.filter((t) => t.officeId === officeId)
  let revenue = 0
  let expenses = 0
  for (const t of subset) {
    if (t.type === "income") revenue += t.amount
    else expenses += t.amount
  }
  return {
    officeId,
    revenue,
    expenses,
    profit: revenue - expenses,
    transactionCount: subset.length,
  }
}

export interface BusinessInsights {
  bestOffice: { office: Office; profit: number } | null
  highestRevenueMonth: MonthPoint | null
  highestExpenseMonth: MonthPoint | null
  profitTrend: "up" | "down" | "flat"
}

export function businessInsights(
  transactions: Transaction[],
  offices: Office[],
): BusinessInsights {
  let bestOffice: BusinessInsights["bestOffice"] = null
  for (const o of offices) {
    const m = officeMetrics(transactions, o.id)
    if (!bestOffice || m.profit > bestOffice.profit) {
      bestOffice = { office: o, profit: m.profit }
    }
  }

  const monthly = monthlySeries(transactions)
  let highestRevenueMonth: MonthPoint | null = null
  let highestExpenseMonth: MonthPoint | null = null
  for (const m of monthly) {
    if (!highestRevenueMonth || m.revenue > highestRevenueMonth.revenue) highestRevenueMonth = m
    if (!highestExpenseMonth || m.expenses > highestExpenseMonth.expenses) highestExpenseMonth = m
  }

  let profitTrend: "up" | "down" | "flat" = "flat"
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1].profit
    const prev = monthly[monthly.length - 2].profit
    if (last > prev) profitTrend = "up"
    else if (last < prev) profitTrend = "down"
  }

  return { bestOffice, highestRevenueMonth, highestExpenseMonth, profitTrend }
}

export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  cancelled: number
  completionRate: number
}

export function taskStats(tasks: Task[]): TaskStats {
  const stats = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    cancelled: 0,
    completionRate: 0,
  }
  for (const t of tasks) {
    if (t.status === "pending") stats.pending++
    else if (t.status === "in_progress") stats.inProgress++
    else if (t.status === "completed") stats.completed++
    else if (t.status === "overdue") stats.overdue++
    else if (t.status === "cancelled") stats.cancelled++
  }
  stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  return stats
}

export function categoryBreakdown(
  transactions: Transaction[],
  type: "income" | "expense",
): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== type) continue
    map.set(t.category, (map.get(t.category) || 0) + t.amount)
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

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
