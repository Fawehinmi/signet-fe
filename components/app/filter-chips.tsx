import Link from "next/link"
import { cn } from "@/lib/cn"

type Chip = {
    label: string
    href: string
    count: number
    active: boolean
}

export function FilterChips({ chips }: { chips: Chip[] }) {
    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
                <Link
                    key={chip.href}
                    href={chip.href}
                    aria-current={chip.active ? "true" : undefined}
                    className={cn(
                        "inline-flex h-8 items-center rounded-full border px-3 text-[13px] font-semibold",
                        chip.active ? "border-brand-200 bg-brand-50 text-brand-700" : "border-grey-300 bg-white text-grey-800 hover:bg-grey-100",
                    )}
                >
                    {chip.label} {chip.count}
                </Link>
            ))}
        </div>
    )
}