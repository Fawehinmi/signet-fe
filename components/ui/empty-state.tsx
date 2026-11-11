import type { LucideIcon } from "lucide-react"

type EmptyStateProps = {
    icon: LucideIcon
    title: string
    description: string
    action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="size-7" />
            </span>
            <h2 className="font-display text-xl font-medium text-grey-900">{title}</h2>
            <p className="max-w-[460px] text-sm leading-[22px] text-grey-800">{description}</p>
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}