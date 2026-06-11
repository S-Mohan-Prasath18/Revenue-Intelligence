"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createNotification,
} from "@/lib/data"
import type { TransactionType } from "@/lib/types"
import { canAccess } from "@/lib/types"
import { formatCurrency } from "@/lib/analytics"

async function assertManager() {
  const session = await getSession()
  if (!session || !canAccess(session.role, "transactions")) {
    throw new Error("Not authorized to manage transactions.")
  }
  return session
}

export async function createTransactionAction(formData: FormData) {
  const session = await assertManager()
  const officeId = String(formData.get("officeId") || "")
  const type = String(formData.get("type") || "income") as TransactionType
  const category = String(formData.get("category") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const amount = Number(formData.get("amount") || 0)
  const date = String(formData.get("date") || "") || new Date().toISOString()

  if (!officeId) throw new Error("Please select an office.")
  if (!category) throw new Error("Category is required.")
  if (!amount || amount <= 0) throw new Error("Amount must be greater than zero.")

  const txn = await createTransaction({
    officeId,
    type,
    category,
    description,
    amount,
    date: new Date(date).toISOString(),
    createdBy: session.userId,
  })

  await createNotification({
    officeId,
    category: type === "income" ? "revenue" : "expense",
    title: type === "income" ? "New income recorded" : "New expense recorded",
    message: `${category}: ${formatCurrency(amount)} added.`,
  })

  revalidatePath("/", "layout")
  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/reports")
  return txn
}

export async function updateTransactionAction(formData: FormData) {
  await assertManager()
  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Missing transaction id.")

  const type = String(formData.get("type") || "income") as TransactionType
  const category = String(formData.get("category") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const amount = Number(formData.get("amount") || 0)
  const date = String(formData.get("date") || "")

  if (!category) throw new Error("Category is required.")
  if (!amount || amount <= 0) throw new Error("Amount must be greater than zero.")

  await updateTransaction(id, {
    type,
    category,
    description,
    amount,
    date: date ? new Date(date).toISOString() : undefined,
  })

  revalidatePath("/", "layout")
  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/reports")
}

export async function deleteTransactionAction(formData: FormData) {
  await assertManager()
  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Missing transaction id.")
  await deleteTransaction(id)
  revalidatePath("/", "layout")
  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/reports")
}
