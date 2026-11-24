import { Tag } from "@/components/ui/tag"
import { decisionLabels } from "@/lib/claim-labels"
import type { ClaimItem } from "@/lib/data/claims"
import { resultNouns } from "@/lib/result-checks"

export function ReasonsList({ items }: { items: ClaimItem[] }) {
  return (
    <ul className="-mt-4 flex flex-col">
      {items.map((item) =>
        item.decision ? (
          <li key={item.resultId} className="flex items-start gap-3 border-b border-grey-200 py-3.5 last:border-b-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-grey-900">
                {item.participantRef}, {resultNouns[item.result]}
              </p>
              <p className="text-sm text-grey-800">{item.decision.reason}</p>
              <p className="text-xs text-grey-700">
                {item.decision.approved ? `Approved by ${item.decision.approved.by}` : "Waiting for Sign-off"}
              </p>
            </div>
            <Tag tone="neutral">{decisionLabels[item.decision.kind].done}</Tag>
          </li>
        ) : null,
      )}
    </ul>
  )
}
