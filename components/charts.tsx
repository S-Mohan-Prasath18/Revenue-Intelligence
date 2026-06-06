"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCompact, formatCurrency } from "@/lib/format"
import type { MonthPoint } from "@/lib/analytics"

const COLORS = {
  revenue: "oklch(0.45 0.13 250)",
  expenses: "oklch(0.58 0.22 25)",
  profit: "oklch(0.6 0.14 155)",
}

const PIE_COLORS = [
  "oklch(0.45 0.13 250)",
  "oklch(0.6 0.14 155)",
  "oklch(0.7 0.16 65)",
  "oklch(0.55 0.13 200)",
  "oklch(0.58 0.22 25)",
  "oklch(0.5 0.1 290)",
]

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="capitalize text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function RevenueExpenseChart({ data }: { data: MonthPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 247)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="oklch(0.55 0.02 256)"
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={56}
                stroke="oklch(0.55 0.02 256)"
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(0.96 0.01 247)" }} />
              <Bar dataKey="revenue" fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfitTrendChart({ data }: { data: MonthPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profit Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.profit} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.profit} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 247)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="oklch(0.55 0.02 256)"
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={56}
                stroke="oklch(0.55 0.02 256)"
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="profit"
                stroke={COLORS.profit}
                strokeWidth={2}
                fill="url(#profitFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function RevenueLineChart({ data }: { data: MonthPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 247)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="oklch(0.55 0.02 256)"
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={56}
                stroke="oklch(0.55 0.02 256)"
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.revenue}
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function CategoryPieChart({
  data,
  title,
}: {
  data: { name: string; value: number }[]
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              <span className="text-muted-foreground">{d.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function OfficeComparisonChart({
  data,
}: {
  data: { office: string; revenue: number; expenses: number; profit: number }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Office Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 247)" />
              <XAxis
                dataKey="office"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="oklch(0.55 0.02 256)"
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={56}
                stroke="oklch(0.55 0.02 256)"
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(0.96 0.01 247)" }} />
              <Bar dataKey="revenue" fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill={COLORS.profit} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
