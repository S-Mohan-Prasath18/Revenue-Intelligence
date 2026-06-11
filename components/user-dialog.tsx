"use client"

import { useState, useTransition } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Users, Mail, Lock, ShieldCheck, UserIcon } from "lucide-react"
import { createUserAction, updateUserAction } from "@/app/actions/users"
import type { User } from "@/lib/types"

interface UserDialogProps {
  user?: User
}

export function UserDialog({ user }: UserDialogProps) {
  const isEdit = Boolean(user)
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    if (isEdit) formData.set("id", user!.id)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateUserAction(formData)
          toast.success("User updated")
        } else {
          await createUserAction(formData)
          toast.success("User created")
        }
        setOpen(false)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save user")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon" aria-label="Edit user" />
          ) : (
            <Button />
          )
        }
      >
        {isEdit ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" />
            Add User
          </>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <form action={onSubmit}>
          {/* Header */}
          <div className="flex items-center gap-4 border-b bg-muted/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0.5">
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Edit User" : "Create New User"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "Update user details. Leave password blank to keep current."
                  : "Add a new user to the system with role-based access."}
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <UserIcon className="h-3.5 w-3.5" />
                User Information
              </div>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="u-name">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="u-name"
                    name="name"
                    defaultValue={user?.name}
                    required
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="u-email">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address <span className="text-destructive">*</span></span>
                  </Label>
                  <Input
                    id="u-email"
                    name="email"
                    type="email"
                    defaultValue={user?.email}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Security */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Security & Access
              </div>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="u-password">
                    Password {isEdit && <span className="ml-1 text-xs font-normal text-muted-foreground">(Optional — leave blank to keep current)</span>}
                    {!isEdit && <span className="text-destructive"> *</span>}
                  </Label>
                  <Input
                    id="u-password"
                    name="password"
                    type="password"
                    required={!isEdit}
                    placeholder={isEdit ? "Leave blank to keep unchanged" : "Minimum 6 characters"}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="u-role">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Role <span className="text-destructive">*</span></span>
                  </Label>
                  <Select name="role" defaultValue={user?.role || "user"} required>
                    <SelectTrigger id="u-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <span className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          User — Standard access
                        </span>
                      </SelectItem>
                      <SelectItem value="admin">
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          Admin — Full access
                        </span>
                      </SelectItem>
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
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
