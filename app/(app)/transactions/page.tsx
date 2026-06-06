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
import { IndianRupee, Wallet, Scale } from "lucide-react"

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
  const officeName = (id: string) => offices.find((o) => o.id === id)?.name ?? "Unknown"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="Record and review all income and expenses."
        action={<TransactionDialog offices={offices} defaultOfficeId={officeId} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Revenue" value={formatCurrency(summary.totalRevenue)} icon={IndianRupee} accent="primary" />
        <StatCard title="Expenses" value={formatCurrency(summary.totalExpenses)} icon={Wallet} accent="destructive" />
        <StatCard
          title={summary.isProfit ? "Net Profit" : "Net Loss"}
          value={formatCurrency(Math.abs(summary.netProfit))}
          icon={Scale}
          accent={summary.isProfit ? "success" : "destructive"}
        />
      </div>

      <Card className="overflow-hidden p-0">
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
                    {new Date(t.date).toLocaleDateString("en-US", {
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
                          ? "border-[var(--success)]/40 text-[var(--success)]"
                          : "border-destructive/40 text-destructive"
                      }
                    >
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      t.type === "income" ? "text-[var(--success)]" : "text-destructive"
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
