import Link from "next/link"
import { FilePlus } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { buttonStyles } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { joinNames } from "@/lib/claim-labels"
import { getClaimPeriods, getToFix } from "@/lib/data/claims"
import { getEvidenceOnFile, getUploadPool, getUploads } from "@/lib/data/evidence"
import { waitingDays, type ProgrammeResult } from "@/lib/data/results"
import { getAdmins } from "@/lib/data/team"
import { participantsInScope } from "@/lib/evidence-matching"
import { formatDate, plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { resultNouns } from "@/lib/result-checks"
import { NeedsEvidenceTable, type NeedsEvidenceRow } from "./needs-evidence-table"
import { UnmatchedFiles } from "./unmatched-files"
import { UploadsTable } from "./uploads-table"

type UploadEvidencePageProps = {
  params: Promise<{ programmeId: string }>
}

function statusFor(result: ProgrammeResult, admins: string): NeedsEvidenceRow["status"] {
  if (result.heldDecision) return { kind: "accepted", by: result.heldDecision.by, on: formatDate(result.heldDecision.on) }
  if (result.check && !result.check.answer) return { kind: "checking", to: admins, on: formatDate(result.check.on) }

  const chase = result.chases[result.chases.length - 1]
  const answer = result.check?.answer
  if (answer && (!chase || answer.on >= chase.on)) {
    return { kind: "sent-back", by: answer.by, on: formatDate(answer.on), reason: answer.reason }
  }
  return chase ? { kind: "asked", by: chase.by, on: formatDate(chase.on), message: chase.message } : { kind: "none" }
}

export default async function UploadEvidencePage({ params }: UploadEvidencePageProps) {
  const { programmeId } = await params
  const { session, programme } = await getProgrammePage(programmeId, "upload-evidence")

  const [uploads, periods, caseload, toFix, adminList] = await Promise.all([
    getUploads(programmeId, session.user.name),
    getClaimPeriods(programmeId),
    getUploadPool(programmeId, { name: session.user.name, jobRole: programme.jobRole }),
    getToFix(programmeId),
    getAdmins(programmeId),
  ])

  const admins = joinNames(adminList.map((admin) => admin.name), "or")
  const needsEvidence: NeedsEvidenceRow[] =
    programme.jobRole === "caseworker"
      ? await Promise.all(
          toFix
            .map((row) => row.result)
            .filter((result) => result.caseworker === session.user.name && result.label === "needs-evidence")
            .map(async (result) => {
              const name = caseload.find((participant) => participant.ref === result.participantRef)?.name ?? result.participantRef
              const evidence = await getEvidenceOnFile(programmeId, result.participantRef, result.result)

              return {
                id: result.id,
                participantRef: result.participantRef,
                name,
                title: `${name}'s ${resultNouns[result.result]}`,
                result: result.result,
                why: result.why,
                waiting: waitingDays(result),
                evidence: evidence.map((file) => `${file.evidenceType}, uploaded ${formatDate(file.on)}`),
                status: statusFor(result, admins),
              }
            }),
        )
      : []

  const unmatched = uploads.flatMap((upload) =>
    upload.unmatched.map((file) => ({
      uploadId: upload.id,
      name: file.name,
      note: `Uploaded ${formatDate(upload.on)}. ${file.reason}`,
      participants: participantsInScope(caseload, upload.scope),
    })),
  )
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
        actions={(uploads.length > 0 || needsEvidence.length > 0) && uploadLink}
      />
      <Columns
        main={
          <>
            {needsEvidence.length > 0 && (
              <Section
                title="Needs evidence"
                description={`Results in your caseload that aren't ready to claim. If you've uploaded the evidence and it still isn't accepted, send it to ${admins || "your organisation admin"} for checking.`}
                count={needsEvidence.length}
              >
                <NeedsEvidenceTable programmeId={programmeId} rows={needsEvidence} admins={admins} />
              </Section>
            )}
            {unmatched.length > 0 && (
              <Section
                title="Unmatched"
                description="These files affect nothing until they're matched to a participant and a result."
                count={unmatched.length}
              >
                <UnmatchedFiles programmeId={programmeId} files={unmatched} />
              </Section>
            )}
            {uploads.length > 0 ? (
              <Section title="Your uploads">
                <UploadsTable programmeId={programmeId} uploads={uploads} periods={periods} caseload={caseload} />
                <p className="mt-3 text-[13px] text-grey-700">Showing {plural(uploads.length, "upload")}</p>
              </Section>
            ) : (
              <EmptyState
                icon={FilePlus}
                title="No uploads yet"
                description="Add evidence for several participants at once. You check who each file is for before anything is added."
                action={uploadLink}
              />
            )}
          </>
        }
      />
    </>
  )
}
