"use client"

import { usePathname } from "next/navigation"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/cn"

type Step = {
  title: string
  description: string
}

type RouteStep = {
  step: number
  joining?: boolean
  failed?: boolean
}

type StepState = "done" | "current" | "todo" | "failed"

const steps: Step[] = [
  { title: "Create your account", description: "Name, work email and password" },
  { title: "Verify your email", description: "Confirm you can open your inbox" },
  { title: "Add your organisation", description: "The details we use to check it's real" },
]

const joinStep: Step = { title: "Join your organisation", description: "An admin approves your request" }

const routes: Record<string, RouteStep> = {
  "/sign-up": { step: 1 },
  "/check-email": { step: 2 },
  "/verify-email": { step: 2 },
  "/verify-email/expired": { step: 2 },
  "/organisation/new": { step: 3 },
  "/organisation/exists": { step: 3, joining: true },
  "/organisation/join-requested": { step: 3, joining: true },
  "/organisation/checking": { step: 4 },
  "/organisation/update": { step: 4 },
  "/organisation/not-verified": { step: 4, failed: true },
}

const dotStyles: Record<StepState, string> = {
  done: "bg-brand-400 text-white",
  current: "border-2 border-brand-400 bg-white text-brand-600",
  todo: "border-[1.5px] border-brand-200 text-grey-700",
  failed: "border-2 border-danger-700 bg-danger-50 text-danger-700",
}

const titleStyles: Record<StepState, string> = {
  done: "font-medium text-grey-800",
  current: "font-bold text-grey-900",
  todo: "font-medium text-grey-700",
  failed: "font-bold text-danger-800",
}

function useAuthStep() {
  const pathname = usePathname()
  const route = routes[pathname] ?? { step: 1 }
  const items = steps.map((item, index) => (index === 2 && route.joining ? joinStep : item))

  function stateOf(number: number): StepState {
    if (route.failed && number === route.step) return "failed"
    if (number < route.step) return "done"
    if (number === route.step) return "current"
    return "todo"
  }

  return { step: route.step, failed: route.failed, items, stateOf }
}

export function AuthSteps() {
  const { step, items, stateOf } = useAuthStep()

  return (
    <ol className="flex flex-col">
      {items.map((item, index) => {
        const number = index + 1
        const state = stateOf(number)

        return (
          <li key={item.title} className="flex gap-4" aria-current={number === step ? "step" : undefined}>
            <div className="flex w-7 shrink-0 flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-medium",
                  dotStyles[state],
                )}
              >
                {state === "done" && <Check className="size-3.5" strokeWidth={3} />}
                {state === "failed" && <X className="size-3.5" strokeWidth={2.5} />}
                {(state === "current" || state === "todo") && number}
              </span>
              {number < items.length && (
                <span className={cn("my-1 h-10 w-0.5", number < step ? "bg-brand-300" : "bg-brand-100")} />
              )}
            </div>
            <div className="pt-[3px] pb-4">
              <p className={cn("font-display text-base leading-[22px]", titleStyles[state])}>{item.title}</p>
              <p className="text-sm text-grey-700">{item.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function AuthStepsCompact() {
  const { step, failed, items } = useAuthStep()

  return (
    <p className="text-sm text-grey-700">
      Step {step} of {items.length}:{" "}
      <span className={cn("font-semibold", failed ? "text-danger-700" : "text-grey-900")}>{items[step - 1].title}</span>
    </p>
  )
}
