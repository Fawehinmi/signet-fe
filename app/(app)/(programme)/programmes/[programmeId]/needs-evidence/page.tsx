import { notFound } from "next/navigation"
import { CircleCheck } from "lucide-react"
import { PageHeader } from "@/components/app/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { getNeedsEvidence } from "@/lib/caseworker"
import { joinNames } from "@/lib/claim-labels"
import { getAdmins } from "@/lib/data/team"
import { canOpen } from "@/lib/navigation"
import { getProgrammePage } from "@/lib/programme-page"
import { NeedsEvidenceTable } from "./needs-evidence-table"

type NeedsEvidencePageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function NeedsEvidencePage({ params }: NeedsEvidencePageProps) {
  const { programmeId } = await params
  const { session, programme } = await getProgrammePage(programmeId, "needs-evidence")
  if (programme.position !== "prime") notFound()

  const [rows, admins] = await Promise.all([getNeedsEvidence(programmeId, session.user.name), getAdmins(programmeId)])

  return (
    <>
      <PageHeader title="Needs evidence" />
      {rows.length > 0 ? (
        <NeedsEvidenceTable
          programmeId={programmeId}
          rows={rows}
          admins={joinNames(admins.map((admin) => admin.name), "or")}
          canUpload={canOpen(session, programme, "upload-evidence")}
        />
      ) : (
        <EmptyState icon={CircleCheck} title="Nothing needs evidence" />
      )}
    </>
  )
}
