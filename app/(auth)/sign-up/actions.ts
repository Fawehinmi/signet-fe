"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth"

export async function createAccount(values: SignUpValues) {
  const parsed = signUpSchema.safeParse(values)

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  console.log(parsed.data)
  redirect("/check-email")
}
