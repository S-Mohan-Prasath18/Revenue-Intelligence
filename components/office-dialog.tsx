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
import { Plus, Pencil } from "lucide-react"

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
      <DialogContent>
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit office" : "Register new office"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the office details below."
                : "Add a new office or branch to the system."}
            </DialogDescription>
          </DialogHeader>

          {office && <input type="hidden" name="id" value={office.id} />}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Office name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={office?.name}
                placeholder="Office C — Madurai"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={office?.type || "branch"}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headquarters">Headquarters</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="franchise">Franchise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={office?.location}
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactName">Contact name</Label>
              <Input
                id="contactName"
                name="contactName"
                defaultValue={office?.contactName}
                placeholder="Manager name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={office?.contactEmail}
                  placeholder="email@company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Contact phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={office?.contactPhone}
                  placeholder="+91 ..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create office"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
