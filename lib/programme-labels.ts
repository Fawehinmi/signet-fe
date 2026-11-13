import type { Permission, ProgrammePosition, ProgrammeStatus } from "@/lib/session"

export const positionLabels: Record<ProgrammePosition, string> = {
  prime: "Prime",
  subcontractor: "Subcontractor",
  commissioner: "Commissioner",
}

export const statusTags: Record<ProgrammeStatus, { label: string; tone: "ok" | "warn" | "info" }> = {
  "waiting-for-documents": { label: "Waiting for documents", tone: "warn" },
  "rules-in-progress": { label: "Rules in progress", tone: "info" },
  "waiting-for-confirmation": { label: "Waiting for confirmation", tone: "info" },
  live: { label: "Live", tone: "ok" },
}

export const permissionLabels: Record<Permission, string> = {
  "sign-off": "Sign-off",
  "bulk-import": "Bulk import",
  "bulk-upload": "Bulk upload",
  privacy: "Privacy",
}

export type ResultLabel = "ready-to-claim" | "needs-evidence" | "cannot-be-claimed"
export type ResultNote = "changed" | "challenged" | "accepted-as-is"

export const resultLabelTags: Record<ResultLabel, { label: string; tone: "ok" | "warn" | "error" }> = {
  "ready-to-claim": { label: "Ready to claim", tone: "ok" },
  "needs-evidence": { label: "Needs evidence", tone: "warn" },
  "cannot-be-claimed": { label: "Can't be claimed", tone: "error" },
}

export const resultNoteTags: Record<ResultNote, { label: string; tone: "info" | "warn" | "neutral" }> = {
  changed: { label: "Changed", tone: "info" },
  challenged: { label: "Challenged", tone: "warn" },
  "accepted-as-is": { label: "Accepted as is", tone: "neutral" },
}
