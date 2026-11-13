import Link from "next/link"
import { FilePlus } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { buttonStyles } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { StepList } from "@/components/ui/step-list"
import { getClaimPeriods } from "@/lib/data/claims"
import { getUploadPool, getUploads } from "@/lib/data/evidence"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { participantsInScope } from "@/lib/evidence-matching"
import { formatDate, plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { UnmatchedFiles } from "./unmatched-files"
import { uploadSteps } from "./upload-steps"
import { UploadsTable } from "./uploads-table"
import { WhoSeesYourFiles } from "./who-sees"

type UploadEvidencePageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function UploadEvidencePage({ params }: UploadEvidencePageProps) {
  const { programmeId } = await params
  const { session, organisation, programme } = await getProgrammePage(programmeId, "upload-evidence")

  const [uploads, periods, caseload, details] = await Promise.all([
    getUploads(programmeId, session.user.name),
    getClaimPeriods(programmeId),
    getUploadPool(programmeId, { name: session.user.name, jobRole: programme.jobRole }),
    getProgrammeDetails(programmeId),
  ])

  const unmatched = uploads.flatMap((upload) =>
    upload.unmatched.map((file) => ({
      uploadId: upload.id,
      name: file.name,
      note: `Uploaded ${formatDate(upload.on)}. ${file.reason}`,
      participants: participantsInScope(caseload, upload.scope),
    })),
  )
  const sharedWith =
    programme.position === "prime"
      ? `${details?.commissioner ?? "Your commissioner"} sees results in claims only.`
      : "Your prime sees result labels only."
  const uploadLink = (
    <Link href={`/programmes/${programmeId}/upload-evidence/new`} className={buttonStyles()}>
      <FilePlus className="size-[18px]" />
      Upload files
    </Link>
  )

  return (
    <>
      <PageHeader
        title="Upload evidence"
        description="Add payslips, letters and forms for several participants at once."
        actions={uploads.length > 0 && uploadLink}
      />
      {uploads.length > 0 ? (
        <Columns
          main={
            <>
              {unmatched.length > 0 && (
                <Section
                  title="Unmatched"
                  description="These files affect nothing until they're matched to a participant and a result."
                  count={unmatched.length}
                >
                  <UnmatchedFiles programmeId={programmeId} files={unmatched} />
                </Section>
              )}
              <Section title="Your uploads">
                <UploadsTable programmeId={programmeId} uploads={uploads} periods={periods} caseload={caseload} />
                <p className="mt-3 text-[13px] text-grey-700">Showing {plural(uploads.length, "upload")}</p>
              </Section>
            </>
          }
          side={
            <>
              <Section title="How it works">
                <StepList steps={uploadSteps} />
              </Section>
              <Section title="Participants">
                <p className="text-sm leading-[22px] text-grey-800">
                  Participants come from Imports. You can only match files to people already on the programme.
                </p>
              </Section>
              <WhoSeesYourFiles organisation={organisation.name} sharedWith={sharedWith} />
            </>
          }
        />
      ) : (
        <EmptyState
          icon={FilePlus}
          title="No uploads yet"
          description="Add evidence for several participants at once. You check who each file is for before anything is added."
          action={uploadLink}
        />
      )}
    </>
  )
}
