import { notFound } from "next/navigation"
import { FileCheck } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { EmptyState } from "@/components/ui/empty-state"
import { getProofPackProgress, getProofPackVersions } from "@/lib/data/proof-packs"
import { formatDate, formatDateRange, today } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { GenerateButton } from "./generate-button"
import { GenerationProgress } from "./generation-progress"
import { VersionsTable, type ProofPackRow } from "./versions-table"

type ProofPackPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function ProofPackPage({ params }: ProofPackPageProps) {
  const { programmeId } = await params
  const { programme } = await getProgrammePage(programmeId, "proof-pack")
  if (programme.position !== "prime") notFound()

  const [versions, progress] = await Promise.all([getProofPackVersions(programmeId), getProofPackProgress(programmeId)])
  const generating = progress?.status === "generating"
  const madeOn = (date: string) => (date === today() ? "Today" : formatDate(date))
  const href = (version: number) => `/programmes/${programmeId}/proof-pack/download?version=${version}`

  const rows: ProofPackRow[] = versions.map((version) => ({
    version: version.version,
    madeOn: madeOn(version.madeOn),
    covers: formatDateRange(version.periodStart, version.periodEnd),
    results: version.results.length,
    change: version.change.title,
    href: href(version.version),
    isNew: progress?.status === "ready" && progress.version === version.version,
  }))
  const latest = versions[0]

  if (versions.length === 0 && !progress) {
    return (
      <>
        <PageHeader title="Proof pack" />
        <EmptyState
          icon={FileCheck}
          title="No proof pack yet"
          action={<GenerateButton programmeId={programmeId} label="Generate first version" />}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Proof pack"
        actions={<GenerateButton programmeId={programmeId} label="Generate new version" generating={generating} />}
      />
      <Columns
        main={
          <>
            {progress && <GenerationProgress programmeId={programmeId} progress={progress} downloadHref={href(progress.version)} />}
            <Section title="Versions">
              <VersionsTable
                rows={rows}
                generating={
                  generating && progress
                    ? {
                        version: progress.version,
                        madeOn: "Today",
                        covers: latest ? formatDateRange(latest.periodStart, latest.periodEnd) : "",
                      }
                    : null
                }
              />
            </Section>
          </>
        }
      />
    </>
  )
}
