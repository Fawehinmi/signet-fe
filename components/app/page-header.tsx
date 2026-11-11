import Link from "next/link"

type Breadcrumb = {
    label: string
    href?: string
}

type PageHeaderProps = {
    title: string
    description?: React.ReactNode
    tags?: React.ReactNode
    actions?: React.ReactNode
    breadcrumbs?: Breadcrumb[]
}

export function PageHeader({ title, description, tags, actions, breadcrumbs }: PageHeaderProps) {
    return (
        <header className="mb-8 flex flex-col gap-3">
            {breadcrumbs && (
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.label} className="flex items-center gap-2">
                            {index > 0 && <span className="text-grey-500">/</span>}
                            {crumb.href ? (
                                <Link href={crumb.href} className="font-semibold text-brand-600 hover:underline">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-grey-800">{crumb.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-[32px] leading-10 tracking-[0.25px] text-grey-900">{title}</h1>
                        {tags}
                    </div>
                    {description && <p className="max-w-[640px] text-base text-grey-700">{description}</p>}
                </div>
                {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
            </div>
        </header>
    )
}