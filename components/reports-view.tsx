"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExportButtons } from "@/components/export-buttons"
import { formatCurrency } from "@/lib/format"

export interface PeriodRow {
  period: string
  revenue: number
  expenses: number
  profit: number
}

export interface OfficeRow {
  office: string
  revenue: number
  expenses: number
  profit: number
  margin: string
}

export interface TaskRow {
  title: string
  office: string
  assignee: string
  priority: string
  status: string
  deadline: string
}

interface ReportsViewProps {
  daily: PeriodRow[]
  monthly: PeriodRow[]
  offices: OfficeRow[]
  tasks: TaskRow[]
}

function PeriodTable({ rows }: { rows: PeriodRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Expenses</TableHead>
          <TableHead className="text-right">Profit / Loss</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
              No data for this report.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((r) => (
            <TableRow key={r.period}>
              <TableCell className="font-medium">{r.period}</TableCell>
              <TableCell className="text-right">{formatCurrency(r.revenue)}</TableCell>
              <TableCell className="text-right">{formatCurrency(r.expenses)}</TableCell>
              <TableCell
                className={`text-right font-medium ${
                  r.profit >= 0 ? "text-[var(--success)]" : "text-destructive"
                }`}
              >
                {formatCurrency(r.profit)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export function ReportsView({ daily, monthly, offices, tasks }: ReportsViewProps) {
  return (
    <Tabs defaultValue="monthly">
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="daily">Daily Revenue</TabsTrigger>
        <TabsTrigger value="monthly">Monthly Revenue</TabsTrigger>
        <TabsTrigger value="office">Office Comparison</TabsTrigger>
        <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
        <TabsTrigger value="tasks">Pending Works</TabsTrigger>
      </TabsList>

      <TabsContent value="daily">
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Daily Revenue Report</CardTitle>
            <ExportButtons rows={daily} filename="daily-revenue-report" />
          </CardHeader>
          <CardContent className="p-0">
            <PeriodTable rows={daily} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="monthly">
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Monthly Revenue Report</CardTitle>
            <ExportButtons rows={monthly} filename="monthly-revenue-report" />
          </CardHeader>
          <CardContent className="p-0">
            <PeriodTable rows={monthly} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="office">
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Office Comparison Report</CardTitle>
            <ExportButtons rows={offices} filename="office-comparison-report" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Office</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offices.map((o) => (
                  <TableRow key={o.office}>
                    <TableCell className="font-medium">{o.office}</TableCell>
                    <TableCell className="text-right">{formatCurrency(o.revenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(o.expenses)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        o.profit >= 0 ? "text-[var(--success)]" : "text-destructive"
                      }`}
                    >
                      {formatCurrency(o.profit)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{o.margin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pnl">
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Profit &amp; Loss Report (Monthly)</CardTitle>
            <ExportButtons rows={monthly} filename="profit-loss-report" />
          </CardHeader>
          <CardContent className="p-0">
            <PeriodTable rows={monthly} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks">
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending Works Report</CardTitle>
            <ExportButtons rows={tasks} filename="pending-works-report" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t, i) => (
                  <TableRow key={`${t.title}-${i}`}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>{t.office}</TableCell>
                    <TableCell>{t.assignee}</TableCell>
                    <TableCell className="capitalize">{t.priority}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          t.status === "overdue"
                            ? "border-destructive/40 text-destructive"
                            : t.status === "completed"
                              ? "border-[var(--success)]/40 text-[var(--success)]"
                              : "text-muted-foreground"
                        }
                      >
                        {t.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.deadline}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
