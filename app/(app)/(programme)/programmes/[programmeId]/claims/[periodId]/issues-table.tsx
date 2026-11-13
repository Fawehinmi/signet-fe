import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { decisionLabels, joinNames } from "@/lib/claim-labels"
import type { ClaimItem } from "@/lib/data/claims"
import { resultLabelTags } from "@/lib/programme-labels"
import { ResultCell } from "../result-cell"
import { DecideResult } from "./decide-result"
import { LeaveOut } from "./leave-out"

type IssuesTableProps = {
  programmeId: string
  periodId: string
  periodLabel: string
  nextPeriodLabel: string | null
  items: ClaimItem[]
  canDecide: boolean
  signOffNames: (decidedBy: string) => string[]
}

function Status({ main, note }: { main: React.ReactNode; note: string }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      {main}
      <span className="text-xs text-grey-700">{note}</span>
    </div>
  )
}

export function IssuesTable({ programmeId, periodId, periodLabel, nextPeriodLabel, items, canDecide, signOffNames }: IssuesTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Participant</Th>
          <Th>Label</Th>
          <Th>Why</Th>
          <Th>
            <span className="sr-only">Decision</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const label = resultLabelTags[item.label]
          const decision = item.decision
          const names = decision ? signOffNames(decision.by) : []

          return (
            <tr key={item.resultId}>
              <Td>
                <ResultCell participantRef={item.participantRef} result={item.result} partnerName={item.partnerName} />
              </Td>
              <Td>
                <Tag tone={label.tone}>{label.label}</Tag>
              </Td>
              <Td className="min-w-[180px] whitespace-normal">{item.why}</Td>
              <Td className="text-right">
                {decision?.approved ? (
                  <Status
                    main={<Tag tone="ok">Approved</Tag>}
                    note={`${decisionLabels[decision.kind].done}, by ${decision.approved.by}`}
                  />
                ) : decision ? (
                  <Status
                    main={<Tag tone="warn">Waiting for Sign-off</Tag>}
                    note={`${decisionLabels[decision.kind].done}, ${names.length > 0 ? `asked ${joinNames(names, "or")}` : "nobody can sign off yet"}`}
                  />
                ) : canDecide ? (
                  <div className="flex justify-end gap-1">
                    <LeaveOut
                      programmeId={programmeId}
                      periodId={periodId}
                      periodLabel={periodLabel}
                      nextPeriodLabel={nextPeriodLabel}
                      item={item}
                    />
                    <DecideResult programmeId={programmeId} periodId={periodId} item={item} />
                  </div>
                ) : (
                  <span className="text-grey-600">Not decided yet</span>
                )}
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
