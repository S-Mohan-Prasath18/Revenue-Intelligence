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
import { updateTaskStatusAction } from "@/app/actions/tasks"
import type { TaskStatus } from "@/lib/types"

export function TaskStatusControl({
  id,
  status,
}: {
  id: string
  status: TaskStatus
}) {
  const [pending, startTransition] = useTransition()

  function onChange(value: string | null) {
    if (!value || value === status) return
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set("id", id)
        fd.set("status", value)
        await updateTaskStatusAction(fd)
        toast.success("Status updated")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update")
      }
    })
  }

  // Overdue is derived automatically; allow setting working states + completed
  return (
    <Select value={status === "overdue" ? "pending" : status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  )
}
