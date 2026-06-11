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
import { Plus, Pencil, ArrowLeftRight, TrendingUp, TrendingDown, Calendar, Tag, Building2, PenLine } from "lucide-react"
import { createTransactionAction, updateTransactionAction } from "@/app/actions/transactions"
import type { Office, Transaction } from "@/lib/types"

const INCOME_CATEGORIES = ["Sales", "Services", "Consulting", "Subscriptions", "Licensing", "Other Income"]
const EXPENSE_CATEGORIES = [
  "Salaries", "Rent", "Utilities", "Marketing",
  "Supplies", "Travel", "Equipment", "Other Expense",
]

interface TransactionDialogProps {
  offices: Office[]
  defaultOfficeId?: string
  transaction?: Transaction
}

export function TransactionDialog({ offices, defaultOfficeId, transaction }: TransactionDialogProps) {
  const isEdit = Boolean(transaction)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">(transaction?.type ?? "income")
  const [selectedCategory, setSelectedCategory] = useState<string>(transaction?.category ?? "")
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(defaultOfficeId || offices[0]?.id || "")
  const [pending, startTransition] = useTransition()

  // Keep selectedOfficeId in sync if offices list changes
  useEffect(() => {
    if (!selectedOfficeId && offices.length > 0) {
      setSelectedOfficeId(defaultOfficeId || offices[0].id)
    }
  }, [offices, defaultOfficeId])

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const isCustom = selectedCategory === "Other Income" || selectedCategory === "Other Expense" || selectedCategory === "__custom__"

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && transaction) {
      setType(transaction.type)
      setSelectedCategory(transaction.category ?? "")
    }
    if (!next) setSelectedCategory("")
  }

  function onSubmit(formData: FormData) {
    formData.set("type", type)
    if (isEdit) formData.set("id", transaction!.id)
    // If custom, use the manual input value as category
    if (isCustom) {
      const custom = String(formData.get("customCategory") || "").trim()
      if (!custom) {
        toast.error("Please enter a custom category name.")
        return
      }
      formData.set("category", custom)
    }
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

      <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden">
        <form action={onSubmit}>
          {/* Header */}
          <div className="flex items-center gap-4 border-b bg-muted/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0.5">
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Edit Transaction" : "Record Transaction"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEdit ? "Update the details for this transaction." : "Capture income or expense for an office."}
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Income / Expense Toggle */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transaction Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setType("income"); setSelectedCategory("") }}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${type === "income"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30"
                    }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => { setType("expense"); setSelectedCategory("") }}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${type === "expense"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30"
                    }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  Expense
                </button>
              </div>
            </div>

            <div className="border-t" />

            {/* Financial Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Financial Details
              </div>
              <div className="grid gap-4">
                {!isEdit && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="txn-officeId">
                      <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Office</span>
                    </Label>
                    <input type="hidden" name="officeId" value={selectedOfficeId} />
                    <Select value={selectedOfficeId} onValueChange={(v) => v && setSelectedOfficeId(v)} required>
                      <SelectTrigger id="txn-officeId" className="w-full">
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
                )}
                <div className="grid gap-1.5">
                  <Label htmlFor="txn-amount">Amount (₹) <span className="text-destructive">*</span></Label>
                  <Input
                    id="txn-amount"
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={transaction?.amount}
                    required
                  />
                </div>

                {/* Category row */}
                <div className="grid gap-1.5">
                  <Label htmlFor="txn-category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    name="category"
                    value={selectedCategory || (transaction?.category ?? "")}
                    onValueChange={(val) => setSelectedCategory(val || "")}
                    key={type}
                  >
                    <SelectTrigger id="txn-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                      <SelectItem value="__custom__">
                        <span className="flex items-center gap-2 text-primary">
                          <PenLine className="h-3.5 w-3.5" />
                          Custom Category
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom category manual input — appears when "Other" or custom selected */}
                {isCustom && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="txn-customCategory" className="flex items-center gap-1.5">
                      <PenLine className="h-3.5 w-3.5 text-primary" />
                      Custom Category Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="txn-customCategory"
                      name="customCategory"
                      placeholder={`e.g. ${type === "income" ? "Grant Revenue" : "Office Renovation"}`}
                      autoFocus
                      className="border-primary/50 focus-visible:ring-primary/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Type a specific category name that best describes this {type}.
                    </p>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="txn-date">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date <span className="text-destructive">*</span></span>
                  </Label>
                  <Input
                    id="txn-date"
                    name="date"
                    type="date"
                    defaultValue={defaultDate}
                    required
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="txn-description">Description / Notes</Label>
                  <Textarea
                    id="txn-description"
                    name="description"
                    placeholder="Add any relevant details about this transaction..."
                    rows={3}
                    defaultValue={transaction?.description}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="min-w-[140px]">
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
