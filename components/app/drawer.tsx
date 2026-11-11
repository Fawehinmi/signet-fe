"use client"

import { useEffect, useId } from "react"
import { X } from "lucide-react"

type DrawerProps = {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    footer: React.ReactNode
    children: React.ReactNode
}

export function Drawer({ open, onClose, title, description, footer, children }: DrawerProps) {
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
        <div className="fixed inset-0 z-50">
            <button type="button" aria-label="Close" className="absolute inset-0 bg-grey-900/45" onClick={onClose} />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-white shadow-[-8px_0_24px_rgba(33,33,33,0.16)]"
            >
                <div className="flex items-start justify-between gap-4 border-b border-grey-200 px-8 pt-7 pb-5">
                    <div>
                        <h2 id={titleId} className="font-display text-xl font-medium text-grey-900">
                            {title}
                        </h2>
                        {description && <p className="mt-1 text-sm text-grey-700">{description}</p>}
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="flex size-9 shrink-0 items-center justify-center rounded-md text-grey-700 hover:bg-grey-100"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-8 py-8">{children}</div>
                <div className="flex justify-end gap-3 border-t border-grey-200 px-8 py-4">{footer}</div>
            </div>
        </div>
    )
}