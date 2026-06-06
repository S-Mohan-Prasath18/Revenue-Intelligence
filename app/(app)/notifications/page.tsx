import { requireSession } from "@/app/actions/auth"
import { listNotifications } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import { MarkAllReadButton, MarkReadButton } from "@/components/notification-actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  IndianRupee,
  Wallet,
  CalendarClock,
  ListChecks,
  Building2,
  Bell,
} from "lucide-react"
import type { NotificationCategory } from "@/lib/types"

const categoryMeta: Record<
  NotificationCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  revenue: { label: "Revenue", icon: IndianRupee, className: "bg-primary/10 text-primary" },
  expense: { label: "Expense", icon: Wallet, className: "bg-destructive/10 text-destructive" },
  deadline: { label: "Deadline", icon: CalendarClock, className: "bg-[var(--warning)]/15 text-[var(--warning)]" },
  task: { label: "Task", icon: ListChecks, className: "bg-[var(--success)]/12 text-[var(--success)]" },
  office: { label: "Office", icon: Building2, className: "bg-secondary text-secondary-foreground" },
}

export default async function NotificationsPage() {
  await requireSession()
  const notifications = await listNotifications()
  const unread = notifications.filter((n) => !n.read)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notification Center"
        description={`${unread.length} unread of ${notifications.length} total notifications`}
        action={<MarkAllReadButton disabled={unread.length === 0} />}
      />

      {notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const meta = categoryMeta[n.category]
            const Icon = meta.icon
            return (
              <Card
                key={n.id}
                className={cn(
                  "flex items-start gap-4 p-4",
                  !n.read && "border-l-4 border-l-primary bg-primary/[0.03]",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    meta.className,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium leading-tight">{n.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {meta.label}
                    </Badge>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                </div>
                {!n.read && <MarkReadButton id={n.id} />}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
