import { KeyRound } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { StepList } from "@/components/ui/step-list"
import { joinNames } from "@/lib/claim-labels"
import { getMonths, getToFix } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { ClaimsTabs } from "./claims-tabs"
import { MonthsTable } from "./months-table"

type ClaimsPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function ClaimsPage({ params }: ClaimsPageProps) {
  const { programmeId } = await params
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const [months, toFix, details] = await Promise.all([
    getMonths(programmeId),
    getToFix(programmeId),
    getProgrammeDetails(programmeId),
  ])

  const viewer = {
    name: session.user.name,
    canDecide: programme.jobRole === "compliance-lead",
    canSignOff: programme.permissions.includes("sign-off"),
  }
  const mine = viewer.canSignOff
    ? months.flatMap((month) =>
        month.waiting.filter((item) => item.decision?.by !== viewer.name).map(() => month.period.label),
      )
    : []
  const mineMonths = [...new Set(mine)]

  return (
    <>
      <ClaimsTabs
        programmeId={programmeId}
        commissioner={details?.commissioner ?? "the commissioner"}
        active="months"
        toFix={toFix.length}
      />

      {mine.length > 0 && (
        <Banner
          tone="warn"
          icon={KeyRound}
          title={`${mine.length === 1 ? "1 result needs" : `${mine.length} results need`} your Sign-off`}
          className="mb-8"
        >
          They&apos;re in the {joinNames(mineMonths)} {mineMonths.length === 1 ? "claim" : "claims"}. You only sign off
          results accepted as is or challenged, never the whole claim or your own decisions.
        </Banner>
      )}

      <Columns
        main={
          <Section title="Claims by month">
            <MonthsTable programmeId={programmeId} months={months} viewer={viewer} />
            <p className="mt-3 text-[13px] text-grey-700">Showing {plural(months.length, "month")}</p>
          </Section>
        }
        side={
          <>
            <Section title="How it works">
              <StepList
                steps={[
                  "Signet drafts the claim when the month ends",
                  "The Compliance lead decides on each result with issues",
                  "A Sign-off holder approves any result accepted as is or challenged",
                  "The Compliance lead previews and submits it",
                ]}
              />
            </Section>
            <Section title="Sign-off">
              <p className="text-sm leading-[22px] text-grey-800">
                Sign-off only happens inside a month&apos;s claim, and only for results accepted as is or challenged. The
                claim itself, uploads and To fix never need it.
              </p>
            </Section>
          </>
        }
      />
    </>
  )
}
