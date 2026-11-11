import Link from "next/link"
import { Mail } from "lucide-react"
import { buttonStyles } from "@/components/ui/button"
import type { Invitation } from "@/lib/data/programmes"

export function InvitationList({ invitations }: { invitations: Invitation[] }) {
    return (
        <ul className="flex flex-col gap-3">
            {invitations.map((invitation) => (
                <li
                    key={invitation.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-200 bg-brand-tint p-4"
                >
                    <Mail className="size-5 shrink-0 text-brand-600" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-grey-900">
                            {invitation.from} invited you to be {invitation.position === "prime" ? "the prime" : "a subcontractor"} on{" "}
                            {invitation.programme}
                        </p>
                        <p className="text-xs text-grey-700">
                            Sent {invitation.sentOn}. Expires {invitation.expiresOn}.
                        </p>
                    </div>
                    <Link
                        href={`/programmes/invitations/${invitation.id}?decline=true`}
                        className={buttonStyles({ variant: "text", size: "sm" })}
                    >
                        Decline
                    </Link>
                    <Link
                        href={`/programmes/invitations/${invitation.id}`}
                        className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                        View invitation
                    </Link>
                </li>
            ))}
        </ul>
    )
}