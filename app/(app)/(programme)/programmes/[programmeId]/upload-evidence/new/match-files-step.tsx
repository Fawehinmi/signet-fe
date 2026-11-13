"use client"

import { useState } from "react"
import { FileIcon } from "lucide-react"
import { Section } from "@/components/app/section"
import { Button } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { CaseloadParticipant, MatchStatus } from "@/lib/evidence-matching"
import { formatFileSize, initials, plural } from "@/lib/format"
import type { FileMatchValues } from "@/lib/validations/evidence"
import { MatchDialog } from "./match-dialog"
import { ScopeBar } from "./scope-bar"

export type MatchRow = {
  id: string
  file: File
  participantRef: string
  evidenceType: string
  result: FileMatchValues["result"] | ""
  status: MatchStatus
  confirmed: boolean
  unmatched: boolean
}

export function isReady(row: MatchRow) {
  return !row.unmatched && row.confirmed && Boolean(row.participantRef && row.evidenceType && row.result)
}

type MatchFilesStepProps = {
  rows: MatchRow[]
  inScope: CaseloadParticipant[]
  scopeSentence: string
  title: string
  description: string
  onRowsChange: (rows: MatchRow[]) => void
  onBack: () => void
  onContinue: () => void
}

function statusTag(row: MatchRow) {
  if (row.unmatched && row.status === "out") return <Tag tone="warn">Not in this upload</Tag>
  if (row.unmatched) return <Tag tone="neutral">Goes to Unmatched</Tag>
  if (isReady(row)) return <Tag tone="ok">Matched</Tag>
  if (row.status === "needs-match" || !row.participantRef) return <Tag tone="warn">Needs a match</Tag>
  return <Tag tone="info">Check this match</Tag>
}

export function MatchFilesStep({ rows, inScope, scopeSentence, title, description, onRowsChange, onBack, onContinue }: MatchFilesStepProps) {
  const [editing, setEditing] = useState<MatchRow | null>(null)

  const toAdd = rows.filter((row) => !row.unmatched).length
  const unmatched = rows.length - toAdd
  const waiting = rows.filter((row) => !row.unmatched && !isReady(row)).length
  const canContinue = waiting === 0 && toAdd > 0

  function update(id: string, changes: Partial<MatchRow>) {
    onRowsChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)))
  }

  function confirm(row: MatchRow) {
    if (row.participantRef && row.evidenceType && row.result) update(row.id, { confirmed: true })
    else setEditing(row)
  }

  return (
    <>
      <ScopeBar sentence={scopeSentence} />
      <Section
        title={title}
        description={description}
        action={
          <div className="flex gap-2">
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[13px] font-semibold text-brand-700">
              To add {toAdd}
            </span>
            {unmatched > 0 && (
              <span className="rounded-full border border-grey-300 px-3 py-1 text-[13px] font-semibold text-grey-800">
                Unmatched {unmatched}
              </span>
            )}
          </div>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>File</Th>
              <Th>Participant</Th>
              <Th>Evidence type</Th>
              <Th>Result</Th>
              <Th>Status</Th>
              <Th>
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const participant = inScope.find((item) => item.ref === row.participantRef)

              return (
                <tr key={row.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <FileIcon className="size-5 shrink-0 text-brand-600" />
                      <div>
                        <p className="max-w-[220px] truncate font-semibold text-grey-900">{row.file.name}</p>
                        <p className="text-xs text-grey-700">{formatFileSize(row.file.size)}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {participant && !row.unmatched ? (
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
                          {initials(participant.name)}
                        </span>
                        <div>
                          <p className="flex items-center gap-2 font-semibold text-grey-900">
                            {participant.name}
                            {row.status === "check" && !row.confirmed && <Tag tone="info">Suggested</Tag>}
                          </p>
                          <p className="text-xs text-grey-700">{participant.ref}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-grey-600">No match</span>
                    )}
                  </Td>
                  <Td>{row.evidenceType || <span className="text-grey-600">Not set</span>}</Td>
                  <Td>{row.result || <span className="text-grey-600">Not set</span>}</Td>
                  <Td>{statusTag(row)}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      {row.unmatched ? (
                        <Button variant="text" size="sm" aria-label={`Match ${row.file.name}`} onClick={() => setEditing(row)}>
                          Match
                        </Button>
                      ) : (
                        <>
                          <Button variant="text" size="sm" aria-label={`Change ${row.file.name}`} onClick={() => setEditing(row)}>
                            Change
                          </Button>
                          {!isReady(row) && row.participantRef && (
                            <Button variant="secondary" size="sm" aria-label={`Confirm ${row.file.name}`} onClick={() => confirm(row)}>
                              Confirm
                            </Button>
                          )}
                          {!row.participantRef && (
                            <Button
                              variant="text"
                              size="sm"
                              aria-label={`Leave ${row.file.name} unmatched`}
                              onClick={() => update(row.id, { unmatched: true })}
                            >
                              Leave unmatched
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </Table>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-grey-200 pt-4">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <p className="flex-1 text-right text-xs text-grey-700">
            {waiting > 0
              ? `Confirm ${plural(waiting, "match", "matches")}, or leave them unmatched, to continue.`
              : toAdd === 0
                ? "Match at least one file to continue."
                : `${plural(toAdd, "file")} ready to add.${unmatched > 0 ? ` ${plural(unmatched, "file")} ${unmatched === 1 ? "goes" : "go"} to Unmatched.` : ""}`}
          </p>
          <Button disabled={!canContinue} onClick={onContinue}>
            Continue
          </Button>
        </div>
      </Section>

      {editing && (
        <MatchDialog
          fileName={editing.file.name}
          initial={editing}
          participants={inScope}
          onCancel={() => setEditing(null)}
          onLeaveUnmatched={() => {
            update(editing.id, { unmatched: true, confirmed: false })
            setEditing(null)
          }}
          onConfirm={(values) => {
            update(editing.id, { ...values, status: "matched", confirmed: true, unmatched: false })
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
