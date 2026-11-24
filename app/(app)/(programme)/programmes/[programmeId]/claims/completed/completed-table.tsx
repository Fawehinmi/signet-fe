import Link from "next/link"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { completionTags } from "@/lib/claim-labels"
import { formatDate } from "@/lib/format"
import { resultLabelTags } from "@/lib/programme-labels"
import type { Completion } from "@/lib/data/results"

export type CompletedRow = Completion & {
  name: string | null
  from: string
  claim: { periodId: string; label: string; version: string } | null
}

export function CompletedTable({ programmeId, rows }: { programmeId: string; rows: CompletedRow[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Participant</Th>
          <Th>Result</Th>
          {/* <Th>Label before</Th>
          <Th>How it was completed</Th> */}
          <Th>Completed</Th>
          <Th>For claim</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const before = resultLabelTags[row.labelBefore]
          const how = completionTags[row.how]

          return (
            <tr key={`${row.resultId}-${row.on}-${index}`}>
              <Td>
                <p className="font-semibold text-grey-900">{row.name ?? row.participantRef}</p>
                <p className="text-xs text-grey-700">{row.name ? `${row.participantRef}, ${row.from}` : row.from}</p>
              </Td>
              <Td>{row.result}</Td>
              {/* <Td>
                <Tag tone={before.tone}>{before.label}</Tag>
              </Td> */}
              {/* <Td className="py-2.5">
                <div className="flex flex-col items-start gap-1">
                  <Tag tone={how.tone}>{how.label}</Tag>
                  <span className="text-xs text-grey-700">{row.detail}</span>
                </div>
              </Td> */}
              <Td>{formatDate(row.on)}</Td>
              <Td>
                {row.claim ? (
                  <>
                    <p className="font-semibold text-grey-900">{row.claim.label}</p>
                    <p className="text-xs text-grey-700">{row.claim.version}</p>
                  </>
                ) : (
                  <>
                    <p className="text-grey-900">Next claim</p>
                    <p className="text-xs text-grey-700">Not in a claim yet</p>
                  </>
                )}
              </Td>
              <Td className="text-right">
                {row.claim && (
                  <Link
                    href={`/programmes/${programmeId}/claims/${row.claim.periodId}`}
                    className={buttonStyles({ variant: "text", size: "sm" })}
                  >
                    View claim
                  </Link>
                )}
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
