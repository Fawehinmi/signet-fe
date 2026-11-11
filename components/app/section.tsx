import { cn } from "@/lib/cn"

type SectionProps = {
    title: string
    description?: string
    count?: number
    action?: React.ReactNode
    className?: string
    children: React.ReactNode
}

export function Section({ title, description, count, action, className, children }: SectionProps) {
    return (
        <section className={cn("flex flex-col", className)}>
            <div className="flex items-end justify-between gap-4 border-b border-grey-300 pb-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h2 className="font-display text-lg leading-6 font-medium text-grey-900">{title}</h2>
                    {description && <p className="text-sm text-grey-700">{description}</p>}
                </div>
                {action}
                {count !== undefined && (
                    <span className="inline-flex h-5 items-center rounded-full bg-grey-100 px-2 text-xs font-semibold text-grey-800">
                        {count}
                    </span>
                )}
            </div>
            <div className="pt-4">{children}</div>
        </section>
    )
}