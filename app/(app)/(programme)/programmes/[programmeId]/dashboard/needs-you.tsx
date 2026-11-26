import Link from "next/link"
import { Check, CircleAlert, Clock, Handshake, Inbox, KeyRound, MessageSquare, Undo2 } from "lucide-react"
import { buttonStyles } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import type { NeedItem } from "@/lib/dashboard"
import { Panel } from "./panel"

const icons = {
  check: { icon: Inbox, className: "bg-brand-50 text-brand-600" },
  chase: { icon: Clock, className: "bg-warning-50 text-warning-800" },
  partner: { icon: Handshake, className: "bg-warning-50 text-warning-800" },
  team: { icon: KeyRound, className: "bg-warning-50 text-warning-800" },
  asked: { icon: MessageSquare, className: "bg-warning-50 text-warning-800" },
  "sent-back": { icon: Undo2, className: "bg-warning-50 text-warning-800" },
  waiting: { icon: Clock, className: "bg-warning-50 text-warning-800" },
  needs: { icon: CircleAlert, className: "bg-brand-50 text-brand-600" },
}

export function NeedsYou({ items, className }: { items: NeedItem[]; className?: string }) {
  if (items.length === 0) {
    return (
      <Panel title="Needs you" className={className}>
        <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-success-50 text-success-800">
            <Check className="size-5" />
          </span>
          <p className="text-sm font-semibold text-grey-900">Nothing needs you right now</p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel
      title={
        <>
          Needs you
          <span className="inline-flex h-5 items-center rounded-full bg-warning-50 px-2 text-xs font-semibold text-warning-900">
            {items.length}
          </span>
        </>
      }
      className={className}
    >
      <ul className="-mx-5 border-t border-grey-100">
        {items.map((item) => {
          const { icon: Icon, className: tone } = icons[item.kind]

          return (
            <li key={item.key} className="flex items-center gap-3 border-b border-grey-100 px-5 py-2.5 last:border-b-0">
              <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", tone)}>
                <Icon className="size-4" />
              </span>
              <p className="min-w-0 flex-1 text-sm font-semibold text-grey-900">{item.title}</p>
              <Link href={item.href} className={buttonStyles({ variant: "secondary", size: "sm" })}>
                {item.action}
              </Link>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
