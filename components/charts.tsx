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

/* ── Theme colours ─────────────────────────── */
const GOLD   = "#C5A059" // Mustard/Champagne Gold
const GOLD2  = "#E2C275"
const BLACK  = "#2C2A28" // Dark brown/charcoal for text
const RED    = "#dc2626"
const GREEN  = "#16a34a"
const GRID   = "#e5e5e5"
const TICK   = "#6b6b6b"

const COLORS = {
  revenue:  GOLD,
  expenses: RED,
  profit:   GREEN,
}

const PIE_COLORS = [
  GOLD, "#b45309", "#92400e", "#78350f", "#d97706cc", "#f59e0b99",
]

/* ── Shared card header style ──────────────── */
const cardHeaderStyle = {
  background: "transparent",
  borderBottom: "1px solid var(--border)",
}
const cardTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#C5A059",
  letterSpacing: "-0.01em",
}

/* ── Tooltip ──────────────────────────────── */
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
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #EAE5D9",
        borderRadius: "12px",
        padding: "10px 16px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.03), 0 2px 10px rgba(0, 0, 0, 0.01)",
        fontSize: "0.9rem",
      }}
    >
      {label && (
        <p style={{ marginBottom: 6, fontWeight: 700, color: BLACK, fontSize: "0.95rem" }}>
          {label}
        </p>
      )}
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span
            style={{
              display: "inline-block",
              height: 10,
              width: 10,
              borderRadius: "50%",
              background: p.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#555", textTransform: "capitalize" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: BLACK }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Revenue vs Expenses Bar Chart ─────────── */
export function RevenueExpenseChart({ data }: { data: MonthPoint[] }) {
  return (
    <Card className="card-premium border-0">
      <CardHeader style={cardHeaderStyle}>
        <CardTitle style={cardTitleStyle}>Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent style={{ paddingTop: "1.25rem" }}>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={GRID} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={13}
                fontWeight={500}
                stroke={TICK}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={13}
                width={60}
                stroke={TICK}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(245,158,11,.06)" }} />
              <Bar dataKey="revenue"  fill={GOLD}  radius={[5, 5, 0, 0]} />
              <Bar dataKey="expenses" fill={RED}   radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Profit Trend Area Chart ────────────────── */
export function ProfitTrendChart({ data }: { data: MonthPoint[] }) {
  return (
    <Card className="card-premium border-0">
      <CardHeader style={cardHeaderStyle}>
        <CardTitle style={cardTitleStyle}>Profit Trend</CardTitle>
      </CardHeader>
      <CardContent style={{ paddingTop: "1.25rem" }}>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={GOLD2} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GOLD2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={GRID} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={13}
                fontWeight={500}
                stroke={TICK}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={13}
                width={60}
                stroke={TICK}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="profit"
                stroke={GOLD}
                strokeWidth={3}
                fill="url(#profitFill)"
                dot={{ r: 4, fill: GOLD, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: GOLD2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Monthly Revenue Line Chart ─────────────── */
export function RevenueLineChart({ data }: { data: MonthPoint[] }) {
  return (
    <Card className="card-premium border-0">
      <CardHeader style={cardHeaderStyle}>
        <CardTitle style={cardTitleStyle}>Monthly Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent style={{ paddingTop: "1.25rem" }}>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={GRID} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={13}
                fontWeight={500}
                stroke={TICK}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={13}
                width={60}
                stroke={TICK}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={GOLD}
                strokeWidth={3}
                dot={{ r: 4, fill: GOLD, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: GOLD2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Category Pie Chart ─────────────────────── */
export function CategoryPieChart({
  data,
  title,
}: {
  data: { name: string; value: number }[]
  title: string
}) {
  return (
    <Card className="card-premium border-0">
      <CardHeader style={cardHeaderStyle}>
        <CardTitle style={cardTitleStyle}>{title}</CardTitle>
      </CardHeader>
      <CardContent style={{ paddingTop: "1.25rem" }}>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={95}
                paddingAngle={3}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span
                style={{
                  display: "inline-block",
                  height: 10,
                  width: 10,
                  borderRadius: "50%",
                  background: PIE_COLORS[i % PIE_COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.825rem", fontWeight: 500, color: BLACK }}>
                {d.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Office Comparison Bar Chart ────────────── */
export function OfficeComparisonChart({
  data,
}: {
  data: { office: string; revenue: number; expenses: number; profit: number }[]
}) {
  return (
    <Card className="card-premium border-0">
      <CardHeader style={cardHeaderStyle}>
        <CardTitle style={cardTitleStyle}>Office Comparison</CardTitle>
      </CardHeader>
      <CardContent style={{ paddingTop: "1.25rem" }}>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={GRID} />
              <XAxis
                dataKey="office"
                tickLine={false}
                axisLine={false}
                fontSize={13}
                fontWeight={500}
                stroke={TICK}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={13}
                width={60}
                stroke={TICK}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(245,158,11,.06)" }} />
              <Bar dataKey="revenue"  fill={GOLD}  radius={[5, 5, 0, 0]} />
              <Bar dataKey="expenses" fill={RED}   radius={[5, 5, 0, 0]} />
              <Bar dataKey="profit"   fill={GREEN} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
