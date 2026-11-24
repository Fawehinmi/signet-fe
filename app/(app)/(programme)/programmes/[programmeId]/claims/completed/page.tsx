import { CircleCheck } from "lucide-react"
import { Section } from "@/components/app/section"
import { EmptyState } from "@/components/ui/empty-state"
import { matchesSearch, readFilters } from "@/lib/claim-filters"
import { partnerLabel } from "@/lib/claim-labels"
import { getClaimPeriods, getLatestClaim, getToFix } from "@/lib/data/claims"
import { getParticipantNames } from "@/lib/data/participants"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { getCompletions, getResults } from "@/lib/data/results"
import { plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { ClaimFilters } from "../claim-filters"
import { ClaimsTabs } from "../claims-tabs"
import { CompletedTable } from "./completed-table"

type CompletedPageProps = {
  params: Promise<{ programmeId: string }>
  searchParams: Promise<{ q?: string; month?: string }>
}

export default async function CompletedPage({ params, searchParams }: CompletedPageProps) {
  const { programmeId } = await params
  await getProgrammePage(programmeId, "claims")

  const [completions, results, periods, toFix, details, names] = await Promise.all([
    getCompletions(programmeId),
    getResults(programmeId),
    getClaimPeriods(programmeId),
    getToFix(programmeId),
    getProgrammeDetails(programmeId),
    getParticipantNames(programmeId),
  ])
  const filters = readFilters(
    await searchParams,
    periods.map((period) => period.id),
  )

  const versions = Object.fromEntries(
    await Promise.all(
      periods.map(async (period) => {
        const latest = await getLatestClaim(programmeId, period.id)
        return [period.id, latest ? `Version ${latest.version}` : "Not drafted yet"] as const
      }),
    ),
  )

  const rows = completions.map((completion) => {
    const periodId = results.find((result) => result.id === completion.resultId)?.periodId ?? null
    const period = periods.find((item) => item.id === periodId)

    return {
      ...completion,
      name: names[completion.participantRef] ?? null,
      from: partnerLabel(completion.partnerName),
      claim: period ? { periodId: period.id, label: period.label, version: versions[period.id] } : null,
    }
  })
  const shown = rows.filter(
    (row) => (!filters.month || row.claim?.periodId === filters.month) && matchesSearch(filters.q, row.participantRef, row.name),
  )

  return (
    <>
      <ClaimsTabs
        programmeId={programmeId}
        commissioner={details?.commissioner ?? "the commissioner"}
        active="completed"
        toFix={toFix.length}
        filters={filters}
      />
      {rows.length > 0 ? (
        <Section
          title="Completed results"
          description="Results that needed fixing and are now settled. Most recent first. Results waiting for Sign-off show in their month's claim until they're approved."
        >
          <ClaimFilters
            q={filters.q}
            month={filters.month}
            months={[...periods].reverse().map((period) => ({ value: period.id, label: period.label }))}
            empty={shown.length === 0}
            noun="results"
          >
            <CompletedTable programmeId={programmeId} rows={shown} />
            <p className="mt-3 text-[13px] text-grey-700">
              Showing {shown.length} of {plural(rows.length, "result")}
            </p>
          </ClaimFilters>
        </Section>
      ) : (
        <EmptyState
          icon={CircleCheck}
          title="Nothing completed yet"
          description="When a result is fixed, or accepted as is or challenged and approved, it shows here."
        />
      )}
    </>
  )
}
