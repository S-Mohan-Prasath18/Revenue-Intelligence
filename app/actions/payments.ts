"use server"

import { revalidatePath } from "next/cache"
import {
  createPayment,
  updatePayment,
  deletePayment as deletePaymentData,
  createNotification,
  listPayments,
  createTransaction,
} from "@/lib/data"
import { requireSession } from "./auth"
import type { PaymentStatus } from "@/lib/types"

export async function createPaymentAction(formData: FormData) {
  const session = await requireSession()
  if (session.role !== "admin") throw new Error("Unauthorized: Only admins can create payments.")

  const officeId = String(formData.get("officeId") || "")
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const amount = parseFloat(String(formData.get("amount") || "0"))
  const dueDate = String(formData.get("dueDate") || "")

  if (!officeId) throw new Error("Office is required.")
  if (!title) throw new Error("Payment title is required.")
  if (!dueDate) throw new Error("Due date is required.")
  if (isNaN(amount) || amount <= 0) throw new Error("Amount must be a positive number.")

  const payment = await createPayment({
    officeId,
    title,
    description,
    amount,
    dueDate: new Date(dueDate).toISOString(),
    status: "pending",
    paidAmount: 0,
    createdBy: session.userId,
  })

  await createNotification({
    officeId,
    category: "payment",
    title: "New payment recorded",
    message: `"${title}" of ₹${amount.toLocaleString("en-IN")} due ${new Date(dueDate).toLocaleDateString("en-IN")}.`,
  })

  revalidatePath("/dashboard")
  revalidatePath("/payments")
  return payment
}

export async function updatePaymentStatusAction(formData: FormData) {
  const session = await requireSession()

  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "") as PaymentStatus
  const paidAmount = parseFloat(String(formData.get("paidAmount") || "0"))

  if (!id) throw new Error("Payment ID is required.")

  const payments = await listPayments()
  const payment = payments.find(p => p.id === id)
  if (!payment) throw new Error("Payment not found.")

  const wasPaid = payment.status === "paid"

  await updatePayment(id, {
    status,
    paidAmount: isNaN(paidAmount) ? 0 : paidAmount,
    paidAt: status === "paid" ? new Date().toISOString() : undefined,
  })

  // Link payment with transactions
  if (status === "paid" && !wasPaid) {
    const finalAmount = !isNaN(paidAmount) && paidAmount > 0 ? paidAmount : payment.amount
    await createTransaction({
      officeId: payment.officeId,
      type: "expense",
      category: "Payment Clearance",
      description: `Cleared payment: ${payment.title}`,
      amount: finalAmount,
      date: new Date().toISOString(),
      createdBy: session.userId,
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/payments")
  revalidatePath("/transactions")
}

export async function deletePaymentAction(formData: FormData) {
  const session = await requireSession()
  if (session.role !== "admin") throw new Error("Unauthorized")

  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Payment ID required.")
  await deletePaymentData(id)
  revalidatePath("/dashboard")
  revalidatePath("/payments")
}
