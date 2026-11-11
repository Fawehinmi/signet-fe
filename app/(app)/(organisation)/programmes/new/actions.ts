"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { findProgrammeOnSignet, saveProgramme } from "@/lib/data/programmes"
import { getSession } from "@/lib/session"
import { programmeName, startProgrammeSchema, type StartProgrammeValues } from "@/lib/validations/programme"

export async function checkProgramme(values: StartProgrammeValues) {
    const parsed = startProgrammeSchema.safeParse(values)

    if (!parsed.success) {
        return { errors: z.flattenError(parsed.error).fieldErrors, existing: null }
    }

    const existing = await findProgrammeOnSignet(programmeName(parsed.data.scheme, parsed.data.area))
    return { errors: null, existing }
}

export async function createProgramme(values: StartProgrammeValues) {
    const session = await getSession()
    if (session?.organisation?.access !== "admin") redirect("/programmes")

    const parsed = startProgrammeSchema.safeParse(values)

    if (!parsed.success) {
        return { errors: z.flattenError(parsed.error).fieldErrors }
    }

    const programme = await saveProgramme({ ...parsed.data, organisationId: session.organisation.id })
    redirect(`/programmes/${programme.id}/dashboard`)
}