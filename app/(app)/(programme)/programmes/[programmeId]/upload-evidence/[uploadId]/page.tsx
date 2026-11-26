import Link from "next/link"
import { notFound } from "next/navigation"
import { Check, Inbox } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Stats } from "@/components/app/stats"
import { buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import { cn } from "@/lib/cn"
import { getClaimPeriods } from "@/lib/data/claims"
import { getUploadPool, getUpload } from "@/lib/data/evidence"
import { describeScope } from "@/lib/evidence-matching"
import { formatDate, formatDateTime } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { resultNouns } from "@/lib/result-checks"

type UploadPageProps = {
  params: Promise<{ programmeId: string; uploadId: string }>
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { programmeId, uploadId } = await params
  const { session } = await getProgrammePage(programmeId, "upload-evidence")

  const upload = await getUpload(programmeId, uploadId)
  if (!upload || upload.uploadedBy !== session.user.name) notFound()

  const [periods, caseload] = await Promise.all([
    getClaimPeriods(programmeId),
    getUploadPool(programmeId),
  ])
  const scope = describeScope(upload.scope, periods, caseload)
  const uploadsPath = `/programmes/${programmeId}/upload-evidence`

  const evidence = caseload
    .map((participant) => ({ participant, files: upload.files.filter((file) => file.participantRef === participant.ref) }))
    .filter((group) => group.files.length > 0)
    .flatMap(({ participant, files }) =>
      [...new Set(files.map((file) => file.result))].map((result) => {
        const types = [...new Set(files.filter((file) => file.result === result).map((file) => file.evidenceType))]
        return {
          key: `${participant.ref}-${result}`,
          title: `${participant.name}'s ${resultNouns[result]} has new evidence`,
          detail: `${types.join(" and ")} added.`,
        }
      }),
    )
  const labelsChanged = upload.changes.filter((change) => change.kind === "label").length

  return (
    <>
      <PageHeader
        title="Upload complete"
        tags={<Tag tone="ok">Complete</Tag>}
        breadcrumbs={[{ label: "Upload evidence", href: uploadsPath }, { label: formatDate(upload.on) }]}
        description={`${formatDateTime(upload.on)}, by ${upload.uploadedBy}.`}
      />

      <Stats
        items={[
          { label: "Files added", value: upload.files.length },
          { label: labelsChanged === 1 ? "Label changed" : "Labels changed", value: labelsChanged },
          { label: "Unmatched", value: upload.unmatched.length, warn: upload.unmatched.length > 0 },
        ]}
      />

      <Columns
        main={
          <>
            <Section title="What changed">
              <ul className="-mt-4 flex flex-col">
                {upload.changes.map((change, index) => (
                  <li key={`${change.title}-${index}`} className="flex items-start gap-3 border-b border-grey-200 py-3.5 last:border-b-0">
                    {change.kind === "label" ? (
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success-50">
                        <Check className="size-3.5 text-success-800" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50">
                        <Inbox className="size-3.5 text-brand-600" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-grey-900">{change.title}</p>
                      <p className="text-sm text-grey-700">{change.detail}</p>
                    </div>
                    {change.kind === "label" ? <Tag tone="ok">Label changed</Tag> : <Tag tone="info">Claim</Tag>}
                  </li>
                ))}
                {evidence.map((item) => (
                  <li key={item.key} className="flex items-start gap-3 border-b border-grey-200 py-3.5 last:border-b-0">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-grey-100">
                      <Check className="size-3.5 text-grey-700" strokeWidth={3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-grey-900">{item.title}</p>
                      <p className="text-sm text-grey-700">{item.detail}</p>
                    </div>
                    <Tag tone="neutral">Evidence added</Tag>
                  </li>
                ))}
              </ul>
            </Section>
              <Section title="This upload was for">
                <DetailsList
                  items={
                    upload.scope.kind === "participant"
                      ? [{ label: "Participant", value: scope.people }]
                      : [
                          { label: "Month", value: scope.month ?? "Whole programme" },
                          { label: "Participants", value: scope.people },
                        ]
                  }
                />
              </Section>
              {upload.unmatched.length > 0 && (
                <Section title="Unmatched" count={upload.unmatched.length}>
                  <ul className="-mt-1 flex flex-col gap-3">
                    {upload.unmatched.map((file) => (
                      <li key={file.name}>
                        <p className="truncate text-sm font-semibold text-grey-900">{file.name}</p>
                        <p className="text-sm text-grey-700">{file.reason}</p>
                      </li>
                    ))}
                  </ul>
                  <Link href={uploadsPath} className={cn(buttonStyles({ variant: "secondary", size: "sm" }), "mt-4")}>
                    Match from Upload evidence
                  </Link>
                </Section>
              )}

          </>
        }
      />
    </>
  )
}
