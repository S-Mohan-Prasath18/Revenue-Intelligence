"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import { TrendingUp, TrendingDown } from "lucide-react"

interface OfficeStat {
  officeId: string
  officeName: string
  revenue: number
  expenses: number
  profit: number
}

interface OfficeComparisonProps {
  stats: OfficeStat[]
}

export function OfficeComparison({ stats }: OfficeComparisonProps) {
  const maxRevenue = Math.max(...stats.map((s) => s.revenue), 1)
  const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Office Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No office data available.</p>
        ) : (
          stats.map((office, index) => {
            const profitable = office.profit >= 0
            const contribution =
              totalRevenue > 0 ? Math.round((office.revenue / totalRevenue) * 100) : 0
            return (
              <div key={`${office.officeId}-${index}`} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{office.officeName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {contribution}% of revenue
                    </Badge>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      profitable ? "text-[var(--success)]" : "text-destructive"
                    }`}
                  >
                    {profitable ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatCurrency(office.profit)}
                  </div>
                </div>
                <Progress value={(office.revenue / maxRevenue) * 100} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Revenue {formatCurrency(office.revenue)}</span>
                  <span>Expenses {formatCurrency(office.expenses)}</span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
