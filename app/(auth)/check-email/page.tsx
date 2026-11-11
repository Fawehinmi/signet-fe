import Link from "next/link"
import { Mail } from "lucide-react"
import { AuthHeading } from "@/components/auth/auth-heading"
import { getSessionEmail } from "@/lib/session"
import { ResendEmailButton } from "./resend-email-button"

export default async function CheckEmailPage() {
    const email = await getSessionEmail()

    return (
        <>
            <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Mail className="size-7" />
            </span>
            <AuthHeading
                title="Check your email"
                description={
                    <>
                        We sent a verification link to <strong className="font-semibold text-grey-900">{email}</strong>. Open it
                        to carry on.
                    </>
                }
            />
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <ResendEmailButton />
                <Link
                    href="/sign-up"
                    className="inline-flex h-10 items-center rounded px-2 text-sm font-semibold tracking-[0.5px] text-brand-500 hover:bg-brand-50"
                >
                    Change email address
                </Link>
            </div>
            <p className="text-sm text-grey-700">Can&apos;t find it? Check your spam or junk folder.</p>
        </>
    )
}