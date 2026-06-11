import type { ReactNode } from "react"
import { requireSession } from "@/app/actions/auth"
import { listOffices, listNotifications } from "@/lib/data"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Toaster } from "@/components/ui/sonner"

// Always fetch fresh office/notification data — never use cached layout render
export const dynamic = "force-dynamic"

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
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar role={session.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          offices={offices}
          userName={session.name}
          userEmail={session.email}
          role={session.role}
          unreadCount={unreadCount}
        />
        <main
          className="flex-1 overflow-x-hidden p-5 lg:p-8"
          style={{ background: "var(--background)" }}
        >
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
