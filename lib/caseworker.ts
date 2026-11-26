import { getMonths, getToFix } from "@/lib/data/claims"
import { getEvidenceOnFile, getUploads } from "@/lib/data/evidence"
import { getCaseload } from "@/lib/data/participants"
import { getResults, waitingDays, type ProgrammeResult } from "@/lib/data/results"
import { formatDate } from "@/lib/format"
import { resultKinds, resultNouns, type ResultKind } from "@/lib/result-checks"

export type EvidenceStatus =
  | { kind: "none" }
  | { kind: "asked"; by: string; on: string; message: string }
  | { kind: "checking"; on: string }
  | { kind: "sent-back"; by: string; on: string; reason: string }
  | { kind: "accepted"; by: string; on: string }

export type ResultStatus = "ready" | "in-a-claim" | "needs-evidence" | "sent-for-checking" | "sent-back" | "cannot-be-claimed"

function evidenceStatus(result: ProgrammeResult): EvidenceStatus {
  if (result.heldDecision) return { kind: "accepted", by: result.heldDecision.by, on: formatDate(result.heldDecision.on) }
  if (result.check && !result.check.answer) return { kind: "checking", on: formatDate(result.check.on) }

  const chase = result.chases[result.chases.length - 1]
  const answer = result.check?.answer
  if (answer && (!chase || answer.on >= chase.on)) {
    return { kind: "sent-back", by: answer.by, on: formatDate(answer.on), reason: answer.reason }
  }
  return chase ? { kind: "asked", by: chase.by, on: formatDate(chase.on), message: chase.message } : { kind: "none" }
}

export async function getNeedsEvidence(programmeId: string, caseworker: string) {
  const [toFix, caseload] = await Promise.all([getToFix(programmeId), getCaseload(programmeId, caseworker)])

  return Promise.all(
    toFix
      .map((row) => row.result)
      .filter((result) => result.caseworker === caseworker && result.label === "needs-evidence")
      .map(async (result) => {
        const name = caseload.find((participant) => participant.ref === result.participantRef)?.name ?? result.participantRef
        const evidence = await getEvidenceOnFile(programmeId, result.participantRef, result.result)

        return {
          id: result.id,
          participantRef: result.participantRef,
          name,
          title: `${name}'s ${resultNouns[result.result]}`,
          result: result.result,
          why: result.why,
          waiting: waitingDays(result),
          evidence: evidence.map((file) => `${file.evidenceType}, uploaded ${formatDate(file.on)}`),
          status: evidenceStatus(result),
        }
      }),
  )
}

export type NeedsEvidenceRow = Awaited<ReturnType<typeof getNeedsEvidence>>[number]

export async function getMyParticipants(programmeId: string, caseworker: string) {
  const [caseload, results, months] = await Promise.all([getCaseload(programmeId, caseworker), getResults(programmeId), getMonths(programmeId)])
  const sealed = months.filter((month) => month.status === "submitted" || month.status === "accepted").map((month) => month.period.id)

  function statusOf(result: ProgrammeResult): ResultStatus {
    if (result.label === "cannot-be-claimed") return "cannot-be-claimed"
    if (result.label === "ready-to-claim" || result.heldDecision) {
      return result.periodId && sealed.includes(result.periodId) ? "in-a-claim" : "ready"
    }
    if (result.check && !result.check.answer) return "sent-for-checking"
    if (result.check?.answer) return "sent-back"
    return "needs-evidence"
  }

  return caseload.map((participant) => {
    const own = results.filter((result) => result.participantRef === participant.ref && !result.partnerName)
    const statuses = Object.fromEntries(
      resultKinds.map((kind) => {
        const result = own.find((item) => item.result === kind)
        return [kind, result ? statusOf(result) : null]
      }),
    ) as Record<ResultKind, ResultStatus | null>

    return { ref: participant.ref, name: participant.name, statuses }
  })
}

export async function getCaseworkerDashboard(programmeId: string, caseworker: string) {
  const [needs, participants, uploads] = await Promise.all([
    getNeedsEvidence(programmeId, caseworker),
    getCaseload(programmeId, caseworker),
    getUploads(programmeId, caseworker),
  ])
  const names = Object.fromEntries(participants.map((participant) => [participant.ref, participant.name]))
  const base = `/programmes/${programmeId}`

  const items = needs
    .filter((row) => row.status.kind !== "checking" && row.status.kind !== "accepted")
    .map((row) => {
      const upload = `${base}/upload-evidence/new?participant=${row.participantRef}`
      if (row.status.kind === "sent-back") return { key: row.id, kind: "sent-back" as const, title: `${row.title} was sent back`, href: upload, order: 0 }
      if (row.status.kind === "asked") return { key: row.id, kind: "asked" as const, title: `${row.status.by} asked about ${row.title}`, href: upload, order: 1 }
      if (row.waiting >= 14) return { key: row.id, kind: "waiting" as const, title: `${row.title} has waited ${row.waiting} days`, href: upload, order: 2 }
      return { key: row.id, kind: "needs" as const, title: `${row.title} needs evidence`, href: upload, order: 3 }
    })
    .sort((a, b) => a.order - b.order)

  return {
    numbers: {
      participants: participants.length,
      needsEvidence: needs.length,
      overdue: needs.filter((row) => row.waiting >= 14).length,
      sentBack: needs.filter((row) => row.status.kind === "sent-back").length,
      uploads: uploads.length,
    },
    items,
    uploads: uploads.slice(0, 3).map((upload) => {
      const refs = [...new Set(upload.files.map((file) => file.participantRef))]
      return {
        id: upload.id,
        on: formatDate(upload.on),
        who: refs.length === 1 ? (names[refs[0]] ?? refs[0]) : `${refs.length} participants`,
        files: upload.files.length + upload.unmatched.length,
        href: `${base}/upload-evidence/${upload.id}`,
      }
    }),
  }
}
