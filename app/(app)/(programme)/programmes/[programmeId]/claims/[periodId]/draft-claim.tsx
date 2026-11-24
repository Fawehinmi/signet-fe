import Link from "next/link"
import { CircleCheck, Clock, KeyRound } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { FilterChips } from "@/components/app/filter-chips"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Stats } from "@/components/app/stats"
import { Banner } from "@/components/ui/banner"
import { Button, buttonStyles } from "@/components/ui/button"
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
import { formatDate, plural } from "@/lib/format"
import { AdjustmentsTable } from "./adjustments-table"
import { ChangeSummary } from "./change-summary"
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
  show?: string
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

export async function DraftClaim({ programmeId, period, claim, versions, commissioner, viewer, showAllReady, show }: DraftClaimProps) {
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
  const previous = versions.find((version) => version.version === claim.version - 1)
  const monthPath = `/programmes/${programmeId}/claims/${period.id}`

  const signOffNames = (decidedBy: string) => holders.filter((holder) => holder.name !== decidedBy).map((holder) => holder.name)
  const askedNames = [...new Set(waiting.flatMap((item) => signOffNames(item.decision.by)))]
  const askers = [...new Set(mine.map((item) => item.decision.by))]

  const views = [
    { key: "issues", label: "Fixes", count: otherIssues.length },
    { key: "ready", label: "Ready", count: ready.length },
    { key: "adjustments", label: "Revisions", count: claim.adjustments.length },
    { key: "left-out", label: "Left out", count: claim.leftOut.length },
  ].filter((view) => view.key !== "left-out" || view.count > 0)
  const active = views.find((view) => view.key === show)?.key ?? (otherIssues.length > 0 ? "issues" : "ready")
  const descriptions: Record<string, string> = {
    issues: viewer.canDecide
      ? "Accept a Needs evidence result as is, or challenge a Can't be claimed label. Both need a reason and Sign-off. Or leave it out."
      : "The Compliance lead decides on each of these.",
    ready: "Ready to claim. Nothing to decide.",
    adjustments:
      "These results changed after their claim was closed. Closed claims don't change, so the change comes through here as a revision.",
    "left-out": "These aren't in this claim and don't need Sign-off.",
  }
  const empty: Record<string, string> = {
    issues: mine.length > 0 ? "The fixes are waiting for your Sign-off, above." : "No fixes. Every result is ready to claim.",
    ready: "No results are ready to claim yet.",
    adjustments: "No revisions to closed claims this month.",
    "left-out": "Nothing is left out.",
  }
  const activeCount = views.find((view) => view.key === active)?.count ?? 0

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
        description={`Send by ${formatDate(period.sendBy)}. ${draftedNote(claim)} It's sealed when it's submitted.`}
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
        <Banner tone="ok" icon={CircleCheck} title="Every fix is decided" className="mb-8">
          Preview the claim, then submit it.
        </Banner>
      )}

      <Stats
        items={[
          { label: "Results", value: items.length },
          { label: "Ready", value: ready.length },
          mine.length > 0
            ? { label: "Need your Sign-off", value: mine.length, warn: true }
            : { label: "Fixes", value: issues.length, warn: viewer.canDecide && stage === "ready-to-review" },
          { label: "Left out", value: claim.leftOut.length },
        ]}
      />

      <Columns
        main={
          <>
            {claim.changes.length > 0 && (
              <Section title={`What changed since Version ${claim.version - 1}`} count={claim.changes.length}>
                <ChangeSummary
                  version={claim.version}
                  changes={claim.changes}
                  before={previous?.counts ?? []}
                  after={counts}
                  fixesLeft={issues.length - decided.length}
                />
              </Section>
            )}
            {mine.length > 0 && (
              <Section
                title="Waiting for your Sign-off"
                description="Approved results count in the claim. Rejected ones are left out and go back to Fixes."
                count={mine.length}
              >
                <SignOffTable programmeId={programmeId} periodId={period.id} periodLabel={period.label} items={mine} />
              </Section>
            )}
            <Section title="Results" description={descriptions[active]}>
              <FilterChips
                chips={views.map((view) => ({
                  label: view.label,
                  count: view.count,
                  href: `${monthPath}?show=${view.key}`,
                  active: view.key === active,
                }))}
              />
              {activeCount === 0 ? (
                <p className="border-t border-grey-200 pt-4 text-sm text-grey-700">{empty[active]}</p>
              ) : active === "issues" ? (
                <IssuesTable
                  programmeId={programmeId}
                  periodId={period.id}
                  periodLabel={period.label}
                  nextPeriodLabel={nextPeriod?.label ?? null}
                  items={otherIssues}
                  canDecide={viewer.canDecide}
                  signOffNames={signOffNames}
                />
              ) : active === "ready" ? (
                <ReadyTable items={ready} showAll={showAllReady} showAllHref={`${monthPath}?show=ready&ready=all`} />
              ) : active === "adjustments" ? (
                <AdjustmentsTable adjustments={claim.adjustments} periods={periods} />
              ) : (
                <LeftOutTable items={claim.leftOut} />
              )}
            </Section>
            <Section title="Counts by payment type">
              <ClaimCounts counts={counts} />
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
