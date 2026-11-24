import { today } from "@/lib/format"
import { resultLabelTags, type ResultLabel } from "@/lib/programme-labels"
import {
  addCompletion,
  assignReadyResults,
  holdDecision,
  takeHeldDecisions,
  getMonthResults,
  getResult,
  getResults,
  moveResult,
  type LabelChange,
  type ProgrammeResult,
  type HeldDecision,
  type ResultKind,
} from "@/lib/data/results"
import { resultKinds, resultNouns } from "@/lib/result-checks"
import type { DecideResultValues, LeaveOutValues } from "@/lib/validations/claims"

export type ClaimStatus = "draft" | "submitted" | "replaced" | "sent-back" | "accepted"
export type DraftStage = "ready-to-review" | "waiting-for-sign-off" | "ready-to-submit"
export type MonthStatus = "open" | DraftStage | "submitted" | "sent-back" | "accepted"

export type ClaimPeriod = {
  id: string
  label: string
  start: string
  end: string
  sendBy: string
}

export type Decision = DecideResultValues & {
  by: string
  on: string
  approved?: { by: string; on: string; note: string }
}

export type ClaimItem = {
  resultId: string
  participantRef: string
  result: ResultKind
  partnerName: string | null
  label: ResultLabel
  why: string
  decision?: Decision
}

export type LeftOut = Omit<ClaimItem, "decision"> & {
  to: LeaveOutValues["to"]
  where: string
  reason: string
  by: string
  on: string
}

export type Adjustment = {
  resultId: string
  participantRef: string
  result: ResultKind
  partnerName: string | null
  fromPeriodId: string
  before: string
  now: string
  detail: string
  count: number
  on: string
}

export type ClaimChange = {
  subject: string
  before: string
  now: string
}

export type ClaimCount = {
  label: string
  kind: ResultKind | "Adjustment"
  fromPartners: number
  ownDelivery: number
}

export type FlaggedResult = {
  participantRef: string
  result: ResultKind
  partnerName: string | null
  problem: string
}

export type Claim = {
  id: string
  periodId: string
  version: number
  status: ClaimStatus
  draftedOn: string
  draftedBecause: "month-ended" | "results-changed" | "sent-back"
  asAt: string
  decisions: Record<string, Decision>
  items: ClaimItem[]
  leftOut: LeftOut[]
  adjustments: Adjustment[]
  changes: ClaimChange[]
  counts: ClaimCount[]
  submitted?: { by: string; on: string; reference: string }
  sentBack?: { by: string; on: string; reason: string; flagged: FlaggedResult[] }
  accepted?: { by: string; organisation: string; on: string; receiptNumber: string }
  replacedBy?: number
}

export type ClaimEffect = {
  kind: "updated" | "new-version" | "adjustment" | "adjustment-removed" | "added"
  periodLabel: string
  version?: number
}

export type ClaimMonth = {
  period: ClaimPeriod
  latest: Claim | null
  versions: number
  status: MonthStatus
  results: number
  issues: number
  waiting: ClaimItem[]
}

export const readyLabel: ResultLabel = "ready-to-claim"

const programmeCodes: Record<string, string> = {
  "ctw-northshire": "NS",
  "ctw-westmoor": "WM",
}

const periodsByProgramme: Record<string, ClaimPeriod[]> = {
  "ctw-northshire": [
    { id: "2027-06", label: "June 2027", start: "2027-06-01", end: "2027-06-30", sendBy: "2027-07-05" },
    { id: "2027-07", label: "July 2027", start: "2027-07-01", end: "2027-07-31", sendBy: "2027-08-04" },
    { id: "2027-08", label: "August 2027", start: "2027-08-01", end: "2027-08-31", sendBy: "2027-09-04" },
    { id: "2027-09", label: "September 2027", start: "2027-09-01", end: "2027-09-30", sendBy: "2027-10-04" },
    // { id: "2027-10", label: "October 2027", start: "2027-10-01", end: "2027-10-31", sendBy: "2027-11-04" },
  ],
}

function blankClaim(periodId: string, version: number, draftedBecause: Claim["draftedBecause"]): Claim {
  return {
    id: `${periodId}-v${version}`,
    periodId,
    version,
    status: "draft",
    draftedOn: today(),
    draftedBecause,
    asAt: today(),
    decisions: {},
    items: [],
    leftOut: [],
    adjustments: [],
    changes: [],
    counts: [],
  }
}

function sealed(
  periodId: string,
  version: number,
  values: Partial<Claim> & Pick<Claim, "status" | "asAt" | "counts">,
): Claim {
  return { ...blankClaim(periodId, version, "month-ended"), draftedOn: values.asAt, ...values }
}

const meridianAccepted = (on: string, receiptNumber: string) => ({
  by: "Emma Lawson",
  organisation: "Northshire Strategic Authority",
  on,
  receiptNumber,
})

const claimsByProgramme: Record<string, Claim[]> = {
  "ctw-northshire": [
    sealed("2027-06", 1, {
      status: "accepted",
      asAt: "2027-07-03",
      counts: [
        { label: "Enrolled", kind: "Enrolled", fromPartners: 7, ownDelivery: 2 },
        { label: "Onboarded", kind: "Onboarded", fromPartners: 15, ownDelivery: 3 },
        { label: "Outcome", kind: "Outcome", fromPartners: 9, ownDelivery: 2 },
      ],
      submitted: { by: "Ruth Adeyemi", on: "2027-07-04T10:20:00Z", reference: "CL-NS-0627-1" },
      accepted: meridianAccepted("2027-07-07T09:05:00Z", "R-46511"),
    }),
    sealed("2027-07", 1, {
      status: "accepted",
      asAt: "2027-08-03",
      counts: [
        { label: "Enrolled", kind: "Enrolled", fromPartners: 8, ownDelivery: 2 },
        { label: "Onboarded", kind: "Onboarded", fromPartners: 17, ownDelivery: 4 },
        { label: "Outcome", kind: "Outcome", fromPartners: 12, ownDelivery: 3 },
        { label: "Revision, June 2027", kind: "Adjustment", fromPartners: 1, ownDelivery: 0 },
      ],
      submitted: { by: "Ruth Adeyemi", on: "2027-08-04T08:45:00Z", reference: "CL-NS-0727-1" },
      accepted: meridianAccepted("2027-08-06T15:30:00Z", "R-47102"),
    }),
    sealed("2027-08", 1, {
      status: "sent-back",
      asAt: "2027-09-03",
      counts: [
        { label: "Enrolled", kind: "Enrolled", fromPartners: 9, ownDelivery: 2 },
        { label: "Onboarded", kind: "Onboarded", fromPartners: 18, ownDelivery: 4 },
        { label: "Outcome", kind: "Outcome", fromPartners: 14, ownDelivery: 3 },
        { label: "Revision, July 2027", kind: "Adjustment", fromPartners: 2, ownDelivery: 0 },
      ],
      submitted: { by: "Ruth Adeyemi", on: "2027-09-04T09:00:00Z", reference: "CL-NS-0827-1" },
      sentBack: {
        by: "Emma Lawson",
        on: "2027-09-09",
        reason: "NS-0187 couldn't be verified. Please fix it and send the claim again.",
        flagged: [
          { participantRef: "NS-0187", result: "Onboarded", partnerName: "Harbour Skills", problem: "Its proof pack couldn't be verified" },
        ],
      },
    }),
    sealed("2027-08", 2, {
      status: "accepted",
      draftedOn: "2027-09-09",
      draftedBecause: "sent-back",
      asAt: "2027-09-09",
      changes: [{ subject: "NS-0187, onboarding", before: "Couldn't be verified", now: "Sent again by Harbour Skills. Verified." }],
      counts: [
        { label: "Enrolled", kind: "Enrolled", fromPartners: 9, ownDelivery: 2 },
        { label: "Onboarded", kind: "Onboarded", fromPartners: 18, ownDelivery: 4 },
        { label: "Outcome", kind: "Outcome", fromPartners: 14, ownDelivery: 3 },
        { label: "Revision, July 2027", kind: "Adjustment", fromPartners: 2, ownDelivery: 0 },
      ],
      submitted: { by: "Ruth Adeyemi", on: "2027-09-09T14:10:00Z", reference: "CL-NS-0827-2" },
      accepted: meridianAccepted("2027-09-10T15:20:00Z", "R-48213"),
    }),
    {
      ...blankClaim("2027-09", 1, "month-ended"),
      draftedOn: "2027-10-01",
      asAt: "2027-10-01",
      adjustments: [
        {
          resultId: "NS-0161-outcome",
          participantRef: "NS-0161",
          result: "Outcome",
          partnerName: "Brightwell Training",
          fromPeriodId: "2027-08",
          before: "Ready to claim",
          now: "Can't be claimed",
          detail: "Employer letter withdrawn",
          count: -1,
          on: "2027-09-15",
        },
        {
          resultId: "NS-0416-outcome",
          participantRef: "NS-0416",
          result: "Outcome",
          partnerName: null,
          fromPeriodId: "2027-08",
          before: "Ready to claim",
          now: "Needs evidence",
          detail: "Payslip for week 13 is missing",
          count: -1,
          on: "2027-09-20",
        },
      ],
    },
  ],
}

const pendingAdjustments: Record<string, Adjustment[]> = {}

function claimsFor(programmeId: string) {
  return claimsByProgramme[programmeId] ?? []
}

function addClaim(programmeId: string, claim: Claim) {
  claimsByProgramme[programmeId] = [...claimsFor(programmeId), claim]
  return claim
}

function toItem(result: ProgrammeResult, decision?: Decision): ClaimItem {
  return {
    resultId: result.id,
    participantRef: result.participantRef,
    result: result.result,
    partnerName: result.partnerName,
    label: result.label,
    why: result.why,
    decision,
  }
}

function labelText(label: ResultLabel, decision?: Decision) {
  const name = resultLabelTags[label].label
  if (!decision) return name
  return `${name}, ${decision.kind === "accept-as-is" ? "accepted as is" : "challenged"}`
}

function mergeAdjustment(list: Adjustment[], adjustment: Adjustment) {
  const index = list.findIndex((item) => item.resultId === adjustment.resultId && item.fromPeriodId === adjustment.fromPeriodId)
  if (index === -1) {
    list.push(adjustment)
    return true
  }

  const count = list[index].count + adjustment.count
  if (count === 0) list.splice(index, 1)
  else list[index] = { ...adjustment, before: list[index].before, count }
  return count !== 0
}

export function isIncluded(item: ClaimItem) {
  return item.label === readyLabel || Boolean(item.decision?.approved)
}

export function isWaiting(item: ClaimItem) {
  return Boolean(item.decision && !item.decision.approved)
}

export function draftStage(items: ClaimItem[]): DraftStage {
  const issues = items.filter((item) => item.label !== readyLabel)
  if (issues.some((item) => !item.decision)) return "ready-to-review"
  if (issues.some(isWaiting)) return "waiting-for-sign-off"
  return "ready-to-submit"
}

export function countClaim(items: ClaimItem[], adjustments: Adjustment[], periods: ClaimPeriod[]): ClaimCount[] {
  const included = items.filter(isIncluded)
  const row = (kind: ResultKind): ClaimCount => ({
    label: kind,
    kind,
    fromPartners: included.filter((item) => item.result === kind && item.partnerName).length,
    ownDelivery: included.filter((item) => item.result === kind && !item.partnerName).length,
  })
  const adjusted = [...new Set(adjustments.map((item) => item.fromPeriodId))].sort().map((periodId): ClaimCount => {
    const group = adjustments.filter((item) => item.fromPeriodId === periodId)
    const sum = (own: boolean) => group.filter((item) => !item.partnerName === own).reduce((total, item) => total + item.count, 0)
    const label = periods.find((period) => period.id === periodId)?.label ?? periodId
    return { label: `Revision, ${label}`, kind: "Adjustment", fromPartners: sum(false), ownDelivery: sum(true) }
  })

  return [...resultKinds.map(row), ...adjusted]
}

function monthStatus(claim: Claim, items: ClaimItem[]): MonthStatus {
  if (claim.status === "draft") return draftStage(items)
  if (claim.status === "replaced") return "submitted"
  return claim.status
}

export function claimTotal(counts: ClaimCount[]) {
  return counts.reduce((total, count) => total + count.fromPartners + count.ownDelivery, 0)
}

export async function getClaimPeriods(programmeId: string) {
  return periodsByProgramme[programmeId] ?? []
}

export async function getPeriod(programmeId: string, periodId: string) {
  return (periodsByProgramme[programmeId] ?? []).find((period) => period.id === periodId) ?? null
}

export async function getNextPeriod(programmeId: string, periodId: string) {
  const periods = periodsByProgramme[programmeId] ?? []
  return periods[periods.findIndex((period) => period.id === periodId) + 1] ?? null
}

export async function getPeriodClaims(programmeId: string, periodId: string) {
  return claimsFor(programmeId)
    .filter((claim) => claim.periodId === periodId)
    .sort((a, b) => b.version - a.version)
}

export async function getLatestClaim(programmeId: string, periodId: string) {
  return (await getPeriodClaims(programmeId, periodId))[0] ?? null
}

async function getLatestDraft(programmeId: string, periodId: string) {
  const latest = await getLatestClaim(programmeId, periodId)
  return latest?.status === "draft" ? latest : null
}

export async function getClaimItems(programmeId: string, claim: Claim) {
  if (claim.status !== "draft") return claim.items

  const results = await getMonthResults(programmeId, claim.periodId)
  return results.map((result) => toItem(result, result.label === readyLabel ? undefined : claim.decisions[result.id]))
}

export async function getClaimCounts(programmeId: string, claim: Claim) {
  if (claim.status !== "draft") return claim.counts
  return countClaim(await getClaimItems(programmeId, claim), claim.adjustments, await getClaimPeriods(programmeId))
}

async function draftEndedMonths(programmeId: string) {
  for (const period of periodsByProgramme[programmeId] ?? []) {
    if (period.end >= today() || claimsFor(programmeId).some((claim) => claim.periodId === period.id)) continue

    await assignReadyResults(programmeId, period.id)
    addClaim(programmeId, {
      ...blankClaim(period.id, 1, "month-ended"),
      decisions: await takeHeldDecisions(programmeId, period.id),
      adjustments: pendingAdjustments[programmeId] ?? [],
    })
    pendingAdjustments[programmeId] = []
  }
}

export async function getMonths(programmeId: string): Promise<ClaimMonth[]> {
  await draftEndedMonths(programmeId)
  const periods = [...(await getClaimPeriods(programmeId))].reverse()

  return Promise.all(
    periods.map(async (period): Promise<ClaimMonth> => {
      const versions = await getPeriodClaims(programmeId, period.id)
      const latest = versions[0] ?? null

      if (!latest) {
        const results = await getMonthResults(programmeId, period.id)
        return {
          period,
          latest,
          versions: 0,
          status: "open",
          results: results.length,
          issues: results.filter((result) => result.label !== readyLabel).length,
          waiting: [],
        }
      }

      const items = await getClaimItems(programmeId, latest)
      const draft = latest.status === "draft"

      return {
        period,
        latest,
        versions: versions.length,
        status: monthStatus(latest, items),
        results: draft ? items.length : claimTotal(latest.counts),
        issues: draft ? items.filter((item) => item.label !== readyLabel).length : 0,
        waiting: draft ? items.filter(isWaiting) : [],
      }
    }),
  )
}

export async function getToFix(programmeId: string) {
  const periods = await getClaimPeriods(programmeId)
  const rows: { result: ProgrammeResult; period: ClaimPeriod | null }[] = []

  for (const result of await getResults(programmeId)) {
    if (result.label === readyLabel) continue

    const period = periods.find((item) => item.id === result.periodId) ?? null
    if (period) {
      const latest = await getLatestClaim(programmeId, period.id)
      if (latest && (latest.status !== "draft" || latest.decisions[result.id])) continue
    }

    rows.push({ result, period })
  }

  return rows.sort(
    (a, b) =>
      (a.period?.sendBy ?? "9999").localeCompare(b.period?.sendBy ?? "9999") || a.result.since.localeCompare(b.result.since),
  )
}

export async function saveDecision(programmeId: string, periodId: string, resultId: string, values: DecideResultValues, by: string) {
  const claim = await getLatestDraft(programmeId, periodId)
  if (claim) claim.decisions[resultId] = { ...values, by, on: today() }
}

export async function saveCheckedAcceptance(programmeId: string, resultId: string, decision: HeldDecision) {
  const result = await getResult(programmeId, resultId)
  if (!result) return null

  if (!result.periodId) {
    const target = await firstOpenPeriod(programmeId)
    if (!target) return null
    await moveResult(programmeId, result.id, target.id)
  }

  const period = await getPeriod(programmeId, result.periodId ?? "")
  const latest = await getLatestClaim(programmeId, result.periodId ?? "")
  if (!period || (latest && latest.status !== "draft")) return null

  if (latest) latest.decisions[result.id] = decision
  else await holdDecision(programmeId, result.id, decision)

  return { period, drafted: Boolean(latest) }
}

export async function saveApproval(programmeId: string, periodId: string, resultId: string, by: string, note: string) {
  const decision = (await getLatestDraft(programmeId, periodId))?.decisions[resultId]
  const result = await getResult(programmeId, resultId)
  if (!decision || !result) return

  decision.approved = { by, on: today(), note }
  await addCompletion(programmeId, result, { labelBefore: result.label, how: decision.kind, detail: `Approved by ${by}` })
}

export async function saveLeftOut(programmeId: string, periodId: string, resultId: string, values: LeaveOutValues, by: string) {
  const claim = await getLatestDraft(programmeId, periodId)
  const result = await getResult(programmeId, resultId)
  if (!claim || !result) return

  const next = values.to === "next-month" ? await getNextPeriod(programmeId, periodId) : null

  delete claim.decisions[resultId]
  claim.leftOut = [
    ...claim.leftOut,
    {
      ...toItem(result),
      to: next ? "next-month" : "to-fix",
      where: next ? `Moved to ${next.label}` : "Back to Fixes",
      reason: values.reason,
      by,
      on: today(),
    },
  ]

  await moveResult(programmeId, resultId, next?.id ?? null)
}

export async function saveSubmission(programmeId: string, periodId: string, by: string) {
  const claim = await getLatestDraft(programmeId, periodId)
  if (!claim) return null

  const items = await getClaimItems(programmeId, claim)
  const [year, month] = periodId.split("-")

  claim.items = items
  claim.counts = countClaim(items, claim.adjustments, await getClaimPeriods(programmeId))
  claim.asAt = today()
  claim.status = "submitted"
  claim.submitted = {
    by,
    on: new Date().toISOString(),
    reference: `CL-${programmeCodes[programmeId] ?? "XX"}-${month}${year.slice(2)}-${claim.version}`,
  }

  for (const older of claimsFor(programmeId)) {
    if (older.periodId === periodId && older.status === "submitted" && older.version < claim.version) {
      older.status = "replaced"
      older.replacedBy = claim.version
    }
  }

  return claim
}

function draftNewVersion(programmeId: string, previous: Claim, changedId: string, changes: ClaimChange[]) {
  const decisions = Object.fromEntries(
    previous.items
      .filter((item) => item.decision && item.resultId !== changedId)
      .map((item) => [item.resultId, item.decision as Decision]),
  )

  return addClaim(programmeId, {
    ...blankClaim(previous.periodId, previous.version + 1, "results-changed"),
    decisions,
    leftOut: [...previous.leftOut],
    adjustments: previous.adjustments.map((item) => ({ ...item })),
    changes,
  })
}

async function addAdjustment(programmeId: string, adjustment: Adjustment) {
  for (const period of await getClaimPeriods(programmeId)) {
    if (period.id <= adjustment.fromPeriodId) continue

    const latest = await getLatestClaim(programmeId, period.id)
    if (latest && latest.status !== "draft") continue

    const kept = mergeAdjustment(latest ? latest.adjustments : (pendingAdjustments[programmeId] ??= []), adjustment)
    return { period, kept }
  }

  return { period: null, kept: mergeAdjustment((pendingAdjustments[programmeId] ??= []), adjustment) }
}

async function firstOpenPeriod(programmeId: string) {
  for (const period of await getClaimPeriods(programmeId)) {
    const latest = await getLatestClaim(programmeId, period.id)
    if (!latest || latest.status === "draft") return period
  }
  return null
}

export async function applyLabelChange(programmeId: string, change: LabelChange): Promise<ClaimEffect | null> {
  const result = await getResult(programmeId, change.resultId)
  if (!result) return null

  if (!result.periodId) {
    if (change.after !== readyLabel) return null
    const target = await firstOpenPeriod(programmeId)
    if (!target) return null
    await moveResult(programmeId, result.id, target.id)
    return { kind: "added", periodLabel: target.label }
  }

  const period = await getPeriod(programmeId, result.periodId)
  const latest = await getLatestClaim(programmeId, result.periodId)
  if (!period || !latest) return null

  const subject = `${result.participantRef}, ${resultNouns[result.result]}`

  if (latest.status === "draft") {
    const decision = latest.decisions[result.id]
    delete latest.decisions[result.id]
    if (latest.version > 1) {
      latest.changes = [...latest.changes, { subject, before: labelText(change.before, decision), now: labelText(change.after) }]
    }
    return { kind: "updated", periodLabel: period.label, version: latest.version }
  }

  const item = latest.items.find((entry) => entry.resultId === result.id)

  if (latest.status === "submitted" || latest.status === "sent-back") {
    const claim = draftNewVersion(programmeId, latest, result.id, [
      { subject, before: labelText(change.before, item?.decision), now: labelText(change.after) },
    ])
    return { kind: "new-version", periodLabel: period.label, version: claim.version }
  }

  const countedBefore = change.before === readyLabel || (item?.label === change.before && Boolean(item?.decision?.approved))
  const count = (change.after === readyLabel ? 1 : 0) - (countedBefore ? 1 : 0)
  if (count === 0) return null

  const target = await addAdjustment(programmeId, {
    resultId: result.id,
    participantRef: result.participantRef,
    result: result.result,
    partnerName: result.partnerName,
    fromPeriodId: period.id,
    before: resultLabelTags[change.before].label,
    now: resultLabelTags[change.after].label,
    detail: change.after === readyLabel ? "Evidence added" : result.why,
    count,
    on: today(),
  })

  return { kind: target.kept ? "adjustment" : "adjustment-removed", periodLabel: target.period?.label ?? "next month's" }
}
