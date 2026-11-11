"use client"

import { forwardRef, useId } from "react"

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string
  description?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label htmlFor={inputId} className="flex cursor-pointer items-start gap-4">
      <input ref={ref} id={inputId} role="switch" className="peer sr-only" {...props} type="checkbox" />
      <span className="relative mt-0.5 h-6 w-10 shrink-0 rounded-full bg-grey-500 transition-colors peer-checked:bg-brand-400 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200 peer-disabled:opacity-50 after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold text-grey-900">{label}</span>
        {description && <span className="text-sm text-grey-700">{description}</span>}
      </span>
    </label>
  )
})
