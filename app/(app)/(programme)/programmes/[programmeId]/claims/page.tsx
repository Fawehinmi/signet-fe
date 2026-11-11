import { Inbox } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getClaimPeriods, getClaims, getNextPeriodToClaim } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { ClaimsHeader } from "./claims-header"
import { ClaimsTable } from "./claims-table"

type ClaimsPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function ClaimsPage({ params }: ClaimsPageProps) {
  const { programmeId } = await params
  await getProgrammePage(programmeId, "claims")

  const [claims, periods, nextPeriod, details] = await Promise.all([
    getClaims(programmeId),
    getClaimPeriods(programmeId),
    getNextPeriodToClaim(programmeId),
    getProgrammeDetails(programmeId),
  ])

  return (
    <>
      <ClaimsHeader
        programmeId={programmeId}
        commissioner={details?.commissioner ?? "the commissioner"}
        active="claims"
        claimCount={claims.length}
        canBuild={nextPeriod !== null}
      />
      {claims.length > 0 ? (
        <>
          <ClaimsTable programmeId={programmeId} claims={claims} periods={periods} />
          <p className="mt-3 text-[13px] text-grey-700">Showing {plural(claims.length, "claim")}</p>
        </>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No claims yet"
          description={
            nextPeriod
              ? `Build the ${nextPeriod.label} claim once your partners have sent their results.`
              : "Claims start once the rules are live and your first claim period begins."
          }
        />
      )}
    </>
  )
}
