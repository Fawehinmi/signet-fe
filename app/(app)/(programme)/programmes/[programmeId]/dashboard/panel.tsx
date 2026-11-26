import Link from "next/link"
import { cn } from "@/lib/cn"

type PanelProps = {
  title: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Panel({ title, action, className, children }: PanelProps) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-lg border border-grey-200 bg-white", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h2 className="flex items-center gap-2 text-[15px] leading-[22px] font-semibold text-grey-900">{title}</h2>
        {action}
      </div>
      <div className="flex-1 px-5 pb-4">{children}</div>
    </section>
  )
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[13px] font-semibold whitespace-nowrap text-brand-600 hover:underline">
      {children}
    </Link>
  )
}
