import Link from "next/link"
import { cn } from "@/lib/cn"

type Tab = {
    label: string
    href: string
    count?: number
    active: boolean
}

export function Tabs({ tabs }: { tabs: Tab[] }) {
    return (
        <nav aria-label="Tabs" className="flex gap-8 overflow-x-auto border-b border-grey-200">
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={tab.active ? "page" : undefined}
                    className={cn(
                        "-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-semibold",
                        tab.active ? "border-brand-600 text-brand-600" : "border-transparent text-grey-700 hover:text-grey-900",
                    )}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span
                            className={cn(
                                "inline-flex h-5 items-center rounded-full px-2 text-xs",
                                tab.active ? "bg-brand-50 text-brand-600" : "bg-grey-100 text-grey-800",
                            )}
                        >
                            {tab.count}
                        </span>
                    )}
                </Link>
            ))}
        </nav>
    )
}