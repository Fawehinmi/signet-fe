"use server"

import { getSessionEmail } from "@/lib/session"

export async function resendVerificationEmail() {
    const email = await getSessionEmail()
    console.log("Resend verification email to", email)
}