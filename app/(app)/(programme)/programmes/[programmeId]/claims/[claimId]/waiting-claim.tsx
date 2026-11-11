import Link from "next/link"
import { Clock } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { Button, buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import { adjustmentTotal, claimTotal, type Claim, type ClaimPeriod } from "@/lib/data/claims"
import { getSignOffHolders } from "@/lib/data/team"
import { formatDate, initials, plural } from "@/lib/format"
import { ClaimChanges } from "./claim-changes"
import { ClaimCounts } from "./claim-counts"
import { SubmitClaim } from "./submit-claim"

type WaitingClaimProps = {
  programmeId: string
  claim: Claim
  period: ClaimPeriod
  commissioner: string
  viewer: { name: string; canSignOff: boolean }
}

export async function WaitingClaim({ programmeId, claim, period, commissioner, viewer }: WaitingClaimProps) {
  const holders = await getSignOffHolders(programmeId)
  const others = holders.filter((holder) => holder.name !== claim.builtBy)
  const isBuilder = claim.builtBy === viewer.name
  const canSubmit = viewer.canSignOff && !isBuilder
  const stuck = others.length === 0
  const total = claimTotal(claim)
  const adjustments = adjustmentTotal(claim)
  const asAt = claim.asAt ? formatDate(claim.asAt) : "Not yet"
  const claimsPath = `/programmes/${programmeId}/claims`
  const names = others.length === 1 ? others[0].name : `${others[0]?.name} or another Sign-off holder`

  const people = [
    ...others.map((holder) => ({ name: holder.name, note: holder.jobTitle, canSubmit: true })),
    { name: claim.builtBy, note: "Built this claim", canSubmit: false },
  ]

  return (
    <>
      <PageHeader
        title={canSubmit ? `Submit the ${period.label} claim` : `${period.label} claim`}
        tags={stuck ? <Tag tone="warn">Waiting</Tag> : <Tag tone="info">Waiting for Sign-off</Tag>}
        breadcrumbs={[{ label: "Claims", href: claimsPath }, { label: period.label }]}
        description={
          canSubmit ? `Check the claim, then submit it to ${commissioner}.` : `Version ${claim.version}. As at ${asAt}.`
        }
        actions={
          viewer.canSignOff && (
            <>
              <Link href={`${claimsPath}/${claim.id}/preview`} className={buttonStyles({ variant: "secondary" })}>
                Preview
              </Link>
              {canSubmit ? (
                <SubmitClaim
                  programmeId={programmeId}
                  claimId={claim.id}
                  periodLabel={period.label}
                  commissioner={commissioner}
                  version={claim.version}
                  asAt={asAt}
                  results={total}
                />
              ) : (
                <Button disabled>Submit claim</Button>
              )}
            </>
          )
        }
      />

      {!canSubmit && stuck && isBuilder && (
        <Banner tone="warn" title="You can't submit this claim" className="mb-8">
          You built it, so another Sign-off holder must submit it. Nobody else on the Programme team has Sign-off yet. Ask
          an organisation admin to give someone Sign-off.
        </Banner>
      )}
      {!canSubmit && stuck && !isBuilder && (
        <Banner
          tone="warn"
          title="Nobody else can submit this claim"
          className="mb-8"
          action={
            <Link href={`/programmes/${programmeId}/team`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              Open Programme team
            </Link>
          }
        >
          {claim.builtBy} built it and is the only Sign-off holder. Give someone else Sign-off so they can submit it.
        </Banner>
      )}
      {!canSubmit && !stuck && (
        <Banner icon={Clock} title="Waiting for a Sign-off holder to submit" className="mb-8">
          {isBuilder ? `You built this claim, so ${names} must submit it. We've let them know.` : `${names} can submit it.`}
        </Banner>
      )}

      <Columns
        main={
          <>
            {claim.changes.length > 0 && (
              <Section title="What changed" description={`Since Version ${claim.version - 1}, which was sent back.`}>
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
            {!canSubmit && (
              <Section title="Who can submit">
                <ul className="-mt-4 flex flex-col">
                  {people.map((person) => (
                    <li
                      key={person.name}
                      className="flex items-center gap-3 border-b border-grey-200 py-3.5 last:border-b-0"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-[13px] font-medium text-brand-700">
                        {initials(person.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-grey-900">
                          {person.name}
                          {person.name === viewer.name && (
                            <span className="rounded-full bg-brand-400 px-1.5 text-[11px] leading-4 font-bold text-white">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-grey-700">{person.note}</p>
                      </div>
                      {person.canSubmit ? <Tag tone="ok">Can submit</Tag> : <Tag tone="neutral">Can&apos;t submit</Tag>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            <Section title="Claim">
              <DetailsList
                items={[
                  { label: "Version", value: `Version ${claim.version}` },
                  { label: "As at", value: asAt },
                  { label: "Results", value: total },
                  { label: "Verification", value: `All ${plural(total, "result")} verified` },
                  { label: "Built by", value: `${claim.builtBy}, ${formatDate(claim.builtOn)}` },
                  { label: "Send by", value: formatDate(period.sendBy) },
                ]}
              />
            </Section>
          </>
        }
      />
    </>
  )
}
