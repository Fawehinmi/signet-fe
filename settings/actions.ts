"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getProgrammeDetails, saveAiFeatures, saveProgrammeDates, saveProgrammeEnded } from "@/lib/data/programmes"
import { getProgrammePage } from "@/lib/programme-page"
import {
  aiFeaturesSchema,
  endProgrammeSchema,
  programmeDatesSchema,
  type AiFeaturesValues,
  type EndProgrammeValues,
  type ProgrammeDatesValues,
} from "@/lib/validations/programme-settings"

async function getEditableDetails(programmeId: string) {
  const page = await getProgrammePage(programmeId, "settings")
  const details = await getProgrammeDetails(programmeId)
  const canEdit = details?.startedBy === page.programme.position && !details.endedOn

  return { ...page, details: canEdit ? details : null }
}

export async function saveDates(programmeId: string, values: ProgrammeDatesValues) {
  const { details } = await getEditableDetails(programmeId)
  if (!details) {
    return { errors: { startDate: ["You can't change these details"] } }
  }

  const parsed = programmeDatesSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveProgrammeDates(programmeId, parsed.data)
  revalidatePath(`/programmes/${programmeId}/settings`, "layout")

  return { errors: null }
}

export async function saveAiSetting(programmeId: string, values: AiFeaturesValues) {
  const { session } = await getProgrammePage(programmeId, "settings")

  const parsed = aiFeaturesSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveAiFeatures(programmeId, parsed.data.on, session.user.name)
  revalidatePath(`/programmes/${programmeId}/settings`, "layout")

  return { errors: null }
}

export async function endProgramme(programmeId: string, values: EndProgrammeValues) {
  const { details } = await getEditableDetails(programmeId)
  if (!details || details.commissionerJoined) {
    return { errors: { confirmed: ["You can't end this programme"] } }
  }

  const parsed = endProgrammeSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveProgrammeEnded(programmeId)
  revalidatePath("/programmes", "layout")

  return { errors: null }
}
