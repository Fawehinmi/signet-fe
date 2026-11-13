import Link from "next/link"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { partnerLabel } from "@/lib/claim-labels"
import type { ClaimItem } from "@/lib/data/claims"
import { plural } from "@/lib/format"

const shown = 10

type ReadyTableProps = {
  items: ClaimItem[]
  showAll: boolean
  showAllHref: string
}

export function ReadyTable({ items, showAll, showAllHref }: ReadyTableProps) {
  const visible = showAll ? items : items.slice(0, shown)

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>Participant</Th>
            <Th>Result</Th>
            <Th>Label</Th>
          </tr>
        </thead>
        <tbody>
          {visible.map((item) => (
            <tr key={item.resultId}>
              <Td>
                <p className="font-semibold text-grey-900">{item.participantRef}</p>
                <p className="text-xs text-grey-700">{partnerLabel(item.partnerName)}</p>
              </Td>
              <Td>{item.result}</Td>
              <Td>
                <Tag tone="ok">Ready to claim</Tag>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="mt-3 flex items-center justify-between gap-3 text-[13px] text-grey-700">
        <p>
          Showing {visible.length} of {plural(items.length, "result")}
        </p>
        {visible.length < items.length && (
          <Link href={showAllHref} scroll={false} className="font-semibold text-brand-600 hover:underline">
            Show all
          </Link>
        )}
      </div>
    </>
  )
}
