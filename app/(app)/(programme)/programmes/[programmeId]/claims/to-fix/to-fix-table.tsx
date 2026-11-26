"use client"

import { useState } from "react"
import { Table, Td, Th } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { plural } from "@/lib/format"
import { resultLabelTags, type ResultLabel } from "@/lib/programme-labels"
import { ChaseDrawer } from "./chase-drawer"
import { CheckDrawer } from "./check-drawer"

export type FollowUp = { kind: "chased" | "checking" | "sent-back" | "accepted"; by: string; on: string }

export type FixRow = {
  id: string
  participantRef: string
  name: string | null
  from: string
  ownDelivery: boolean
  result: string
  noun: string
  label: ResultLabel
  why: string
  claim: { label: string; sendBy: string } | null
  waiting: number
  followUp: FollowUp | null
  recipient: string
  hasCaseworker: boolean
  canChase: boolean
  check: { by: string; on: string; note: string; evidence: string[] } | null
}

type ToFixTableProps = {
  programmeId: string
  rows: FixRow[]
  total: number
}

const followUpTags = {
  checking: { label: "Sent for checking", tone: "info" },
  "sent-back": { label: "Sent back", tone: "neutral" },
  accepted: { label: "Accepted as is", tone: "ok" },
} as const

function FollowUpCell({ followUp }: { followUp: FollowUp | null }) {
  if (!followUp) return <span className="text-grey-600">Not yet</span>

  if (followUp.kind === "chased") {
    return (
      <>
        <p className="text-grey-900">Chased {followUp.on}</p>
        <p className="text-xs text-grey-700">{followUp.by}</p>
      </>
    )
  }

  const tag = followUpTags[followUp.kind]
  return (
    <div className="flex flex-col items-start gap-1">
      <Tag tone={tag.tone}>{tag.label}</Tag>
      <p className="text-xs text-grey-700">
        {followUp.kind === "sent-back" ? `To ${followUp.by}` : followUp.by}, {followUp.on}
      </p>
    </div>
  )
}

export function ToFixTable({ programmeId, rows, total }: ToFixTableProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [chasing, setChasing] = useState<FixRow[] | null>(null)
  const [checking, setChecking] = useState<FixRow | null>(null)
  const chosen = rows.filter((row) => row.canChase && selected.includes(row.id))
  const selectable = rows.some((row) => row.canChase)

  function toggle(id: string) {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  }

  return (
    <>
      {chosen.length > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 py-2.5 pr-3 pl-4">
          <p className="flex-1 text-sm font-semibold text-grey-900">{chosen.length} selected</p>
          <Button variant="text" size="sm" onClick={() => setSelected([])}>
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setChasing(chosen)}>
            Chase {chosen.length}
          </Button>
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Participant</Th>
            <Th>Result</Th>
            <Th>Label</Th>
            <Th>Reason</Th>
            <Th>For claim</Th>
            <Th>Waiting</Th>
            <Th>Follow-up</Th>
            <Th>
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const label = resultLabelTags[row.label]
            const waiting = plural(row.waiting, "day")

            return (
              <tr key={row.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    {selectable &&
                      (row.canChase ? (
                        <input
                          type="checkbox"
                          aria-label={`Select ${row.participantRef}`}
                          checked={selected.includes(row.id)}
                          onChange={() => toggle(row.id)}
                          className="size-[18px] shrink-0 cursor-pointer accent-brand-400"
                        />
                      ) : (
                        <span className="size-[18px] shrink-0" />
                      ))}
                    <div>
                      <p className="font-semibold text-grey-900">{row.name ?? row.participantRef}</p>
                      <p className="text-xs text-grey-700">{row.name ? `${row.participantRef}, ${row.from}` : row.from}</p>
                    </div>
                  </div>
                </Td>
                <Td>{row.result}</Td>
                <Td>
                  <Tag tone={label.tone}>{label.label}</Tag>
                </Td>
                <Td className="min-w-[180px] whitespace-normal">{row.why}</Td>
                <Td>
                  {row.claim ? (
                    <>
                      <p className="text-grey-900">{row.claim.label}</p>
                      <p className="text-xs text-grey-700">Send by {row.claim.sendBy}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-grey-900">Next claim</p>
                      <p className="text-xs text-grey-700">Once it&apos;s ready</p>
                    </>
                  )}
                </Td>
                <Td>{row.waiting >= 14 ? <Tag tone="warn">{waiting}</Tag> : waiting}</Td>
                <Td>
                  <FollowUpCell followUp={row.followUp} />
                </Td>
                <Td className="text-right">
                  {row.check ? (
                    <Button variant="secondary" size="sm" aria-label={`Check ${row.participantRef}`} onClick={() => setChecking(row)}>
                      Check
                    </Button>
                  ) : (
                    row.canChase && (
                      <Button
                        variant={row.followUp?.kind === "chased" ? "text" : "secondary"}
                        size="sm"
                        aria-label={`Chase ${row.participantRef}`}
                        onClick={() => setChasing([row])}
                      >
                        {row.followUp?.kind === "chased" ? "Chase again" : "Chase"}
                      </Button>
                    )
                  )}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <p className="mt-3 text-[13px] text-grey-700">
        Showing {rows.length} of {plural(total, "result")}
      </p>

      {chasing && (
        <ChaseDrawer
          programmeId={programmeId}
          rows={chasing}
          onClose={() => setChasing(null)}
          onSent={() => {
            setChasing(null)
            setSelected([])
          }}
        />
      )}
      {checking && <CheckDrawer programmeId={programmeId} row={checking} onClose={() => setChecking(null)} />}
    </>
  )
}
