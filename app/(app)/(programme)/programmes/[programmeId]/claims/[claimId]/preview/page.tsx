import Link from "next/link"
import { notFound } from "next/navigation"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Button, buttonStyles } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { getClaim, getPeriod } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { getProgrammePage } from "@/lib/programme-page"
import { sendForSignOff } from "../../actions"
import { ClaimCounts } from "../claim-counts"

const shared = [
  "Counts by payment type, including Own delivery",
  "Each result's participant reference and label",
  "Whether each result is verified",
  "Notes marked Accepted as is or Challenged",
  "Adjustments to earlier claims",
]

const kept = [
  "Participant names and contact details",
  "Evidence documents",
  "Follow-ups with your partners",
  "Results you left out, and why",
]

function DotList({ items, tone }: { items: string[]; tone: "ok" | "neutral" }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-grey-800">
          <span
            className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", tone === "ok" ? "bg-success-800" : "bg-grey-500")}
          />
          {item}
        </li>
      ))}
    </ul>
  )
}

type ClaimPreviewPageProps = {
  params: Promise<{ programmeId: string; claimId: string }>
}

export default async function ClaimPreviewPage({ params }: ClaimPreviewPageProps) {
  const { programmeId, claimId } = await params
  await getProgrammePage(programmeId, "claims")

  const claim = await getClaim(programmeId, claimId)
  const period = claim ? await getPeriod(programmeId, claim.periodId) : null
  if (!claim || !period) notFound()

  const details = await getProgrammeDetails(programmeId)
  const commissioner = details?.commissioner ?? "The commissioner"
  const claimPath = `/programmes/${programmeId}/claims/${claim.id}`
  const draft = claim.status === "draft"

  return (
    <>
      <PageHeader
        title={`Preview the ${period.label} claim`}
        breadcrumbs={[
          { label: "Claims", href: `/programmes/${programmeId}/claims` },
          { label: period.label, href: claimPath },
          { label: "Preview" },
        ]}
        description={
          draft ? "Check what you'll share before a Sign-off holder submits it." : `This is what ${commissioner} will see.`
        }
        actions={
          draft ? (
            <>
              <Link href={claimPath} className={buttonStyles({ variant: "secondary" })}>
                Back to build
              </Link>
              <form action={sendForSignOff.bind(null, programmeId, claim.id)}>
                <Button type="submit">Send for Sign-off</Button>
              </form>
            </>
          ) : (
            <Link href={claimPath} className={buttonStyles({ variant: "secondary" })}>
              Back to claim
            </Link>
          )
        }
      />
      <Columns
        main={
          <Section title="What the commissioner will see" description={commissioner}>
            <DotList items={shared} tone="ok" />
            <div className="mt-8">
              <ClaimCounts counts={claim.counts} />
            </div>
          </Section>
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
