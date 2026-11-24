import { Tag } from "@/components/ui/tag"
import { cn } from "@/lib/cn"
import { initials } from "@/lib/format"

type PersonCellProps = {
  name: string
  jobTitle: string
  admin?: boolean
  muted?: boolean
}

export function PersonCell({ name, jobTitle, admin, muted }: PersonCellProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          muted ? "bg-grey-100 text-grey-600" : "bg-brand-100 text-brand-700",
        )}
      >
        {initials(name)}
      </span>
      <div className="min-w-0">
        <p className={cn("flex flex-wrap items-center gap-2 font-semibold", muted ? "text-grey-700" : "text-grey-900")}>
          {name}
          {admin && <Tag tone="info">Organisation admin</Tag>}
        </p>
        <p className="text-xs text-grey-700">{jobTitle}</p>
      </div>
    </div>
  )
}
