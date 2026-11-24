import { getClaimPeriods } from "@/lib/data/claims"
import { getResultChecks, getUploadPool, poolLabel } from "@/lib/data/evidence"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { getProgrammePage } from "@/lib/programme-page"
import { UploadWizard } from "./upload-wizard"

type NewUploadPageProps = {
  params: Promise<{ programmeId: string }>
  searchParams: Promise<{ participant?: string }>
}

export default async function NewUploadPage({ params, searchParams }: NewUploadPageProps) {
  const { programmeId } = await params
  const { participant } = await searchParams
  const { session, programme } = await getProgrammePage(programmeId, "upload-evidence")

  const [periods, caseload, details] = await Promise.all([
    getClaimPeriods(programmeId),
    getUploadPool(programmeId, { name: session.user.name, jobRole: programme.jobRole }),
    getProgrammeDetails(programmeId),
  ])

  const checks = await getResultChecks(
    programmeId,
    caseload.map((participant) => participant.ref),
  )

  return (
    <UploadWizard
      programmeId={programmeId}
      periods={periods.map(({ id, label }) => ({ id, label }))}
      caseload={caseload}
      pool={poolLabel(programme.jobRole)}
      aiOn={details?.aiFeatures.on ?? false}
      checks={checks}
      initialScope={
        caseload.some((item) => item.ref === participant)
          ? { kind: "participant", periodId: "", who: "some", participantRefs: [participant ?? ""] }
          : null
      }
    />
  )
}
