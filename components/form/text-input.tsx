"use client"

import { forwardRef, useId } from "react"
import { CircleAlert, Lock } from "lucide-react"
import { cn } from "@/lib/cn"
import { FieldShell, controlClass, messageId } from "./field-shell"

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  helper?: string
  trailing?: React.ReactNode
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, helper, trailing, id, className, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const locked = props.readOnly || props.disabled
  const icon =
    trailing ?? (error ? <CircleAlert className="size-5" /> : locked ? <Lock className="size-5" /> : null)

  return (
    <FieldShell id={inputId} label={label} error={error} helper={helper} locked={locked} trailing={icon}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error || helper ? messageId(inputId) : undefined}
        className={cn(controlClass, "h-full", className)}
        {...props}
      />
    </FieldShell>
  )
})
