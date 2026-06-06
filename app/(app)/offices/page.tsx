import { redirect } from "next/navigation"
import { requireSession } from "@/app/actions/auth"
import { listOffices, listTransactions } from "@/lib/data"
import { canAccess, type OfficeType } from "@/lib/types"
import { officeMetrics, formatCurrency } from "@/lib/analytics"
import { PageHeader } from "@/components/page-header"
import { OfficeDialog } from "@/components/office-dialog"
import { DeleteButton } from "@/components/delete-button"
import { deleteOfficeAction } from "@/app/actions/offices"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Mail, Phone, User } from "lucide-react"

const typeLabels: Record<OfficeType, string> = {
  headquarters: "Headquarters",
  regional: "Regional",
  branch: "Branch",
  franchise: "Franchise",
}

export default async function OfficesPage() {
  const session = await requireSession()
  if (!canAccess(session.role, "offices")) redirect("/dashboard")

  const [offices, transactions] = await Promise.all([
    listOffices(),
    listTransactions(),
  ])

  return (
    <div>
      <PageHeader
        title="Office Management"
        description="Register and manage offices across all branches."
        action={<OfficeDialog />}
      />

      {offices.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No offices yet. Add your first office to get started.
          </p>
          <OfficeDialog />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {offices.map((office) => {
            const m = officeMetrics(transactions, office.id)
            return (
              <Card key={office.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold leading-tight">
                        {office.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {typeLabels[office.type]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <OfficeDialog office={office} />
                    <DeleteButton
                      id={office.id}
                      action={deleteOfficeAction}
                      title="Delete office?"
                      description={`This will permanently remove ${office.name} along with its transactions and tasks.`}
                      successMessage="Office deleted"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                  {office.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{office.location}</span>
                    </div>
                  )}
                  {office.contactName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="truncate">{office.contactName}</span>
                    </div>
                  )}
                  {office.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{office.contactEmail}</span>
                    </div>
                  )}
                  {office.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{office.contactPhone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold">{formatCurrency(m.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="text-sm font-semibold">{formatCurrency(m.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit</p>
                    <p
                      className={
                        m.profit >= 0
                          ? "text-sm font-semibold text-[oklch(0.55_0.14_155)]"
                          : "text-sm font-semibold text-destructive"
                      }
                    >
                      {formatCurrency(m.profit)}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
