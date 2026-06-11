"use client"

import { useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { updatePaymentStatusAction } from "@/app/actions/payments"

export function PaymentStatusControl({
  id,
  status,
  paidAmount,
}: {
  id: string
  status: string
  paidAmount: number
}) {
  const [pending, startTransition] = useTransition()

  function onChange(value: string | null) {
    if (!value || value === status) return
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set("id", id)
        fd.set("status", value)
        fd.set("paidAmount", String(paidAmount))
        await updatePaymentStatusAction(fd)
        toast.success("Payment status updated")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update")
      }
    })
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">⏳ Pending</SelectItem>
        <SelectItem value="partial">🔶 Partial</SelectItem>
        <SelectItem value="paid">✅ Paid</SelectItem>
        <SelectItem value="overdue">🔴 Overdue</SelectItem>
      </SelectContent>
    </Select>
  )
}
