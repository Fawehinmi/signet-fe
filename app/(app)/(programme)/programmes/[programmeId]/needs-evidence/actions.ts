"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getToFix } from "@/lib/data/claims"
import { saveCheckRequest } from "@/lib/data/results"
import { getAdmins } from "@/lib/data/team"
import { getProgrammePage } from "@/lib/programme-page"
import { sendForCheckingSchema, type SendForCheckingValues } from "@/lib/validations/evidence"

export async function sendForChecking(programmeId: string, resultId: string, values: SendForCheckingValues) {
  const { session, programme } = await getProgrammePage(programmeId, "needs-evidence")

  const result = (await getToFix(programmeId)).find((row) => row.result.id === resultId)?.result
  const canSend =
    programme.jobRole === "caseworker" &&
    result?.caseworker === session.user.name &&
    result.label === "needs-evidence" &&
    !result.heldDecision &&
    !(result.check && !result.check.answer)

  if (!canSend || (await getAdmins(programmeId)).length === 0) {
    return { errors: { note: ["This result can't be sent for checking now. Refresh the page to see the latest."] } }
  }

  const parsed = sendForCheckingSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveCheckRequest(programmeId, resultId, { by: session.user.name, note: parsed.data.note })
  revalidatePath(`/programmes/${programmeId}`, "layout")

  return { errors: null }
}
