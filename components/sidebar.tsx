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
  Users as UsersIcon,
  CreditCard,
  ClipboardList,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  module: string
}

const NAV: NavItem[] = [
  { href: "/dashboard",   label: "Dashboard",        icon: LayoutDashboard, module: "dashboard" },
  { href: "/offices",     label: "Offices",           icon: Building2,       module: "offices" },
  { href: "/transactions",label: "Transactions",      icon: ArrowLeftRight,  module: "transactions" },
  { href: "/tasks",       label: "Pending Works",     icon: ListChecks,      module: "tasks" },
  { href: "/reports",     label: "Reports",           icon: FileBarChart,    module: "reports" },
  { href: "/users",       label: "Users",             icon: UsersIcon,       module: "users" },
  { href: "/payments",    label: "Pending Payments",  icon: CreditCard,      module: "payments" },
  { href: "/daily-works", label: "Daily Works",       icon: ClipboardList,   module: "dailyworks" },
]

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const items = NAV.filter((item) => canAccess(role, item.module))

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col lg:flex"
      style={{
        background: "#0F1115",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex h-16 items-center gap-3 px-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #E2C275 100%)",
            borderRadius: "10px",
            boxShadow: "0 2px 12px rgba(212,175,55,.3)",
          }}
        >
          <BarChart3 className="h-5 w-5" style={{ color: "#fff" }} />
        </div>
        <div className="leading-tight min-w-0">
          <p
            className="text-sm font-bold tracking-tight leading-none"
            style={{ color: "#FAFAFA", letterSpacing: "-0.01em" }}
          >
            ST Revenue
          </p>
          <p
            className="text-[0.625rem] font-medium mt-0.5 uppercase tracking-widest"
            style={{ color: "rgba(161,161,170,0.5)" }}
          >
            Intelligence System
          </p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-5">
        <p className="sidebar-section-label mb-2">
          Main Menu
        </p>
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
                "sidebar-nav-item",
                active && "active",
              )}
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-[0.6875rem] font-medium" style={{ color: "rgba(161,161,170,0.4)" }}>
          © 2025 ST Revenue Intelligence
        </p>
      </div>
    </aside>
  )
}
