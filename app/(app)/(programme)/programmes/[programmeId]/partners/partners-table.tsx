import Link from "next/link"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th, Tr } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { Partner } from "@/lib/data/partners"
import { plural } from "@/lib/format"

function fixesSplit(partner: Partner) {
  return [
    partner.overdueChecks > 0 && plural(partner.overdueChecks, "overdue check"),
    partner.needsEvidence > 0 && `${partner.needsEvidence} ${partner.needsEvidence === 1 ? "needs" : "need"} evidence`,
  ]
    .filter(Boolean)
    .join(", ")
}

export function PartnersTable({ programmeId, partners }: { programmeId: string; partners: Partner[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Partner</Th>
          <Th>Sent results</Th>
          <Th>Fixes</Th>
          <Th>Can&apos;t be claimed</Th>
          <Th>Status</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {partners.map((partner) => (
          <Tr key={partner.id} highlight={partner.atRisk}>
            <Td>
              <span className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-display text-[13px] font-medium text-brand-700">
                  {partner.initials}
                </span>
                <span className="font-semibold text-grey-900">{partner.name}</span>
              </span>
            </Td>
            <Td>{partner.sentResults}</Td>
            <Td>
              <p className="text-grey-900">{partner.overdueChecks + partner.needsEvidence}</p>
              {fixesSplit(partner) && <p className="text-xs text-grey-700">{fixesSplit(partner)}</p>}
            </Td>
            <Td>{partner.cannotBeClaimed}</Td>
            <Td>{partner.atRisk ? <Tag tone="warn">At risk</Tag> : <Tag tone="ok">On track</Tag>}</Td>
            <Td className="text-right">
              <Link
                href={`/programmes/${programmeId}/partners/${partner.id}`}
                className={buttonStyles({ variant: "text", size: "sm" })}
              >
                View
              </Link>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  )
}
