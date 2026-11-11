"use client"

import { forwardRef, useId } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"
import { FieldShell, controlClass, messageId } from "./field-shell"

type SelectOption = {
  value: string
  label: string
}

type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  helper?: string
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { label, options, placeholder = "Choose one", error, helper, id, className, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <FieldShell id={selectId} label={label} error={error} helper={helper} locked={props.disabled}>
      <select
        ref={ref}
        id={selectId}
        required
        aria-invalid={!!error}
        aria-describedby={error || helper ? messageId(selectId) : undefined}
        className={cn(
          controlClass,
          "absolute inset-0 h-full cursor-pointer appearance-none rounded pr-12 pl-4 invalid:text-grey-500 [&>option]:text-grey-900",
          className,
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className={cn("pointer-events-none ml-auto size-5", error ? "text-danger-700" : "text-grey-700")} />
    </FieldShell>
  )
})
