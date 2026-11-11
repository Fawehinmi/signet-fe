import type { ProgrammeMembership, Session } from "@/lib/session"
import type { StartProgrammeValues } from "@/lib/validations/programme"
import { getProgrammeStatus } from "@/lib/data/rules"

export type ProgrammeListItem = ProgrammeMembership & {
  scheme: string
  area: string
  commissioner: string
  commissionerJoined: boolean
  teamSize: number
}

export type Invitation = {
  id: string
  from: string
  programme: string
  position: "prime" | "subcontractor"
  sentOn: string
  expiresOn: string
}

const programmeDetails: Record<string, Omit<ProgrammeListItem, keyof ProgrammeMembership>> = {
  "ctw-northshire": {
    scheme: "Connect to Work",
    area: "Northshire",
    commissioner: "Northshire Strategic Authority",
    commissionerJoined: true,
    teamSize: 4,
  },
  "ctw-westmoor": {
    scheme: "Connect to Work",
    area: "Westmoor",
    commissioner: "Westmoor Council",
    commissionerJoined: false,
    teamSize: 3,
  },
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