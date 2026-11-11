import type { ClaimStatus } from "@/lib/data/claims"

export const claimStatusTags: Record<ClaimStatus, { label: string; tone: "ok" | "warn" | "info" | "neutral" }> = {
  draft: { label: "Draft", tone: "neutral" },
  "waiting-for-sign-off": { label: "Waiting for Sign-off", tone: "info" },
  submitted: { label: "Submitted", tone: "info" },
  "sent-back": { label: "Sent back", tone: "warn" },
  accepted: { label: "Accepted", tone: "ok" },
}
