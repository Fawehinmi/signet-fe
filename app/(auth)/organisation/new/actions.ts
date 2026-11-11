"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { organisationSchema, type OrganisationValues } from "@/lib/validations/auth"

export async function createOrganisation(values: OrganisationValues) {
  const parsed = organisationSchema.safeParse(values)

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  console.log(parsed.data)
  redirect("/organisation/checking")
}
