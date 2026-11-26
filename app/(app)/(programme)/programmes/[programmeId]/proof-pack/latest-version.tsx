import { FileCheck } from "lucide-react"
import { Tag } from "@/components/ui/tag"
import { DownloadLink } from "./download-link"
import type { ProofPackRow } from "./versions-table"

export function LatestVersion({ row, programme }: { row: ProofPackRow; programme: string }) {
  const details = [
    { label: "Programme", value: programme },
    { label: "Period covered", value: row.covers },
    { label: "Results included", value: row.results },
    { label: "Delivered by", value: row.deliveredBy },
  ]

  return (
    <section className="rounded-lg border border-brand-300 bg-white ring-4 ring-brand-50">
      <div className="flex items-center gap-4 border-b border-grey-200 px-6 py-5">
        <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded bg-brand-50 text-brand-600">
          <FileCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-medium text-grey-900">Proof pack, Version {row.version}</h2>
          <p className="text-sm text-grey-700">Updated {row.madeOn}</p>
        </div>
        <Tag tone="info">Latest</Tag>
      </div>
      <dl className="grid sm:grid-cols-2">
        {details.map((detail, index) => (
          <div
            key={detail.label}
            className={`border-grey-200 px-6 py-3.5 ${index < 2 ? "border-b" : ""} ${index % 2 === 0 ? "sm:border-r" : ""}`}
          >
            <dt className="text-[13px] text-grey-700">{detail.label}</dt>
            <dd className="mt-0.5 font-semibold text-grey-900">{detail.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-3 rounded-b-lg border-t border-grey-200 bg-brand-50/40 px-6 py-3">
        <p className="flex-1 text-[13px] text-grey-700">The latest version. Every earlier version is kept below.</p>
        <DownloadLink href={row.href} label={`Download Version ${row.version}`} />
      </div>
    </section>
  )
}
