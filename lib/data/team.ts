import type { Permission } from "@/lib/session"

export type TeamMember = {
  name: string
  jobTitle: string
  permissions: Permission[]
}

const teams: Record<string, TeamMember[]> = {
  "ctw-northshire": [
    { name: "Priya Nair", jobTitle: "Partnerships manager", permissions: [] },
    { name: "Marcus Webb", jobTitle: "Contracts and claims lead", permissions: ["sign-off", "bulk-import"] },
    { name: "Ruth Adeyemi", jobTitle: "Compliance lead", permissions: [] },
    { name: "Tom Okafor", jobTitle: "Employment caseworker", permissions: ["bulk-upload"] },
  ],
  "ctw-westmoor": [
    { name: "Priya Nair", jobTitle: "Partnerships manager", permissions: [] },
    { name: "Marcus Webb", jobTitle: "Contracts and claims lead", permissions: ["sign-off"] },
    { name: "Ruth Adeyemi", jobTitle: "Compliance lead", permissions: [] },
  ],
}

export async function getSignOffHolders(programmeId: string) {
  return (teams[programmeId] ?? []).filter((member) => member.permissions.includes("sign-off"))
}

export async function getTeamMember(programmeId: string, jobTitle: string) {
  return (teams[programmeId] ?? []).find((member) => member.jobTitle === jobTitle) ?? null
}
