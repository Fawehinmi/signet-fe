import { Tag } from "@/components/ui/tag"
import { cn } from "@/lib/cn"
import type { PrimeDashboard } from "@/lib/dashboard"
import { Panel, PanelLink } from "./panel"

type PartnersPanelProps = {
  programmeId: string
  month: string | null
  rows: PrimeDashboard["partners"]
  className?: string
}

export function PartnersPanel({ programmeId, month, rows, className }: PartnersPanelProps) {
  const cell = "border-b border-grey-100 py-2.5 pr-2"

  return (
    <Panel
      title="Our partners"
      action={<PanelLink href={`/programmes/${programmeId}/partners`}>All partners</PanelLink>}
      className={className}
    >
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-xs text-grey-700">
            <th className="border-b border-grey-200 pb-1.5 font-semibold">Delivered by</th>
            {month && <th className="border-b border-grey-200 pb-1.5 font-semibold">{month}</th>}
            <th className="border-b border-grey-200 pb-1.5 font-semibold">Fixes</th>
            <th className="border-b border-grey-200 pb-1.5 font-semibold">Last sent</th>
            <th className="border-b border-grey-200 pb-1.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {rows.map((row) => (
            <tr key={row.key}>
              <td className={cn(cell, "font-semibold text-grey-900")}>{row.name}</td>
              {month && <td className={cn(cell, "text-grey-800")}>{row.results}</td>}
              <td className={cn(cell, "font-semibold", row.behind ? "text-warning-900" : "text-grey-900")}>{row.fixes}</td>
              <td className={cn(cell, "text-grey-800")}>{row.lastSent}</td>
              <td className={cell}>{row.behind ? <Tag tone="warn">Behind</Tag> : <Tag tone="ok">On track</Tag>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}
