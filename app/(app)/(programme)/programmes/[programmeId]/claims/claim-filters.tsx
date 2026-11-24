"use client"

import { useRef, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/cn"
import { filterQuery } from "@/lib/claim-filters"

type ClaimFiltersProps = {
  q: string
  month: string
  months: { value: string; label: string }[]
  empty: boolean
  noun: string
  children: React.ReactNode
}

export function ClaimFilters({ q, month, months, empty, noun, children }: ClaimFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState(q)
  const [, startTransition] = useTransition()
  const timer = useRef<number | undefined>(undefined)

  function go(next: { q: string; month: string }) {
    window.clearTimeout(timer.current)
    startTransition(() => router.replace(`${pathname}${filterQuery({ q: next.q.trim(), month: next.month })}`, { scroll: false }))
  }

  function onSearch(value: string) {
    setSearch(value)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => go({ q: value, month }), 300)
  }

  function clear() {
    setSearch("")
    go({ q: "", month: "" })
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-[380px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-grey-600" />
          <input
            type="search"
            aria-label="Search by name or reference"
            placeholder="Search by name or reference"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            className="h-11 w-full rounded border border-brand-300 bg-white pr-10 pl-11 text-[15px] text-grey-900 outline-none placeholder:text-grey-600 focus:border-2 focus:border-brand-400 focus:pr-[39px] focus:pl-[43px] [&::-webkit-search-cancel-button]:appearance-none"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearch("")
                go({ q: "", month })
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded text-grey-700 hover:text-grey-900 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-none"
            >
              <X className="size-[18px]" />
            </button>
          )}
        </div>
        <select
          aria-label="Month"
          value={month}
          onChange={(event) => go({ q: search, month: event.target.value })}
          className={cn(
            "h-11 min-w-[210px] rounded border border-brand-300 bg-white px-3.5 text-[15px] text-grey-900 outline-none focus:border-2 focus:border-brand-400 focus:px-[13px]",
            month && "border-2 border-brand-400 bg-brand-50 px-[13px] font-semibold text-brand-700",
          )}
        >
          <option value="">All months</option>
          {months.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(search || month) && (
          <button
            type="button"
            onClick={clear}
            className="rounded text-sm font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-none"
          >
            Clear filters
          </button>
        )}
      </div>

      {empty ? (
        <div className="border-t border-grey-200 pb-6">
          <EmptyState
            icon={Search}
            title={`No ${noun} match`}
            description="Try another name, reference or month."
            action={
              <Button variant="secondary" size="sm" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        children
      )}
    </>
  )
}
