"use client"

import { useActionState } from "react"
import Link from "next/link"
import { loginAction, signupAction, type AuthResult } from "@/app/actions/auth"
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
import { AlertCircle, BarChart3 } from "lucide-react"

const initial: AuthResult = {}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? loginAction : signupAction
  const [state, formAction, pending] = useActionState(action, initial)

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {mode === "login" ? "Welcome back to RIOMS" : "Create your RIOMS account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          {mode === "login"
            ? "Sign in to your Revenue Intelligence & Operations dashboard."
            : "Set up access to the Revenue Intelligence & Operations system."}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="employee">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — full access</SelectItem>
                  <SelectItem value="manager">Manager — finance & operations</SelectItem>
                  <SelectItem value="employee">Employee — reports & tasks</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The first account created becomes an Admin automatically.
              </p>
            </div>
          )}

          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={pending}>
            {pending
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
