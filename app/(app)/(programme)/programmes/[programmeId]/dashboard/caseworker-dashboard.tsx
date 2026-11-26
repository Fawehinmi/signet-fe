import Link from "next/link"
import { FileText } from "lucide-react"
import type { getCaseworkerDashboard } from "@/lib/caseworker"
import { plural } from "@/lib/format"
import { KeyNumber } from "./key-numbers"
import { NeedsYou } from "./needs-you"
import { Panel, PanelLink } from "./panel"

type CaseworkerDashboardProps = {
  programmeId: string
  dashboard: Awaited<ReturnType<typeof getCaseworkerDashboard>>
}

export function CaseworkerDashboard({ programmeId, dashboard }: CaseworkerDashboardProps) {
  const { numbers } = dashboard
  const items = dashboard.items.map(({ key, kind, title, href }) => ({ key, kind, title, href, action: "Upload" }))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="mb-2 font-display text-[28px] leading-9 text-grey-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KeyNumber label="My participants" value={numbers.participants} />
        <KeyNumber
          label="Need evidence"
          value={numbers.needsEvidence}
          note={numbers.overdue > 0 ? `${numbers.overdue} over 14 days` : undefined}
        />
        <KeyNumber label="Sent back" value={numbers.sentBack} />
        <KeyNumber label="Your uploads" value={numbers.uploads} />
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <NeedsYou items={items} className="lg:col-span-8" />
        <Panel
          title="Recent uploads"
          action={<PanelLink href={`/programmes/${programmeId}/upload-evidence`}>All uploads</PanelLink>}
          className="lg:col-span-4"
        >
          {dashboard.uploads.length > 0 ? (
            <ul className="-mt-1">
              {dashboard.uploads.map((upload) => (
                <li key={upload.id} className="border-b border-grey-100 last:border-b-0">
                  <Link href={upload.href} className="flex items-center gap-2.5 py-2 hover:bg-grey-50">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-700">
                      <FileText className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-grey-900">{upload.on}</span>
                      <span className="block text-xs text-grey-700">{upload.who}</span>
                    </span>
                    <span className="text-xs text-grey-700">{plural(upload.files, "file")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-grey-700">No uploads yet</p>
          )}
        </Panel>
      </div>
    </div>
  )
}
