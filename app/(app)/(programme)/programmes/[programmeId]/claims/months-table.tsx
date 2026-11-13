import Link from "next/link"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { monthStatusTags } from "@/lib/claim-labels"
import type { ClaimMonth } from "@/lib/data/claims"
import { addDays, formatDate, formatPeriod } from "@/lib/format"

type MonthsTableProps = {
  programmeId: string
  months: ClaimMonth[]
  viewer: { name: string; canDecide: boolean; canSignOff: boolean }
}

const needsCompliance = ["ready-to-review", "ready-to-submit", "sent-back"]

export function MonthsTable({ programmeId, months, viewer }: MonthsTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Month</Th>
          <Th>Status</Th>
          <Th>Latest version</Th>
          <Th>Results</Th>
          <Th>Send by</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {months.map((month) => {
          const status = monthStatusTags[month.status]
          const mine = viewer.canSignOff ? month.waiting.filter((item) => item.decision?.by !== viewer.name).length : 0
          const yourTurn = mine > 0 || (viewer.canDecide && needsCompliance.includes(month.status))
          const note =
            mine > 0
              ? `${mine} need${mine === 1 ? "s" : ""} your Sign-off`
              : month.issues > 0
                ? `${month.issues} ${month.latest ? "with issues" : "not ready"}`
                : null

          return (
            <tr key={month.period.id}>
              <Td>
                <p className="font-semibold text-grey-900">{month.period.label}</p>
                <p className="text-xs text-grey-700">{formatPeriod(month.period.start, month.period.end)}</p>
              </Td>
              <Td>
                <Tag tone={status.tone}>{status.label}</Tag>
              </Td>
              <Td>
                {month.latest ? (
                  `Version ${month.latest.version}${month.latest.status === "draft" ? ", draft" : ""}`
                ) : (
                  <span className="text-grey-600">Drafts on {formatDate(addDays(month.period.end, 1))}</span>
                )}
              </Td>
              <Td>
                <p className="text-grey-900">
                  {month.results}
                  {!month.latest && " so far"}
                </p>
                {note && <p className="text-xs text-grey-700">{note}</p>}
              </Td>
              <Td>{formatDate(month.period.sendBy)}</Td>
              <Td className="text-right">
                <Link
                  href={`/programmes/${programmeId}/claims/${month.period.id}`}
                  className={buttonStyles({ variant: yourTurn ? "secondary" : "text", size: "sm" })}
                >
                  {mine > 0 ? "Review" : "View details"}
                </Link>
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
