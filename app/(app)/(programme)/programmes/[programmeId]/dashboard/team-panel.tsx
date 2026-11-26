import { Tag } from "@/components/ui/tag"
import type { PrimeDashboard } from "@/lib/dashboard"
import { initials } from "@/lib/format"
import { Panel, PanelLink } from "./panel"

type TeamPanelProps = {
  programmeId: string
  team: NonNullable<PrimeDashboard["team"]>
  className?: string
}

export function TeamPanel({ programmeId, team, className }: TeamPanelProps) {
  return (
    <Panel
      title="Programme team"
      action={<PanelLink href={`/programmes/${programmeId}/team`}>Manage team</PanelLink>}
      className={className}
    >
      <ul className="-mt-1">
        {team.map((member) => (
          <li key={member.email} className="flex items-center gap-2.5 border-b border-grey-100 py-2 last:border-b-0">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-grey-100 text-[11px] font-semibold text-grey-800">
              {initials(member.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-grey-900">{member.name}</p>
              <p className="text-xs text-grey-700">{member.role}</p>
            </div>
            {member.signOff && <Tag tone="info">Sign-off</Tag>}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
