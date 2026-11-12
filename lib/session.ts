export type OrganisationType = "provider" | "commissioner"
export type OrganisationAccess = "admin" | "member"
export type ProgrammePosition = "prime" | "subcontractor" | "commissioner"
export type ProgrammeStatus = "waiting-for-documents" | "rules-in-progress" | "waiting-for-confirmation" | "live"
export type JobRole = "partner-manager" | "compliance-lead" | "caseworker"
export type Permission = "sign-off" | "bulk-import" | "privacy"

export type ProgrammeMembership = {
  id: string
  name: string
  position: ProgrammePosition
  status: ProgrammeStatus
  jobRole?: JobRole
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

const demoSessions: Record<"priya" | "marcus" | "tom", Session> = {
  priya: {
    user: { name: "Priya Nair", email: "priya.nair@meridianemployment.co.uk" },
    organisation: { ...meridian, access: "admin" },
    programmes: [
      { ...northshire, jobRole: "partner-manager", permissions: ["sign-off"] },
      { ...westmoor, jobRole: "partner-manager", permissions: ["sign-off"] },
    ],
  },
  marcus: {
    user: { name: "Marcus Webb", email: "marcus.webb@meridianemployment.co.uk" },
    organisation: { ...meridian, access: "member" },
    programmes: [
      { ...northshire, jobRole: "caseworker", permissions: ["sign-off", "bulk-import"] },
      { ...westmoor, jobRole: "caseworker", permissions: ["sign-off", "bulk-import"] },
    ],
  },
  tom: {
    user: { name: "Tom Okafor", email: "tom.okafor@meridianemployment.co.uk" },
    organisation: { ...meridian, access: "member" },
    programmes: [{ ...northshire, jobRole: "caseworker", permissions: [] }],
  },
}

const demoUser = "priya"

export async function getSession(): Promise<Session | null> {
  return demoSessions[demoUser]
}

export async function getSessionEmail() {
  return (await getSession())?.user.email
}