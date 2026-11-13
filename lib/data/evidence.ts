import { applyLabelChange, getLatestClaim, getPeriod, type ClaimEffect } from "@/lib/data/claims"
import { addEvidence, getParticipantResults, getResults } from "@/lib/data/results"
import type { CaseloadParticipant } from "@/lib/evidence-matching"
import { resultLabelTags } from "@/lib/programme-labels"
import type { ResultCheck } from "@/lib/result-checks"
import type { JobRole } from "@/lib/session"
import type { EvidenceResult, FileMatchValues, UploadScope } from "@/lib/validations/evidence"

export type UploadChange = {
  kind: "label" | "claim"
  title: string
  detail: string
}

export type UnmatchedFile = {
  name: string
  size: number
  reason: string
}

export type EvidenceUpload = {
  id: string
  uploadedBy: string
  on: string
  scope: UploadScope
  files: { name: string; size: number; participantRef: string; evidenceType: string; result: EvidenceResult }[]
  unmatched: UnmatchedFile[]
  changes: UploadChange[]
}

const participants: Record<string, { ref: string; name: string; caseworker: string }[]> = {
  "ctw-northshire": [
    { ref: "NS-0433", name: "Darren Lowe", caseworker: "Tom Okafor" },
    { ref: "NS-0398", name: "Kyle Wright", caseworker: "Tom Okafor" },
    { ref: "NS-0431", name: "Hassan Ali", caseworker: "Tom Okafor" },
    { ref: "NS-0432", name: "Chloe Bennett", caseworker: "Tom Okafor" },
    { ref: "NS-0441", name: "Kyla Morris", caseworker: "Tom Okafor" },
    { ref: "NS-0452", name: "Amira Hussain", caseworker: "Tom Okafor" },
    { ref: "NS-0467", name: "Ben Carter", caseworker: "Tom Okafor" },
    { ref: "NS-0416", name: "Megan Holt", caseworker: "Tom Okafor" },
    { ref: "NS-0407", name: "Sophie Marsh", caseworker: "Tom Okafor" },
  ],
}

const uploadsByProgramme: Record<string, EvidenceUpload[]> = {
  "ctw-northshire": [
    {
      id: "up-0818",
      uploadedBy: "Tom Okafor",
      on: "2027-08-18T13:20:00Z",
      scope: { kind: "month", periodId: "2027-08", who: "all", participantRefs: [] },
      files: [
        { name: "NS-0416_payslip_aug.pdf", size: 210000, participantRef: "NS-0416", evidenceType: "Payslip", result: "Job outcome" },
        { name: "NS-0416_employer_letter.pdf", size: 180000, participantRef: "NS-0416", evidenceType: "Employer letter", result: "Job outcome" },
        { name: "NS-0407_start_form.pdf", size: 120000, participantRef: "NS-0407", evidenceType: "Start form", result: "Start" },
        { name: "smarsh_consent.pdf", size: 98000, participantRef: "NS-0407", evidenceType: "Consent form", result: "Start" },
      ],
      unmatched: [{ name: "IMG_1904.jpg", size: 1840000, reason: "We couldn't tell who it's for." }],
      changes: [],
    },
    {
      id: "up-0901",
      uploadedBy: "Tom Okafor",
      on: "2027-09-01T08:30:00Z",
      scope: { kind: "programme", periodId: "", who: "all", participantRefs: [] },
      files: [
        { name: "NS-0431_consent_form.pdf", size: 101000, participantRef: "NS-0431", evidenceType: "Consent form", result: "Start" },
        { name: "NS-0432_consent_form.pdf", size: 99000, participantRef: "NS-0432", evidenceType: "Consent form", result: "Start" },
        { name: "NS-0441_referral_letter.pdf", size: 143000, participantRef: "NS-0441", evidenceType: "Referral letter", result: "Start" },
      ],
      unmatched: [{ name: "scan_0051.pdf", size: 420000, reason: "It isn't for anyone in this upload." }],
      changes: [],
    },
  ],
}

function uploadsFor(programmeId: string) {
  return uploadsByProgramme[programmeId] ?? []
}

function claimChange(effect: ClaimEffect): UploadChange {
  if (effect.kind === "new-version") {
    const version = effect.version ?? 2
    return {
      kind: "claim",
      title: `${effect.periodLabel} claim: Version ${version} drafted`,
      detail: `Version ${version - 1} hadn't been accepted yet, so your Compliance lead will review Version ${version} and submit it.`,
    }
  }

  if (effect.kind === "adjustment") {
    return {
      kind: "claim",
      title: `Adjustment added to the ${effect.periodLabel} claim`,
      detail: "The earlier claim was already accepted, so the change comes through as an adjustment.",
    }
  }

  if (effect.kind === "adjustment-removed") {
    return {
      kind: "claim",
      title: `Adjustment removed from the ${effect.periodLabel} claim`,
      detail: "It counts again, so it cancels out the earlier adjustment.",
    }
  }

  if (effect.kind === "added") {
    return { kind: "claim", title: `Added to the ${effect.periodLabel} claim`, detail: "It's ready to claim now." }
  }

  return { kind: "claim", title: `${effect.periodLabel} claim updated`, detail: "It's still a draft, so the change shows there straight away." }
}

async function recordEvidence(programmeId: string, scope: UploadScope, files: EvidenceUpload["files"]) {
  const names = participants[programmeId] ?? []
  const changes: UploadChange[] = []

  for (const file of files) {
    const labelChanges = await addEvidence(programmeId, {
      participantRef: file.participantRef,
      result: file.result,
      evidenceType: file.evidenceType,
      periodId: scope.kind === "month" ? scope.periodId : null,
    })

    for (const change of labelChanges) {
      const name = names.find((participant) => participant.ref === file.participantRef)?.name ?? file.participantRef
      changes.push({
        kind: "label",
        title: `${name}'s ${file.result.toLowerCase()} is now ${resultLabelTags[change.after].label}`,
        detail: "Checked against the rules. Its proof pack is updated.",
      })

      const effect = await applyLabelChange(programmeId, change)
      if (effect) changes.push(claimChange(effect))
    }
  }

  return changes
}

export async function getUploadPool(
  programmeId: string,
  person: { name: string; jobRole?: JobRole },
): Promise<CaseloadParticipant[]> {
  const results = await getResults(programmeId)

  return (participants[programmeId] ?? [])
    .filter((participant) => person.jobRole !== "caseworker" || participant.caseworker === person.name)
    .map(({ ref, name }) => ({
      ref,
      name,
      results: results
        .filter((result) => result.participantRef === ref)
        .map((result) => ({ periodId: result.periodId ?? "", result: result.result })),
    }))
}

export function poolLabel(jobRole?: JobRole) {
  return jobRole === "caseworker" ? "your caseload" : "your own delivery"
}

export async function getResultChecks(programmeId: string, refs: string[]): Promise<ResultCheck[]> {
  const results = await getParticipantResults(programmeId, refs)

  return Promise.all(
    results.map(async (result) => {
      const latest = result.periodId ? await getLatestClaim(programmeId, result.periodId) : null
      const period = result.periodId ? await getPeriod(programmeId, result.periodId) : null
      const status = latest?.status === "accepted" ? "accepted" : latest?.status === "submitted" ? "submitted" : null

      return {
        resultId: result.id,
        participantRef: result.participantRef,
        result: result.result,
        periodId: result.periodId,
        label: result.label,
        missing: result.missing,
        claim: latest && period && status ? { periodLabel: period.label, version: latest.version, status } : null,
      }
    }),
  )
}

export async function getUploads(programmeId: string, uploadedBy: string) {
  return uploadsFor(programmeId)
    .filter((upload) => upload.uploadedBy === uploadedBy)
    .reverse()
}

export async function getUpload(programmeId: string, uploadId: string) {
  return uploadsFor(programmeId).find((upload) => upload.id === uploadId) ?? null
}

export async function saveUpload(programmeId: string, values: Omit<EvidenceUpload, "id" | "on" | "changes">) {
  const changes = await recordEvidence(programmeId, values.scope, values.files)
  const upload: EvidenceUpload = { ...values, changes, id: crypto.randomUUID(), on: new Date().toISOString() }
  uploadsByProgramme[programmeId] = [...uploadsFor(programmeId), upload]
  return upload
}

export async function saveUnmatchedMatch(programmeId: string, uploadId: string, fileName: string, values: FileMatchValues) {
  const upload = await getUpload(programmeId, uploadId)
  const file = upload?.unmatched.find((item) => item.name === fileName)
  if (!upload || !file) return

  const matched = { name: file.name, size: file.size, ...values }
  upload.unmatched = upload.unmatched.filter((item) => item.name !== fileName)
  upload.files = [...upload.files, matched]
  upload.changes = [...upload.changes, ...(await recordEvidence(programmeId, upload.scope, [matched]))]
}
