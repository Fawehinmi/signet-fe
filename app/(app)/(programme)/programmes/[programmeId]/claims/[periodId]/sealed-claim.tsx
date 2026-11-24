import Link from "next/link"
import { Download, Lock } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import { versionStatusTags } from "@/lib/claim-labels"
import { getClaimPeriods, type Claim, type ClaimPeriod } from "@/lib/data/claims"
import { formatDate, formatDateTime } from "@/lib/format"
import { AdjustmentsTable } from "./adjustments-table"
import { ChangeSummary } from "./change-summary"
import { ClaimCounts } from "./claim-counts"
import { ClaimVersions } from "./claim-versions"
import { LeftOutTable } from "./left-out-table"
import { ReasonsList } from "./reasons-list"

type SealedClaimProps = {
  programmeId: string
  period: ClaimPeriod
  claim: Claim
  versions: Claim[]
  commissioner: string
  justSubmitted: boolean
}

export async function SealedClaim({ programmeId, period, claim, versions, commissioner, justSubmitted }: SealedClaimProps) {
  const periods = await getClaimPeriods(programmeId)
  const latest = versions[0]
  const newer = latest.version > claim.version ? latest : null
  const status = versionStatusTags[claim.status]
  const monthPath = `/programmes/${programmeId}/claims/${period.id}`
  const decided = claim.items.filter((item) => item.decision)
  const previous = versions.find((version) => version.version === claim.version - 1)

  const description =
    claim.status === "submitted"
      ? `Version ${claim.version}, as at ${formatDate(claim.asAt)}. Waiting for ${commissioner} to review it.`
      : `Version ${claim.version}, as at ${formatDate(claim.asAt)}.`

  return (
    <>
      <PageHeader
        title={`${period.label} claim`}
        tags={<Tag tone={status.tone}>{status.label}</Tag>}
        breadcrumbs={[
          { label: "Claims", href: `/programmes/${programmeId}/claims` },
          { label: period.label, href: monthPath },
          { label: `Version ${claim.version}` },
        ]}
        description={description}
        actions={
          <>
            {claim.submitted && (
              <a href={`${monthPath}/receipt?version=${claim.version}`} className={buttonStyles({ variant: "secondary" })}>
                <Download className="size-[18px]" />
                Download receipt
              </a>
            )}
            {newer && (
              <Link href={monthPath} className={buttonStyles()}>
                Open Version {newer.version}
              </Link>
            )}
          </>
        }
      />

      {justSubmitted && (
        <Banner tone="ok" title="Claim submitted" className="mb-8">
          {commissioner} can now review it. Download the receipt for your records.
        </Banner>
      )}
      {newer?.status === "draft" && claim.status === "submitted" && (
        <Banner title={`Version ${newer.version} is ready to review`} className="mb-8">
          Results changed after this version was submitted, and it hasn&apos;t been accepted yet. Review Version{" "}
          {newer.version} and submit it instead. {commissioner} will see what changed.
        </Banner>
      )}
      {claim.status === "replaced" && (
        <Banner tone="neutral" title={`Replaced by Version ${claim.replacedBy}`} className="mb-8">
          {commissioner} reviews the latest version instead.
        </Banner>
      )}
      {claim.status === "accepted" && (
        <Banner tone="neutral" icon={Lock} title="This claim is closed" className="mb-8">
          It can&apos;t be changed. Later changes come through as revisions in a later month&apos;s claim.
        </Banner>
      )}

      <Columns
        main={
          <>
            {claim.changes.length > 0 && (
              <Section title={`What changed since Version ${claim.version - 1}`} count={claim.changes.length}>
                <ChangeSummary version={claim.version} changes={claim.changes} before={previous?.counts ?? []} after={claim.counts} />
              </Section>
            )}
            {decided.length > 0 && (
              <Section title="Reasons the commissioner sees" count={decided.length}>
                <ReasonsList items={decided} />
              </Section>
            )}
            {claim.adjustments.length > 0 && (
              <Section title="Revisions to closed claims" count={claim.adjustments.length}>
                <AdjustmentsTable adjustments={claim.adjustments} periods={periods} />
              </Section>
            )}
            {claim.leftOut.length > 0 && (
              <Section title="Left out" description="Only your team sees these." count={claim.leftOut.length}>
                <LeftOutTable items={claim.leftOut} />
              </Section>
            )}
            <Section title="Counts by payment type">
              <ClaimCounts counts={claim.counts} />
            </Section>
            {claim.accepted ? (
              <Section title="Receipt">
                <DetailsList
                  items={[
                    { label: "Receipt number", value: claim.accepted.receiptNumber },
                    { label: "Accepted by", value: `${claim.accepted.by}, ${claim.accepted.organisation}` },
                    { label: "Accepted on", value: formatDateTime(claim.accepted.on) },
                    { label: "Version", value: `Version ${claim.version}` },
                  ]}
                />
              </Section>
            ) : (
              claim.submitted && (
                <Section title="Receipt">
                  <DetailsList
                    items={[
                      { label: "Reference", value: claim.submitted.reference },
                      { label: "Submitted by", value: claim.submitted.by },
                      { label: "Submitted on", value: formatDateTime(claim.submitted.on) },
                      { label: "Version", value: `Version ${claim.version}` },
                    ]}
                  />
                </Section>
              )
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
