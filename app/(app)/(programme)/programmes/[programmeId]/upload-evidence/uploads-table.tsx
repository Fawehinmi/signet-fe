import Link from "next/link"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { EvidenceUpload } from "@/lib/data/evidence"
import { describeScope, type CaseloadParticipant } from "@/lib/evidence-matching"
import { formatDate, plural } from "@/lib/format"

type UploadsTableProps = {
  programmeId: string
  uploads: EvidenceUpload[]
  periods: { id: string; label: string }[]
  caseload: CaseloadParticipant[]
}

export function UploadsTable({ programmeId, uploads, periods, caseload }: UploadsTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Upload</Th>
          <Th>For</Th>
          <Th>Files added</Th>
          <Th>Unmatched</Th>
          <Th>Status</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {uploads.map((upload) => {
          const scope = describeScope(upload.scope, periods, caseload)

          return (
            <tr key={upload.id}>
              <Td>
                <p className="font-semibold text-grey-900">{formatDate(upload.on)}</p>
                <p className="text-xs text-grey-700">{plural(upload.files.length + upload.unmatched.length, "file")}</p>
              </Td>
              <Td>
                <p className="font-semibold text-grey-900">{scope.title}</p>
                <p className="text-xs text-grey-700">{scope.detail}</p>
              </Td>
              <Td>{upload.files.length}</Td>
              <Td>{upload.unmatched.length}</Td>
              <Td>
                <Tag tone="ok">Complete</Tag>
              </Td>
              <Td className="text-right">
                <Link
                  href={`/programmes/${programmeId}/upload-evidence/${upload.id}`}
                  className={buttonStyles({ variant: "text", size: "sm" })}
                >
                  View
                </Link>
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
