import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AuthForm } from "@/components/auth-form"

export default async function SignupPage() {
  const session = await getSession()
  if (session) redirect("/dashboard")
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <AuthForm mode="signup" />
    </main>
  )
}
