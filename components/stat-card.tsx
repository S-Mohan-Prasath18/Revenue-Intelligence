import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Accent = "primary" | "success" | "warning" | "destructive"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  accent?: Accent
  trend?: { value: number; label?: string }
  hint?: string
}

const ACCENT_STYLES: Record<Accent, { bg: string; text: string }> = {
  primary:     { bg: "rgba(212,175,55,.10)",  text: "#D4AF37" },
  success:     { bg: "rgba(34,197,94,.10)",   text: "#22C55E" },
  warning:     { bg: "rgba(245,158,11,.10)",  text: "#F59E0B" },
  destructive: { bg: "rgba(239,68,68,.10)",   text: "#EF4444" },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  accent = "primary",
  trend,
  hint,
}: StatCardProps) {
  const positive = trend ? trend.value >= 0 : true
  const style = ACCENT_STYLES[accent]

  return (
    <Card
      className="p-5 border-0 animate-fade-up"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)", letterSpacing: "0.05em" }}
          >
            {title}
          </p>
          <p
            className="mt-2 stat-value"
          >
            {value}
          </p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center"
          style={{
            background: style.bg,
            borderRadius: "10px",
          }}
        >
          <Icon className="h-5 w-5" style={{ color: style.text }} />
        </div>
      </div>

      {(trend || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold"
              style={{
                background: positive ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.08)",
                color: positive ? "#22C55E" : "#EF4444",
                fontSize: "0.6875rem",
              }}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          )}
          {(trend?.label || hint) && (
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {trend?.label || hint}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
