import Link from "next/link"
import { CircleAlert, Plus } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { Button, buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { ProgressSteps } from "@/components/ui/progress-steps"
import { Tag } from "@/components/ui/tag"
import { getPeriodClaims, type Claim, type ClaimPeriod } from "@/lib/data/claims"
import { formatDate } from "@/lib/format"
import { startNewVersion } from "../actions"
import { ClaimVersions } from "./claim-versions"

type SentBackClaimProps = {
  programmeId: string
  claim: Claim
  period: ClaimPeriod
  commissioner: string
}

export async function SentBackClaim({ programmeId, claim, period, commissioner }: SentBackClaimProps) {
  const versions = await getPeriodClaims(programmeId, period.id)
  const latest = versions[0]
  const newer = latest && latest.version > claim.version ? latest : null
  const fixes = claim.sentBack?.fixes ?? []
  const allFixed = fixes.every((fix) => fix.fixedOn)
  const claimsPath = `/programmes/${programmeId}/claims`

  return (
    <>
      <PageHeader
        title={`${period.label} claim`}
        tags={<Tag tone="warn">Sent back</Tag>}
        breadcrumbs={[{ label: "Claims", href: claimsPath }, { label: period.label }]}
        description={`Version ${claim.version}, as at ${claim.asAt ? formatDate(claim.asAt) : "not set"}.`}
        actions={
          newer ? (
            <Link href={`${claimsPath}/${newer.id}`} className={buttonStyles({ variant: "secondary" })}>
              View Version {newer.version}
            </Link>
          ) : (
            <form action={startNewVersion.bind(null, programmeId, claim.id)}>
              <Button type="submit">
                <Plus className="size-[18px]" />
                Create new version
              </Button>
            </form>
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
            <Section title="What needs fixing">
              <ul className="flex flex-col gap-4">
                {fixes.map((fix) => (
                  <li key={fix.participantRef} className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning-800" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-grey-900">
                        {fix.participantRef}: {fix.problem.charAt(0).toLowerCase()}
                        {fix.problem.slice(1)}
                      </p>
                      <p className="text-sm text-grey-700">
                        {fix.result}, from {fix.partnerName}.{" "}
                        {fix.fixedOn
                          ? `${fix.partnerName} sent it again on ${formatDate(fix.fixedOn)}.`
                          : `Waiting for ${fix.partnerName} to send it again.`}
                      </p>
                    </div>
                    {fix.fixedOn ? <Tag tone="ok">Verified now</Tag> : <Tag tone="warn">Not fixed yet</Tag>}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Next steps">
              <ProgressSteps
                steps={[
                  {
                    label:
                      fixes.length === 1
                        ? `${fixes[0].partnerName} sends ${fixes[0].participantRef} again`
                        : "Partners send the results again",
                    state: allFixed ? "done" : "current",
                  },
                  {
                    label: "Create a new version of the claim",
                    state: newer ? "done" : allFixed ? "current" : "todo",
                  },
                  { label: "A Sign-off holder submits it", state: newer?.submitted ? "done" : newer ? "current" : "todo" },
                ]}
              />
            </Section>
          </>
        }
        side={
          <>
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
            {versions.length > 1 && (
              <Section title="Versions">
                <ClaimVersions programmeId={programmeId} versions={versions} currentId={claim.id} />
              </Section>
            )}
          </>
        }
      />
    </>
  )
}
