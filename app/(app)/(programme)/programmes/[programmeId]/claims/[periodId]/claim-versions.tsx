import Link from "next/link"
import { Tag } from "@/components/ui/tag"
import { versionStatusTags } from "@/lib/claim-labels"
import type { Claim } from "@/lib/data/claims"
import { formatDate } from "@/lib/format"

function versionNote(claim: Claim) {
  if (claim.status === "draft") return `Draft. Signet drafted it on ${formatDate(claim.draftedOn)}.`

  const notes = [`As at ${formatDate(claim.asAt)}.`]
  if (claim.submitted) notes.push(`Submitted by ${claim.submitted.by}.`)
  if (claim.sentBack) notes.push(`Sent back on ${formatDate(claim.sentBack.on)}.`)
  if (claim.accepted) notes.push(`Accepted by ${claim.accepted.by}.`)
  return notes.join(" ")
}

type ClaimVersionsProps = {
  programmeId: string
  versions: Claim[]
  currentId: string
}

export function ClaimVersions({ programmeId, versions, currentId }: ClaimVersionsProps) {
  return (
    <ul className="-mt-4 flex flex-col">
      {versions.map((version) => {
        const status = versionStatusTags[version.status]

        return (
          <li key={version.id} className="flex items-start justify-between gap-3 border-b border-grey-200 py-3.5 last:border-b-0">
            <div className="min-w-0">
              {version.id === currentId ? (
                <p className="text-sm font-semibold text-grey-900">Version {version.version}</p>
              ) : (
                <Link
                  href={`/programmes/${programmeId}/claims/${version.periodId}?version=${version.version}`}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  Version {version.version}
                </Link>
              )}
              <p className="text-sm text-grey-700">{versionNote(version)}</p>
            </div>
            <Tag tone={status.tone}>{status.label}</Tag>
          </li>
        )
      })}
    </ul>
  )
}
