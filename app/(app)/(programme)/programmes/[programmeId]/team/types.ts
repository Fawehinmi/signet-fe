import type { JobRole, Permission } from "@/lib/session"

export type MemberRow = {
  email: string
  name: string
  jobTitle: string
  admin: boolean
  jobRole: JobRole
  permissions: Permission[]
  addedOn: string
}

export type StaffRow = {
  email: string
  name: string
  jobTitle: string
  onTeam: boolean
}
