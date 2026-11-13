import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { decisionLabels } from "@/lib/claim-labels"
import type { ClaimItem, Decision } from "@/lib/data/claims"
import { formatDate } from "@/lib/format"
import { resultLabelTags } from "@/lib/programme-labels"
import { ResultCell } from "../result-cell"
import { ReviewSignOff } from "./review-sign-off"

type SignOffTableProps = {
  programmeId: string
  periodId: string
  periodLabel: string
  items: (ClaimItem & { decision: Decision })[]
}

export function SignOffTable({ programmeId, periodId, periodLabel, items }: SignOffTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Participant</Th>
          <Th>Label</Th>
          <Th>Decision</Th>
          <Th>Reason</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const label = resultLabelTags[item.label]

          return (
            <tr key={item.resultId}>
              <Td>
                <ResultCell participantRef={item.participantRef} result={item.result} partnerName={item.partnerName} />
              </Td>
              <Td>
                <Tag tone={label.tone}>{label.label}</Tag>
              </Td>
              <Td>
                <Tag tone="neutral">{decisionLabels[item.decision.kind].action}</Tag>
              </Td>
              <Td className="min-w-[200px] whitespace-normal">
                <p className="line-clamp-2">{item.decision.reason}</p>
              </Td>
              <Td className="text-right">
                <ReviewSignOff
                  programmeId={programmeId}
                  periodId={periodId}
                  periodLabel={periodLabel}
                  item={item}
                  askedOn={formatDate(item.decision.on)}
                />
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
