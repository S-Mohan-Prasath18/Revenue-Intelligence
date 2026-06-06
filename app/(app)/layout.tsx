import type { ReactNode } from "react"
import { Suspense } from "react"
import { requireSession } from "@/app/actions/auth"
import { listOffices, listNotifications } from "@/lib/data"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Toaster } from "@/components/ui/sonner"

export default async function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await requireSession()
  const [offices, notifications] = await Promise.all([
    listOffices(),
    listNotifications(),
  ])
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar role={session.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<div className="h-16 shrink-0 border-b bg-card" />}>
          <Topbar
            offices={offices}
            userName={session.name}
            userEmail={session.email}
            role={session.role}
            unreadCount={unreadCount}
          />
        </Suspense>
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
