"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/cn"
import type { NavItem } from "@/lib/navigation"
import { icons, isActive } from "./sidebar"

export function BottomTabs({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-grey-200 bg-white pt-2 pb-6 lg:hidden">
      {items.map((item) => {
        const Icon = icons[item.icon]
        const active = isActive(pathname, item.href)

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 text-[11px] leading-[14px] font-semibold",
              active ? "text-brand-600" : "text-grey-700",
            )}
          >
            <Icon className="size-[22px]" />
            {item.mobileLabel ?? item.label}
          </Link>
        )
      })}
    </nav>
  )
}
