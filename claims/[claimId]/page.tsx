import { notFound } from "next/navigation"
import { getClaim, getPeriod } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { getProgrammePage } from "@/lib/programme-page"
import { AcceptedClaim } from "./accepted-claim"
import { BuildClaim } from "./build-claim"
import { SentBackClaim } from "./sent-back-claim"
import { SubmittedClaim } from "./submitted-claim"
import { WaitingClaim } from "./waiting-claim"

type ClaimPageProps = {
  params: Promise<{ programmeId: string; claimId: string }>
  searchParams: Promise<{ submitted?: string }>
}

export default async function ClaimPage({ params, searchParams }: ClaimPageProps) {
  const { programmeId, claimId } = await params
  const { submitted } = await searchParams
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const claim = await getClaim(programmeId, claimId)
  const period = claim ? await getPeriod(programmeId, claim.periodId) : null
  if (!claim || !period) notFound()

  const details = await getProgrammeDetails(programmeId)
  const commissioner = details?.commissioner ?? "the commissioner"

  if (claim.status === "draft") {
    return <BuildClaim programmeId={programmeId} claim={claim} period={period} />
  }

  if (claim.status === "waiting-for-sign-off") {
    return (
      <WaitingClaim
        programmeId={programmeId}
        claim={claim}
        period={period}
        commissioner={commissioner}
        viewer={{ name: session.user.name, canSignOff: programme.permissions.includes("sign-off") }}
      />
    )
  }

  if (claim.status === "submitted") {
    return (
      <SubmittedClaim
        programmeId={programmeId}
        claim={claim}
        period={period}
        commissioner={commissioner}
        justSubmitted={submitted === "1"}
      />
    )
  }

  if (claim.status === "sent-back") {
    return <SentBackClaim programmeId={programmeId} claim={claim} period={period} commissioner={commissioner} />
  }

  return <AcceptedClaim programmeId={programmeId} claim={claim} period={period} />
}
