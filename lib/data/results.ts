import { addDays, today } from "@/lib/format"
import type { ResultLabel } from "@/lib/programme-labels"
import { labelAfter, type ResultKind } from "@/lib/result-checks"

export type { ResultKind }

export type Chase = {
  to: string
  by: string
  on: string
  message: string
}

export type ProgrammeResult = {
  id: string
  participantRef: string
  result: ResultKind
  partnerName: string | null
  caseworker: string | null
  periodId: string | null
  label: ResultLabel
  why: string
  missing: string[]
  since: string
  chases: Chase[]
  check: CheckRequest | null
  heldDecision: HeldDecision | null
}

export type CheckRequest = {
  by: string
  on: string
  note: string
  answer?: { by: string; on: string; reason: string }
}

export type HeldDecision = {
  kind: "accept-as-is" | "challenge"
  reason: string
  by: string
  on: string
}

export type LabelChange = {
  resultId: string
  before: ResultLabel
  after: ResultLabel
}

export type Completion = {
  resultId: string
  participantRef: string
  result: ResultKind
  partnerName: string | null
  labelBefore: ResultLabel
  how: "fixed" | "accept-as-is" | "challenge"
  detail: string
  on: string
}

type Seed = Pick<ProgrammeResult, "participantRef" | "result" | "partnerName" | "periodId" | "label"> &
  Partial<Pick<ProgrammeResult, "why" | "missing" | "since" | "chases">>

const partners = ["Harbour Skills", "Riverside Trust", "Brightwell Training"]

function daysAgo(days: number) {
  return addDays(today(), -days)
}

export function resultId(participantRef: string, result: ResultKind) {
  return `${participantRef}-${result.toLowerCase()}`
}

function seed(item: Seed): ProgrammeResult {
  return {
    why: "",
    missing: [],
    since: daysAgo(90),
    chases: [],
    check: null,
    heldDecision: null,
    ...item,
    id: resultId(item.participantRef, item.result),
    caseworker: item.partnerName ? null : "Tom Okafor",
  }
}

function ready(periodId: string, first: number, result: ResultKind, count: number, own: boolean) {
  return Array.from({ length: count }, (_, index) =>
    seed({
      participantRef: `NS-${String(first + index).padStart(4, "0")}`,
      result,
      periodId,
      label: "ready-to-claim",
      partnerName: own ? null : partners[index % partners.length],
    }),
  )
}

const resultsByProgramme: Record<string, ProgrammeResult[]> = {
  "ctw-northshire": [
    seed({ participantRef: "NS-0398", result: "Onboarded", partnerName: null, periodId: "2027-06", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0187", result: "Onboarded", partnerName: "Harbour Skills", periodId: "2027-08", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0407", result: "Onboarded", partnerName: null, periodId: "2027-08", label: "ready-to-claim" }),
    seed({
      participantRef: "NS-0158",
      result: "Outcome",
      partnerName: "Brightwell Training",
      periodId: "2027-08",
      label: "needs-evidence",
      why: "Payslips cover 11 of the 13 weeks",
      missing: ["Payslip"],
      since: daysAgo(60),
    }),
    seed({
      participantRef: "NS-0149",
      result: "Onboarded",
      partnerName: "Riverside Trust",
      periodId: "2027-08",
      label: "cannot-be-claimed",
      why: "Referral is dated after the start",
      since: daysAgo(60),
    }),
    seed({
      participantRef: "NS-0416",
      result: "Outcome",
      partnerName: null,
      periodId: "2027-08",
      label: "needs-evidence",
      why: "Payslip for week 13 is missing",
      missing: ["Payslip"],
      since: daysAgo(40),
    }),
    seed({
      participantRef: "NS-0161",
      result: "Outcome",
      partnerName: "Brightwell Training",
      periodId: "2027-08",
      label: "cannot-be-claimed",
      why: "Employer letter withdrawn",
      since: daysAgo(45),
    }),
    seed({ participantRef: "NS-0119", result: "Onboarded", partnerName: "Riverside Trust", periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0190", result: "Onboarded", partnerName: "Harbour Skills", periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0433", result: "Onboarded", partnerName: null, periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0431", result: "Enrolled", partnerName: null, periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0432", result: "Enrolled", partnerName: null, periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0441", result: "Enrolled", partnerName: null, periodId: "2027-09", label: "ready-to-claim" }),
    ...ready("2027-09", 600, "Onboarded", 16, false),
    ...ready("2027-09", 700, "Onboarded", 2, true),
    ...ready("2027-09", 640, "Enrolled", 9, false),
    ...ready("2027-09", 720, "Outcome", 13, false),
    ...ready("2027-09", 740, "Outcome", 3, true),
    seed({
      participantRef: "NS-0203",
      result: "Outcome",
      partnerName: "Harbour Skills",
      periodId: "2027-09",
      label: "needs-evidence",
      why: "Payslips cover 9 of the 13 weeks",
      missing: ["Payslip"],
      since: daysAgo(11),
    }),
    seed({
      participantRef: "NS-0174",
      result: "Onboarded",
      partnerName: "Harbour Skills",
      periodId: "2027-09",
      label: "cannot-be-claimed",
      why: "Lives outside Northshire",
      since: daysAgo(8),
      chases: [
        {
          to: "Harbour Skills",
          by: "Ruth Adeyemi",
          on: "2027-09-28",
          message: "Please send proof of address for the start date.",
        },
      ],
    }),
    seed({
      participantRef: "NS-0452",
      result: "Enrolled",
      partnerName: null,
      periodId: "2027-09",
      label: "needs-evidence",
      why: "Consent form isn't signed",
      missing: ["Consent form"],
      since: daysAgo(28),
    }),
    seed({
      participantRef: "NS-0467",
      result: "Onboarded",
      partnerName: null,
      periodId: "2027-09",
      label: "needs-evidence",
      why: "Start form isn't signed",
      missing: ["Start form"],
      since: daysAgo(22),
    }),
    ...ready("2027-10", 800, "Onboarded", 15, false),
    ...ready("2027-10", 820, "Outcome", 4, false),
    seed({
      participantRef: "NS-0166",
      result: "Outcome",
      partnerName: "Harbour Skills",
      periodId: "2027-10",
      label: "needs-evidence",
      why: "No employer letter",
      missing: ["Employer letter"],
      since: daysAgo(9),
      chases: [
        { to: "Harbour Skills", by: "Ruth Adeyemi", on: "2027-10-02", message: "Please upload the signed employer letter." },
      ],
    }),
    seed({
      participantRef: "NS-0398",
      result: "Outcome",
      partnerName: null,
      periodId: "2027-10",
      label: "needs-evidence",
      why: "No payslip or employer letter",
      missing: ["Payslip", "Employer letter"],
      since: daysAgo(1),
    }),
  ],
}

function done(
  participantRef: string,
  result: ResultKind,
  partnerName: string | null,
  labelBefore: ResultLabel,
  how: Completion["how"],
  detail: string,
  on: string,
): Completion {
  return { resultId: resultId(participantRef, result), participantRef, result, partnerName, labelBefore, how, detail, on }
}

const completionsByProgramme: Record<string, Completion[]> = {
  "ctw-northshire": [
    done("NS-0407", "Onboarded", null, "needs-evidence", "fixed", "Start form uploaded by Tom Okafor", "2027-08-18"),
    done("NS-0431", "Enrolled", null, "needs-evidence", "fixed", "Consent form uploaded by Tom Okafor", "2027-09-01"),
    done("NS-0432", "Enrolled", null, "needs-evidence", "fixed", "Consent form uploaded by Tom Okafor", "2027-09-01"),
    done("NS-0441", "Enrolled", null, "needs-evidence", "fixed", "Referral letter uploaded by Tom Okafor", "2027-09-01"),
    done("NS-0158", "Outcome", "Brightwell Training", "needs-evidence", "accept-as-is", "Approved by Marcus Webb", "2027-09-02"),
    done("NS-0149", "Onboarded", "Riverside Trust", "cannot-be-claimed", "challenge", "Approved by Marcus Webb", "2027-09-02"),
    done("NS-0187", "Onboarded", "Harbour Skills", "needs-evidence", "fixed", "Sent again by Harbour Skills", "2027-09-09"),
  ],
}

function resultsFor(programmeId: string) {
  return resultsByProgramme[programmeId] ?? []
}

export function waitingDays(result: ProgrammeResult) {
  const days = (new Date(today()).getTime() - new Date(result.since.slice(0, 10)).getTime()) / 86400000
  return Math.max(0, Math.round(days))
}

export function recipientFor(result: ProgrammeResult) {
  return result.partnerName ?? result.caseworker ?? "their caseworker"
}

export async function getResults(programmeId: string) {
  return resultsFor(programmeId)
}

export async function getResult(programmeId: string, resultId: string) {
  return resultsFor(programmeId).find((result) => result.id === resultId) ?? null
}

export async function getMonthResults(programmeId: string, periodId: string) {
  return resultsFor(programmeId)
    .filter((result) => result.periodId === periodId)
    .sort((a, b) => a.participantRef.localeCompare(b.participantRef))
}

export async function getParticipantResults(programmeId: string, refs: string[]) {
  return resultsFor(programmeId).filter((result) => refs.includes(result.participantRef))
}

export async function getCompletions(programmeId: string) {
  return [...(completionsByProgramme[programmeId] ?? [])].reverse()
}

export async function addCompletion(
  programmeId: string,
  result: ProgrammeResult,
  values: Pick<Completion, "labelBefore" | "how" | "detail">,
) {
  completionsByProgramme[programmeId] = [
    ...(completionsByProgramme[programmeId] ?? []),
    {
      resultId: result.id,
      participantRef: result.participantRef,
      result: result.result,
      partnerName: result.partnerName,
      ...values,
      on: today(),
    },
  ]
}

export async function saveChases(programmeId: string, resultIds: string[], chase: Omit<Chase, "to">) {
  for (const result of resultsFor(programmeId)) {
    if (resultIds.includes(result.id)) result.chases = [...result.chases, { ...chase, to: recipientFor(result) }]
  }
}

export async function saveCheckRequest(programmeId: string, resultId: string, request: Omit<CheckRequest, "on" | "answer">) {
  const result = resultsFor(programmeId).find((item) => item.id === resultId)
  if (result) result.check = { ...request, on: today() }
}

export async function saveCheckAnswer(programmeId: string, resultId: string, answer: { by: string; reason: string }) {
  const result = resultsFor(programmeId).find((item) => item.id === resultId)
  if (result?.check) result.check = { ...result.check, answer: { ...answer, on: today() } }
}

export async function clearCheck(programmeId: string, resultId: string) {
  const result = resultsFor(programmeId).find((item) => item.id === resultId)
  if (result) result.check = null
}

export async function holdDecision(programmeId: string, resultId: string, decision: HeldDecision) {
  const result = resultsFor(programmeId).find((item) => item.id === resultId)
  if (result) result.heldDecision = decision
}

export async function takeHeldDecisions(programmeId: string, periodId: string) {
  const held: Record<string, HeldDecision> = {}
  for (const result of resultsFor(programmeId)) {
    if (result.periodId === periodId && result.heldDecision) {
      held[result.id] = result.heldDecision
      result.heldDecision = null
    }
  }
  return held
}

export async function moveResult(programmeId: string, resultId: string, periodId: string | null) {
  const result = resultsFor(programmeId).find((item) => item.id === resultId)
  if (result) result.periodId = periodId
}

export async function assignReadyResults(programmeId: string, periodId: string) {
  for (const result of resultsFor(programmeId)) {
    if (!result.periodId && result.label === "ready-to-claim") result.periodId = periodId
  }
}

export async function addEvidence(
  programmeId: string,
  evidence: { participantRef: string; result: ResultKind; evidenceType: string; periodId: string | null; by: string },
): Promise<LabelChange[]> {
  const changes: LabelChange[] = []

  for (const result of resultsFor(programmeId)) {
    const sameResult = result.participantRef === evidence.participantRef && result.result === evidence.result
    if (!sameResult || (evidence.periodId && result.periodId !== evidence.periodId)) continue

    const before = result.label
    const after = labelAfter(result, [evidence.evidenceType])
    result.missing = result.missing.filter((type) => type !== evidence.evidenceType)

    if (after !== before) {
      result.label = after
      result.why = ""
      result.since = today()
      result.check = null
      result.heldDecision = null
      changes.push({ resultId: result.id, before, after })
      await addCompletion(programmeId, result, {
        labelBefore: before,
        how: "fixed",
        detail: `${evidence.evidenceType} uploaded by ${evidence.by}`,
      })
    }
  }

  return changes
}
