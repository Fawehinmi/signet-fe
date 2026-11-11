"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/cn"

type RadioCardOption = {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
}

type RadioCardsProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  legend: string
  options: RadioCardOption[]
  error?: string
}

export const RadioCards = forwardRef<HTMLInputElement, RadioCardsProps>(function RadioCards(
  { legend, options, error, className, ...props },
  ref,
) {
  const errorId = useId()

  return (
    <fieldset className={cn("flex flex-col gap-3", className)} aria-describedby={error ? errorId : undefined}>
      <legend className="mb-3 text-sm font-semibold text-grey-900">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "group flex cursor-pointer flex-col gap-1 rounded-lg border bg-white p-4 transition-colors has-[:checked]:border-brand-400 has-[:checked]:bg-brand-tint has-[:checked]:ring-1 has-[:checked]:ring-brand-400 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-200",
              error ? "border-danger-400" : "border-grey-300",
            )}
          >
            <span className="flex items-center gap-3">
              {option.icon && (
                <span className="flex text-grey-700 group-has-[:checked]:text-brand-600">{option.icon}</span>
              )}
              <span className="flex-1 text-base font-semibold text-grey-900">{option.label}</span>
              <input ref={ref} {...props} type="radio" value={option.value} className="sr-only" />
              <span className="flex size-5 items-center justify-center rounded-full border-2 border-grey-600 group-has-[:checked]:border-brand-400">
                <span className="size-2.5 scale-0 rounded-full bg-brand-400 transition-transform group-has-[:checked]:scale-100" />
              </span>
            </span>
            {option.description && <span className="text-sm text-grey-700">{option.description}</span>}
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="text-xs leading-4 text-danger-700">
          {error}
        </p>
      )}
    </fieldset>
  )
})
