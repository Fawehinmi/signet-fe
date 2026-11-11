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

export async function getSession(): Promise<Session | null> {
  return {
    user: { name: "Amina Yusuf", email: "amina.yusuf@riversidetrust.org.uk" },
    organisation: {
      id: "riverside-trust",
      name: "Riverside Trust",
      description: "Employment support charity",
      type: "provider",
      access: "admin",
    },
    programmes: [
      {
        id: "ctw-northshire",
        name: "Connect to Work: Northshire",
        position: "subcontractor",
        status: "live",
        jobRole: "compliance-lead",
        permissions: ["sign-off", "privacy"],
      },
      {
        id: "northshire-skills",
        name: "Northshire Skills Pathway",
        position: "prime",
        status: "live",
        jobRole: "partner-manager",
        permissions: ["sign-off"],
      },
    ],
  }
}

export async function getSessionEmail() {
  return (await getSession())?.user.email
}