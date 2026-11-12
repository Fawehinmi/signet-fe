"use client"

import { useEffect, useState, useTransition } from "react"
import { CircleAlert, Download, Eye } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { Dialog } from "@/components/app/dialog"
import { Section } from "@/components/app/section"
import { Stats } from "@/components/app/stats"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { toCsv } from "@/lib/csv"
import { formatDate, plural } from "@/lib/format"
import { checkRows, importFields, importTypeLabels, type MatchColumnsValues } from "@/lib/validations/imports"
import { logPreview, runImport } from "../actions"
import type { ImportFile } from "./import-wizard"

type PreviewStepProps = {
  programmeId: string
  file: ImportFile
  matching: MatchColumnsValues
  confirming: boolean
  onBack: () => void
  onConfirm: () => void
  onCancelConfirm: () => void
}

const shownRows = 10

export function PreviewStep({ programmeId, file, matching, confirming, onBack, onConfirm, onCancelConfirm }: PreviewStepProps) {
  const [showProblems, setShowProblems] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importing, startImporting] = useTransition()

  const { ready, problems } = checkRows(file.type, file.headers, file.rows, matching.matching)
  const chosen = Object.values(matching.matching)
  const fields = importFields[file.type].filter((field) => chosen.includes(field.key))
  const noun = importTypeLabels[file.type]
  const readyLabel = plural(ready.length, noun.one, noun.many)

  useEffect(() => {
    logPreview(programmeId, file.name)
  }, [programmeId, file.name])

  function nameOf(values: Record<string, string>) {
    return file.type === "participants"
      ? [values.firstName, values.lastName].filter(Boolean).join(" ")
      : (values.participantRef ?? "")
  }

  function downloadProblems() {
    const csv = toCsv([
      ["Row", ...file.headers, "Problem", "How to fix"],
      ...problems.map((problem) => [problem.row, ...(file.rows[problem.row - 2] ?? []), problem.problem, problem.fix]),
    ])
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${file.name.replace(/\.csv$/i, "")}_problems.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function importNow() {
    setError(null)
    startImporting(async () => {
      const result = await runImport(programmeId, {
        fileName: file.name,
        type: file.type,
        headers: file.headers,
        rows: file.rows,
        matching: matching.matching,
        saveMatching: matching.saveMatching,
      })

      if (result?.error) setError(result.error)
    })
  }

  if (showProblems) {
    return (
      <>
        <Banner tone="warn" title={`${plural(problems.length, "row")} won't be imported`} className="mb-8">
          Signet never fills in missing details. Fix these rows in your file, then import them again.
        </Banner>
        <Section title="Problems">
          <Table>
            <thead>
              <tr>
                <Th>Row</Th>
                <Th>{file.type === "participants" ? "Name" : "Participant ref"}</Th>
                <Th>Problem</Th>
                <Th>How to fix it</Th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem.row}>
                  <Td>Row {problem.row}</Td>
                  <Td>{nameOf(problem.values) || <span className="text-grey-600">Blank</span>}</Td>
                  <Td>
                    <Tag tone="warn">{problem.problem}</Tag>
                  </Td>
                  <Td>{problem.fix}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-grey-200 pt-4">
            <Button variant="secondary" onClick={downloadProblems}>
              <Download className="size-[18px]" />
              Download problem rows
            </Button>
            <Button onClick={() => setShowProblems(false)}>Back to preview</Button>
          </div>
        </Section>
      </>
    )
  }

  return (
    <>
      <Banner icon={Eye} title="This view is logged" className="mb-8">
        You don&apos;t usually see participant details. Opening this preview is recorded, and names are hidden again
        after the import.
      </Banner>

      <Stats
        items={[
          { label: "Rows in your file", value: file.rows.length },
          { label: "Ready to add", value: ready.length },
          { label: problems.length === 1 ? "Problem" : "Problems", value: problems.length, warn: problems.length > 0 },
        ]}
      />

      <Columns
        main={
          <Section title="Ready to add">
            {ready.length > 0 ? (
              <>
                <Table>
                  <thead>
                    <tr>
                      <Th>Row</Th>
                      {fields.map((field) => (
                        <Th key={field.key}>{field.label}</Th>
                      ))}
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {ready.slice(0, shownRows).map((row) => (
                      <tr key={row.row}>
                        <Td>Row {row.row}</Td>
                        {fields.map((field) => (
                          <Td key={field.key}>
                            {field.date && row.values[field.key] ? formatDate(row.values[field.key]) : row.values[field.key]}
                          </Td>
                        ))}
                        <Td>
                          <Tag tone="ok">Ready</Tag>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <p className="mt-3 text-[13px] text-grey-700">
                  Showing {Math.min(shownRows, ready.length)} of {plural(ready.length, "ready row")}
                </p>
              </>
            ) : (
              <p className="text-sm text-grey-700">
                No rows are ready to add. Fix the problems in your file, then import it again.
              </p>
            )}
            <div className="mt-6 flex justify-between gap-3 border-t border-grey-200 pt-4">
              <Button variant="secondary" onClick={onBack}>
                Back
              </Button>
              <Button disabled={ready.length === 0} onClick={onConfirm}>
                Continue
              </Button>
            </div>
          </Section>
        }
        side={
          <Section title="Needs your attention">
            {problems.length > 0 ? (
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning-800" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-grey-900">
                    {problems.length === 1 ? "1 row has a problem" : `${problems.length} rows have problems`}
                  </p>
                  <p className="text-sm text-grey-700">
                    {problems.length === 1
                      ? `Row ${problems[0].row}: ${problems[0].problem.toLowerCase()}. It'll be held back.`
                      : "They'll be held back. Nothing is filled in for you."}
                  </p>
                </div>
                <Button variant="text" size="sm" onClick={() => setShowProblems(true)}>
                  View
                </Button>
              </div>
            ) : (
              <p className="text-sm text-grey-700">Nothing needs your attention. Every row is ready.</p>
            )}
          </Section>
        }
      />

      <Dialog
        open={confirming}
        onClose={onCancelConfirm}
        title={`Import ${readyLabel}?`}
        footer={
          <>
            <Button variant="secondary" onClick={onCancelConfirm}>
              Cancel
            </Button>
            <Button loading={importing} onClick={importNow}>
              Import {readyLabel}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-[22px] text-grey-800">
          They&apos;re added together.{" "}
          {problems.length > 0
            ? `${plural(problems.length, "row")} with problems ${problems.length === 1 ? "is" : "are"} held back, and nothing is filled in for you.`
            : "Nothing is filled in for you."}
        </p>
        <DetailsList
          items={[
            { label: "Ready to add", value: ready.length },
            { label: "Held back", value: problems.length },
            { label: "Matching", value: matching.saveMatching ? "Saved for next time" : "Not saved" },
          ]}
        />
        {error && (
          <p role="alert" className="text-sm text-danger-700">
            {error}
          </p>
        )}
      </Dialog>
    </>
  )
}
