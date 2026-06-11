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
  Menu,
  Users as UsersIcon,
  CreditCard,
  ClipboardList,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

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
  { href: "/reports", label: "Reports", icon: FileBarChart, module: "reports" },
  { href: "/users", label: "Users", icon: UsersIcon, module: "users" },
  { href: "/payments", label: "Pending Payments", icon: CreditCard, module: "payments" },
  { href: "/daily-works", label: "Daily Works", icon: ClipboardList, module: "dailyworks" },
]

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const items = NAV.filter((item) => canAccess(role, item.module))

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        style={{
          background: "#0F1115",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #E2C275)",
                borderRadius: "8px",
              }}
            >
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div className="leading-tight">
              <SheetTitle style={{ color: "#FAFAFA", fontSize: "0.875rem" }}>ST Revenue</SheetTitle>
              <p className="text-[0.625rem] uppercase tracking-widest" style={{ color: "rgba(161,161,170,0.5)" }}>
                Intelligence System
              </p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-0.5 p-3 pt-4">
          <p className="sidebar-section-label mb-2">Main Menu</p>
          {items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <SheetClose
                key={item.href}
                nativeButton={false}
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "sidebar-nav-item",
                      active && "active",
                    )}
                  />
                }
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </SheetClose>
            )
          })}
        </nav>

        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[0.6875rem]" style={{ color: "rgba(161,161,170,0.4)" }}>
            © 2025 ST Revenue Intelligence
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
