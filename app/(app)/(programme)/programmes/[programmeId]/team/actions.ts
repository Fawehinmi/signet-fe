"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { addMember, getStaff, getTeam, removeMember, saveAccess } from "@/lib/data/team"
import { getProgrammePage } from "@/lib/programme-page"
import { addMemberSchema, type AddMemberValues } from "@/lib/validations/team"

const adminOnly = "Only an organisation admin can change the team."
const refresh = "Refresh the page to see the latest."

async function getManager(programmeId: string) {
  const page = await getProgrammePage(programmeId, "team")
  return page.organisation.access === "admin" ? page : null
}

function refreshProgramme(programmeId: string) {
  revalidatePath(`/programmes/${programmeId}`, "layout")
}

export async function saveMemberAccess(programmeId: string, values: AddMemberValues) {
  if (!(await getManager(programmeId))) return { errors: { email: [adminOnly] } }

  const parsed = addMemberSchema.safeParse(values)
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors }

  const { email, jobRole, permissions } = parsed.data
  if (!(await getTeam(programmeId)).some((member) => member.email === email)) {
    return { errors: { email: [`This person isn't on the programme any more. ${refresh}`] } }
  }

  await saveAccess(programmeId, email, { jobRole, permissions })
  refreshProgramme(programmeId)

  return { errors: null }
}

export async function addTeamMember(programmeId: string, values: AddMemberValues) {
  const manager = await getManager(programmeId)
  if (!manager) return { errors: { email: [adminOnly] } }

  const parsed = addMemberSchema.safeParse(values)
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors }

  const { email, jobRole, permissions } = parsed.data
  const staff = (await getStaff(manager.organisation.id)).find((member) => member.email === email)
  const onTeam = (await getTeam(programmeId)).some((member) => member.email === email)
  if (!staff || onTeam) {
    return { errors: { email: [`Choose someone from your organisation who isn't on the programme. ${refresh}`] } }
  }

  await addMember(programmeId, staff, { jobRole, permissions })
  refreshProgramme(programmeId)

  return { errors: null }
}

export async function removeTeamMember(programmeId: string, email: string) {
  const manager = await getManager(programmeId)
  if (!manager) return { error: adminOnly }

  if (email === manager.session.user.email) return { error: "You can't remove yourself. Ask another organisation admin." }
  if (!(await getTeam(programmeId)).some((member) => member.email === email)) {
    return { error: `This person isn't on the programme any more. ${refresh}` }
  }

  await removeMember(programmeId, email, manager.session.user.name)
  refreshProgramme(programmeId)

  return { error: null }
}
