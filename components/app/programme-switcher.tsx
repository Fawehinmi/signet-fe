"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

type ProgrammeLink = {
  id: string
  name: string
}

export function ProgrammeSwitcher({ current, programmes }: { current: ProgrammeLink; programmes: ProgrammeLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        aria-expanded={open}
        // onClick={() => setOpen((value) => !value)}
        className="flex max-w-full items-center gap-1.5 rounded-md px-2 py-1.5 font-display text-lg font-medium text-grey-900 hover:bg-grey-100"
      >
        <span className="truncate">{current.name}</span>
        {/* <ChevronDown className={cn("size-5 shrink-0 text-grey-700 transition-transform", open && "rotate-180")} /> */}
      </button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 z-30 mt-1 w-72 rounded-lg border border-grey-300 bg-white py-1.5 shadow-lg">
            {programmes.map((programme) => (
              <Link
                key={programme.id}
                href={`/programmes/${programme.id}/dashboard`}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex px-3.5 py-2.5 text-sm hover:bg-grey-100",
                  programme.id === current.id ? "font-semibold text-brand-600" : "text-grey-800",
                )}
              >
                {programme.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
