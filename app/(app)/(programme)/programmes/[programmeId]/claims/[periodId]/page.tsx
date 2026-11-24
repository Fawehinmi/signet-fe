import { notFound } from "next/navigation"
import { getPeriod, getPeriodClaims } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { getProgrammePage } from "@/lib/programme-page"
import { DraftClaim } from "./draft-claim"
import { OpenMonth } from "./open-month"
import { SealedClaim } from "./sealed-claim"
import { SentBackClaim } from "./sent-back-claim"

type ClaimMonthPageProps = {
  params: Promise<{ programmeId: string; periodId: string }>
  searchParams: Promise<{ version?: string; submitted?: string; ready?: string; show?: string }>
}

export default async function ClaimMonthPage({ params, searchParams }: ClaimMonthPageProps) {
  const { programmeId, periodId } = await params
  const { version, submitted, ready, show } = await searchParams
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const period = await getPeriod(programmeId, periodId)
  if (!period) notFound()

  const [versions, details] = await Promise.all([getPeriodClaims(programmeId, periodId), getProgrammeDetails(programmeId)])
  if (versions.length === 0) return <OpenMonth programmeId={programmeId} period={period} />

  const claim = version ? versions.find((item) => String(item.version) === version) : versions[0]
  if (!claim) notFound()

  const shared = {
    programmeId,
    period,
    claim,
    versions,
    commissioner: details?.commissioner ?? "the commissioner",
  }

  if (claim.status === "draft") {
    return (
      <DraftClaim
        {...shared}
        viewer={{
          name: session.user.name,
          canDecide: programme.jobRole === "compliance-lead",
          canSignOff: programme.permissions.includes("sign-off"),
        }}
        showAllReady={ready === "all"}
        show={show}
      />
    )
  }

  if (claim.status === "sent-back") return <SentBackClaim {...shared} />

  return <SealedClaim {...shared} justSubmitted={submitted === "1" && claim.id === versions[0].id} />
}
