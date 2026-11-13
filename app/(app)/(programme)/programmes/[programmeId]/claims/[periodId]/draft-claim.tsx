import Link from "next/link"
import { CircleCheck, Clock, KeyRound } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Stats } from "@/components/app/stats"
import { Banner } from "@/components/ui/banner"
import { Button, buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { ProgressSteps } from "@/components/ui/progress-steps"
import { Tag } from "@/components/ui/tag"
import { joinNames, monthStatusTags } from "@/lib/claim-labels"
import {
  countClaim,
  draftStage,
  getClaimItems,
  getClaimPeriods,
  getNextPeriod,
  isWaiting,
  readyLabel,
  type Claim,
  type ClaimItem,
  type ClaimPeriod,
  type Decision,
} from "@/lib/data/claims"
import { getSignOffHolders } from "@/lib/data/team"
import { formatDate, formatPeriod, plural } from "@/lib/format"
import { AdjustmentsTable } from "./adjustments-table"
import { ClaimChanges } from "./claim-changes"
import { ClaimCounts } from "./claim-counts"
import { ClaimVersions } from "./claim-versions"
import { IssuesTable } from "./issues-table"
import { LeftOutTable } from "./left-out-table"
import { ReadyTable } from "./ready-table"
import { SignOffTable } from "./sign-off-table"
import { SubmitClaim } from "./submit-claim"

type DraftClaimProps = {
  programmeId: string
  period: ClaimPeriod
  claim: Claim
  versions: Claim[]
  commissioner: string
  viewer: { name: string; canDecide: boolean; canSignOff: boolean }
  showAllReady: boolean
}

function hasDecision(item: ClaimItem): item is ClaimItem & { decision: Decision } {
  return Boolean(item.decision)
}

function draftedNote(claim: Claim) {
  const on = formatDate(claim.draftedOn)
  if (claim.draftedBecause === "results-changed") {
    return `Signet drafted this on ${on} because results changed after Version ${claim.version - 1} was submitted.`
  }
  if (claim.draftedBecause === "sent-back") return `Signet drafted this on ${on} because Version ${claim.version - 1} was sent back.`
  return `Signet drafted this on ${on}, when the month ended.`
}

export async function DraftClaim({ programmeId, period, claim, versions, commissioner, viewer, showAllReady }: DraftClaimProps) {
  const [items, periods, nextPeriod, holders] = await Promise.all([
    getClaimItems(programmeId, claim),
    getClaimPeriods(programmeId),
    getNextPeriod(programmeId, period.id),
    getSignOffHolders(programmeId),
  ])

  const counts = countClaim(items, claim.adjustments, periods)
  const stage = draftStage(items)
  const status = monthStatusTags[stage]
  const ready = items.filter((item) => item.label === readyLabel)
  const issues = items.filter((item) => item.label !== readyLabel)
  const waiting = issues.filter(isWaiting).filter(hasDecision)
  const mine = viewer.canSignOff ? waiting.filter((item) => item.decision.by !== viewer.name) : []
  const mineIds = mine.map((item) => item.resultId)
  const otherIssues = issues.filter((item) => !mineIds.includes(item.resultId))
  const decided = issues.filter(hasDecision)
  const monthPath = `/programmes/${programmeId}/claims/${period.id}`

  const signOffNames = (decidedBy: string) => holders.filter((holder) => holder.name !== decidedBy).map((holder) => holder.name)
  const askedNames = [...new Set(waiting.flatMap((item) => signOffNames(item.decision.by)))]
  const askers = [...new Set(mine.map((item) => item.decision.by))]

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
        description={`${draftedNote(claim)} It's sealed when it's submitted.`}
        actions={
          <>
            <Link href={`${monthPath}/preview`} className={buttonStyles({ variant: "secondary" })}>
              Preview
            </Link>
            {viewer.canDecide &&
              (stage === "ready-to-submit" ? (
                <SubmitClaim
                  programmeId={programmeId}
                  periodId={period.id}
                  periodLabel={period.label}
                  commissioner={commissioner}
                  version={claim.version}
                  results={items.length}
                  acceptedAsIs={decided.filter((item) => item.decision.kind === "accept-as-is").length}
                  challenged={decided.filter((item) => item.decision.kind === "challenge").length}
                />
              ) : (
                <Button disabled>Submit claim</Button>
              ))}
          </>
        }
      />

      {mine.length > 0 && (
        <Banner
          tone="warn"
          icon={KeyRound}
          title={`${mine.length === 1 ? "1 result needs" : `${mine.length} results need`} your Sign-off`}
          className="mb-8"
        >
          {joinNames(askers)} asked for it. Approve or reject each one. Only the Compliance lead can submit the claim.
        </Banner>
      )}
      {viewer.canDecide && stage === "waiting-for-sign-off" && askedNames.length > 0 && (
        <Banner icon={Clock} title={`${plural(waiting.length, "result")} waiting for Sign-off`} className="mb-8">
          {joinNames(askedNames, "or")} {askedNames.length === 1 ? "has" : "have"} been asked to approve{" "}
          {joinNames(waiting.map((item) => item.participantRef))}. You can submit once they decide. The claim itself
          doesn&apos;t need Sign-off.
        </Banner>
      )}
      {viewer.canDecide && stage === "waiting-for-sign-off" && askedNames.length === 0 && (
        <Banner tone="warn" title="Nobody else can sign off these results" className="mb-8">
          You can&apos;t approve your own decisions, and nobody else on the Programme team has Sign-off. Ask an
          organisation admin to give someone Sign-off.
        </Banner>
      )}
      {viewer.canDecide && stage === "ready-to-submit" && (
        <Banner tone="ok" icon={CircleCheck} title="Every result with issues is decided" className="mb-8">
          Preview the claim, then submit it.
        </Banner>
      )}

      <Stats
        items={[
          { label: "Results", value: items.length },
          { label: "Ready", value: ready.length },
          mine.length > 0
            ? { label: "Need your Sign-off", value: mine.length, warn: true }
            : { label: "Has issues", value: issues.length, warn: viewer.canDecide && stage === "ready-to-review" },
          { label: "Left out", value: claim.leftOut.length },
        ]}
      />

      <Columns
        main={
          <>
            {claim.changes.length > 0 && (
              <Section title={`What changed since Version ${claim.version - 1}`} count={claim.changes.length}>
                <ClaimChanges changes={claim.changes} />
              </Section>
            )}
            {mine.length > 0 && (
              <Section
                title="Waiting for your Sign-off"
                description="Approved results count in the claim. Rejected ones are left out and go back to To fix."
                count={mine.length}
              >
                <SignOffTable programmeId={programmeId} periodId={period.id} periodLabel={period.label} items={mine} />
              </Section>
            )}
            {otherIssues.length > 0 && (
              <Section
                title="Has issues"
                description={
                  viewer.canDecide
                    ? "Accept a Needs evidence result as is, or challenge a Can't be claimed label. Both need a reason and Sign-off. Or leave it out."
                    : "The Compliance lead decides on each of these."
                }
                count={otherIssues.length}
              >
                <IssuesTable
                  programmeId={programmeId}
                  periodId={period.id}
                  periodLabel={period.label}
                  nextPeriodLabel={nextPeriod?.label ?? null}
                  items={otherIssues}
                  canDecide={viewer.canDecide}
                  signOffNames={signOffNames}
                />
              </Section>
            )}
            {claim.leftOut.length > 0 && (
              <Section title="Left out" description="These aren't in this claim and don't need Sign-off." count={claim.leftOut.length}>
                <LeftOutTable items={claim.leftOut} />
              </Section>
            )}
            {ready.length > 0 && (
              <Section title="Ready" description="Ready to claim. Nothing to decide." count={ready.length}>
                <ReadyTable items={ready} showAll={showAllReady} showAllHref={`${monthPath}?ready=all`} />
              </Section>
            )}
            {claim.adjustments.length > 0 && (
              <Section
                title="Adjustments to earlier claims"
                description="These results changed after their claim was accepted. Accepted claims stay closed, so the change comes through here."
                count={claim.adjustments.length}
              >
                <AdjustmentsTable adjustments={claim.adjustments} periods={periods} />
              </Section>
            )}
            <Section title="Counts by payment type">
              <ClaimCounts counts={counts} />
            </Section>
          </>
        }
        side={
          <>
            {viewer.canDecide ? (
              <Section title="Before you submit">
                <ProgressSteps
                  steps={[
                    {
                      label: "Decide on each result with issues",
                      state: stage === "ready-to-review" ? "current" : "done",
                    },
                    {
                      label: "Wait for Sign-off on any you accept as is or challenge",
                      state: stage === "ready-to-review" ? "todo" : stage === "waiting-for-sign-off" ? "current" : "done",
                    },
                    { label: "Preview, then submit", state: stage === "ready-to-submit" ? "current" : "todo" },
                  ]}
                />
              </Section>
            ) : (
              <Section title={mine.length > 0 ? "Your part" : "Who does what"}>
                <p className="text-sm leading-[22px] text-grey-800">
                  {mine.length > 0
                    ? "Approve or reject each result waiting for you. The Compliance lead submits the claim once you've decided. You can't submit it."
                    : "The Compliance lead decides on results with issues and submits the claim. A Sign-off holder approves any result accepted as is or challenged."}
                </p>
              </Section>
            )}
            <Section title="Claim">
              <DetailsList
                items={[
                  { label: "Period", value: formatPeriod(period.start, period.end) },
                  { label: "Send by", value: formatDate(period.sendBy) },
                  { label: "Version", value: `Version ${claim.version}, draft` },
                  { label: "Results", value: items.length },
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
