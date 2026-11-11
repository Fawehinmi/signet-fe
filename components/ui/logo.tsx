import { cn } from "@/lib/cn"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 font-display text-xl font-medium text-grey-900", className)}>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#473CB9" />
        <circle cx="16" cy="16" r="8" fill="none" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="3" fill="#ffffff" />
      </svg>
      Signet
    </span>
  )
}
