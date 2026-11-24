import { Table, Td, Th } from "@/components/ui/table"
import type { Adjustment, ClaimPeriod } from "@/lib/data/claims"
import { ResultCell } from "../result-cell"

export function AdjustmentsTable({ adjustments, periods }: { adjustments: Adjustment[]; periods: ClaimPeriod[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Result</Th>
          <Th>From claim</Th>
          <Th>Change</Th>
          <Th className="text-right">Count</Th>
        </tr>
      </thead>
      <tbody>
        {adjustments.map((adjustment) => (
          <tr key={`${adjustment.resultId}-${adjustment.fromPeriodId}`}>
            <Td>
              <ResultCell
                participantRef={adjustment.participantRef}
                result={adjustment.result}
                partnerName={adjustment.partnerName}
              />
            </Td>
            <Td>
              <p className="text-grey-900">{periods.find((period) => period.id === adjustment.fromPeriodId)?.label}</p>
              <p className="text-xs text-grey-700">Closed</p>
            </Td>
            <Td className="min-w-[200px] whitespace-normal">
              <p className="text-grey-900">
                {adjustment.before}, now {adjustment.now}
              </p>
              <p className="text-xs text-grey-700">{adjustment.detail}</p>
            </Td>
            <Td className="text-right font-semibold text-grey-900">
              {adjustment.count > 0 ? `+${adjustment.count}` : adjustment.count}
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
