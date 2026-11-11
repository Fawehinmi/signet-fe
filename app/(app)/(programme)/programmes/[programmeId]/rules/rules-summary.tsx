import type { Rule } from "@/lib/data/rules"

export const rulesDescription = "The plain-language rules for how this programme pays and what counts."

export function RulesSummary({ rules }: { rules: Rule[] }) {
  return (
    <dl className="-mt-4 flex flex-col">
      {rules.map((rule) => (
        <div
          key={rule.heading}
          className="flex flex-col gap-1 border-b border-grey-200 py-3.5 last:border-b-0 sm:flex-row sm:gap-4"
        >
          <dt className="text-sm font-bold text-grey-900 sm:w-[190px] sm:shrink-0">{rule.heading}</dt>
          <dd className="text-sm text-grey-800">{rule.text}</dd>
        </div>
      ))}
    </dl>
  )
}
