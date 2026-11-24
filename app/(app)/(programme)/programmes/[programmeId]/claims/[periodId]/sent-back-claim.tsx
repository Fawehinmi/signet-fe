import Link from "next/link"
import { CircleAlert } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { ProgressSteps } from "@/components/ui/progress-steps"
import { Tag } from "@/components/ui/tag"
import { partnerLabel } from "@/lib/claim-labels"
import type { Claim, ClaimPeriod } from "@/lib/data/claims"
import { formatDate } from "@/lib/format"
import { ClaimVersions } from "./claim-versions"
import { resultNouns } from "@/lib/result-checks"

type SentBackClaimProps = {
  programmeId: string
  period: ClaimPeriod
  claim: Claim
  versions: Claim[]
  commissioner: string
}

export function SentBackClaim({ programmeId, period, claim, versions, commissioner }: SentBackClaimProps) {
  const newer = versions.find((version) => version.version === claim.version + 1)
  const monthPath = `/programmes/${programmeId}/claims/${period.id}`
  const flagged = claim.sentBack?.flagged ?? []

  return (
    <>
      <PageHeader
        title={`${period.label} claim`}
        tags={<Tag tone="warn">Sent back</Tag>}
        breadcrumbs={[
          { label: "Claims", href: `/programmes/${programmeId}/claims` },
          { label: period.label, href: monthPath },
          { label: `Version ${claim.version}` },
        ]}
        description={`Version ${claim.version}, as at ${formatDate(claim.asAt)}.`}
        actions={
          newer && (
            <Link href={`${monthPath}?version=${newer.version}`} className={buttonStyles()}>
              Open Version {newer.version}
            </Link>
          )
        }
      />

      {claim.sentBack && (
        <Banner tone="error" title={`${commissioner} sent this claim back`} className="mb-8">
          Reason: {claim.sentBack.reason}
        </Banner>
      )}

      <Columns
        main={
          <>
            <Section title="Flagged results" count={flagged.length}>
              <ul className="flex flex-col gap-4">
                {flagged.map((item) => (
                  <li key={item.participantRef} className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning-800" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-grey-900">
                        {item.participantRef}, {resultNouns[item.result]}
                      </p>
                      <p className="text-sm text-grey-700">
                        From {partnerLabel(item.partnerName)}. {item.problem}.
                      </p>
                    </div>
                    <Tag tone="warn">Flagged</Tag>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="What happens next">
              <ProgressSteps
                steps={[
                  { label: `Signet drafts Version ${claim.version + 1}`, state: newer ? "done" : "current" },
                  {
                    label: "Fix the flagged results, or leave them out",
                    state: newer?.submitted ? "done" : newer ? "current" : "todo",
                  },
                  { label: `Submit Version ${claim.version + 1}`, state: newer?.submitted ? "done" : "todo" },
                ]}
              />
            </Section>
            <Section title="Claim">
              <DetailsList
                items={[
                  { label: "Sent back by", value: claim.sentBack?.by },
                  { label: "Sent back on", value: claim.sentBack && formatDate(claim.sentBack.on) },
                  {
                    label: "Submitted by",
                    value: claim.submitted && `${claim.submitted.by}, ${formatDate(claim.submitted.on)}`,
                  },
                ]}
              />
            </Section>
            <Section title="Versions">
              <ClaimVersions programmeId={programmeId} versions={versions} currentId={claim.id} />
            </Section>
          </>
        }
      />
    </>
  )
}
