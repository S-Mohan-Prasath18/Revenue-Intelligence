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
import { Plus, Pencil } from "lucide-react"
import { createTransactionAction, updateTransactionAction } from "@/app/actions/transactions"
import type { Office, Transaction } from "@/lib/types"

const INCOME_CATEGORIES = ["Sales", "Services", "Consulting", "Subscriptions", "Other Income"]
const EXPENSE_CATEGORIES = [
  "Salaries",
  "Rent",
  "Utilities",
  "Marketing",
  "Supplies",
  "Travel",
  "Equipment",
  "Other Expense",
]

interface TransactionDialogProps {
  offices: Office[]
  defaultOfficeId?: string
  /** Pass an existing transaction to enable edit mode */
  transaction?: Transaction
}

export function TransactionDialog({ offices, defaultOfficeId, transaction }: TransactionDialogProps) {
  const isEdit = Boolean(transaction)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">(transaction?.type ?? "income")
  const [pending, startTransition] = useTransition()

  // Reset type to match the edited transaction whenever dialog opens
  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && transaction) setType(transaction.type)
  }

  function onSubmit(formData: FormData) {
    formData.set("type", type)
    if (isEdit) formData.set("id", transaction!.id)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateTransactionAction(formData)
          toast.success("Transaction updated")
        } else {
          await createTransactionAction(formData)
          toast.success("Transaction recorded")
        }
        setOpen(false)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save transaction")
      }
    })
  }

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const defaultDate = transaction?.date
    ? new Date(transaction.date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon" aria-label="Edit transaction" />
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
            Add Transaction
          </>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "Record Transaction"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this transaction."
              : "Capture income or expense for an office."}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="flex flex-col gap-4">
          {/* Income / Expense toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                type === "income"
                  ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                type === "expense"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Expense
            </button>
          </div>

          {/* Office — hidden in edit mode (can't move transactions between offices) */}
          {!isEdit && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="txn-officeId">Office</Label>
              <Select name="officeId" defaultValue={defaultOfficeId || offices[0]?.id} required>
                <SelectTrigger id="txn-officeId">
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
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="txn-category">Category</Label>
              <Select
                name="category"
                defaultValue={transaction?.category ?? categories[0]}
                key={type}
              >
                <SelectTrigger id="txn-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="txn-amount">Amount (₹)</Label>
              <Input
                id="txn-amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="0"
                defaultValue={transaction?.amount}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="txn-date">Date</Label>
            <Input
              id="txn-date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="txn-description">Description</Label>
            <Textarea
              id="txn-description"
              name="description"
              placeholder="Optional notes"
              rows={2}
              defaultValue={transaction?.description}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
