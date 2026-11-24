import type { ResultLabel } from "@/lib/programme-labels"

export const resultKinds = ["Enrolled", "Onboarded", "Outcome"] as const

export type ResultKind = (typeof resultKinds)[number]

export const resultNouns: Record<ResultKind, string> = {
  Enrolled: "enrolment",
  Onboarded: "onboarding",
  Outcome: "outcome",
}

export type ResultCheck = {
  resultId: string
  participantRef: string
  result: ResultKind
  periodId: string | null
  label: ResultLabel
  missing: string[]
  claim: { periodLabel: string; version: number; status: "submitted" | "accepted" } | null
}

export function labelAfter(check: { label: ResultLabel; missing: string[] }, evidenceTypes: string[]): ResultLabel {
  if (check.label !== "needs-evidence" || check.missing.length === 0) return check.label
  return check.missing.every((type) => evidenceTypes.includes(type)) ? "ready-to-claim" : check.label
}
