"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/cn"
import { FieldShell, controlClass, messageId } from "./field-shell"

type TextareaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  helper?: string
}

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(function TextareaInput(
  { label, error, helper, id, rows = 4, className, ...props },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <FieldShell
      id={textareaId}
      label={label}
      error={error}
      helper={helper}
      locked={props.readOnly || props.disabled}
      multiline
    >
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error || helper ? messageId(textareaId) : undefined}
        className={cn(controlClass, "resize-y leading-6", className)}
        {...props}
      />
    </FieldShell>
  )
})
