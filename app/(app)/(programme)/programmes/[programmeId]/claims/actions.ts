"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import {
  draftStage,
  getClaimItems,
  getLatestClaim,
  getToFix,
  readyLabel,
  saveApproval,
  saveDecision,
  saveLeftOut,
  saveSubmission,
} from "@/lib/data/claims"
import { saveChases } from "@/lib/data/results"
import { today } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import {
  chaseSchema,
  decideResultSchema,
  leaveOutSchema,
  signOffSchema,
  submitClaimSchema,
  type ChaseValues,
  type DecideResultValues,
  type LeaveOutValues,
  type SignOffValues,
  type SubmitClaimValues,
} from "@/lib/validations/claims"

const refresh = "Refresh the page to see the latest."

function refreshProgramme(programmeId: string) {
  revalidatePath(`/programmes/${programmeId}`, "layout")
}

async function findDraftItem(programmeId: string, periodId: string, resultId: string) {
  const claim = await getLatestClaim(programmeId, periodId)
  if (claim?.status !== "draft") return null
  return (await getClaimItems(programmeId, claim)).find((item) => item.resultId === resultId) ?? null
}

export async function chaseResults(programmeId: string, values: ChaseValues) {
  const { session, programme } = await getProgrammePage(programmeId, "claims")
  if (programme.jobRole !== "compliance-lead") {
    return { errors: { message: ["Only the Compliance lead can chase results."] } }
  }

  const parsed = chaseSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  const open = (await getToFix(programmeId)).map((row) => row.result.id)
  if (parsed.data.resultIds.some((id) => !open.includes(id))) {
    return { errors: { message: [`Some of these results don't need fixing now. ${refresh}`] } }
  }

  await saveChases(programmeId, parsed.data.resultIds, { by: session.user.name, on: today(), message: parsed.data.message })
  refreshProgramme(programmeId)

  return { errors: null }
}

export async function decideResult(programmeId: string, periodId: string, resultId: string, values: DecideResultValues) {
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const item = await findDraftItem(programmeId, periodId, resultId)
  if (programme.jobRole !== "compliance-lead" || !item || item.decision) {
    return { errors: { reason: [`You can't decide on this result now. ${refresh}`] } }
  }

  const parsed = decideResultSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  const fits = parsed.data.kind === "accept-as-is" ? item.label === "needs-evidence" : item.label === "cannot-be-claimed"
  if (!fits) {
    return { errors: { reason: [`This decision doesn't fit the result's label. ${refresh}`] } }
  }

  await saveDecision(programmeId, periodId, resultId, parsed.data, session.user.name)
  refreshProgramme(programmeId)

  return { errors: null }
}

export async function leaveOutResult(programmeId: string, periodId: string, resultId: string, values: LeaveOutValues) {
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const item = await findDraftItem(programmeId, periodId, resultId)
  if (programme.jobRole !== "compliance-lead" || !item || item.label === readyLabel || item.decision) {
    return { errors: { reason: [`You can't leave this result out now. ${refresh}`] } }
  }

  const parsed = leaveOutSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveLeftOut(programmeId, periodId, resultId, parsed.data, session.user.name)
  refreshProgramme(programmeId)

  return { errors: null }
}

export async function signOffResult(programmeId: string, periodId: string, resultId: string, values: SignOffValues) {
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const decision = (await findDraftItem(programmeId, periodId, resultId))?.decision
  const canSignOff =
    programme.permissions.includes("sign-off") && decision && !decision.approved && decision.by !== session.user.name

  if (!canSignOff) {
    return { errors: { note: [`You can't sign off this result. ${refresh}`] } }
  }

  const parsed = signOffSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  if (parsed.data.outcome === "approve") {
    await saveApproval(programmeId, periodId, resultId, session.user.name, parsed.data.note)
  } else {
    await saveLeftOut(
      programmeId,
      periodId,
      resultId,
      { to: "to-fix", reason: `Sign-off rejected by ${session.user.name}. ${parsed.data.note}` },
      session.user.name,
    )
  }

  refreshProgramme(programmeId)

  return { errors: null }
}

export async function submitClaim(programmeId: string, periodId: string, values: SubmitClaimValues) {
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const claim = await getLatestClaim(programmeId, periodId)
  const ready = claim?.status === "draft" && draftStage(await getClaimItems(programmeId, claim)) === "ready-to-submit"

  if (programme.jobRole !== "compliance-lead" || !ready) {
    return { errors: { confirmed: [`You can't submit this claim now. ${refresh}`] } }
  }

  const parsed = submitClaimSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveSubmission(programmeId, periodId, session.user.name)
  refreshProgramme(programmeId)
  redirect(`/programmes/${programmeId}/claims/${periodId}?submitted=1`)
}
