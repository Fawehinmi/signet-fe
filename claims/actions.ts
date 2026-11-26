"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import {
  createClaim,
  createNewVersion,
  getClaim,
  getClaimItems,
  getNextPeriodToClaim,
  getPeriod,
  getPeriodClaims,
  saveLeftOutResult,
  saveSendByDate,
  saveSentForSignOff,
  saveSubmission,
} from "@/lib/data/claims"
import { getProgrammePage } from "@/lib/programme-page"
import {
  leaveOutSchema,
  sendByDateSchema,
  submitClaimSchema,
  type LeaveOutValues,
  type SendByDateValues,
  type SubmitClaimValues,
} from "@/lib/validations/claims"

function claimsPath(programmeId: string, claimId?: string) {
  return claimId ? `/programmes/${programmeId}/claims/${claimId}` : `/programmes/${programmeId}/claims`
}

export async function startClaim(programmeId: string) {
  const { session } = await getProgrammePage(programmeId, "claims")

  const period = await getNextPeriodToClaim(programmeId)
  if (!period) redirect(claimsPath(programmeId))

  const claim = await createClaim(programmeId, period.id, session.user.name)
  revalidatePath(claimsPath(programmeId), "layout")
  redirect(claimsPath(programmeId, claim.id))
}

export async function leaveOutResult(programmeId: string, claimId: string, resultId: string, values: LeaveOutValues) {
  await getProgrammePage(programmeId, "claims")

  const claim = await getClaim(programmeId, claimId)
  const items = claim ? await getClaimItems(programmeId, claim) : []
  if (claim?.status !== "draft" || !items.some((item) => item.resultId === resultId)) {
    return { errors: { reason: ["This result can't be left out now. Refresh the page to see the latest."] } }
  }

  const parsed = leaveOutSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveLeftOutResult(programmeId, claimId, resultId, parsed.data)
  revalidatePath(claimsPath(programmeId), "layout")

  return { errors: null }
}

export async function sendForSignOff(programmeId: string, claimId: string) {
  await getProgrammePage(programmeId, "claims")

  const claim = await getClaim(programmeId, claimId)
  if (claim?.status === "draft") {
    await saveSentForSignOff(programmeId, claimId)
    revalidatePath(claimsPath(programmeId), "layout")
  }

  redirect(claimsPath(programmeId, claimId))
}

export async function submitClaim(programmeId: string, claimId: string, values: SubmitClaimValues) {
  const { session, programme } = await getProgrammePage(programmeId, "claims")

  const claim = await getClaim(programmeId, claimId)
  const canSubmit =
    claim?.status === "draft" &&
    programme.permissions.includes("sign-off")

  if (!canSubmit) {
    return { errors: { confirmed: ["You can't submit this claim. Refresh the page to see the latest."] } }
  }

  const parsed = submitClaimSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveSubmission(programmeId, claim.periodId, session.user.name)
  revalidatePath(claimsPath(programmeId), "layout")
  redirect(`${claimsPath(programmeId, claimId)}?submitted=1`)
}

export async function startNewVersion(programmeId: string, claimId: string) {
  const { session } = await getProgrammePage(programmeId, "claims")

  const claim = await getClaim(programmeId, claimId)
  const versions = claim ? await getPeriodClaims(programmeId, claim.periodId) : []
  if (claim?.status !== "sent-back" || versions[0]?.id !== claim.id) redirect(claimsPath(programmeId, claimId))

  const newVersion = await createNewVersion(programmeId, claimId, session.user.name)
  if (!newVersion) redirect(claimsPath(programmeId, claimId))

  revalidatePath(claimsPath(programmeId), "layout")
  redirect(claimsPath(programmeId, newVersion.id))
}

export async function changeSendByDate(programmeId: string, periodId: string, values: SendByDateValues) {
  const { programme } = await getProgrammePage(programmeId, "claims")

  const period = await getPeriod(programmeId, periodId)
  if (!period || programme.jobRole !== "programme-manager") {
    return { errors: { sendBy: ["Only Programme managers can change send-by dates"] } }
  }

  const parsed = sendByDateSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  if (parsed.data.sendBy <= period.end) {
    return { errors: { sendBy: ["Choose a date after the period ends"] } }
  }

  await saveSendByDate(programmeId, periodId, parsed.data.sendBy)
  revalidatePath(claimsPath(programmeId), "layout")

  return { errors: null }
}
