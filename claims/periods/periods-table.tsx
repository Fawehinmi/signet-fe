import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { claimStatusTags } from "@/lib/claim-labels"
import type { Claim, ClaimPeriod } from "@/lib/data/claims"
import { formatDate, formatPeriod } from "@/lib/format"
import { ChangeDate } from "./change-date"

type PeriodsTableProps = {
  programmeId: string
  periods: ClaimPeriod[]
  claims: Claim[]
  canChangeDates: boolean
}

export function PeriodsTable({ programmeId, periods, claims, canChangeDates }: PeriodsTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Period</Th>
          <Th>Send-by date</Th>
          <Th>Status</Th>
          <Th>Claim</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {periods.map((period) => {
          const latest = claims.find((claim) => claim.periodId === period.id)
          const claimed = latest?.status === "accepted"
          const latestLabel = latest && claimStatusTags[latest.status].label

          return (
            <tr key={period.id}>
              <Td>
                <p className="font-semibold text-grey-900">{period.label}</p>
                <p className="text-xs text-grey-700">{formatPeriod(period.start, period.end)}</p>
              </Td>
              <Td>{formatDate(period.sendBy)}</Td>
              <Td>{claimed ? <Tag tone="ok">Claimed</Tag> : <Tag tone="info">Open</Tag>}</Td>
              <Td>
                {latest && latestLabel ? (
                  `Version ${latest.version}, ${latestLabel.charAt(0).toLowerCase()}${latestLabel.slice(1)}`
                ) : (
                  <span className="text-grey-600">Not started</span>
                )}
              </Td>
              <Td className="text-right">
                {canChangeDates && !claimed && <ChangeDate programmeId={programmeId} period={period} />}
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
