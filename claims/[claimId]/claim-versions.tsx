import Link from "next/link"
import { Tag } from "@/components/ui/tag"
import { claimStatusTags } from "@/lib/claim-labels"
import type { Claim } from "@/lib/data/claims"
import { formatDate } from "@/lib/format"

function versionNote(claim: Claim) {
  const notes = [claim.asAt ? `As at ${formatDate(claim.asAt)}.` : "Not sent for Sign-off yet."]
  if (claim.submitted) notes.push(`Submitted by ${claim.submitted.by}.`)
  if (claim.sentBack) notes.push(`Sent back on ${formatDate(claim.sentBack.on)}.`)
  return notes.join(" ")
}

export function ClaimVersions({ programmeId, versions, currentId }: { programmeId: string; versions: Claim[]; currentId: string }) {
  return (
    <ul className="-mt-4 flex flex-col">
      {versions.map((version) => {
        const status = claimStatusTags[version.status]

        return (
          <li key={version.id} className="flex items-start justify-between gap-3 border-b border-grey-200 py-3.5 last:border-b-0">
            <div className="min-w-0">
              {version.id === currentId ? (
                <p className="text-sm font-semibold text-grey-900">Version {version.version}</p>
              ) : (
                <Link
                  href={`/programmes/${programmeId}/claims/${version.id}`}
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
