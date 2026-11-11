import { Fragment } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/cn"

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
    return (
        <ol className="flex items-center gap-3 rounded-lg border border-grey-300 bg-white px-4 py-4 sm:px-6">
            {steps.map((label, index) => {
                const number = index + 1
                const done = number < current
                const active = number === current

                return (
                    <Fragment key={label}>
                        <li className="flex shrink-0 items-center gap-2.5" aria-current={active ? "step" : undefined}>
                            <span
                                className={cn(
                                    "flex size-7 items-center justify-center rounded-full font-display text-[13px] font-medium",
                                    done && "bg-brand-400 text-white",
                                    active && "border-2 border-brand-400 bg-white text-brand-600",
                                    !done && !active && "border-[1.5px] border-brand-200 bg-white text-grey-700",
                                )}
                            >
                                {done ? <Check className="size-3.5" strokeWidth={3} /> : number}
                            </span>
                            <span
                                className={cn(
                                    "text-sm font-semibold",
                                    active ? "text-grey-900" : "hidden text-grey-700 sm:inline",
                                )}
                            >
                                {label}
                            </span>
                        </li>
                        {number < steps.length && (
                            <li aria-hidden="true" className={cn("h-0.5 flex-1", done ? "bg-brand-300" : "bg-brand-100")} />
                        )}
                    </Fragment>
                )
            })}
        </ol>
    )
}