"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/types"
import { canAccess } from "@/lib/types"
import {
  LayoutDashboard,
  Building2,
  ArrowLeftRight,
  ListChecks,
  Bell,
  FileBarChart,
  BarChart3,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  module: string
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/offices", label: "Offices", icon: Building2, module: "offices" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, module: "transactions" },
  { href: "/tasks", label: "Pending Works", icon: ListChecks, module: "tasks" },
  { href: "/notifications", label: "Notifications", icon: Bell, module: "notifications" },
  { href: "/reports", label: "Reports", icon: FileBarChart, module: "reports" },
]

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const items = NAV.filter((item) => canAccess(role, item.module))

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">RIOMS</p>
          <p className="text-xs text-sidebar-foreground/60">Revenue Intelligence</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/50">
          Operations Management System
        </p>
      </div>
    </aside>
  )
}
