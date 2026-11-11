import { formatDate } from "@/lib/format"

type Activity = {
    id: string
    text: string
    date: string
}

export function ActivityList({ items }: { items: Activity[] }) {
    return (
        <ul className="flex flex-col gap-3.5">
            {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-300" />
                    <div>
                        <p className="text-sm text-grey-800">{item.text}</p>
                        <p className="text-xs text-grey-700">{formatDate(item.date)}</p>
                    </div>
                </li>
            ))}
        </ul>
    )
}