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
import { Plus, ClipboardList, Building2, Clock, AlignLeft, UserCheck, Pencil, Link as LinkIcon } from "lucide-react"
import { createDailyWorkAction, updateDailyWorkAction } from "@/app/actions/dailyworks"
import type { Office, User, DailyWork, Task } from "@/lib/types"

export function DailyWorkDialog({
  offices,
  users,
  tasks,
  defaultOfficeId,
  isAdmin,
  work,
}: {
  offices: Office[]
  users?: User[]
  tasks?: Task[]
  defaultOfficeId?: string
  isAdmin?: boolean
  work?: DailyWork
}) {
  const isEdit = Boolean(work)
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [selectedUserId, setSelectedUserId] = useState<string>(work?.userId || "")
  const [selectedTaskId, setSelectedTaskId] = useState<string>(work?.taskId || "")
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(work?.officeId || defaultOfficeId || offices[0]?.id || "")

  useEffect(() => {
    if (!selectedOfficeId && offices.length > 0) {
      setSelectedOfficeId(work?.officeId || defaultOfficeId || offices[0].id)
    }
  }, [offices, defaultOfficeId])

  function onSubmit(formData: FormData) {
    // Attach selected user info for admin assignment
    if (isAdmin && selectedUserId && users) {
      formData.set("assignedUserId", selectedUserId)
      const found = users.find((u) => u.id === selectedUserId)
      if (found) formData.set("assignedUserName", found.name)
    }
    if (selectedTaskId && selectedTaskId !== "none") {
      formData.set("taskId", selectedTaskId)
    }
    // Default date to today if not set
    if (!formData.get("date")) {
      formData.set("date", new Date().toISOString().split("T")[0])
    }
    if (isEdit && work) {
      formData.set("id", work.id)
    }
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateDailyWorkAction(formData)
          toast.success("Work entry updated")
        } else {
          await createDailyWorkAction(formData)
          toast.success("Daily work logged")
        }
        setOpen(false)
        setSelectedUserId("")
        setSelectedTaskId("")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save work entry")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon" aria-label="Edit work entry" />
          ) : (
            <Button variant="outline" />
          )
        }
      >
        {isEdit ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" />
            Log Work
          </>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden">
        <form action={onSubmit}>
          {/* Header */}
          <div className="flex items-center gap-4 border-b bg-muted/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0.5">
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Edit Work Entry" : "Log Daily Work"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isAdmin && !isEdit
                  ? "Log work for yourself or assign it to a team member."
                  : isEdit
                    ? "Update this work entry's details, status, or hours."
                    : "Record what you worked on today, hours spent, and progress."}
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ClipboardList className="h-3.5 w-3.5" />
                Work Details
              </div>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="dw-title">Work Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="dw-title"
                    name="title"
                    placeholder="e.g. Reviewed client invoices"
                    defaultValue={work?.title}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="dw-desc">
                    <span className="flex items-center gap-1.5"><AlignLeft className="h-3.5 w-3.5" /> Notes</span>
                  </Label>
                  <Textarea
                    id="dw-desc"
                    name="description"
                    placeholder="What did you accomplish or work towards?"
                    defaultValue={work?.description}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                {tasks && tasks.length > 0 && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="dw-task">
                      <span className="flex items-center gap-1.5"><LinkIcon className="h-3.5 w-3.5" /> Link to Pending Task</span>
                    </Label>
                    <Select
                      value={selectedTaskId}
                      onValueChange={(v: string | null) => setSelectedTaskId(!v || v === "none" ? "" : v)}
                    >
                      <SelectTrigger id="dw-task">
                        <SelectValue placeholder="— None —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {tasks.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Schedule & Assignment
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="dw-office">
                    <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Office <span className="text-destructive">*</span></span>
                  </Label>
                  <input type="hidden" name="officeId" value={selectedOfficeId} />
                  <Select value={selectedOfficeId} onValueChange={(v) => v && setSelectedOfficeId(v)} required>
                    <SelectTrigger id="dw-office">
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

                {/* Admin: Assign to user */}
                {isAdmin && users && users.length > 0 ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="dw-assign-user">
                      <span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5" /> Assign To</span>
                    </Label>
                    <Select
                      value={selectedUserId}
                      onValueChange={(v: string | null) => setSelectedUserId(!v || v === "__self__" ? "" : v)}
                    >
                      <SelectTrigger id="dw-assign-user">
                        <SelectValue placeholder="Myself" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__self__">— Myself —</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} <span className="text-muted-foreground text-xs ml-1">({u.role})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="grid gap-1.5">
                    <Label htmlFor="dw-date">
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Date</span>
                    </Label>
                    <Input
                      id="dw-date"
                      name="date"
                      type="date"
                      defaultValue={work?.date || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                )}

                {/* Show date separately when admin has user select */}
                {isAdmin && users && users.length > 0 && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="dw-date">
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Date</span>
                    </Label>
                    <Input
                      id="dw-date"
                      name="date"
                      type="date"
                      defaultValue={work?.date || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="dw-hours">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Hours Spent</span>
                  </Label>
                  <Input
                    id="dw-hours"
                    name="hoursSpent"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    placeholder="e.g. 3.5"
                    defaultValue={work?.hoursSpent}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="dw-status">Status</Label>
                  <Select name="status" defaultValue={work?.status || "in_progress"}>
                    <SelectTrigger id="dw-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="done">✅ Done</SelectItem>
                      <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                      <SelectItem value="pending">⏳ Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="min-w-[120px]">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Log Work"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
