import { getMemberships } from "@/lib/data/team"

export type OrganisationType = "provider" | "commissioner"
export type OrganisationAccess = "admin" | "member"
export type ProgrammePosition = "prime" | "subcontractor" | "commissioner"
export type ProgrammeStatus = "waiting-for-documents" | "rules-in-progress" | "waiting-for-confirmation" | "live"
export type JobRole = "programme-manager" | "compliance-lead" | "caseworker"
export type Permission = "sign-off" | "bulk-import" | "bulk-upload" | "privacy"

export type ProgrammeMembership = {
  id: string
  name: string
  position: ProgrammePosition
  status: ProgrammeStatus
  jobRole: JobRole
  permissions: Permission[]
}

export type Session = {
  user: {
    name: string
    email: string
  }
  organisation: {
    id: string
    name: string
    description: string
    type: OrganisationType
    access: OrganisationAccess
  } | null
  programmes: ProgrammeMembership[]
}

const meridian = {
  id: "meridian-employment",
  name: "Meridian Employment",
  description: "Employment support provider",
  type: "provider",
} as const

const northshire = { id: "ctw-northshire", name: "Connect to Work: Northshire", position: "prime", status: "live" } as const
const westmoor = {
  id: "ctw-westmoor",
  name: "Connect to Work: Westmoor",
  position: "prime",
  status: "waiting-for-confirmation",
} as const

const programmesByOrganisation: Record<string, Omit<ProgrammeMembership, "jobRole" | "permissions">[]> = {
  "meridian-employment": [northshire, westmoor],
}

const demoPeople: Record<"priya" | "marcus" | "ruth" | "tom", Omit<Session, "programmes">> = {
  priya: {
    user: { name: "Priya Nair", email: "priya.nair@meridianemployment.co.uk" },
    organisation: { ...meridian, access: "admin" },
  },
  marcus: {
    user: { name: "Marcus Webb", email: "marcus.webb@meridianemployment.co.uk" },
    organisation: { ...meridian, access: "member" },
  },
  ruth: {
    user: { name: "Ruth Adeyemi", email: "ruth.adeyemi@meridianemployment.co.uk" },
    organisation: { ...meridian, access: "member" },
  },
  tom: {
    user: { name: "Tom Okafor", email: "tom.okafor@meridianemployment.co.uk" },
    organisation: { ...meridian, access: "member" },
  },
}

const demoUser = "priya"

export async function getSession(): Promise<Session | null> {
  const person = demoPeople[demoUser]
  const programmes = person.organisation ? (programmesByOrganisation[person.organisation.id] ?? []) : []
  const memberships = getMemberships(person.user.email)

  return {
    ...person,
    programmes: programmes.flatMap((programme) => {
      const membership = memberships.find((item) => item.programmeId === programme.id)
      return membership ? [{ ...programme, jobRole: membership.jobRole, permissions: [...membership.permissions] }] : []
    }),
  }
}

export async function getSessionEmail() {
  return (await getSession())?.user.email
}
