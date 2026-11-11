import type { ClaimChange } from "@/lib/data/claims"

export function ClaimChanges({ changes }: { changes: ClaimChange[] }) {
  return (
    <ul className="flex flex-col">
      {changes.map((change) => (
        <li key={change.subject} className="flex flex-col gap-1.5 border-b border-grey-200 py-4 first:pt-0 last:border-b-0">
          <p className="text-sm font-semibold text-grey-900">{change.subject}</p>
          <dl className="grid grid-cols-[56px_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-xs leading-5 font-semibold text-grey-700">Before</dt>
            <dd className="text-grey-700">{change.before}</dd>
            <dt className="text-xs leading-5 font-semibold text-grey-700">Now</dt>
            <dd className="text-grey-900">{change.now}</dd>
          </dl>
        </li>
      ))}
    </ul>
  )
}
