import { today } from "@/lib/format"
import type { LeaveOutValues } from "@/lib/validations/claims"

export type ClaimStatus = "draft" | "waiting-for-sign-off" | "submitted" | "sent-back" | "accepted"

export type ClaimPeriod = {
  id: string
  label: string
  start: string
  end: string
  sendBy: string
}

export type ClaimCount = {
  label: string
  kind: "Start" | "Job outcome" | "Adjustment"
  fromPartners: number
  ownDelivery: number
}

export type ClaimResult = {
  id: string
  participantRef: string
  result: "Start" | "Job outcome"
  partnerName: string
}

export type ClaimChange = {
  subject: string
  before: string
  now: string
}

export type ClaimFix = {
  participantRef: string
  result: "Start" | "Job outcome"
  partnerName: string
  problem: string
  fixedOn?: string
}

export type Claim = {
  id: string
  periodId: string
  version: number
  status: ClaimStatus
  asAt?: string
  builtBy: string
  builtOn: string
  counts: ClaimCount[]
  results: ClaimResult[]
  leftOut: (ClaimResult & LeaveOutValues)[]
  changes: ClaimChange[]
  submitted?: { by: string; on: string; reference: string }
  sentBack?: { by: string; on: string; reason: string; fixes: ClaimFix[] }
  accepted?: { by: string; organisation: string; on: string; receiptNumber: string }
}

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
  ],
}

const claimsByProgramme: Record<string, Claim[]> = {
  "ctw-northshire": [
    {
      id: "2027-06-v1",
      periodId: "2027-06",
      version: 1,
      status: "accepted",
      asAt: "2027-07-03",
      builtBy: "Priya Nair",
      builtOn: "2027-07-03",
      counts: [
        { label: "Start", kind: "Start", fromPartners: 22, ownDelivery: 5 },
        { label: "Job outcome", kind: "Job outcome", fromPartners: 9, ownDelivery: 2 },
      ],
      results: [],
      leftOut: [],
      changes: [],
      submitted: { by: "Marcus Webb", on: "2027-07-04T10:20:00Z", reference: "CL-NS-0627-1" },
      accepted: {
        by: "Emma Lawson",
        organisation: "Northshire Strategic Authority",
        on: "2027-07-07T09:05:00Z",
        receiptNumber: "R-46511",
      },
    },
    {
      id: "2027-07-v1",
      periodId: "2027-07",
      version: 1,
      status: "accepted",
      asAt: "2027-08-03",
      builtBy: "Priya Nair",
      builtOn: "2027-08-03",
      counts: [
        { label: "Start", kind: "Start", fromPartners: 25, ownDelivery: 6 },
        { label: "Job outcome", kind: "Job outcome", fromPartners: 12, ownDelivery: 3 },
        { label: "Adjustments to June 2027", kind: "Adjustment", fromPartners: 1, ownDelivery: 0 },
      ],
      results: [],
      leftOut: [],
      changes: [],
      submitted: { by: "Marcus Webb", on: "2027-08-04T08:45:00Z", reference: "CL-NS-0727-1" },
      accepted: {
        by: "Emma Lawson",
        organisation: "Northshire Strategic Authority",
        on: "2027-08-06T15:30:00Z",
        receiptNumber: "R-47102",
      },
    },
    {
      id: "2027-08-v1",
      periodId: "2027-08",
      version: 1,
      status: "sent-back",
      asAt: "2027-09-03",
      builtBy: "Priya Nair",
      builtOn: "2027-09-03",
      counts: [
        { label: "Start", kind: "Start", fromPartners: 27, ownDelivery: 6 },
        { label: "Job outcome", kind: "Job outcome", fromPartners: 14, ownDelivery: 3 },
        { label: "Adjustments to July 2027", kind: "Adjustment", fromPartners: 2, ownDelivery: 0 },
      ],
      results: [
        { id: "r-0203", participantRef: "NS-0203", result: "Job outcome", partnerName: "Harbour Skills" },
        { id: "r-0187", participantRef: "NS-0187", result: "Start", partnerName: "Harbour Skills" },
        { id: "r-0161", participantRef: "NS-0161", result: "Job outcome", partnerName: "Brightwell Training" },
      ],
      leftOut: [],
      changes: [],
      submitted: { by: "Marcus Webb", on: "2027-09-04T09:00:00Z", reference: "CL-NS-0827-1" },
      sentBack: {
        by: "Emma Lawson",
        on: "2027-09-09",
        reason: `A result couldn't be verified. "NS-0187 couldn't be verified. Please fix it and send the claim again."`,
        fixes: [
          {
            participantRef: "NS-0187",
            result: "Start",
            partnerName: "Harbour Skills",
            problem: "Result couldn't be verified",
            fixedOn: "2027-09-09",
          },
        ],
      },
    },
  ],
}

function newClaimContent(programmeId: string, periodId: string): Pick<Claim, "counts" | "results"> {
  const periods = periodsByProgramme[programmeId] ?? []
  const previous = periods[periods.findIndex((period) => period.id === periodId) - 1]
  const code = programmeCodes[programmeId] ?? "XX"

  return {
    counts: [
      { label: "Start", kind: "Start", fromPartners: 29, ownDelivery: 6 },
      { label: "Job outcome", kind: "Job outcome", fromPartners: 15, ownDelivery: 3 },
      ...(previous
        ? [{ label: `Adjustments to ${previous.label}`, kind: "Adjustment" as const, fromPartners: 2, ownDelivery: 0 }]
        : []),
    ],
    results: [
      { id: crypto.randomUUID(), participantRef: `${code}-0215`, result: "Start", partnerName: "Harbour Skills" },
      { id: crypto.randomUUID(), participantRef: `${code}-0209`, result: "Job outcome", partnerName: "Brightwell Training" },
      { id: crypto.randomUUID(), participantRef: `${code}-0198`, result: "Start", partnerName: "Riverside Trust" },
    ],
  }
}

function findClaim(programmeId: string, claimId: string) {
  return (claimsByProgramme[programmeId] ?? []).find((claim) => claim.id === claimId)
}

export function claimTotal(claim: Claim) {
  return claim.counts.reduce((total, count) => total + count.fromPartners + count.ownDelivery, 0)
}

export function adjustmentTotal(claim: Claim) {
  return claim.counts
    .filter((count) => count.kind === "Adjustment")
    .reduce((total, count) => total + count.fromPartners + count.ownDelivery, 0)
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

export async function getClaims(programmeId: string) {
  return [...(claimsByProgramme[programmeId] ?? [])].sort(
    (a, b) => b.periodId.localeCompare(a.periodId) || b.version - a.version,
  )
}

export async function getClaim(programmeId: string, claimId: string) {
  return findClaim(programmeId, claimId) ?? null
}

export async function getPeriodClaims(programmeId: string, periodId: string) {
  return (await getClaims(programmeId)).filter((claim) => claim.periodId === periodId)
}

export async function getNextPeriodToClaim(programmeId: string) {
  const claims = claimsByProgramme[programmeId] ?? []
  return (periodsByProgramme[programmeId] ?? []).find((period) => !claims.some((claim) => claim.periodId === period.id)) ?? null
}

export async function createClaim(programmeId: string, periodId: string, builtBy: string) {
  const claim: Claim = {
    id: `${periodId}-v1`,
    periodId,
    version: 1,
    status: "draft",
    builtBy,
    builtOn: today(),
    leftOut: [],
    changes: [],
    ...newClaimContent(programmeId, periodId),
  }

  claimsByProgramme[programmeId] = [...(claimsByProgramme[programmeId] ?? []), claim]
  return claim
}

export async function createNewVersion(programmeId: string, claimId: string, builtBy: string) {
  const previous = findClaim(programmeId, claimId)
  if (!previous) return null

  const claim: Claim = {
    id: `${previous.periodId}-v${previous.version + 1}`,
    periodId: previous.periodId,
    version: previous.version + 1,
    status: "draft",
    builtBy,
    builtOn: today(),
    counts: previous.counts.map((count) => ({ ...count })),
    results: [...previous.results],
    leftOut: [],
    changes: (previous.sentBack?.fixes ?? []).map((fix) => ({
      subject: fix.participantRef,
      before: fix.problem,
      now: fix.fixedOn
        ? `Sent again by ${fix.partnerName}. Verified.`
        : `Not fixed yet. Waiting for ${fix.partnerName} to send it again.`,
    })),
  }

  claimsByProgramme[programmeId] = [...(claimsByProgramme[programmeId] ?? []), claim]
  return claim
}

export async function saveLeftOutResult(programmeId: string, claimId: string, resultId: string, values: LeaveOutValues) {
  const claim = findClaim(programmeId, claimId)
  const result = claim?.results.find((item) => item.id === resultId)
  if (!claim || !result) return

  claim.results = claim.results.filter((item) => item.id !== resultId)
  claim.leftOut = [...claim.leftOut, { ...result, ...values }]
  claim.counts = claim.counts.map((count) =>
    count.kind === result.result ? { ...count, fromPartners: Math.max(0, count.fromPartners - 1) } : count,
  )
}

export async function saveSentForSignOff(programmeId: string, claimId: string) {
  const claim = findClaim(programmeId, claimId)
  if (!claim) return

  claim.status = "waiting-for-sign-off"
  claim.asAt = today()
}

export async function saveSubmission(programmeId: string, claimId: string, submittedBy: string) {
  const claim = findClaim(programmeId, claimId)
  if (!claim) return

  const month = claim.periodId.slice(5, 7)
  const year = claim.periodId.slice(2, 4)

  claim.status = "submitted"
  claim.submitted = {
    by: submittedBy,
    on: new Date().toISOString(),
    reference: `CL-${programmeCodes[programmeId] ?? "XX"}-${month}${year}-${claim.version}`,
  }
}

export async function saveSendByDate(programmeId: string, periodId: string, sendBy: string) {
  const period = (periodsByProgramme[programmeId] ?? []).find((item) => item.id === periodId)
  if (period) period.sendBy = sendBy
}
