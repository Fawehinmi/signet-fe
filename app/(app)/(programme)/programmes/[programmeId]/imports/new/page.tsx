import { getProgrammeDetails } from "@/lib/data/programmes"
import { getSavedMatching } from "@/lib/data/imports"
import { getProgrammePage } from "@/lib/programme-page"
import { ImportWizard } from "./import-wizard"

type NewImportPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function NewImportPage({ params }: NewImportPageProps) {
  const { programmeId } = await params
  await getProgrammePage(programmeId, "imports")

  const [details, participants, supportRecords] = await Promise.all([
    getProgrammeDetails(programmeId),
    getSavedMatching(programmeId, "participants"),
    getSavedMatching(programmeId, "support-records"),
  ])

  return (
    <ImportWizard
      programmeId={programmeId}
      aiOn={details?.aiFeatures.on ?? false}
      savedMatchings={{ participants, "support-records": supportRecords }}
    />
  )
}
