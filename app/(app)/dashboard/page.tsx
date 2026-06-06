import { requireSession } from "@/app/actions/auth"
import {
  listOffices,
  listTransactions,
  listTasks,
} from "@/lib/data"
import {
  summarize,
  monthlySeries,
  officeMetrics,
  businessInsights,
  taskStats,
  categoryBreakdown,
} from "@/lib/analytics"
import { formatCurrency } from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  RevenueExpenseChart,
  ProfitTrendChart,
  CategoryPieChart,
  OfficeComparisonChart,
} from "@/components/charts"
import { OfficeComparison } from "@/components/office-comparison"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Wallet,
  Trophy,
  CalendarArrowUp,
  CalendarArrowDown,
  ListChecks,
  AlertTriangle,
} from "lucide-react"

export default async function DashboardPage({
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

  const summary = summarize(transactions)
  const monthly = monthlySeries(transactions)
  const insights = businessInsights(allTransactions, offices)
  const tStats = taskStats(tasks)
  const expenseCategories = categoryBreakdown(transactions, "expense")

  const comparison = offices.map((o) => {
    const m = officeMetrics(allTransactions, o.id)
    return {
      officeId: o.id,
      officeName: o.name,
      office: o.name,
      revenue: m.revenue,
      expenses: m.expenses,
      profit: m.profit,
    }
  })

  const activeOffice = officeId ? offices.find((o) => o.id === officeId) : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={
          activeOffice
            ? `Revenue intelligence for ${activeOffice.name}`
            : "Company-wide revenue intelligence across all offices"
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={IndianRupee}
          accent="primary"
          hint={`Avg ${formatCurrency(summary.avgDailyRevenue)}/day`}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={Wallet}
          accent="destructive"
        />
        <StatCard
          title={summary.isProfit ? "Net Profit" : "Net Loss"}
          value={formatCurrency(Math.abs(summary.netProfit))}
          icon={summary.isProfit ? TrendingUp : TrendingDown}
          accent={summary.isProfit ? "success" : "destructive"}
          hint={`${summary.margin.toFixed(1)}% margin`}
        />
        <StatCard
          title="Revenue Growth"
          value={`${summary.growthRate >= 0 ? "+" : ""}${summary.growthRate.toFixed(1)}%`}
          icon={summary.growthRate >= 0 ? TrendingUp : TrendingDown}
          accent={summary.growthRate >= 0 ? "success" : "warning"}
          hint="Month over month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueExpenseChart data={monthly} />
        <ProfitTrendChart data={monthly} />
      </div>

      {/* Office comparison + insights */}
      {!officeId && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <OfficeComparisonChart data={comparison} />
          <OfficeComparison stats={comparison} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CategoryPieChart data={expenseCategories} title="Expense Breakdown" />

        {/* Business insights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Business Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InsightRow
              icon={Trophy}
              label="Best Performing Office"
              value={insights.bestOffice?.office.name ?? "N/A"}
              sub={insights.bestOffice ? formatCurrency(insights.bestOffice.profit) : ""}
            />
            <InsightRow
              icon={CalendarArrowUp}
              label="Highest Revenue Month"
              value={insights.highestRevenueMonth?.month ?? "N/A"}
              sub={
                insights.highestRevenueMonth
                  ? formatCurrency(insights.highestRevenueMonth.revenue)
                  : ""
              }
            />
            <InsightRow
              icon={CalendarArrowDown}
              label="Highest Expense Month"
              value={insights.highestExpenseMonth?.month ?? "N/A"}
              sub={
                insights.highestExpenseMonth
                  ? formatCurrency(insights.highestExpenseMonth.expenses)
                  : ""
              }
            />
            <InsightRow
              icon={insights.profitTrend === "up" ? TrendingUp : TrendingDown}
              label="Profit Trend"
              value={
                insights.profitTrend === "up"
                  ? "Improving"
                  : insights.profitTrend === "down"
                    ? "Declining"
                    : "Stable"
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Pending works summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Pending Works Summary</CardTitle>
          {tStats.overdue > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {tStats.overdue} overdue
            </Badge>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <TaskStat label="Total Tasks" value={tStats.total} icon={ListChecks} />
          <TaskStat label="Completed" value={tStats.completed} tone="success" />
          <TaskStat label="Pending" value={tStats.pending + tStats.inProgress} tone="warning" />
          <TaskStat label="Overdue" value={tStats.overdue} tone="destructive" />
        </CardContent>
      </Card>
    </div>
  )
}

function InsightRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-semibold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

function TaskStat({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: number
  icon?: React.ComponentType<{ className?: string }>
  tone?: "default" | "success" | "warning" | "destructive"
}) {
  const toneClass =
    tone === "success"
      ? "text-[var(--success)]"
      : tone === "warning"
        ? "text-[var(--warning)]"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground"
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <span className={`text-2xl font-bold ${toneClass}`}>{value}</span>
    </div>
  )
}
