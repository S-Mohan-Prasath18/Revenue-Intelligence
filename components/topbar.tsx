"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Office, Role } from "@/lib/types"
import { ROLE_LABELS } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, LogOut, Building2, Search } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"

interface TopbarProps {
  offices: Office[]
  userName: string
  userEmail: string
  role: Role
  unreadCount: number
}

export function Topbar({
  offices,
  userName,
  userEmail,
  role,
  unreadCount,
}: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentOfficeId = searchParams.get("office") || "all"

  function onOfficeChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") params.delete("office")
    else params.set("office", value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 px-4 lg:px-6"
      style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Mobile hamburger */}
      <MobileNav role={role} />

      {/* Office selector */}
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 hidden sm:block" style={{ color: "var(--muted-foreground)" }} />
        <Select value={currentOfficeId} onValueChange={onOfficeChange}>
          <SelectTrigger
            className="w-[140px] sm:w-[180px] text-sm font-medium h-9"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              borderRadius: "8px",
              background: "var(--background)",
            }}
          >
            <SelectValue>
              {currentOfficeId === "all"
                ? "All Offices"
                : (offices.find((o) => o.id === currentOfficeId)?.name ?? "Select office")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {offices.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Dark / light mode toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <Button
          render={<Link href="/notifications" aria-label="Notifications" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          style={{ borderRadius: "8px" }}
        >
          <Bell className="h-[18px] w-[18px]" style={{ color: "var(--muted-foreground)" }} />
          {unreadCount > 0 && (
            <span
              className="badge-pulse absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ background: "#D4AF37" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px mx-1" style={{ background: "var(--border)" }} />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 h-9 hover:bg-accent"
                style={{ borderRadius: "8px" }}
              />
            }
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #D4AF37, #E2C275)",
                  color: "#fff",
                  fontSize: "0.6875rem",
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-none">{userName}</p>
              <p className="mt-0.5 text-[0.6875rem]" style={{ color: "var(--muted-foreground)" }}>
                {ROLE_LABELS[role]}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ borderRadius: "12px" }}>
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{userName}</span>
                <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                  {userEmail}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<div className="w-full cursor-pointer" />}
              onClick={() => logoutAction()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="text-sm">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
