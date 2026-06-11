import { redirect } from "next/navigation"
import { requireSession } from "@/app/actions/auth"
import { listOffices, listTransactions, listUsers } from "@/lib/data"
import { canAccess, type OfficeType, ROLE_LABELS } from "@/lib/types"
import { officeMetrics, formatCurrency } from "@/lib/analytics"
import { PageHeader } from "@/components/page-header"
import { OfficeDialog } from "@/components/office-dialog"
import { DeleteButton } from "@/components/delete-button"
import { deleteOfficeAction } from "@/app/actions/offices"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { Building2, MapPin, Mail, Phone, Users, ShieldCheck, UserIcon, TrendingUp, TrendingDown } from "lucide-react"

const typeLabels: Record<OfficeType, string> = {
  headquarters: "Headquarters",
  regional: "Regional",
  branch: "Branch",
  franchise: "Franchise",
}

export default async function OfficesPage() {
  const session = await requireSession()
  if (!canAccess(session.role, "offices")) redirect("/dashboard")

  const [offices, transactions, users] = await Promise.all([
    listOffices(),
    listTransactions(),
    listUsers(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Office Management"
        description="Register and manage offices across all branches."
        action={<OfficeDialog />}
      />

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Total Offices" value={String(offices.length)} icon={Building2} accent="primary" />
        <StatCard title="Total Users" value={String(users.length)} icon={Users} accent="primary" />
        <StatCard title="Admin Users" value={String(users.filter(u => u.role === "admin").length)} icon={ShieldCheck} accent="primary" />
        <StatCard title="Standard Users" value={String(users.filter(u => u.role === "user").length)} icon={UserIcon} accent="primary" />
      </div>

      {/* User list */}
      <Card className="card-premium overflow-hidden border-0">
        <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-gradient-gold text-lg font-bold">System Users</h3>
            <Badge variant="secondary" className="ml-1">{users.length}</Badge>
          </div>
        </div>
        {users.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No users found.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {users.map((user, i) => (
              <div key={`${user.id}-${i}`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-secondary/30">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ background: "linear-gradient(135deg, #D4AF37, #E2C275)", color: "#fff" }}>
                  {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.9375rem] font-bold text-foreground truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="flex items-center gap-1 shrink-0">
                  {user.role === "admin"
                    ? <ShieldCheck className="h-3 w-3" />
                    : <UserIcon className="h-3 w-3" />}
                  {ROLE_LABELS[user.role]}
                </Badge>
                {user.id === session.userId && (
                  <span className="text-xs font-medium text-primary shrink-0">(You)</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Offices grid */}
      {offices.length === 0 ? (
        <Card className="card-premium flex flex-col items-center justify-center gap-3 p-12 text-center border-0">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No offices yet. Add your first office to get started.
          </p>
          <OfficeDialog />
        </Card>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-gradient-gold text-lg font-bold">Registered Offices</h2>
            <Badge variant="secondary" className="ml-1">{offices.length}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {offices.map((office) => {
              const m = officeMetrics(transactions, office.id)
              return (
                <div key={office.id} className="card-premium flex flex-col p-5 border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-[0.9375rem] font-bold text-foreground leading-tight">{office.name}</h3>
                        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-primary mt-1">
                          {typeLabels[office.type]}
                        </span>
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
                        <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                        <span className="truncate">{office.location}</span>
                      </div>
                    )}
                    {office.contactName && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 shrink-0 text-primary/60" />
                        <span className="truncate font-medium text-foreground">{office.contactName}</span>
                      </div>
                    )}
                    {office.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                        <span className="truncate">{office.contactEmail}</span>
                      </div>
                    )}
                    {office.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                        <span className="truncate">{office.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/50 pt-4 text-center">
                    <div>
                      <p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">Revenue</p>
                      <p className="text-sm font-extrabold flex items-center justify-center gap-1 text-emerald-600 mt-0.5">
                        <TrendingUp className="h-3 w-3" />
                        {formatCurrency(m.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">Expenses</p>
                      <p className="text-sm font-extrabold flex items-center justify-center gap-1 text-destructive mt-0.5">
                        <TrendingDown className="h-3 w-3" />
                        {formatCurrency(m.expenses)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">Profit</p>
                      <p className={`text-sm font-extrabold mt-0.5 ${m.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {formatCurrency(m.profit)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
