import { requireSession } from "@/app/actions/auth"
import { listOffices, listPayments } from "@/lib/data"
import { deletePaymentAction } from "@/app/actions/payments"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { PaymentDialog } from "@/components/payment-dialog"
import { PaymentStatusControl } from "@/components/payment-status-control"
import { DeleteButton } from "@/components/delete-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CreditCard,
  CircleCheck,
  Clock,
  AlertTriangle,
  IndianRupee,
} from "lucide-react"
import { formatCurrency } from "@/lib/analytics"
import { deadlineInfo } from "@/lib/format"
import type { Payment } from "@/lib/types"

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string }>
}) {
  const session = await requireSession()
  const { office: officeParam } = await searchParams
  const officeId = officeParam && officeParam !== "all" ? officeParam : undefined

  const [offices, payments] = await Promise.all([
    listOffices(),
    listPayments(officeId),
  ])
  const officeName = (id: string) => offices.find((o) => o.id === id)?.name ?? "Unknown"
  const isAdmin = session.role === "admin"

  // Basic stats
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const paidAmount = payments.reduce((sum, p) => sum + p.paidAmount, 0)
  const pendingCount = payments.filter((p) => p.status === "pending" || p.status === "partial").length
  const overdueCount = payments.filter((p) => p.status === "overdue").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pending Payments"
        description="Track and manage outgoing payments and vendor obligations."
        action={isAdmin ? <PaymentDialog offices={offices} /> : undefined}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Obligations" value={formatCurrency(totalAmount)} icon={IndianRupee} accent="primary" />
        <StatCard title="Total Paid" value={formatCurrency(paidAmount)} icon={CircleCheck} accent="success" />
        <StatCard title="Pending Payments" value={String(pendingCount)} icon={Clock} accent="warning" />
        <StatCard title="Overdue" value={String(overdueCount)} icon={AlertTriangle} accent="destructive" />
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => {
                const info = deadlineInfo(p.dueDate, p.status === "paid")
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.title}</div>
                      {p.description && (
                        <div className="max-w-60 truncate text-xs text-muted-foreground">
                          {p.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {officeName(p.officeId)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatCurrency(p.paidAmount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={
                          info.level === "overdue" && p.status !== "paid"
                            ? "text-destructive"
                            : info.level === "today" && p.status !== "paid"
                              ? "text-[var(--warning)]"
                              : "text-muted-foreground"
                        }
                      >
                        {p.status === "paid" ? "Paid" : info.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PaymentStatusControl id={p.id} status={p.status} paidAmount={p.paidAmount} />
                    </TableCell>
                    <TableCell>
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <PaymentDialog offices={offices} payment={p} />
                          <DeleteButton
                            id={p.id}
                            action={deletePaymentAction}
                            title="Delete payment?"
                            description="This will permanently remove this payment."
                            successMessage="Payment deleted"
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
