import { Check } from "lucide-react"
import { cn } from "@/lib/cn"

type Step = {
  label: string
  note?: string
  state: "done" | "current" | "todo"
}

export function ProgressSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => (
        <li key={step.label} className="relative grid grid-cols-[26px_1fr] gap-x-3 pb-3.5 last:pb-0">
          {index < steps.length - 1 && (
            <span
              className={cn(
                "absolute top-[30px] bottom-0.5 left-3 w-0.5",
                step.state === "done" ? "bg-brand-300" : "bg-brand-100",
              )}
            />
          )}
          <span
            className={cn(
              "flex size-[26px] items-center justify-center rounded-full font-display text-xs font-medium",
              step.state === "done" && "bg-brand-400 text-white",
              step.state === "current" && "border-2 border-brand-400 bg-white text-brand-600",
              step.state === "todo" && "border-[1.5px] border-brand-200 bg-white text-grey-700",
            )}
          >
            {step.state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
          </span>
          <div className="mt-[3px]">
            <p
              className={cn(
                "text-[13px] leading-[18px] font-semibold",
                step.state === "todo" ? "text-grey-700" : "text-grey-900",
              )}
            >
              {step.label}
            </p>
            {step.note && <p className="text-xs text-grey-700">{step.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
