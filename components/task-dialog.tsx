"use client"

import { useState, useTransition, useEffect } from "react"
import {
  Dialog,
  DialogContent,
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
import { Plus, ListChecks, Building2, Calendar, User, Flag, AlignLeft, UserCheck } from "lucide-react"
import { createTaskAction } from "@/app/actions/tasks"
import type { Office, User as UserType } from "@/lib/types"

export function TaskDialog({
  offices,
  users,
  defaultOfficeId,
  isAdmin,
}: {
  offices: Office[]
  users?: UserType[]
  defaultOfficeId?: string
  isAdmin?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(defaultOfficeId || offices[0]?.id || "")

  useEffect(() => {
    if (!selectedOfficeId && offices.length > 0) {
      setSelectedOfficeId(defaultOfficeId || offices[0].id)
    }
  }, [offices, defaultOfficeId])

  function onSubmit(formData: FormData) {
    if (selectedUserId) {
      formData.set("assigneeUserId", selectedUserId)
      const found = users?.find((u) => u.id === selectedUserId)
      if (found) formData.set("assignee", found.name)
    }
    startTransition(async () => {
      try {
        await createTaskAction(formData)
        toast.success("Task created")
        setOpen(false)
        setSelectedUserId("")
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

      <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden">
        <form action={onSubmit}>
          {/* Header */}
          <div className="flex items-center gap-4 border-b bg-muted/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ListChecks className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0.5">
              <DialogTitle className="text-lg font-semibold">Create Pending Work</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Assign an operational task to a user with priority and a deadline."
                  : "Create a task with priority and a deadline."}
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Task Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" />
                Task Details
              </div>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="title">Task Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Submit quarterly tax filing"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="task-description">
                    <span className="flex items-center gap-1.5"><AlignLeft className="h-3.5 w-3.5" /> Description</span>
                  </Label>
                  <Textarea
                    id="task-description"
                    name="description"
                    placeholder="Provide additional context or instructions..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Assignment */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Assignment & Schedule
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="task-office">
                    <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Office <span className="text-destructive">*</span></span>
                  </Label>
                  <input type="hidden" name="officeId" value={selectedOfficeId} />
                  <Select value={selectedOfficeId} onValueChange={(v) => v && setSelectedOfficeId(v)} required>
                    <SelectTrigger id="task-office">
                      <SelectValue>
                        {offices.find((o) => o.id === selectedOfficeId)?.name ?? "Select office"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {offices.map((o) => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin: assign to user from dropdown; otherwise free-text */}
                {isAdmin && users && users.length > 0 ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="assignee-user">
                      <span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5" /> Assign To</span>
                    </Label>
                    <Select
                      value={selectedUserId}
                      onValueChange={(v: string | null) => setSelectedUserId(!v || v === "__manual__" ? "" : v)}
                    >
                      <SelectTrigger id="assignee-user">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__manual__">— Enter manually —</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} <span className="text-muted-foreground text-xs ml-1">({u.role})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!selectedUserId && (
                      <Input
                        id="assignee"
                        name="assignee"
                        placeholder="Or type a name"
                        className="mt-1"
                      />
                    )}
                  </div>
                ) : (
                  <div className="grid gap-1.5">
                    <Label htmlFor="assignee">
                      <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Assignee</span>
                    </Label>
                    <Input id="assignee" name="assignee" placeholder="Person responsible" />
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="priority">
                    <span className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /> Priority</span>
                  </Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔴 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="deadline">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Deadline <span className="text-destructive">*</span></span>
                  </Label>
                  <Input id="deadline" name="deadline" type="date" required />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="min-w-[120px]">
              {pending ? "Saving…" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
