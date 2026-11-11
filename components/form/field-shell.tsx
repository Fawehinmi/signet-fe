"use client"

import { cn } from "@/lib/cn"

type FieldShellProps = {
  id: string
  label: string
  error?: string
  helper?: string
  locked?: boolean
  multiline?: boolean
  trailing?: React.ReactNode
  children: React.ReactNode
}

export const controlClass =
  "w-full min-w-0 flex-1 bg-transparent text-base text-grey-900 outline-none placeholder:text-grey-500 read-only:text-grey-700 disabled:cursor-not-allowed disabled:text-grey-700"

export function messageId(id: string) {
  return `${id}-message`
}

export function FieldShell({ id, label, error, helper, locked, multiline, trailing, children }: FieldShellProps) {
  const message = error ?? helper

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div
        className={cn(
          "relative flex rounded border px-4 transition-shadow",
          multiline ? "items-start py-4" : "h-14 items-center",
          locked && "border-grey-300 bg-grey-100",
          !locked && "bg-white",
          !locked && error && "border-danger-400 ring-1 ring-danger-400",
          !locked &&
            !error &&
            "border-brand-300 focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-400",
        )}
      >
        <label
          htmlFor={id}
          className={cn(
            "absolute -top-[9px] left-3 px-1 text-xs leading-4 font-semibold",
            error ? "text-danger-700" : locked ? "text-grey-700" : "text-brand-600",
            locked ? "bg-[linear-gradient(#ffffff_55%,#f5f5f5_55%)]" : "bg-white",
          )}
        >
          {label}
        </label>
        {children}
        {trailing && (
          <span className={cn("ml-2 flex shrink-0", error ? "text-danger-700" : "text-grey-700")}>{trailing}</span>
        )}
      </div>
      {message && (
        <p id={messageId(id)} className={cn("pl-4 text-xs leading-4", error ? "text-danger-700" : "text-grey-700")}>
          {message}
        </p>
      )}
    </div>
  )
}
