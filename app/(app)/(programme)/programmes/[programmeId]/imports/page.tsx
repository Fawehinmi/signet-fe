import Link from "next/link"
import { Upload } from "lucide-react"
import { PageHeader } from "@/components/app/page-header"
import { buttonStyles } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { getImports } from "@/lib/data/imports"
import { plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { ImportsTable } from "./imports-table"

type ImportsPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function ImportsPage({ params }: ImportsPageProps) {
  const { programmeId } = await params
  const { organisation } = await getProgrammePage(programmeId, "imports")

  const imports = await getImports(programmeId)
  const importLink = (
    <Link href={`/programmes/${programmeId}/imports/new`} className={buttonStyles()}>
      <Upload className="size-[18px]" />
      Import file
    </Link>
  )

  return (
    <>
      <PageHeader
        title="Imports"
        description={`Add participants or support records for ${organisation.name}'s own delivery.`}
        actions={imports.length > 0 && importLink}
      />
      {imports.length > 0 ? (
        <>
          <ImportsTable programmeId={programmeId} imports={imports} />
          <p className="mt-3 text-[13px] text-grey-700">Showing {plural(imports.length, "import")}</p>
          <p className="mt-2 text-[13px] text-grey-700">
            Only for your own delivery. Each partner imports its own participants. Rows with problems are held back, and
            nothing is filled in for you.
          </p>
        </>
      ) : (
        <EmptyState
          icon={Upload}
          title="No imports yet"
          description={`Import a CSV file of participants or support records for ${organisation.name}'s own delivery.`}
          action={importLink}
        />
      )}
    </>
  )
}
