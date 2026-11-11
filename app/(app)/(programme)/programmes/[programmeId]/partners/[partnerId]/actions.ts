"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { addFollowUp, getPartner } from "@/lib/data/partners"
import { getProgrammePage } from "@/lib/programme-page"
import { followUpSchema, type FollowUpValues } from "@/lib/validations/follow-up"

export async function sendFollowUp(programmeId: string, partnerId: string, values: FollowUpValues) {
    await getProgrammePage(programmeId, "partners")

    const partner = await getPartner(programmeId, partnerId)
    if (!partner) {
        return { errors: { message: ["This partner is no longer on the programme"] } }
    }

    const parsed = followUpSchema.safeParse(values)
    if (!parsed.success) {
        return { errors: z.flattenError(parsed.error).fieldErrors }
    }

    await addFollowUp(partnerId, parsed.data)
    revalidatePath(`/programmes/${programmeId}/partners/${partnerId}`)

    return { errors: null }
}