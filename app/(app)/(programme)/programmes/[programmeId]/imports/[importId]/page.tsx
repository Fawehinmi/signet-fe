import { notFound } from "next/navigation"
import { Circle, CircleDashed, Download } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Stats } from "@/components/app/stats"
import { buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import { getImport } from "@/lib/data/imports"
import { getTeamMember } from "@/lib/data/team"
import { formatDateTime, plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { importTypeLabels } from "@/lib/validations/imports"

type ImportPageProps = {
  params: Promise<{ programmeId: string; importId: string }>
}

export default async function ImportPage({ params }: ImportPageProps) {
  const { programmeId, importId } = await params
  await getProgrammePage(programmeId, "imports")

  const record = await getImport(programmeId, importId)
  if (!record) notFound()

  const noun = importTypeLabels[record.type]
  const participants = record.type === "participants"
  const complianceLead = participants ? await getTeamMember(programmeId, "Compliance lead") : null
  const problemCount = record.problems.length
  const importPath = `/programmes/${programmeId}/imports/${record.id}`

  return (
    <>
      <PageHeader
        title="Import complete"
        tags={<Tag tone="ok">Complete</Tag>}
        breadcrumbs={[{ label: "Imports", href: `/programmes/${programmeId}/imports` }, { label: record.fileName }]}
        description={`${formatDateTime(record.on)}, by ${record.importedBy}.`}
      />

      <Stats
        items={[
          { label: `${noun.label} added`, value: record.rowsAdded },
          {
            label: problemCount === 1 ? "Row with a problem" : "Rows with a problem",
            value: problemCount,
            warn: problemCount > 0,
          },
        ]}
      />

      <Columns
        main={
          <Section title="Next steps">
            <ul className="-mt-4 flex flex-col">
              {complianceLead && (
                <li className="flex items-start gap-3 border-b border-grey-200 py-3.5 last:border-b-0">
                  <CircleDashed className="mt-0.5 size-5 shrink-0 text-grey-500" />
                  <div>
                    <p className="text-sm font-semibold text-grey-900">{complianceLead.name} gives them a caseworker</p>
                    <p className="text-sm text-grey-700">
                      {complianceLead.name} has been told {plural(record.rowsAdded, noun.one, noun.many)}{" "}
                      {record.rowsAdded === 1 ? "was" : "were"} added to your own delivery.
                    </p>
                  </div>
                </li>
              )}
              {problemCount > 0 && (
                <li className="flex items-start gap-3 border-b border-grey-200 py-3.5 last:border-b-0">
                  <Circle className="mt-0.5 size-5 shrink-0 text-brand-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-grey-900">Fix {plural(problemCount, "problem row")}</p>
                    <p className="text-sm text-grey-700">
                      {problemCount === 1
                        ? `${record.problems[0].fix.replace(/\.$/, "")}, then import that row again.`
                        : "Fix them in your file, then import those rows again."}
                    </p>
                  </div>
                  <a href={`${importPath}/problems`} className={buttonStyles({ variant: "text", size: "sm" })}>
                    <Download className="size-4" />
                    Download
                  </a>
                </li>
              )}
              {!complianceLead && problemCount === 0 && (
                <li className="py-3.5 text-sm text-grey-700">Nothing else to do. Every row was added.</li>
              )}
            </ul>
          </Section>
        }
        side={
          <>
            <Section title="Import">
              <DetailsList
                items={[
                  { label: "File", value: record.fileName },
                  { label: "Type", value: noun.label },
                  { label: "Delivery", value: "Own delivery" },
                ]}
              />
            </Section>
            {participants && (
              <Section title="Participant details">
                <p className="text-sm leading-[22px] text-grey-800">
                  Participant names are hidden again now the import is done.
                </p>
              </Section>
            )}
          </>
        }
      />
    </>
  )
}
