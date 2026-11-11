"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getRules, saveChangeRequest, saveConfirmation, saveContractDocuments } from "@/lib/data/rules"
import { getProgrammePage } from "@/lib/programme-page"
import {
  askForChangesSchema,
  confirmRulesSchema,
  contractDocumentsSchema,
  type AskForChangesValues,
  type ConfirmRulesValues,
} from "@/lib/validations/rules"

async function getOwnRules(programmeId: string) {
  const page = await getProgrammePage(programmeId, "rules")
  const rules = await getRules(programmeId)
  const ownRules = rules?.startedBy === page.programme.position ? rules : null
  const canReview = ownRules?.status === "waiting-for-confirmation" && page.programme.permissions.includes("sign-off")

  return { ...page, rules: ownRules, canReview }
}

export async function sendContractDocuments(programmeId: string, formData: FormData) {
  const { rules } = await getOwnRules(programmeId)
  if (rules?.status !== "waiting-for-documents") {
    return { errors: { contract: ["These documents have already been sent"] } }
  }

  const parsed = contractDocumentsSchema.safeParse({
    contract: formData.get("contract"),
    deliveryPlan: formData.get("deliveryPlan"),
    schedules: formData.get("schedules") ?? undefined,
  })
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveContractDocuments(programmeId, parsed.data)
  revalidatePath("/programmes", "layout")

  return { errors: null }
}

export async function confirmRules(programmeId: string, values: ConfirmRulesValues) {
  const { session, organisation, canReview } = await getOwnRules(programmeId)
  if (!canReview) {
    return { errors: { confirmed: ["These rules can't be confirmed now. Refresh the page to see the latest."] } }
  }

  const parsed = confirmRulesSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveConfirmation(programmeId, organisation.id, session.user.name)
  revalidatePath("/programmes", "layout")

  return { errors: null }
}

export async function askForRuleChanges(programmeId: string, values: AskForChangesValues) {
  const { session, canReview } = await getOwnRules(programmeId)
  if (!canReview) {
    return { errors: { change: ["You can't ask for changes now. Refresh the page to see the latest."] } }
  }

  const parsed = askForChangesSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  await saveChangeRequest(programmeId, session.user.name, parsed.data)
  revalidatePath("/programmes", "layout")

  return { errors: null }
}
