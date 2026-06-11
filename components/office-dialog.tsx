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
import type { Office } from "@/lib/types"
import { createOfficeAction, updateOfficeAction } from "@/app/actions/offices"
import { Plus, Pencil, Building2, MapPin, Phone, Mail, User } from "lucide-react"

export function OfficeDialog({ office }: { office?: Office }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const isEdit = Boolean(office)

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (isEdit) await updateOfficeAction(formData)
        else await createOfficeAction(formData)
        toast.success(isEdit ? "Office updated" : "Office created")
        setOpen(false)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon" aria-label="Edit office" />
          ) : (
            <Button />
          )
        }
      >
        {isEdit ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Office
          </>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden">
        <form action={onSubmit}>
          {/* Header */}
          <div className="flex items-center gap-4 border-b bg-muted/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0.5">
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Edit Office" : "Register New Office"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEdit ? "Update office details and contact information." : "Add a new office or branch to the system."}
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-6">
            {office && <input type="hidden" name="id" value={office.id} />}

            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                Office Details
              </div>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Office Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={office?.name}
                    placeholder="e.g. Office C — Madurai"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="type">Office Type <span className="text-destructive">*</span></Label>
                    <Select name="type" defaultValue={office?.type || "branch"}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="headquarters">🏢 Headquarters</SelectItem>
                        <SelectItem value="regional">🌐 Regional</SelectItem>
                        <SelectItem value="branch">🏬 Branch</SelectItem>
                        <SelectItem value="franchise">🤝 Franchise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="location">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      defaultValue={office?.location}
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Contact Information
              </div>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="contactName">Contact Person</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    defaultValue={office?.contactName}
                    placeholder="e.g. Arjun Mehta"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="contactEmail">
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      defaultValue={office?.contactEmail}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="contactPhone">
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</span>
                    </Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      defaultValue={office?.contactPhone}
                      placeholder="+91 98400 XXXXX"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="min-w-[120px]">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Office"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
