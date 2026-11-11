import Link from "next/link"
import { Handshake } from "lucide-react"
import { PageHeader } from "@/components/app/page-header"
import { buttonStyles } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

export function NoPartners({ programmeId, canImport }: { programmeId: string; canImport: boolean }) {
    return (
        <>
            <PageHeader title="Our partners" description="Partners who deliver this programme with you." />
            <EmptyState
                icon={Handshake}
                title="No partners on this programme"
                description={
                    canImport
                        ? "Invite subcontractors from Organisations. Participants you deliver yourself are added in Imports."
                        : "Invite the subcontractors who deliver this programme with you. You do this from Organisations."
                }
                action={
                    <span className="flex gap-3">
                        <Link href={`/programmes/${programmeId}/organisations`} className={buttonStyles({ variant: "secondary" })}>
                            Go to Organisations
                        </Link>
                        {canImport && (
                            <Link href={`/programmes/${programmeId}/imports`} className={buttonStyles({ variant: "text" })}>
                                Go to Imports
                            </Link>
                        )}
                    </span>
                }
            />
        </>
    )
}