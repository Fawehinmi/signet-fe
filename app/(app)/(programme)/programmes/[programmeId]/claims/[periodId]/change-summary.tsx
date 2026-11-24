import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { joinNames } from "@/lib/claim-labels"
import { claimTotal, type ClaimChange, type ClaimCount } from "@/lib/data/claims"
import { ClaimChanges } from "./claim-changes"

type ChangeSummaryProps = {
  version: number
  changes: ClaimChange[]
  before: ClaimCount[]
  after: ClaimCount[]
  fixesLeft?: number
}

const total = (count?: ClaimCount) => (count ? count.fromPartners + count.ownDelivery : 0)

export function ChangeSummary({ version, changes, before, after, fixesLeft = 0 }: ChangeSummaryProps) {
  const labels = [...new Set([...after.map((count) => count.label), ...before.map((count) => count.label)])]
  const rows = labels.map((label) => ({
    label,
    before: total(before.find((count) => count.label === label)),
    after: total(after.find((count) => count.label === label)),
  }))
  const moved = rows.filter((row) => row.before !== row.after)
  const totals = { before: claimTotal(before), after: claimTotal(after) }

  const counts =
    moved.length === 0
      ? `The counts are the same as Version ${version - 1}, ${totals.after} in total.`
      : `${joinNames(moved.map((row) => `${row.label} goes from ${row.before} to ${row.after}`))}, so the total goes from ${totals.before} to ${totals.after}.`
  const left =
    fixesLeft > 0
      ? ` ${fixesLeft === 1 ? "1 fix needs" : `${fixesLeft} fixes need`} a decision before Version ${version} can be submitted.`
      : ""

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg bg-brand-50 px-5 py-4">
        <p className="font-semibold text-grey-900">
          {changes.length === 1 ? "1 result" : `${changes.length} results`} changed since Version {version - 1}
        </p>
        <p className="mt-1 text-sm leading-[22px] text-grey-800">
          {counts}
          {left}
        </p>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Payment type</Th>
            <Th className="text-right">Version {version - 1}</Th>
            <Th className="text-right">Version {version}</Th>
            <Th>Change</Th>
          </tr>
        </thead>
        <tbody>
          {[...rows, { label: "Total", ...totals }].map((row) => {
            const change = row.after - row.before
            const strong = row.label === "Total" || change !== 0

            return (
              <tr key={row.label}>
                <Td className={strong ? "font-semibold text-grey-900" : undefined}>{row.label}</Td>
                <Td className="text-right">{row.before}</Td>
                <Td className={strong ? "text-right font-semibold text-grey-900" : "text-right"}>{row.after}</Td>
                <Td>
                  {change === 0 ? (
                    <span className="text-grey-600">No change</span>
                  ) : (
                    <Tag tone={change > 0 ? "ok" : "warn"}>{change > 0 ? `+${change}` : change}</Tag>
                  )}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <ClaimChanges changes={changes} />
    </div>
  )
}
