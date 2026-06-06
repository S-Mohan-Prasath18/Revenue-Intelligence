import { requireSession } from "@/app/actions/auth"
import { listOffices, listTransactions, listTasks } from "@/lib/data"
import { monthlySeries, officeMetrics } from "@/lib/analytics"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import {
  ReportsView,
  type PeriodRow,
  type OfficeRow,
  type TaskRow,
} from "@/components/reports-view"
import type { Transaction } from "@/lib/types"

function dailySeries(transactions: Transaction[]): PeriodRow[] {
  const map = new Map<string, PeriodRow>()
  for (const t of transactions) {
    const key = t.date.slice(0, 10)
    if (!map.has(key)) {
      map.set(key, { period: formatDate(t.date), revenue: 0, expenses: 0, profit: 0 })
    }
    const row = map.get(key)!
    if (t.type === "income") row.revenue += t.amount
    else row.expenses += t.amount
    row.profit = row.revenue - row.expenses
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([, v]) => v)
    .slice(0, 60)
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string }>
}) {
  await requireSession()
  const { office: officeParam } = await searchParams
  const officeId = officeParam && officeParam !== "all" ? officeParam : undefined

  const [offices, transactions, tasks] = await Promise.all([
    listOffices(),
    listTransactions(officeId),
    listTasks(officeId),
  ])
  const allTransactions = officeId ? await listTransactions() : transactions

  const daily = dailySeries(transactions)
  const monthly: PeriodRow[] = monthlySeries(transactions).map((m) => ({
    period: m.month,
    revenue: m.revenue,
    expenses: m.expenses,
    profit: m.profit,
  }))

  const officeRows: OfficeRow[] = offices.map((o) => {
    const m = officeMetrics(allTransactions, o.id)
    const margin = m.revenue > 0 ? `${((m.profit / m.revenue) * 100).toFixed(1)}%` : "—"
    return {
      office: o.name,
      revenue: m.revenue,
      expenses: m.expenses,
      profit: m.profit,
      margin,
    }
  })

  const officeName = (id: string) => offices.find((o) => o.id === id)?.name ?? "Unknown"
  const taskRows: TaskRow[] = tasks.map((t) => ({
    title: t.title,
    office: officeName(t.officeId),
    assignee: t.assignee,
    priority: t.priority,
    status: t.status,
    deadline: formatDate(t.deadline),
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Generate and export revenue, office, and operational reports."
      />
      <ReportsView daily={daily} monthly={monthly} offices={officeRows} tasks={taskRows} />
    </div>
  )
}
