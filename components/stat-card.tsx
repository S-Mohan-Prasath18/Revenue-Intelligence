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

const ACCENT_CLASSES: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-[var(--success)]/12 text-[var(--success)]",
  warning: "bg-[var(--warning)]/15 text-[var(--warning)]",
  destructive: "bg-destructive/10 text-destructive",
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
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            ACCENT_CLASSES[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(trend || hint) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                positive ? "text-[var(--success)]" : "text-destructive",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          )}
          {(trend?.label || hint) && (
            <span className="text-muted-foreground">{trend?.label || hint}</span>
          )}
        </div>
      )}
    </Card>
  )
}
