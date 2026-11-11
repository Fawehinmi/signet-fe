import { cn } from "@/lib/cn"

const tones = {
  info: "bg-brand-50 text-brand-700",
  ok: "bg-success-50 text-success-900",
  warn: "bg-warning-50 text-warning-900",
  neutral: "bg-grey-100 text-grey-800",
  error: "bg-danger-50 text-danger-800",
}

export function Tag({ tone = "neutral", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
