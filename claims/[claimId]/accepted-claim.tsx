import { Download, Lock } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import { claimTotal, type Claim, type ClaimPeriod } from "@/lib/data/claims"
import { formatDate, formatDateTime } from "@/lib/format"
import { ClaimCounts } from "./claim-counts"

type AcceptedClaimProps = {
  programmeId: string
  claim: Claim
  period: ClaimPeriod
}

export function AcceptedClaim({ programmeId, claim, period }: AcceptedClaimProps) {
  const claimPath = `/programmes/${programmeId}/claims/${claim.id}`

  return (
    <>
      <PageHeader
        title={`${period.label} claim`}
        tags={
          <>
            <Tag tone="ok">Accepted</Tag>
            <Tag tone="neutral">Read only</Tag>
          </>
        }
        breadcrumbs={[{ label: "Claims", href: `/programmes/${programmeId}/claims` }, { label: period.label }]}
        description={`Version ${claim.version}, as at ${claim.asAt ? formatDate(claim.asAt) : "not set"}.`}
        actions={
          <a href={`${claimPath}/receipt`} className={buttonStyles({ variant: "secondary" })}>
            <Download className="size-[18px]" />
            Download receipt
          </a>
        }
      />

      <Banner tone="neutral" icon={Lock} title="This claim is sealed" className="mb-8">
        It can&apos;t be changed. Later changes come through as adjustments in the next claim.
      </Banner>

      <Columns
        main={
          <Section title="Counts by payment type">
            <ClaimCounts counts={claim.counts} />
          </Section>
        }
        side={
          claim.accepted && (
            <Section title="Receipt">
              <DetailsList
                items={[
                  { label: "Receipt number", value: claim.accepted.receiptNumber },
                  { label: "Accepted by", value: `${claim.accepted.by}, ${claim.accepted.organisation}` },
                  { label: "Accepted on", value: formatDateTime(claim.accepted.on) },
                  { label: "Version", value: `Version ${claim.version}` },
                  { label: "Results", value: claimTotal(claim) },
                ]}
              />
            </Section>
          )
        }
      />
    </>
  )
}
