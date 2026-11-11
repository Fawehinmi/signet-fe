import { Table, Td, Th } from "@/components/ui/table"
import type { ClaimCount } from "@/lib/data/claims"

export function ClaimCounts({ counts }: { counts: ClaimCount[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Payment type</Th>
          <Th className="text-right">From partners</Th>
          <Th className="text-right">Own delivery</Th>
          <Th className="text-right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {counts.map((count) => (
          <tr key={count.label}>
            <Td className="font-semibold text-grey-900">{count.label}</Td>
            <Td className="text-right">{count.fromPartners}</Td>
            <Td className="text-right">{count.ownDelivery}</Td>
            <Td className="text-right font-semibold text-grey-900">{count.fromPartners + count.ownDelivery}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
