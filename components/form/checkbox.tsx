"use client"

import { forwardRef, useId } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/cn"

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, id, className, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 text-sm text-grey-800">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="peer sr-only"
          {...props}
          type="checkbox"
        />
        <span
          className={cn(
            "mt-px flex size-[18px] shrink-0 items-center justify-center rounded-[2px] border-2 text-white peer-checked:border-brand-400 peer-checked:bg-brand-400 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200",
            error ? "border-danger-400" : "border-grey-600",
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${inputId}-error`} className="pl-[30px] text-xs leading-4 text-danger-700">
          {error}
        </p>
      )}
    </div>
  )
})
