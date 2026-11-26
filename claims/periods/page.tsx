import { CalendarDays } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getClaimPeriods, getClaims } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { ClaimsHeader } from "../claims-header"
import { PeriodsTable } from "./periods-table"

type ClaimPeriodsPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function ClaimPeriodsPage({ params }: ClaimPeriodsPageProps) {
  const { programmeId } = await params
  const { programme } = await getProgrammePage(programmeId, "claims")

  const [periods, claims, details] = await Promise.all([
    getClaimPeriods(programmeId),
    getClaims(programmeId),
    getProgrammeDetails(programmeId),
  ])

  return (
    <>
      <ClaimsHeader
        programmeId={programmeId}
        commissioner={details?.commissioner ?? "the commissioner"}
        active="periods"
        claimCount={claims.length}
        canBuild={false}
      />
      {periods.length > 0 ? (
        <>
          <PeriodsTable
            programmeId={programmeId}
            periods={[...periods].reverse()}
            claims={claims}
            canChangeDates={programme.jobRole === "programme-manager"}
          />
          <p className="mt-3 text-[13px] text-grey-700">Showing {plural(periods.length, "period")}</p>
          <p className="mt-2 text-[13px] text-grey-700">
            Programme managers set send-by dates. Your partners see them, so they know when to send results.
          </p>
        </>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No claim periods yet"
          description="Claim periods start when the programme does. Each one is a month of results."
        />
      )}
    </>
  )
}
