"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Building2,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  FileCheck,
  FilePlus,
  FileText,
  Handshake,
  House,
  Inbox,
  Layers,
  LayoutGrid,
  MessageSquare,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/cn"
import { Logo } from "@/components/ui/logo"
import type { IconName, NavItem } from "@/lib/navigation"

export const icons: Record<IconName, LucideIcon> = {
  home: House,
  layers: Layers,
  users: Users,
  sliders: SlidersHorizontal,
  grid: LayoutGrid,
  partners: Handshake,
  inbox: Inbox,
  "file-check": FileCheck,
  upload: Upload,
  message: MessageSquare,
  building: Building2,
  book: BookOpen,
  person: User,
  clipboard: ClipboardCheck,
  alert: CircleAlert,
  "check-circle": CircleCheck,
  send: Send,
  shield: ShieldCheck,
  "file-text": FileText,
  "file-plus": FilePlus,
}

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

type SidebarProps = {
  items: NavItem[]
  top: React.ReactNode
  user: { name: string; role: string }
}

export function Sidebar({ items, top, user }: SidebarProps) {
  const pathname = usePathname()
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return (
    <div className="flex h-full flex-col gap-5 bg-white px-4 py-6">
      <Logo className="px-2" />
      {top}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = icons[item.icon]
          const active = isActive(pathname, item.href)

          return (
            <Fragment key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-3 text-sm",
                  active ? "bg-brand-50 font-semibold text-brand-600" : "text-grey-800 hover:bg-grey-100",
                )}
              >
                <Icon className={cn("size-5 shrink-0", active ? "text-brand-600" : "text-grey-700")} />
                <span className="truncate">{item.label}</span>
              </Link>
              {item.divider && <div className="mx-3 my-2 h-px bg-grey-200" />}
            </Fragment>
          )
        })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-grey-200 px-2 pt-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-400 font-display text-xs font-medium text-white">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-grey-900">{user.name}</p>
          <p className="text-xs text-grey-700">{user.role}</p>
        </div>
      </div>
    </div>
  )
}
