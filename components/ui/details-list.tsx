type Detail = {
    label: string
    value: React.ReactNode
}

export function DetailsList({ items }: { items: Detail[] }) {
    return (
        <dl className="flex flex-col">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex items-start justify-between gap-4 border-b border-grey-200 py-2.5 first:pt-0 last:border-b-0 last:pb-0"
                >
                    <dt className="text-sm text-grey-700">{item.label}</dt>
                    <dd className="text-right text-sm text-grey-900">{item.value}</dd>
                </div>
            ))}
        </dl>
    )
}