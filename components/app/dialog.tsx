"use client"

import { useEffect, useId } from "react"

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  footer: React.ReactNode
  children: React.ReactNode
}

export function Dialog({ open, onClose, title, footer, children }: DialogProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-grey-900/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-full w-full max-w-[520px] flex-col gap-4 overflow-y-auto rounded-lg bg-white px-8 py-7 shadow-[0_16px_48px_rgba(33,33,33,0.24)]"
      >
        <h2 id={titleId} className="font-display text-xl font-medium text-grey-900">
          {title}
        </h2>
        {children}
        <div className="flex justify-end gap-3 pt-2">{footer}</div>
      </div>
    </div>
  )
}
