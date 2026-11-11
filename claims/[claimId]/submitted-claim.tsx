import { Download } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import { adjustmentTotal, getPeriodClaims, type Claim, type ClaimPeriod } from "@/lib/data/claims"
import { formatDate, formatDateTime, plural } from "@/lib/format"
import { ClaimChanges } from "./claim-changes"
import { ClaimCounts } from "./claim-counts"
import { ClaimVersions } from "./claim-versions"

type SubmittedClaimProps = {
  programmeId: string
  claim: Claim
  period: ClaimPeriod
  commissioner: string
  justSubmitted: boolean
}

export async function SubmittedClaim({ programmeId, claim, period, commissioner, justSubmitted }: SubmittedClaimProps) {
  const versions = await getPeriodClaims(programmeId, period.id)
  const adjustments = adjustmentTotal(claim)
  const claimPath = `/programmes/${programmeId}/claims/${claim.id}`

  return (
    <>
      <PageHeader
        title={`${period.label} claim`}
        tags={<Tag tone="info">Submitted</Tag>}
        breadcrumbs={[{ label: "Claims", href: `/programmes/${programmeId}/claims` }, { label: period.label }]}
        description={`Version ${claim.version}, as at ${claim.asAt ? formatDate(claim.asAt) : "not set"}. Waiting for ${commissioner} to review it.`}
        actions={
          <a href={`${claimPath}/receipt`} className={buttonStyles({ variant: "secondary" })}>
            <Download className="size-[18px]" />
            Download receipt
          </a>
        }
      />

      {justSubmitted && (
        <Banner tone="ok" title="Claim submitted" className="mb-8">
          {commissioner} can now review it. Download the receipt for your records.
        </Banner>
      )}

      <Columns
        main={
          <>
            {claim.changes.length > 0 && (
              <Section title="What changed" description={`Since Version ${claim.version - 1}.`}>
                <ClaimChanges changes={claim.changes} />
              </Section>
            )}
            <Section
              title="Counts by payment type"
              description={adjustments > 0 ? `Includes ${plural(adjustments, "adjustment")} to earlier claims.` : undefined}
            >
              <ClaimCounts counts={claim.counts} />
            </Section>
          </>
        }
        side={
          <>
            {claim.submitted && (
              <Section title="Receipt">
                <DetailsList
                  items={[
                    { label: "Reference", value: claim.submitted.reference },
                    { label: "Version", value: `Version ${claim.version}` },
                    { label: "Submitted by", value: claim.submitted.by },
                    { label: "Submitted on", value: formatDateTime(claim.submitted.on) },
                  ]}
                />
              </Section>
            )}
            <Section title="Versions">
              <ClaimVersions programmeId={programmeId} versions={versions} currentId={claim.id} />
            </Section>
          </>
        }
      />
    </>
  )
}
