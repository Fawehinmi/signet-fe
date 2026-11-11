import { cn } from "@/lib/cn"

type Stat = {
    label: string
    value: React.ReactNode
    warn?: boolean
}

export function Stats({ items }: { items: Stat[] }) {
    return (
        <dl className="mb-10 flex flex-wrap gap-y-4 border-y border-grey-200 py-5">
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className={cn("flex min-w-[140px] flex-1 flex-col-reverse gap-0.5 px-6", index === 0 ? "pl-0" : "border-l border-grey-200")}
                >
                    <dt className="text-[13px] text-grey-700">{item.label}</dt>
                    <dd className={cn("font-display text-[28px] leading-9", item.warn ? "text-warning-900" : "text-grey-900")}>
                        {item.value}
                    </dd>
                </div>
            ))}
        </dl>
    )
}