"use client"

import { useState, useTransition } from "react"
import { Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resendVerificationEmail } from "./actions"

export function ResendEmailButton() {
    const [isPending, startTransition] = useTransition()
    const [sent, setSent] = useState(false)

    function handleClick() {
        startTransition(async () => {
            await resendVerificationEmail()
            setSent(true)
        })
    }

    if (sent) {
        return (
            <p className="inline-flex h-10 items-center gap-2 text-sm font-semibold text-success-800">
                <Check className="size-4" />
                Email sent
            </p>
        )
    }

    return (
        <Button variant="secondary" loading={isPending} onClick={handleClick}>
            {!isPending && <RefreshCw className="size-[18px]" />}
            Resend email
        </Button>
    )
}