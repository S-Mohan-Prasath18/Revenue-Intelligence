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
import { Plus, CreditCard, Building2, Calendar, IndianRupee, AlignLeft, Pencil } from "lucide-react"
import { createPaymentAction, updatePaymentStatusAction } from "@/app/actions/payments"
import type { Office, Payment } from "@/lib/types"

export function PaymentDialog({
  offices,
  payment,
}: {
  offices: Office[]
  payment?: Payment
}) {
  const isEdit = Boolean(payment)
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(offices[0]?.id || "")

  useEffect(() => {
    if (!selectedOfficeId && offices.length > 0) {
      setSelectedOfficeId(offices[0].id)
    }
  }, [offices])

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (isEdit && payment) {
          formData.set("id", payment.id)
          await updatePaymentStatusAction(formData)
          toast.success("Payment updated")
        } else {
          await createPaymentAction(formData)
          toast.success("Payment recorded")
        }
        setOpen(false)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save payment")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon" aria-label="Edit payment" />
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
            Add Payment
          </>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <form action={onSubmit}>
          {/* Header */}
          <div className="flex items-center gap-4 border-b bg-muted/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0.5">
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Update Payment Status" : "Record Pending Payment"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "Update the status and paid amount for this payment."
                  : "Log a payment obligation with amount and due date."}
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-6">
            {!isEdit ? (
              <>
                {/* Payment details (create mode) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    Payment Details
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="pay-title">Title <span className="text-destructive">*</span></Label>
                      <Input id="pay-title" name="title" placeholder="e.g. Vendor invoice – June" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="pay-desc">
                        <span className="flex items-center gap-1.5"><AlignLeft className="h-3.5 w-3.5" /> Description</span>
                      </Label>
                      <Textarea
                        id="pay-desc"
                        name="description"
                        placeholder="Notes or payment context..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <Label htmlFor="pay-amount">
                          <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5" /> Amount (₹) <span className="text-destructive">*</span></span>
                        </Label>
                        <Input id="pay-amount" name="amount" type="number" min="1" step="0.01" placeholder="0.00" required />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="pay-due">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Due Date <span className="text-destructive">*</span></span>
                        </Label>
                        <Input id="pay-due" name="dueDate" type="date" required />
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="pay-office">
                        <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Office <span className="text-destructive">*</span></span>
                      </Label>
                    <input type="hidden" name="officeId" value={selectedOfficeId} />
                    <Select value={selectedOfficeId} onValueChange={(v) => v && setSelectedOfficeId(v)} required>
                      <SelectTrigger id="pay-office">
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
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Update mode */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    Update Status
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="pay-status">Status</Label>
                      <Select name="status" defaultValue={payment?.status || "pending"}>
                        <SelectTrigger id="pay-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">⏳ Pending</SelectItem>
                          <SelectItem value="partial">🔶 Partial</SelectItem>
                          <SelectItem value="paid">✅ Paid</SelectItem>
                          <SelectItem value="overdue">🔴 Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="paid-amount">
                        <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5" /> Paid Amount (₹)</span>
                      </Label>
                      <Input
                        id="paid-amount"
                        name="paidAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={payment?.paidAmount ?? 0}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="min-w-[120px]">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
