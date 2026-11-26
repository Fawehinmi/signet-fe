import type { ClaimStatus, Decision, MonthStatus } from "@/lib/data/claims"

type Tone = "ok" | "warn" | "info" | "neutral" | "error"

export const monthStatusTags: Record<MonthStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "neutral" },
  "ready-to-review": { label: "Ready to review", tone: "info" },
  "waiting-for-sign-off": { label: "Waiting for Sign-off", tone: "warn" },
  "ready-to-submit": { label: "Ready to submit", tone: "ok" },
  submitted: { label: "Submitted", tone: "info" },
  "sent-back": { label: "Sent back", tone: "warn" },
  accepted: { label: "Closed", tone: "ok" },
}

export const claimStatusTags: Record<ClaimStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  "waiting-for-sign-off": { label: "Waiting for Sign-off", tone: "warn" },
  submitted: { label: "Submitted", tone: "info" },
  replaced: { label: "Replaced", tone: "neutral" },
  "sent-back": { label: "Sent back", tone: "warn" },
  accepted: { label: "Closed", tone: "ok" },
}

export const versionStatusTags: Record<ClaimStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  "waiting-for-sign-off": { label: "Waiting for Sign-off", tone: "warn" },
  submitted: { label: "Submitted", tone: "info" },
  replaced: { label: "Replaced", tone: "neutral" },
  "sent-back": { label: "Sent back", tone: "warn" },
  accepted: { label: "Closed", tone: "ok" },
}

export const decisionLabels: Record<Decision["kind"], { action: string; done: string }> = {
  "accept-as-is": { action: "Accept as is", done: "Accepted as is" },
  challenge: { action: "Challenge", done: "Challenged" },
}

export function partnerLabel(partnerName: string | null) {
  return partnerName ?? "Own delivery"
}

export function joinNames(names: string[], word = "and") {
  if (names.length <= 1) return names.join("")
  return `${names.slice(0, -1).join(", ")} ${word} ${names[names.length - 1]}`
}

export const completionTags: Record<"fixed" | "accept-as-is" | "challenge", { label: string; tone: Tone }> = {
  fixed: { label: "Fixed", tone: "ok" },
  "accept-as-is": { label: "Accepted as is", tone: "neutral" },
  challenge: { label: "Challenged", tone: "neutral" },
}
