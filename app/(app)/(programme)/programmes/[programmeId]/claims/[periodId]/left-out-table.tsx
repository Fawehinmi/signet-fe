import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { LeftOut } from "@/lib/data/claims"
import { resultLabelTags } from "@/lib/programme-labels"
import { ResultCell } from "../result-cell"

export function LeftOutTable({ items }: { items: LeftOut[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Participant</Th>
          <Th>Label</Th>
          <Th>Where it went</Th>
          <Th>Reason</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const label = resultLabelTags[item.label]

          return (
            <tr key={`${item.resultId}-${item.on}`}>
              <Td>
                <ResultCell participantRef={item.participantRef} result={item.result} partnerName={item.partnerName} />
              </Td>
              <Td>
                <Tag tone={label.tone}>{label.label}</Tag>
              </Td>
              <Td>{item.where}</Td>
              <Td className="min-w-[200px] whitespace-normal">
                <p>{item.reason}</p>
                <p className="text-xs text-grey-700">{item.by}</p>
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
