import { requireSession } from "@/app/actions/auth"
import {
  listOffices,
  listTransactions,
  listTasks,
  listPayments,
  listDailyWorks,
  listUsers,
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
import { PaymentDialog } from "@/components/payment-dialog"
import { DailyWorkDialog } from "@/components/daily-work-dialog"
import { DailyWorkStatusControl } from "@/components/daily-work-status-control"
import { PaymentStatusControl } from "@/components/payment-status-control"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeleteButton } from "@/components/delete-button"
import { deletePaymentAction } from "@/app/actions/payments"
import { deleteDailyWorkAction } from "@/app/actions/dailyworks"
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
  CreditCard,
  ClipboardList,
  CheckCircle2,
  Clock,
  CircleDot,
  XCircle,
  UserCheck,
} from "lucide-react"
import type { Payment, DailyWork, Office, User } from "@/lib/types"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string }>
}) {
  const session = await requireSession()
  const { office: officeParam } = await searchParams
  const officeId = officeParam && officeParam !== "all" ? officeParam : undefined

  const today = new Date().toISOString().split("T")[0]

  const [offices, transactions, tasks, payments, dailyWorks, users] = await Promise.all([
    listOffices(),
    listTransactions(officeId),
    listTasks(officeId),
    listPayments(officeId),
    listDailyWorks({ date: today }),
    listUsers(),
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

  // Payment stats
  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "partial")
  const overduePayments = payments.filter((p) => p.status === "overdue")
  const totalPendingAmount = pendingPayments.reduce((s, p) => s + (p.amount - p.paidAmount), 0)
  const totalOverdueAmount = overduePayments.reduce((s, p) => s + (p.amount - p.paidAmount), 0)

  const isAdmin = session.role === "admin"

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
        <Card className="lg:col-span-2 card-premium border-0">
          <CardHeader className="border-b border-border/50 bg-card/50 pb-4">
            <CardTitle className="text-gradient-gold text-lg font-bold">Business Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-5">
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

      {/* Pending Works Summary */}
      <Card className="card-premium border-0">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/50 pb-4">
          <CardTitle className="text-gradient-gold text-lg font-bold">Pending Works Summary</CardTitle>
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

      {/* ═══════════════════ PENDING PAYMENTS PANEL ═══════════════════ */}
      <Card className="card-premium border-0">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/50 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-gradient-gold text-lg font-bold">Pending Payments</CardTitle>
            {overduePayments.length > 0 && (
              <Badge variant="destructive" className="gap-1 ml-1">
                <AlertTriangle className="h-3 w-3" />
                {overduePayments.length} overdue
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && <PaymentDialog offices={offices} />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 shadow-sm">
              <p className="text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">Total Pending</p>
              <p className="stat-value mt-1">{formatCurrency(totalPendingAmount)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-destructive/5 p-4 shadow-sm">
              <p className="text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">Overdue Amount</p>
              <p className="stat-value text-destructive mt-1">{formatCurrency(totalOverdueAmount)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 shadow-sm">
              <p className="text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">Pending Items</p>
              <p className="stat-value mt-1">{pendingPayments.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 shadow-sm">
              <p className="text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">Total Records</p>
              <p className="stat-value mt-1">{payments.length}</p>
            </div>
          </div>

          {/* Payment list */}
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <CreditCard className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              {isAdmin && <PaymentDialog offices={offices} />}
            </div>
          ) : (
            <div className="divide-y rounded-lg border overflow-hidden">
              {payments.slice(0, 8).map((p) => (
                <PaymentRow
                  key={p.id}
                  payment={p}
                  officeName={offices.find((o) => o.id === p.officeId)?.name ?? "Unknown"}
                  isAdmin={isAdmin}
                  offices={offices}
                />
              ))}
              {payments.length > 8 && (
                <div className="px-4 py-2 text-center text-xs text-muted-foreground bg-muted/20">
                  +{payments.length - 8} more payments
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════ DAILY WORKS PANEL ═══════════════════ */}
      <Card className="card-premium border-0">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/50 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-gradient-gold text-lg font-bold">Daily Works</CardTitle>
            <Badge variant="secondary" className="ml-1">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </Badge>
          </div>
          <DailyWorkDialog offices={offices} users={isAdmin ? users : undefined} isAdmin={isAdmin} />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 shadow-sm">
              <p className="text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">Total Logged</p>
              <p className="stat-value mt-1">{dailyWorks.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-success/5 p-4 shadow-sm">
              <p className="text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">Completed</p>
              <p className="stat-value text-success mt-1">
                {dailyWorks.filter((w) => w.status === "done").length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 shadow-sm">
              <p className="text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">Total Hours</p>
              <p className="stat-value mt-1">
                {dailyWorks.reduce((s, w) => s + w.hoursSpent, 0).toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Work entries */}
          {dailyWorks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No work logged yet for today.</p>
              <DailyWorkDialog offices={offices} users={isAdmin ? users : undefined} isAdmin={isAdmin} />
            </div>
          ) : (
            <div className="divide-y rounded-lg border overflow-hidden">
              {dailyWorks.map((w) => (
                <DailyWorkRow
                  key={w.id}
                  work={w}
                  officeName={offices.find((o) => o.id === w.officeId)?.name ?? "Unknown"}
                  isAdmin={isAdmin}
                  currentUserId={session.userId}
                  offices={offices}
                  users={users}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

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
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-secondary/30 p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
        <p className="text-2xl font-black text-[var(--stat-value-color)] mt-0.5">{value}</p>
        {sub && <p className="text-sm font-semibold text-primary mt-0.5">{sub}</p>}
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
  const toneColor =
    tone === "success" ? "text-success"
    : tone === "warning" ? "text-warning"
    : tone === "destructive" ? "text-destructive"
    : "text-[var(--stat-value-color)]"
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary/30 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[0.75rem] font-semibold tracking-wider text-muted-foreground uppercase">
        {Icon && <Icon className={`h-4 w-4 ${toneColor}`} />}
        {label}
      </div>
      <span className={`stat-value ${toneColor}`}>{value}</span>
    </div>
  )
}

const PAYMENT_STATUS_CONFIG = {
  pending: { label: "Pending", className: "text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30", icon: Clock },
  partial: { label: "Partial", className: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: CircleDot },
  paid: { label: "Paid", className: "text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/30", icon: CheckCircle2 },
  overdue: { label: "Overdue", className: "text-destructive bg-destructive/10 border-destructive/30", icon: XCircle },
}

function PaymentRow({
  payment,
  officeName,
  isAdmin,
  offices,
}: {
  payment: Payment
  officeName: string
  isAdmin: boolean
  offices: Office[]
}) {
  const cfg = PAYMENT_STATUS_CONFIG[payment.status]
  const StatusIcon = cfg.icon
  const remaining = payment.amount - payment.paidAmount
  const dueDate = new Date(payment.dueDate)
  const isOverdue = dueDate < new Date() && payment.status !== "paid"

  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors border-b border-border/50 hover:bg-secondary/30">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cfg.className}`}>
        <StatusIcon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-[0.9375rem] font-bold text-foreground truncate">{payment.title}</p>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${cfg.className}`}>
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-muted-foreground">{officeName}</p>
          <span className="text-border text-xs">•</span>
          <p className={`text-sm ${isOverdue ? "font-bold text-destructive" : "text-muted-foreground"}`}>
            Due {dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[1.05rem] font-extrabold text-primary">{formatCurrency(payment.amount)}</p>
        {payment.paidAmount > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">Paid: {formatCurrency(payment.paidAmount)}</p>
        )}
        {remaining > 0 && payment.status !== "paid" && (
          <p className="text-xs font-bold text-destructive mt-0.5">Due: {formatCurrency(remaining)}</p>
        )}
      </div>
      {/* Inline status control */}
      {isAdmin && (
        <div className="shrink-0 ml-1">
          <PaymentStatusControl id={payment.id} status={payment.status} paidAmount={payment.paidAmount} />
        </div>
      )}
      {isAdmin && (
        <div className="flex items-center gap-1 shrink-0">
          <PaymentDialog offices={offices} payment={payment} />
          <DeleteButton
            id={payment.id}
            action={deletePaymentAction}
            title="Delete payment?"
            description={`This will permanently remove "${payment.title}".`}
            successMessage="Payment deleted"
          />
        </div>
      )}
    </div>
  )
}

const WORK_STATUS_CONFIG: Record<string, { label: string, className: string, icon: any }> = {
  done: { label: "Done", className: "text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/30", icon: CheckCircle2 },
  in_progress: { label: "In Progress", className: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: Clock },
  pending: { label: "Pending", className: "text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30", icon: CircleDot },
  cancelled: { label: "Cancelled", className: "text-muted-foreground bg-muted/10 border-muted/30", icon: XCircle },
}

function DailyWorkRow({
  work,
  officeName,
  isAdmin,
  currentUserId,
  offices,
  users,
}: {
  work: DailyWork
  officeName: string
  isAdmin: boolean
  currentUserId: string
  offices: Office[]
  users: User[]
}) {
  const cfg = WORK_STATUS_CONFIG[work.status]
  const StatusIcon = cfg.icon
  const canModify = isAdmin || work.userId === currentUserId

  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors border-b border-border/50 hover:bg-secondary/30">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cfg.className}`}>
        <StatusIcon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-[0.9375rem] font-bold text-foreground truncate">{work.title}</p>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${cfg.className}`}>
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">{work.userName}</p>
          </div>
          <span className="text-border text-xs">•</span>
          <p className="text-sm text-muted-foreground">{officeName}</p>
          {work.description && (
            <>
              <span className="text-border text-xs">•</span>
              <p className="text-sm text-muted-foreground truncate max-w-[200px]">{work.description}</p>
            </>
          )}
        </div>
      </div>
      {work.hoursSpent > 0 && (
        <div className="shrink-0 text-right">
          <p className="text-[1.05rem] font-extrabold text-primary">{work.hoursSpent}h</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">spent</p>
        </div>
      )}
      {/* Inline status control */}
      {canModify && (
        <div className="shrink-0">
          <DailyWorkStatusControl id={work.id} status={work.status} />
        </div>
      )}
      {canModify && (
        <div className="flex items-center gap-1 ml-1 shrink-0">
          {isAdmin && (
            <DailyWorkDialog offices={offices} users={users} work={work} isAdmin={isAdmin} />
          )}
          <DeleteButton
            id={work.id}
            action={deleteDailyWorkAction}
            title="Delete work log?"
            description="This will permanently remove this work entry."
            successMessage="Work log deleted"
          />
        </div>
      )}
    </div>
  )
}
