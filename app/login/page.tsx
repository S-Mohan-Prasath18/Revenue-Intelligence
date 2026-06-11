import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AuthForm } from "@/components/auth-form"

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect("/dashboard")
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        background: "#FAFAFA",
      }}
    >
      <AuthForm mode="login" />
    </main>
  )
}
