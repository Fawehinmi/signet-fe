import { Download } from "lucide-react"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { DownloadLink } from "./download-link"

export type ProofPackRow = {
  version: number
  madeOn: string
  covers: string
  results: number
  change: string
  href: string
  isNew: boolean
}

type VersionsTableProps = {
  rows: ProofPackRow[]
  generating: { version: number; madeOn: string; covers: string } | null
}

export function VersionsTable({ rows, generating }: VersionsTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Version</Th>
          <Th>Generated</Th>
          <Th>Covers</Th>
          <Th>Results</Th>
          <Th>What changed</Th>
          <Th>
            <span className="sr-only">Download</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {generating && (
          <tr>
            <Td>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-grey-900">Version {generating.version}</p>
                <Tag tone="info">Generating</Tag>
              </div>
            </Td>
            <Td>{generating.madeOn}</Td>
            <Td>{generating.covers}</Td>
            <Td />
            <Td />
            <Td className="text-right">
              <span
                aria-disabled="true"
                className="inline-flex h-8 items-center gap-1.5 rounded border border-grey-200 px-3.5 text-[13px] font-semibold text-grey-500"
              >
                <Download className="size-4" />
                Download
              </span>
            </Td>
          </tr>
        )}
        {rows.map((row, index) => (
          <tr key={row.version}>
            <Td>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-grey-900">Version {row.version}</p>
                {index === 0 && <Tag tone="info">Latest</Tag>}
                {row.isNew && <Tag tone="ok">New</Tag>}
              </div>
            </Td>
            <Td>{row.madeOn}</Td>
            <Td>{row.covers}</Td>
            <Td>{row.results}</Td>
            <Td>{row.change}</Td>
            <Td className="text-right">
              <DownloadLink href={row.href} label={`Download Version ${row.version}`} />
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
