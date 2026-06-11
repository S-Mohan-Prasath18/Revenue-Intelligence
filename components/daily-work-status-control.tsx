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
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateDailyWorkStatusAction } from "@/app/actions/dailyworks"

export function DailyWorkStatusControl({
  id,
  status,
}: {
  id: string
  status: "done" | "in_progress" | "pending" | "cancelled"
}) {
  const [pending, startTransition] = useTransition()

  function onChange(value: string | null) {
    if (!value || value === status) return
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set("id", id)
        fd.set("status", value)
        await updateDailyWorkStatusAction(fd)
        toast.success("Work status updated")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update")
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Select value={status} onValueChange={onChange} disabled={pending}>
        <SelectTrigger size="sm" className="w-[125px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">⏳ Pending</SelectItem>
          <SelectItem value="in_progress">🔄 In Progress</SelectItem>
          <SelectItem value="done">✅ Done</SelectItem>
          <SelectItem value="cancelled">❌ Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
        onClick={() => onChange("done")}
        disabled={pending || status === "done"}
        title="Mark as done"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
        onClick={() => onChange("cancelled")}
        disabled={pending || status === "cancelled"}
        title="Mark as cancelled"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
