"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/cn"

type AppShellProps = {
  sidebar: React.ReactNode
  topBar?: React.ReactNode
  bottomTabs?: React.ReactNode
  children: React.ReactNode
}

export function AppShell({ sidebar, topBar, bottomTabs, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeOnLinkClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a")) setMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-grey-200 lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-grey-900/45"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative h-full w-[280px] shadow-xl" onClick={closeOnLinkClick}>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "flex h-16 shrink-0 items-center gap-3 border-b border-grey-200 bg-white px-4 lg:px-10",
            !topBar && "lg:hidden",
          )}
        >
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex size-10 items-center justify-center rounded-md text-grey-800 hover:bg-grey-100 lg:hidden"
          >
            <Menu className="size-6" />
          </button>
          {topBar}
        </header>
        <main className={cn("flex-1 px-4 py-6 lg:px-12 lg:pt-8 lg:pb-10", Boolean(bottomTabs) && "pb-28")}>{children}</main>
      </div>

      {bottomTabs}
    </div>
  )
}
