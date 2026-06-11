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
    <div className="w-full max-w-sm">
      {/* ── Brand header ── */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #E2C275 100%)",
            borderRadius: "14px",
            boxShadow: "0 4px 20px rgba(212,175,55,.3)",
          }}
        >
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
        >
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {mode === "login"
            ? "Sign in to ST Revenue Intelligence System"
            : "Set up your ST Revenue Intelligence account"}
        </p>
      </div>

      {/* ── Form card ── */}
      <div
        className="p-6"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04)",
        }}
      >
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                required
                className="h-10 text-sm px-3"
                style={{ borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              className="h-10 text-sm px-3"
              style={{ borderRadius: "8px", border: "1px solid var(--border)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-10 text-sm px-3"
              style={{ borderRadius: "8px", border: "1px solid var(--border)" }}
            />
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role" className="text-sm font-medium">Role</Label>
              <Select name="role" defaultValue="user">
                <SelectTrigger
                  id="role"
                  className="h-10 text-sm"
                  style={{ borderRadius: "8px" }}
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-sm">Admin — full access</SelectItem>
                  <SelectItem value="user" className="text-sm">User — standard access</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                The first account created becomes an Admin automatically.
              </p>
            </div>
          )}

          {state?.error && (
            <div
              className="flex items-start gap-2 p-3 text-sm"
              style={{
                background: "rgba(239,68,68,.06)",
                border: "1px solid rgba(239,68,68,.15)",
                borderRadius: "8px",
                color: "#EF4444",
              }}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="mt-1 h-10 w-full text-sm font-semibold btn-gold"
            disabled={pending}
            style={{
              background: "linear-gradient(90deg, #D4AF37, #E2C275, #D4AF37)",
              backgroundSize: "200% auto",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
            }}
          >
            {pending
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold"
              style={{ color: "#D4AF37" }}
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold"
              style={{ color: "#D4AF37" }}
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
