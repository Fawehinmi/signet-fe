"use client"

import { useState } from "react"
import { Table, Td, Th } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { plural } from "@/lib/format"
import { resultLabelTags, type ResultLabel } from "@/lib/programme-labels"
import { ChaseDrawer } from "./chase-drawer"

export type FixRow = {
  id: string
  participantRef: string
  from: string
  result: string
  label: ResultLabel
  why: string
  claim: { label: string; sendBy: string } | null
  chased: { on: string; to: string } | null
  recipient: string
}

type ToFixTableProps = {
  programmeId: string
  rows: FixRow[]
  canChase: boolean
}

export function ToFixTable({ programmeId, rows, canChase }: ToFixTableProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [chasing, setChasing] = useState<FixRow[] | null>(null)

  function toggle(id: string) {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  }

  return (
    <>
      {canChase && selected.length > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 py-2.5 pr-3 pl-4">
          <p className="flex-1 text-sm font-semibold text-grey-900">{selected.length} selected</p>
          <Button variant="text" size="sm" onClick={() => setSelected([])}>
            Clear
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setChasing(rows.filter((row) => selected.includes(row.id)))}
          >
            Chase {selected.length}
          </Button>
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Participant</Th>
            <Th>Result</Th>
            <Th>Label</Th>
            <Th>Why</Th>
            <Th>For claim</Th>
            <Th>Chased</Th>
            <Th>
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const label = resultLabelTags[row.label]

            return (
              <tr key={row.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    {canChase && (
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.participantRef}`}
                        checked={selected.includes(row.id)}
                        onChange={() => toggle(row.id)}
                        className="size-[18px] shrink-0 cursor-pointer accent-brand-400"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-grey-900">{row.participantRef}</p>
                      <p className="text-xs text-grey-700">{row.from}</p>
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
                <Td>
                  {row.chased ? (
                    <>
                      <p className="text-grey-900">{row.chased.on}</p>
                      <p className="text-xs text-grey-700">{row.chased.to}</p>
                    </>
                  ) : (
                    <span className="text-grey-600">Not yet</span>
                  )}
                </Td>
                <Td className="text-right">
                  {canChase && (
                    <Button
                      variant={row.chased ? "text" : "secondary"}
                      size="sm"
                      aria-label={`Chase ${row.participantRef}`}
                      onClick={() => setChasing([row])}
                    >
                      {row.chased ? "Chase again" : "Chase"}
                    </Button>
                  )}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <p className="mt-3 text-[13px] text-grey-700">Showing {plural(rows.length, "result")}</p>

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
    </>
  )
}
