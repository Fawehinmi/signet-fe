import { notFound } from "next/navigation"
import { Users } from "lucide-react"
import { PageHeader } from "@/components/app/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { getMyParticipants } from "@/lib/caseworker"
import { canOpen } from "@/lib/navigation"
import { getProgrammePage } from "@/lib/programme-page"
import { ParticipantsTable } from "./participants-table"

type ParticipantsPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function ParticipantsPage({ params }: ParticipantsPageProps) {
  const { programmeId } = await params
  const { session, programme } = await getProgrammePage(programmeId, "participants")
  if (programme.position !== "prime" || programme.jobRole !== "caseworker") notFound()

  const rows = await getMyParticipants(programmeId, session.user.name)
  const canUpload = canOpen(session, programme, "upload-evidence")

  return (
    <>
      <PageHeader title="My participants" />
      {rows.length > 0 ? (
        <ParticipantsTable programmeId={programmeId} rows={rows} canUpload={canUpload} />
      ) : (
        <EmptyState icon={Users} title="No participants yet" />
      )}
    </>
  )
}
