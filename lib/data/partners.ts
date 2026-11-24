import type { ResultLabel, ResultNote } from "@/lib/programme-labels"
import type { ResultKind } from "@/lib/result-checks"
import type { FollowUpValues } from "@/lib/validations/follow-up"

export type Partner = {
  id: string
  name: string
  initials: string
  sentResults: number
  overdueChecks: number
  needsEvidence: number
  cannotBeClaimed: number
  atRisk: boolean
}

export type PartnerDetails = Partner & {
  since: string
  contact: { name: string; email: string }
  receipts: { id: string; reference: string; results: number; sentOn: string }[]
}

export type ReceivedResult = {
  id: string
  result: ResultKind
  participantRef: string
  label: ResultLabel
  verified: boolean
  partnerName: string
  receivedOn: string
  note: ResultNote | null
}

export type FollowUp = {
  id: string
  text: string
  date: string
}

const partners: Record<string, PartnerDetails[]> = {
  "ctw-northshire": [
    {
      id: "brightwell-training",
      name: "Brightwell Training",
      initials: "BT",
      sentResults: 24,
      overdueChecks: 1,
      needsEvidence: 1,
      cannotBeClaimed: 0,
      atRisk: false,
      since: "2026-12-03",
      contact: { name: "Joanna Hart", email: "joanna.hart@brightwelltraining.org.uk" },
      receipts: [{ id: "bt-1180", reference: "BT-1180", results: 5, sentOn: "2027-09-01" }],
    },
    {
      id: "harbour-skills",
      name: "Harbour Skills",
      initials: "HS",
      sentResults: 18,
      overdueChecks: 4,
      needsEvidence: 3,
      cannotBeClaimed: 1,
      atRisk: true,
      since: "2026-12-04",
      contact: { name: "Lisa Ward", email: "lisa.ward@harbourskills.org" },
      receipts: [
        { id: "hs-2231", reference: "HS-2231", results: 4, sentOn: "2027-09-02" },
        { id: "hs-2207", reference: "HS-2207", results: 6, sentOn: "2027-08-21" },
      ],
    },
    {
      id: "riverside-trust",
      name: "Riverside Trust",
      initials: "RT",
      sentResults: 21,
      overdueChecks: 1,
      needsEvidence: 3,
      cannotBeClaimed: 1,
      atRisk: false,
      since: "2026-12-06",
      contact: { name: "Kate Lin", email: "kate.lin@riversidetrust.org.uk" },
      receipts: [{ id: "rt-0412", reference: "RT-0412", results: 21, sentOn: "2027-08-29" }],
    },
  ],
}

const receivedResults: Record<string, ReceivedResult[]> = {
  "ctw-northshire": [
    { id: "ns-0203-job", result: "Outcome", participantRef: "NS-0203", label: "needs-evidence", verified: true, partnerName: "Harbour Skills", receivedOn: "2027-09-02", note: null },
    { id: "ns-0187-start", result: "Onboarded", participantRef: "NS-0187", label: "ready-to-claim", verified: true, partnerName: "Harbour Skills", receivedOn: "2027-09-02", note: null },
    { id: "ns-0161-job", result: "Outcome", participantRef: "NS-0161", label: "ready-to-claim", verified: true, partnerName: "Brightwell Training", receivedOn: "2027-09-01", note: "changed" },
    { id: "ns-0142-job", result: "Outcome", participantRef: "NS-0142", label: "ready-to-claim", verified: true, partnerName: "Brightwell Training", receivedOn: "2027-09-01", note: "challenged" },
    { id: "ns-0155-start", result: "Onboarded", participantRef: "NS-0155", label: "ready-to-claim", verified: true, partnerName: "Brightwell Training", receivedOn: "2027-08-30", note: "accepted-as-is" },
    { id: "ns-0312-start", result: "Onboarded", participantRef: "NS-0312", label: "ready-to-claim", verified: false, partnerName: "Riverside Trust", receivedOn: "2027-08-29", note: null },
    { id: "ns-0174-start", result: "Onboarded", participantRef: "NS-0174", label: "cannot-be-claimed", verified: true, partnerName: "Harbour Skills", receivedOn: "2027-08-28", note: null },
    { id: "ns-0166-job", result: "Outcome", participantRef: "NS-0166", label: "needs-evidence", verified: true, partnerName: "Harbour Skills", receivedOn: "2027-08-21", note: null },
  ],
}

const followUps: Record<string, FollowUp[]> = {
  "harbour-skills": [
    { id: "fu-3", text: "You followed up about 4 overdue checks", date: "2027-08-30" },
    { id: "fu-2", text: "Lisa Ward replied by email", date: "2027-08-23" },
    { id: "fu-1", text: "You requested more detail on NS-0166", date: "2027-08-22" },
  ],
}

export async function getPartners(programmeId: string): Promise<Partner[]> {
  const list = partners[programmeId] ?? []
  return [...list].sort((a, b) => Number(b.atRisk) - Number(a.atRisk))
}

export async function getPartner(programmeId: string, partnerId: string) {
  return (partners[programmeId] ?? []).find((partner) => partner.id === partnerId) ?? null
}

export async function getReceivedResults(programmeId: string) {
  return receivedResults[programmeId] ?? []
}

export async function getPartnerResults(programmeId: string, partnerName: string) {
  return (receivedResults[programmeId] ?? []).filter((result) => result.partnerName === partnerName)
}

export async function getFollowUps(partnerId: string) {
  return followUps[partnerId] ?? []
}

export async function addFollowUp(partnerId: string, values: FollowUpValues) {
  const text =
    values.type === "more-detail" ? `You requested more detail on ${values.about}` : `You followed up about ${values.about}`

  followUps[partnerId] = [
    { id: crypto.randomUUID(), text, date: new Date().toISOString().slice(0, 10) },
    ...(followUps[partnerId] ?? []),
  ]
}
