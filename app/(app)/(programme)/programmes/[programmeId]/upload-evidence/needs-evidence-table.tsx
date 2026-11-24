import Link from "next/link"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { plural } from "@/lib/format"
import { SendForChecking } from "./send-for-checking"

export type NeedsEvidenceRow = {
  id: string
  participantRef: string
  name: string
  title: string
  result: string
  why: string
  waiting: number
  evidence: string[]
  status:
    | { kind: "none" }
    | { kind: "asked"; by: string; on: string; message: string }
    | { kind: "checking"; to: string; on: string }
    | { kind: "sent-back"; by: string; on: string; reason: string }
    | { kind: "accepted"; by: string; on: string }
}

type NeedsEvidenceTableProps = {
  programmeId: string
  rows: NeedsEvidenceRow[]
  admins: string
}

function StatusCell({ status }: { status: NeedsEvidenceRow["status"] }) {
  if (status.kind === "none") return <span className="text-grey-600">No request</span>

  if (status.kind === "asked") {
    return (
      <>
        <p className="text-grey-900">
          {status.by}, {status.on}
        </p>
        <p className="text-xs text-grey-700">{status.message}</p>
      </>
    )
  }

  const tag =
    status.kind === "checking"
      ? { label: "Sent for checking", tone: "info" as const, note: `To ${status.to}, ${status.on}` }
      : status.kind === "sent-back"
        ? { label: "Sent back", tone: "neutral" as const, note: `${status.by}, ${status.on}. ${status.reason}` }
        : { label: "Accepted as is", tone: "ok" as const, note: `${status.by}, ${status.on}. It needs Sign-off.` }

  return (
    <div className="flex flex-col items-start gap-1">
      <Tag tone={tag.tone}>{tag.label}</Tag>
      <p className="text-xs text-grey-700">{tag.note}</p>
    </div>
  )
}

export function NeedsEvidenceTable({ programmeId, rows, admins }: NeedsEvidenceTableProps) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>Participant</Th>
            <Th>Result</Th>
            <Th>Reason</Th>
            <Th>Asked by</Th>
            <Th>Waiting</Th>
            <Th>
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const waiting = plural(row.waiting, "day")
            const done = row.status.kind === "checking" || row.status.kind === "accepted"

            return (
              <tr key={row.id}>
                <Td>
                  <p className="font-semibold text-grey-900">{row.name}</p>
                  <p className="text-xs text-grey-700">{row.participantRef}</p>
                </Td>
                <Td>{row.result}</Td>
                <Td className="min-w-[160px] whitespace-normal">{row.why}</Td>
                <Td className="max-w-[280px] min-w-[200px] whitespace-normal">
                  <StatusCell status={row.status} />
                </Td>
                <Td>{row.waiting >= 14 ? <Tag tone="warn">{waiting}</Tag> : waiting}</Td>
                <Td className="text-right">
                  {!done && (
                    <div className="flex items-center justify-end gap-2">
                      {admins && <SendForChecking programmeId={programmeId} row={row} admins={admins} />}
                      <Link
                        href={`/programmes/${programmeId}/upload-evidence/new?participant=${row.participantRef}`}
                        aria-label={`Upload evidence for ${row.name}`}
                        className={buttonStyles({ variant: "secondary", size: "sm" })}
                      >
                        Upload
                      </Link>
                    </div>
                  )}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <p className="mt-3 text-[13px] text-grey-700">Showing {plural(rows.length, "result")}</p>
    </>
  )
}
