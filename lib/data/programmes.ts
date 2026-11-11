import { getProgrammeStatus } from "@/lib/data/rules"
import { today } from "@/lib/format"
import type { ProgrammeMembership, ProgrammePosition, Session } from "@/lib/session"
import type { StartProgrammeValues } from "@/lib/validations/programme"
import type { ProgrammeDatesValues } from "@/lib/validations/programme-settings"

export type ProgrammeDetails = {
  scheme: string
  area: string
  commissioner: string
  commissionerJoined: boolean
  teamSize: number
  startedBy: ProgrammePosition
  startDate: string
  endDate: string
  createdBy: string
  createdOn: string
  aiFeatures: { on: boolean; changedBy: string; changedOn: string }
  endedOn?: string
}

export type ProgrammeListItem = ProgrammeMembership & ProgrammeDetails

export type Invitation = {
  id: string
  from: string
  programme: string
  position: "prime" | "subcontractor"
  sentOn: string
  expiresOn: string
}

const programmeDetails: Record<string, ProgrammeDetails> = {
  "ctw-northshire": {
    scheme: "Connect to Work",
    area: "Northshire",
    commissioner: "Northshire Strategic Authority",
    commissionerJoined: true,
    teamSize: 4,
    startedBy: "commissioner",
    startDate: "2027-04-01",
    endDate: "2030-03-31",
    createdBy: "Claire Bennett",
    createdOn: "2026-11-01",
    aiFeatures: { on: true, changedBy: "Priya Nair", changedOn: "2026-11-26" },
  },
  "ctw-westmoor": {
    scheme: "Connect to Work",
    area: "Westmoor",
    commissioner: "Westmoor Council",
    commissionerJoined: false,
    teamSize: 3,
    startedBy: "prime",
    startDate: "2028-01-01",
    endDate: "2030-12-31",
    createdBy: "Priya Nair",
    createdOn: "2027-08-30",
    aiFeatures: { on: true, changedBy: "Priya Nair", changedOn: "2027-08-30" },
  },
}

export async function getProgrammeDetails(programmeId: string) {
  return programmeDetails[programmeId] ?? null
}

export async function saveProgrammeDates(programmeId: string, values: ProgrammeDatesValues) {
  const details = programmeDetails[programmeId]
  if (!details) return

  details.startDate = values.startDate
  details.endDate = values.endDate
}

export async function saveAiFeatures(programmeId: string, on: boolean, changedBy: string) {
  const details = programmeDetails[programmeId]
  if (!details) return

  details.aiFeatures = { on, changedBy, changedOn: today() }
}

export async function saveProgrammeEnded(programmeId: string) {
  const details = programmeDetails[programmeId]
  if (!details) return

  details.endedOn = today()
}

export async function getProgrammes(session: Session): Promise<ProgrammeListItem[]> {
  return Promise.all(
    session.programmes.map(async (programme) => ({
      ...programme,
      ...programmeDetails[programme.id],
      status: (await getProgrammeStatus(programme.id)) ?? programme.status,
    })),
  )
}

export async function getInvitations(session: Session): Promise<Invitation[]> {
  if (session.organisation?.access !== "admin") return []

  return [
    {
      id: "ctw-north-vale",
      from: "Coastline Futures",
      programme: "Connect to Work: North Vale",
      position: "subcontractor",
      sentOn: "6 Sep 2027",
      expiresOn: "13 Sep 2027",
    },
  ]
}

export type ExistingProgramme = {
  name: string
  prime: string
  commissioner: string
}

const programmesOnSignet: ExistingProgramme[] = [
  { name: "Connect to Work: Northshire", prime: "Meridian Employment", commissioner: "Northshire Strategic Authority" },
  { name: "Connect to Work: North Vale", prime: "Coastline Futures", commissioner: "North Vale Council" },
]

export async function findProgrammeOnSignet(name: string) {
  return programmesOnSignet.find((programme) => programme.name === name) ?? null
}

export async function saveProgramme(values: StartProgrammeValues & { organisationId: string }) {
  return { id: `ctw-${values.area.toLowerCase().replace(/\s+/g, "-")}` }
}
