import Link from "next/link"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { claimStatusTags } from "@/lib/claim-labels"
import type { Claim, ClaimPeriod } from "@/lib/data/claims"
import { formatDate } from "@/lib/format"

type ClaimsTableProps = {
  programmeId: string
  claims: Claim[]
  periods: ClaimPeriod[]
}

export function ClaimsTable({ programmeId, claims, periods }: ClaimsTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Period</Th>
          <Th>As at</Th>
          <Th>Status</Th>
          <Th>Built by</Th>
          <Th>Submitted</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {claims.map((claim) => {
          const status = claimStatusTags[claim.status]
          const period = periods.find((item) => item.id === claim.periodId)
          const href = `/programmes/${programmeId}/claims/${claim.id}`

          return (
            <tr key={claim.id}>
              <Td>
                <p className="font-semibold text-grey-900">{period?.label}</p>
                <p className="text-xs text-grey-700">Version {claim.version}</p>
              </Td>
              <Td>{claim.asAt ? formatDate(claim.asAt) : <span className="text-grey-600">Not yet</span>}</Td>
              <Td>
                <Tag tone={status.tone}>{status.label}</Tag>
              </Td>
              <Td>{claim.builtBy}</Td>
              <Td>
                {claim.submitted ? formatDate(claim.submitted.on) : <span className="text-grey-600">Not yet</span>}
              </Td>
              <Td className="text-right">
                {claim.status === "draft" ? (
                  <Link href={href} className={buttonStyles({ variant: "secondary", size: "sm" })}>
                    Continue
                  </Link>
                ) : (
                  <Link href={href} className={buttonStyles({ variant: "text", size: "sm" })}>
                    View
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
