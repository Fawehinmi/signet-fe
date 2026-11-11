import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/cn"

const tones = {
  info: { box: "border-brand-200 bg-brand-50", color: "text-brand-600", icon: Info },
  ok: { box: "border-success-200 bg-success-50", color: "text-success-800", icon: CircleCheck },
  warn: { box: "border-warning-200 bg-warning-50", color: "text-warning-800", icon: TriangleAlert },
  error: { box: "border-danger-200 bg-danger-50", color: "text-danger-700", icon: CircleAlert },
  neutral: { box: "border-grey-300 bg-grey-100", color: "text-grey-700", icon: Info },
}

type BannerProps = {
  tone?: keyof typeof tones
  icon?: LucideIcon
  title: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function Banner({ tone = "info", icon, title, action, children, className }: BannerProps) {
  const style = tones[tone]
  const Icon = icon ?? style.icon

  return (
    <div className={cn("flex gap-3 rounded-lg border px-4 py-3.5", style.box, className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", style.color)} />
      <div className="flex flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="text-sm leading-5">
          <p className="font-bold text-grey-900">{title}</p>
          {children && <div className="text-grey-800">{children}</div>}
        </div>
        {action}
      </div>
    </div>
  )
}
