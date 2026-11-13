"use client"

import { useState, useTransition } from "react"
import { FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CaseloadParticipant } from "@/lib/evidence-matching"
import type { FileMatchValues } from "@/lib/validations/evidence"
import { matchUnmatched } from "./actions"
import { MatchDialog } from "./new/match-dialog"

export type UnmatchedRow = {
  uploadId: string
  name: string
  note: string
  participants: CaseloadParticipant[]
}

export function UnmatchedFiles({ programmeId, files }: { programmeId: string; files: UnmatchedRow[] }) {
  const [matching, setMatching] = useState<UnmatchedRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()

  function open(file: UnmatchedRow) {
    setError(null)
    setMatching(file)
  }

  function confirm(values: FileMatchValues) {
    if (!matching) return

    startSaving(async () => {
      const result = await matchUnmatched(programmeId, matching.uploadId, matching.name, values)
      if (result.error) setError(result.error)
      else setMatching(null)
    })
  }

  return (
    <>
      <ul className="-mt-4 flex flex-col">
        {files.map((file) => (
          <li key={`${file.uploadId}-${file.name}`} className="flex items-center gap-3 border-b border-grey-200 py-3.5 last:border-b-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-grey-100">
              <FileIcon className="size-[18px] text-grey-600" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-grey-900">{file.name}</p>
              <p className="text-sm text-grey-700">{file.note}</p>
            </div>
            <Button variant="secondary" size="sm" aria-label={`Match ${file.name}`} onClick={() => open(file)}>
              Match
            </Button>
          </li>
        ))}
      </ul>

      {matching && (
        <MatchDialog
          fileName={matching.name}
          initial={{ participantRef: "", evidenceType: "", result: "" }}
          participants={matching.participants}
          error={error}
          saving={saving}
          onCancel={() => setMatching(null)}
          onConfirm={confirm}
        />
      )}
    </>
  )
}
