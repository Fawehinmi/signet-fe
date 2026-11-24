import { today } from "@/lib/format"
import type { JobRole, Permission } from "@/lib/session"

export type StaffMember = {
  email: string
  name: string
  jobTitle: string
  admin?: boolean
}

export type TeamMember = StaffMember & {
  jobRole: JobRole
  permissions: Permission[]
  addedOn: string
}

export type RemovedMember = StaffMember & {
  jobRole: JobRole
  removedOn: string
  removedBy: string
}

const person = (name: string, jobTitle: string, admin = false): StaffMember => ({
  name,
  jobTitle,
  email: `${name.toLowerCase().replace(" ", ".")}@meridianemployment.co.uk`,
  admin,
})

const priya = person("Priya Nair", "Partnerships manager", true)
const marcus = person("Marcus Webb", "Contracts and claims lead")
const ruth = person("Ruth Adeyemi", "Compliance lead")
const tom = person("Tom Okafor", "Employment caseworker")
const jade = person("Jade Wilson", "Data officer")

const staffByOrganisation: Record<string, StaffMember[]> = {
  "meridian-employment": [
    priya,
    marcus,
    ruth,
    tom,
    person("Grace Mensah", "Employment caseworker"),
    person("Owen Price", "Finance manager"),
    person("Daniel Okoro", "Data officer"),
    jade,
  ],
}

const teams: Record<string, TeamMember[]> = {
  "ctw-northshire": [
    { ...priya, jobRole: "partner-manager", permissions: [], addedOn: "2027-03-12" },
    { ...marcus, jobRole: "partner-manager", permissions: ["sign-off", "bulk-import"], addedOn: "2027-03-12" },
    { ...ruth, jobRole: "compliance-lead", permissions: [], addedOn: "2027-03-12" },
    { ...tom, jobRole: "caseworker", permissions: ["bulk-upload"], addedOn: "2027-04-02" },
  ],
  "ctw-westmoor": [
    { ...priya, jobRole: "partner-manager", permissions: [], addedOn: "2027-05-20" },
    { ...marcus, jobRole: "partner-manager", permissions: ["sign-off"], addedOn: "2027-05-20" },
    { ...ruth, jobRole: "compliance-lead", permissions: [], addedOn: "2027-05-20" },
  ],
}

const removedByProgramme: Record<string, RemovedMember[]> = {
  "ctw-northshire": [{ ...jade, jobRole: "caseworker", removedOn: "2027-09-03", removedBy: "Priya Nair" }],
}

function teamFor(programmeId: string) {
  return teams[programmeId] ?? []
}

export function getMemberships(email: string) {
  return Object.entries(teams).flatMap(([programmeId, members]) => {
    const member = members.find((item) => item.email === email)
    return member ? [{ programmeId, jobRole: member.jobRole, permissions: member.permissions }] : []
  })
}

export async function getTeam(programmeId: string) {
  return teamFor(programmeId)
}

export async function getRemovedMembers(programmeId: string) {
  return [...(removedByProgramme[programmeId] ?? [])].reverse()
}

export async function getStaff(organisationId: string) {
  return staffByOrganisation[organisationId] ?? []
}

export async function getSignOffHolders(programmeId: string) {
  return teamFor(programmeId).filter((member) => member.permissions.includes("sign-off"))
}

export async function getAdmins(programmeId: string) {
  return teamFor(programmeId).filter((member) => member.admin)
}

export async function getTeamMember(programmeId: string, jobTitle: string) {
  return teamFor(programmeId).find((member) => member.jobTitle === jobTitle) ?? null
}

export async function saveAccess(programmeId: string, email: string, access: Pick<TeamMember, "jobRole" | "permissions">) {
  const member = teamFor(programmeId).find((item) => item.email === email)
  if (member) Object.assign(member, access)
}

export async function addMember(programmeId: string, staff: StaffMember, access: Pick<TeamMember, "jobRole" | "permissions">) {
  teams[programmeId] = [...teamFor(programmeId), { ...staff, ...access, addedOn: today() }]
  removedByProgramme[programmeId] = (removedByProgramme[programmeId] ?? []).filter((item) => item.email !== staff.email)
}

export async function removeMember(programmeId: string, email: string, removedBy: string) {
  const member = teamFor(programmeId).find((item) => item.email === email)
  if (!member) return

  teams[programmeId] = teamFor(programmeId).filter((item) => item.email !== email)
  removedByProgramme[programmeId] = [
    ...(removedByProgramme[programmeId] ?? []),
    { email, name: member.name, jobTitle: member.jobTitle, admin: member.admin, jobRole: member.jobRole, removedOn: today(), removedBy },
  ]
}
