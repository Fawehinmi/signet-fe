import Link from "next/link"
import { FileIcon } from "lucide-react"
import { buttonStyles } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { ImportRecord } from "@/lib/data/imports"
import { formatDate } from "@/lib/format"
import { importTypeLabels } from "@/lib/validations/imports"

export function ImportsTable({ programmeId, imports }: { programmeId: string; imports: ImportRecord[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>File</Th>
          <Th>Imported by</Th>
          <Th>Date</Th>
          <Th>Rows added</Th>
          <Th>Held back</Th>
          <Th>Status</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {imports.map((record) => (
          <tr key={record.id}>
            <Td>
              <div className="flex items-center gap-3">
                <FileIcon className="size-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold text-grey-900">{record.fileName}</p>
                  <p className="text-xs text-grey-700">{importTypeLabels[record.type].label}</p>
                </div>
              </div>
            </Td>
            <Td>{record.importedBy}</Td>
            <Td>{formatDate(record.on)}</Td>
            <Td>{record.rowsAdded}</Td>
            <Td>{record.problems.length}</Td>
            <Td>
              <Tag tone="ok">Complete</Tag>
            </Td>
            <Td className="text-right">
              <Link
                href={`/programmes/${programmeId}/imports/${record.id}`}
                className={buttonStyles({ variant: "text", size: "sm" })}
              >
                View
              </Link>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
