"use client"

import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

type Row = Record<string, string | number>

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")),
  ]
  return lines.join("\n")
}

export function ExportButtons({
  rows,
  filename,
}: {
  rows: Row[]
  filename: string
}) {
  function downloadCsv() {
    const csv = toCsv(rows)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={downloadCsv} disabled={rows.length === 0}>
        <Download className="mr-1.5 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="mr-1.5 h-4 w-4" />
        Print / PDF
      </Button>
    </div>
  )
}
