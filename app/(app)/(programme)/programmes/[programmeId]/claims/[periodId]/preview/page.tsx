import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { buttonStyles } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import {
  countClaim,
  draftStage,
  getClaimItems,
  getClaimPeriods,
  getLatestClaim,
  getPeriod,
} from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { getProgrammePage } from "@/lib/programme-page"
import { ClaimCounts } from "../claim-counts"
import { ReasonsList } from "../reasons-list"
import { SubmitClaim } from "../submit-claim"

const shared = [
  "Each result's reference and label",
  "Each result's proof pack",
  "Counts by payment type, including Own delivery",
  "Reasons for anything Accepted as is or Challenged, and who approved it",
  "Adjustments to earlier claims",
]

const kept = [
  "Participant names and contact details",
  "Evidence files",
  "Follow-ups with your partners",
  "Results you left out, and why",
]

function DotList({ items, tone }: { items: string[]; tone: "ok" | "neutral" }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-grey-800">
          <span className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", tone === "ok" ? "bg-success-800" : "bg-grey-500")} />
          {item}
        </li>
      ))}
    </ul>
  )
}

type ClaimPreviewPageProps = {
  params: Promise<{ programmeId: string; periodId: string }>
}

export default async function ClaimPreviewPage({ params }: ClaimPreviewPageProps) {
  const { programmeId, periodId } = await params
  const { programme } = await getProgrammePage(programmeId, "claims")

  const period = await getPeriod(programmeId, periodId)
  if (!period) notFound()

  const monthPath = `/programmes/${programmeId}/claims/${periodId}`
  const claim = await getLatestClaim(programmeId, periodId)
  if (claim?.status !== "draft") redirect(monthPath)

  const [items, periods, details] = await Promise.all([
    getClaimItems(programmeId, claim),
    getClaimPeriods(programmeId),
    getProgrammeDetails(programmeId),
  ])

  const commissioner = details?.commissioner ?? "the commissioner"
  const decided = items.filter((item) => item.decision)
  const canSubmit = programme.jobRole === "compliance-lead" && draftStage(items) === "ready-to-submit"

  return (
    <>
      <PageHeader
        title={`Preview the ${period.label} claim`}
        breadcrumbs={[
          { label: "Claims", href: `/programmes/${programmeId}/claims` },
          { label: period.label, href: monthPath },
          { label: "Preview" },
        ]}
        description="Check what you'll share before it's submitted."
        actions={
          <>
            <Link href={monthPath} className={buttonStyles({ variant: "secondary" })}>
              Back to the claim
            </Link>
            {canSubmit && (
              <SubmitClaim
                programmeId={programmeId}
                periodId={periodId}
                periodLabel={period.label}
                commissioner={commissioner}
                version={claim.version}
                results={items.length}
                acceptedAsIs={decided.filter((item) => item.decision?.kind === "accept-as-is").length}
                challenged={decided.filter((item) => item.decision?.kind === "challenge").length}
              />
            )}
          </>
        }
      />
      <Columns
        main={
          <>
            <Section title="What the commissioner sees" description={commissioner}>
              <DotList items={shared} tone="ok" />
            </Section>
            {decided.length > 0 && (
              <Section title="Reasons they'll see" count={decided.length}>
                <ReasonsList items={decided} />
              </Section>
            )}
            <Section title="Counts by payment type">
              <ClaimCounts counts={countClaim(items, claim.adjustments, periods)} />
            </Section>
          </>
        }
        side={
          <Section title="What stays with you">
            <DotList items={kept} tone="neutral" />
          </Section>
        }
      />
    </>
  )
}
