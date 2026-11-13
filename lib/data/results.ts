import { today } from "@/lib/format"
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
}

export type LabelChange = {
  resultId: string
  before: ResultLabel
  after: ResultLabel
}

type Seed = Pick<ProgrammeResult, "participantRef" | "result" | "partnerName" | "periodId" | "label"> &
  Partial<Pick<ProgrammeResult, "why" | "missing" | "since" | "chases">>

const partners = ["Harbour Skills", "Riverside Trust", "Brightwell Training"]

function seed(item: Seed): ProgrammeResult {
  return {
    why: "",
    missing: [],
    since: "2027-06-01",
    chases: [],
    ...item,
    id: `${item.participantRef}-${item.result === "Start" ? "start" : "job"}`,
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
    seed({ participantRef: "NS-0398", result: "Start", partnerName: null, periodId: "2027-06", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0187", result: "Start", partnerName: "Harbour Skills", periodId: "2027-08", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0407", result: "Start", partnerName: null, periodId: "2027-08", label: "ready-to-claim" }),
    seed({
      participantRef: "NS-0416",
      result: "Job outcome",
      partnerName: null,
      periodId: "2027-08",
      label: "needs-evidence",
      why: "Payslip for week 13 is missing",
      missing: ["Payslip"],
      since: "2027-09-20",
    }),
    seed({
      participantRef: "NS-0161",
      result: "Job outcome",
      partnerName: "Brightwell Training",
      periodId: "2027-08",
      label: "cannot-be-claimed",
      why: "Employer letter withdrawn",
      since: "2027-09-15",
    }),
    seed({ participantRef: "NS-0119", result: "Start", partnerName: "Riverside Trust", periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0190", result: "Start", partnerName: "Harbour Skills", periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0431", result: "Start", partnerName: null, periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0432", result: "Start", partnerName: null, periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0433", result: "Start", partnerName: null, periodId: "2027-09", label: "ready-to-claim" }),
    seed({ participantRef: "NS-0441", result: "Start", partnerName: null, periodId: "2027-09", label: "ready-to-claim" }),
    ...ready("2027-09", 600, "Start", 25, false),
    ...ready("2027-09", 700, "Start", 2, true),
    ...ready("2027-09", 720, "Job outcome", 13, false),
    ...ready("2027-09", 740, "Job outcome", 3, true),
    seed({
      participantRef: "NS-0203",
      result: "Job outcome",
      partnerName: "Harbour Skills",
      periodId: "2027-09",
      label: "needs-evidence",
      why: "Payslips cover 9 of the 13 weeks",
      missing: ["Payslip"],
      since: "2027-09-21",
    }),
    seed({
      participantRef: "NS-0174",
      result: "Start",
      partnerName: "Harbour Skills",
      periodId: "2027-09",
      label: "cannot-be-claimed",
      why: "Lives outside Northshire",
      since: "2027-09-24",
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
      result: "Start",
      partnerName: null,
      periodId: "2027-09",
      label: "needs-evidence",
      why: "Consent form isn't signed",
      missing: ["Consent form"],
      since: "2027-09-27",
    }),
    seed({
      participantRef: "NS-0467",
      result: "Start",
      partnerName: null,
      periodId: "2027-09",
      label: "needs-evidence",
      why: "No start form",
      missing: ["Start form"],
      since: "2027-09-29",
    }),
    ...ready("2027-10", 800, "Start", 15, false),
    ...ready("2027-10", 820, "Job outcome", 4, false),
    seed({
      participantRef: "NS-0166",
      result: "Job outcome",
      partnerName: "Harbour Skills",
      periodId: "2027-10",
      label: "needs-evidence",
      why: "No employer letter",
      missing: ["Employer letter"],
      since: "2027-09-23",
      chases: [
        { to: "Harbour Skills", by: "Ruth Adeyemi", on: "2027-10-02", message: "Please upload the signed employer letter." },
      ],
    }),
    seed({
      participantRef: "NS-0398",
      result: "Job outcome",
      partnerName: null,
      periodId: "2027-10",
      label: "needs-evidence",
      why: "No payslip or employer letter",
      missing: ["Payslip", "Employer letter"],
      since: "2027-10-05",
    }),
  ],
}

function resultsFor(programmeId: string) {
  return resultsByProgramme[programmeId] ?? []
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

export async function saveChases(programmeId: string, resultIds: string[], chase: Omit<Chase, "to">) {
  for (const result of resultsFor(programmeId)) {
    if (resultIds.includes(result.id)) result.chases = [...result.chases, { ...chase, to: recipientFor(result) }]
  }
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
  evidence: { participantRef: string; result: ResultKind; evidenceType: string; periodId: string | null },
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
      changes.push({ resultId: result.id, before, after })
    }
  }

  return changes
}
