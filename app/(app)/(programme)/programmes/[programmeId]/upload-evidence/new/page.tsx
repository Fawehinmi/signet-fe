import { getClaimPeriods } from "@/lib/data/claims"
import { getResultChecks, getUploadPool, poolLabel } from "@/lib/data/evidence"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { getProgrammePage } from "@/lib/programme-page"
import { WhoSeesYourFiles } from "../who-sees"
import { UploadWizard } from "./upload-wizard"

type NewUploadPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function NewUploadPage({ params }: NewUploadPageProps) {
  const { programmeId } = await params
  const { session, organisation, programme } = await getProgrammePage(programmeId, "upload-evidence")

  const [periods, caseload, details] = await Promise.all([
    getClaimPeriods(programmeId),
    getUploadPool(programmeId, { name: session.user.name, jobRole: programme.jobRole }),
    getProgrammeDetails(programmeId),
  ])

  const checks = await getResultChecks(
    programmeId,
    caseload.map((participant) => participant.ref),
  )
  const sharedWith =
    programme.position === "prime"
      ? `${details?.commissioner ?? "Your commissioner"} sees results in claims only.`
      : "Your prime sees result labels only."

  return (
    <UploadWizard
      programmeId={programmeId}
      periods={periods.map(({ id, label }) => ({ id, label }))}
      caseload={caseload}
      pool={poolLabel(programme.jobRole)}
      aiOn={details?.aiFeatures.on ?? false}
      checks={checks}
      whoSees={<WhoSeesYourFiles organisation={organisation.name} sharedWith={sharedWith} />}
    />
  )
}
