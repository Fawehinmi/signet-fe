"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/cn"

type RadioGroupProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    legend: string
    options: { value: string; label: string }[]
    helper?: string
    error?: string
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(function RadioGroup(
    { legend, options, helper, error, className, ...props },
    ref,
) {
    const messageId = useId()
    const message = error ?? helper

    return (
        <fieldset className={cn("flex flex-col gap-2", className)} aria-describedby={message ? messageId : undefined}>
            <legend className="mb-2 text-sm font-semibold text-grey-900">{legend}</legend>
            <div className="flex flex-wrap gap-6">
                {options.map((option) => (
                    <label key={option.value} className="group flex cursor-pointer items-center gap-2.5 text-sm text-grey-900">
                        <input ref={ref} {...props} type="radio" value={option.value} className="peer sr-only" />
                        <span
                            className={cn(
                                "flex size-5 items-center justify-center rounded-full border-2 peer-checked:border-brand-400 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200",
                                error ? "border-danger-400" : "border-grey-600",
                            )}
                        >
                            <span className="size-2.5 scale-0 rounded-full bg-brand-400 transition-transform group-has-[:checked]:scale-100" />
                        </span>
                        {option.label}
                    </label>
                ))}
            </div>
            {message && (
                <p id={messageId} className={cn("text-xs leading-4", error ? "text-danger-700" : "text-grey-700")}>
                    {message}
                </p>
            )}
        </fieldset>
    )
})