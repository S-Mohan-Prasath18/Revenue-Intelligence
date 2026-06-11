import { redirect } from "next/navigation"
import { requireSession } from "@/app/actions/auth"
import { listOffices, listTransactions } from "@/lib/data"
import { summarize } from "@/lib/analytics"
import { formatCurrency } from "@/lib/format"
import { canAccess } from "@/lib/types"
import { deleteTransactionAction } from "@/app/actions/transactions"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { TransactionDialog } from "@/components/transaction-dialog"
import { DeleteButton } from "@/components/delete-button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IndianRupee, Wallet, Scale, CalendarDays, CalendarRange, Calendar } from "lucide-react"
import type { Transaction } from "@/lib/types"

function periodSummary(transactions: Transaction[], days: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const filtered = transactions.filter((t) => new Date(t.date) >= cutoff)
  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  return { income, expense, net: income - expense, count: filtered.length }
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string }>
}) {
  const session = await requireSession()
  if (!canAccess(session.role, "transactions")) redirect("/dashboard")

  const { office: officeParam } = await searchParams
  const officeId = officeParam && officeParam !== "all" ? officeParam : undefined

  const [offices, transactions] = await Promise.all([
    listOffices(),
    listTransactions(officeId),
  ])
  const summary = summarize(transactions)
  const daily = periodSummary(transactions, 1)
  const weekly = periodSummary(transactions, 7)
  const monthly = periodSummary(transactions, 30)
  const officeName = (id: string) => offices.find((o) => o.id === id)?.name ?? "Unknown"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="Record and review all income and expenses."
        action={<TransactionDialog offices={offices} defaultOfficeId={officeId} />}
      />

      {/* Overall summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon={IndianRupee} accent="primary" />
        <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={Wallet} accent="destructive" />
        <StatCard
          title={summary.isProfit ? "Net Profit" : "Net Loss"}
          value={formatCurrency(Math.abs(summary.netProfit))}
          icon={Scale}
          accent={summary.isProfit ? "success" : "destructive"}
        />
      </div>

      {/* Period breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Today */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <CalendarDays className="h-4 w-4" />
            </div>
            Today
            <Badge variant="secondary" className="ml-auto text-xs">{daily.count} txn</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground">Income</p>
              <p className="text-sm font-semibold text-emerald-600">{formatCurrency(daily.income)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Expense</p>
              <p className="text-sm font-semibold text-destructive">{formatCurrency(daily.expense)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Net</p>
              <p className={`text-sm font-semibold ${daily.net >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {formatCurrency(daily.net)}
              </p>
            </div>
          </div>
        </Card>

        {/* This Week */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <CalendarRange className="h-4 w-4" />
            </div>
            This Week
            <Badge variant="secondary" className="ml-auto text-xs">{weekly.count} txn</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground">Income</p>
              <p className="text-sm font-semibold text-emerald-600">{formatCurrency(weekly.income)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Expense</p>
              <p className="text-sm font-semibold text-destructive">{formatCurrency(weekly.expense)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Net</p>
              <p className={`text-sm font-semibold ${weekly.net >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {formatCurrency(weekly.net)}
              </p>
            </div>
          </div>
        </Card>

        {/* This Month */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="h-4 w-4" />
            </div>
            This Month
            <Badge variant="secondary" className="ml-auto text-xs">{monthly.count} txn</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground">Income</p>
              <p className="text-sm font-semibold text-emerald-600">{formatCurrency(monthly.income)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Expense</p>
              <p className="text-sm font-semibold text-destructive">{formatCurrency(monthly.expense)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Net</p>
              <p className={`text-sm font-semibold ${monthly.net >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {formatCurrency(monthly.net)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions table */}
      <Card className="card-premium overflow-hidden p-0 border-0">
        <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <p className="text-gradient-gold text-lg font-bold">
              All Transactions
            </p>
            <Badge variant="secondary" className="ml-1">{transactions.length}</Badge>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No transactions yet. Add your first one to get started.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(t.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{officeName(t.officeId)}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell className="max-w-50 truncate text-muted-foreground">
                    {t.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        t.type === "income"
                          ? "border-emerald-500/40 text-emerald-600"
                          : "border-destructive/40 text-destructive"
                      }
                    >
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      t.type === "income" ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <TransactionDialog offices={offices} transaction={t} />
                      <DeleteButton
                        id={t.id}
                        action={deleteTransactionAction}
                        title="Delete transaction?"
                        description="This will permanently remove this transaction record."
                        successMessage="Transaction deleted"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
