import { KeyRound } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { matchesSearch, readFilters } from "@/lib/claim-filters"
import { joinNames } from "@/lib/claim-labels"
import { getMonths, getToFix } from "@/lib/data/claims"
import { getParticipantNames } from "@/lib/data/participants"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { getResults } from "@/lib/data/results"
import { plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { ClaimFilters } from "./claim-filters"
import { ClaimsTabs } from "./claims-tabs"
import { MonthsTable } from "./months-table"
import { resultNouns } from "@/lib/result-checks"

type ClaimsPageProps = {
  params: Promise<{ programmeId: string }>
  searchParams: Promise<{ q?: string; month?: string }>
}

export default async function ClaimsPage({ params, searchParams }: ClaimsPageProps) {
  const { programmeId } = await params
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const [months, toFix, details, results, names] = await Promise.all([
    getMonths(programmeId),
    getToFix(programmeId),
    getProgrammeDetails(programmeId),
    getResults(programmeId),
    getParticipantNames(programmeId),
  ])
  const filters = readFilters(
    await searchParams,
    months.map((month) => month.period.id),
  )

  const found = filters.q
    ? results.filter((result) => result.periodId && matchesSearch(filters.q, result.participantRef, names[result.participantRef]))
    : []
  const matches: Record<string, string> = {}
  for (const month of months) {
    const inMonth = found.filter((result) => result.periodId === month.period.id)
    if (inMonth.length === 1) {
      const result = inMonth[0]
      matches[month.period.id] = `${names[result.participantRef] ?? result.participantRef}'s ${resultNouns[result.result]}`
    }
    if (inMonth.length > 1) matches[month.period.id] = plural(inMonth.length, "matching result")
  }

  const shown = months.filter(
    (month) => (!filters.month || month.period.id === filters.month) && (!filters.q || matches[month.period.id]),
  )
  const people = [...new Set(found.filter((result) => matches[result.periodId ?? ""]).map((result) => result.participantRef))]
  const onlyPerson = people.length === 1 ? people[0] : null
  const footer = onlyPerson
    ? `${names[onlyPerson] ? `${names[onlyPerson]}, ${onlyPerson},` : onlyPerson} is in ${shown.length} of ${plural(months.length, "month")}`
    : `Showing ${shown.length} of ${plural(months.length, "month")}`

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
        filters={filters}
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
          <Section
            title="Claims by month"
            description="Open until the commissioner accepts the claim. Then it's Closed. The stage, like Ready to review, is inside each claim."
          >
            <ClaimFilters
              q={filters.q}
              month={filters.month}
              months={months.map((month) => ({ value: month.period.id, label: month.period.label }))}
              empty={shown.length === 0}
              noun="months"
            >
              <MonthsTable programmeId={programmeId} months={shown} viewer={viewer} matches={matches} />
              <p className="mt-3 text-[13px] text-grey-700">{footer}</p>
            </ClaimFilters>
          </Section>
        }
      />
    </>
  )
}
