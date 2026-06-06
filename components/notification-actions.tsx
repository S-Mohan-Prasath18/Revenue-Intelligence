"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { markReadAction, markAllReadAction } from "@/app/actions/notifications"
import { Check, CheckCheck } from "lucide-react"

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          await markAllReadAction()
          toast.success("All notifications marked as read")
        })
      }
    >
      <CheckCheck className="mr-1.5 h-4 w-4" />
      Mark all read
    </Button>
  )
}

export function MarkReadButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Mark as read"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const fd = new FormData()
          fd.set("id", id)
          await markReadAction(fd)
        })
      }
    >
      <Check className="h-4 w-4" />
    </Button>
  )
}
