import type { EvidenceResult, UploadScope } from "@/lib/validations/evidence"

export type CaseloadParticipant = {
  ref: string
  name: string
  results: { periodId: string; result: EvidenceResult }[]
}

export const evidenceTypes: { label: string; result: EvidenceResult; words: string[] }[] = [
  { label: "Referral letter", result: "Enrolled", words: ["referral"] },
  { label: "Consent form", result: "Enrolled", words: ["consent"] },
  { label: "Start form", result: "Onboarded", words: ["start"] },
  { label: "Payslip", result: "Outcome", words: ["payslip", "pay slip", "wage"] },
  { label: "Invoice", result: "Outcome", words: ["invoice", "trading"] },
  { label: "Employer letter", result: "Outcome", words: ["employer", "letter"] },
]

export type MatchStatus = "matched" | "check" | "needs-match" | "out"

export type SuggestedMatch = {
  participantRef: string
  evidenceType: string
  result: EvidenceResult | ""
  status: MatchStatus
}

export function participantsInScope(caseload: CaseloadParticipant[], scope: UploadScope) {
  if (scope.kind === "programme") return caseload
  if (scope.kind === "participant") return caseload.filter((participant) => scope.participantRefs.includes(participant.ref))

  const inMonth = caseload.filter((participant) => participant.results.some((item) => item.periodId === scope.periodId))
  return scope.who === "all" ? inMonth : inMonth.filter((participant) => scope.participantRefs.includes(participant.ref))
}

function simplify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function nameMatches(fileName: string, participant: CaseloadParticipant) {
  const name = simplify(fileName)
  const [first, ...rest] = participant.name.toLowerCase().split(" ")
  const last = simplify(rest.join(" "))
  if (!last || !name.includes(last)) return false
  return name.includes(simplify(first)) || name.includes(`${first[0]}${last}`)
}

export function guessEvidenceType(fileName: string) {
  const name = fileName.toLowerCase()
  return evidenceTypes.find((type) => type.words.some((word) => name.includes(word))) ?? null
}

export function suggestMatch(
  fileName: string,
  caseload: CaseloadParticipant[],
  inScope: CaseloadParticipant[],
  scope: UploadScope,
  aiOn: boolean,
): SuggestedMatch {
  const type = guessEvidenceType(fileName)
  const byRef = caseload.find((participant) => simplify(fileName).includes(simplify(participant.ref)))
  const byName = aiOn ? caseload.filter((participant) => nameMatches(fileName, participant)) : []
  const found = byRef ?? (byName.length === 1 ? byName[0] : undefined)
  const scoped = found ? inScope.find((participant) => participant.ref === found.ref) : undefined
  const chosen = scope.kind === "participant" || (scope.kind === "month" && scope.who === "some")
  const onlyOne = inScope.length === 1 && chosen ? inScope[0] : undefined
  const participant = scoped ?? (found ? undefined : onlyOne)

  if (found && !scoped) {
    return { participantRef: "", evidenceType: type?.label ?? "", result: type?.result ?? "", status: "out" }
  }

  if (!participant) {
    return { participantRef: "", evidenceType: type?.label ?? "", result: type?.result ?? "", status: "needs-match" }
  }

  const results = participant.results.filter((item) => scope.kind !== "month" || item.periodId === scope.periodId)
  const result = type?.result ?? (results.length === 1 ? results[0].result : "")
  const sure = participant === byRef && Boolean(type)

  return { participantRef: participant.ref, evidenceType: type?.label ?? "", result, status: sure ? "matched" : "check" }
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("")
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

export function describeScope(scope: UploadScope, periods: { id: string; label: string }[], caseload: CaseloadParticipant[]) {
  if (scope.kind === "participant") {
    const ref = scope.participantRefs[0] ?? ""
    const name = caseload.find((participant) => participant.ref === ref)?.name ?? ref
    return { title: name, detail: ref, month: null, people: `${name}, ${ref}`, sentence: `${name}, ${ref}.` }
  }

  if (scope.kind === "programme") {
    return { title: "Whole programme", detail: "All participants", month: null, people: "All participants", sentence: "The whole programme." }
  }

  const month = periods.find((period) => period.id === scope.periodId)?.label ?? scope.periodId
  if (scope.who === "all") {
    return { title: month, detail: "All participants", month, people: "All participants", sentence: `${month}. All participants.` }
  }

  const names = scope.participantRefs.map((ref) => caseload.find((participant) => participant.ref === ref)?.name ?? ref)
  const detail = names.length === 1 ? "1 participant" : `${names.length} participants`

  return { title: month, detail, month, people: names.join(", "), sentence: `${month}. ${joinNames(names)}.` }
}
