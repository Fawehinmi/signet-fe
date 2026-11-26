import { Check } from "lucide-react"
import { cn } from "@/lib/cn"
import type { PrimeDashboard } from "@/lib/dashboard"
import { Panel, PanelLink } from "./panel"

type ClaimPanelProps = {
  claim: NonNullable<PrimeDashboard["claim"]>
  className?: string
}

export function ClaimPanel({ claim, className }: ClaimPanelProps) {
  const numbers = [
    { label: "Results", value: claim.results },
    { label: "Ready", value: claim.ready },
    { label: "Fixes", value: claim.fixes },
  ]

  return (
    <Panel title={claim.label} action={<PanelLink href={claim.href}>Open claim</PanelLink>} className={className}>
      <dl className="grid grid-cols-3 gap-2 border-y border-grey-100 py-3">
        {numbers.map((number) => (
          <div key={number.label}>
            <dd className="font-display text-[22px] leading-7 text-grey-900">{number.value}</dd>
            <dt className="text-xs text-grey-700">{number.label}</dt>
          </div>
        ))}
      </dl>
      <ol className="mt-4">
        {claim.stages.map((stage, index) => (
          <li key={stage.name} className="relative flex gap-3 pb-3.5 last:pb-0">
            {index < claim.stages.length - 1 && (
              <span
                className={cn("absolute top-5 bottom-0 left-[9px] w-0.5", stage.state === "done" ? "bg-brand-500" : "bg-grey-200")}
              />
            )}
            <span
              className={cn(
                "relative flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-grey-300 bg-white",
                stage.state === "done" && "border-brand-500 bg-brand-500 text-white",
                stage.state === "current" && "border-brand-500 ring-4 ring-brand-50",
              )}
            >
              {stage.state === "done" && <Check className="size-3" strokeWidth={3.2} />}
              {stage.state === "current" && <span className="size-2 rounded-full bg-brand-500" />}
            </span>
            <div>
              <p
                className={cn(
                  "text-[13px] leading-5 text-grey-700",
                  stage.state !== "next" && "font-semibold text-grey-900",
                )}
              >
                {stage.name}
              </p>
              {stage.note && <p className="text-xs text-grey-700">{stage.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
