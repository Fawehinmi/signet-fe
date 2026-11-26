"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { ResultStatus } from "@/lib/caseworker"
import { resultKinds, type ResultKind } from "@/lib/result-checks"

type ParticipantRow = {
  ref: string
  name: string
  statuses: Record<ResultKind, ResultStatus | null>
}

type ParticipantsTableProps = {
  programmeId: string
  rows: ParticipantRow[]
  canUpload: boolean
}

const statusTags: Record<ResultStatus, { label: string; tone: "ok" | "info" | "warn" | "neutral" }> = {
  ready: { label: "Ready", tone: "ok" },
  "in-a-claim": { label: "In a claim", tone: "neutral" },
  "needs-evidence": { label: "Needs evidence", tone: "warn" },
  "sent-for-checking": { label: "Sent for checking", tone: "info" },
  "sent-back": { label: "Sent back", tone: "warn" },
  "cannot-be-claimed": { label: "Can't be claimed", tone: "warn" },
}

export function ParticipantsTable({ programmeId, rows, canUpload }: ParticipantsTableProps) {
  const [query, setQuery] = useState("")
  const words = query.trim().toLowerCase()
  const shown = rows.filter((row) => !words || row.name.toLowerCase().includes(words) || row.ref.toLowerCase().includes(words))

  return (
    <div className="flex flex-col gap-4">
      <label className="flex h-10 max-w-[400px] items-center gap-2 rounded border border-grey-300 bg-white px-3 focus-within:border-brand-400">
        <Search className="size-[18px] text-grey-600" />
        <span className="sr-only">Search participants</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or reference"
          className="h-full flex-1 bg-transparent text-sm text-grey-900 outline-none placeholder:text-grey-600"
        />
      </label>

      {shown.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Participant</Th>
              {resultKinds.map((kind) => (
                <Th key={kind}>{kind}</Th>
              ))}
              <Th>
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.ref}>
                <Td>
                  <p className="font-semibold text-grey-900">{row.name}</p>
                  <p className="text-xs text-grey-700">{row.ref}</p>
                </Td>
                {resultKinds.map((kind) => {
                  const status = row.statuses[kind]
                  return (
                    <Td key={kind}>
                      {status ? (
                        <Tag tone={statusTags[status].tone}>{statusTags[status].label}</Tag>
                      ) : (
                        <span className="text-grey-600">Not yet</span>
                      )}
                    </Td>
                  )
                })}
                <Td className="text-right">
                  {canUpload && (
                    <Link
                      href={`/programmes/${programmeId}/upload-evidence/new?participant=${row.ref}`}
                      aria-label={`Upload evidence for ${row.name}`}
                      className={buttonStyles({ variant: "text", size: "sm" })}
                    >
                      Upload
                    </Link>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="py-8 text-center text-sm text-grey-700">No participants match your search</p>
      )}
    </div>
  )
}
