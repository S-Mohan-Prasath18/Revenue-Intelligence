"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { createTaskAction } from "@/app/actions/tasks"
import type { Office } from "@/lib/types"

export function TaskDialog({
  offices,
  defaultOfficeId,
}: {
  offices: Office[]
  defaultOfficeId?: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createTaskAction(formData)
        toast.success("Task created")
        setOpen(false)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to create task")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-1.5 h-4 w-4" />
        New Task
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Pending Work</DialogTitle>
          <DialogDescription>Assign an operational task with a deadline.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g. Submit quarterly tax filing" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-office">Office</Label>
            <Select name="officeId" defaultValue={defaultOfficeId || offices[0]?.id} required>
              <SelectTrigger id="task-office">
                <SelectValue placeholder="Select office" />
              </SelectTrigger>
              <SelectContent>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" name="deadline" type="date" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input id="assignee" name="assignee" placeholder="Person responsible" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              name="description"
              placeholder="Optional details"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
