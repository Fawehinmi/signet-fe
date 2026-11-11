import Link from "next/link"
import { redirect } from "next/navigation"
import { Layers, Plus } from "lucide-react"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { buttonStyles } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { getInvitations, getProgrammes } from "@/lib/data/programmes"
import { getSession } from "@/lib/session"
import { InvitationList } from "./invitation-list"
import { ProgrammesTable } from "./programmes-table"

export default async function ProgrammesPage() {
    const session = await getSession()
    if (!session?.organisation) redirect("/sign-in")

    const isAdmin = session.organisation.access === "admin"
    const [programmes, invitations] = await Promise.all([getProgrammes(session), getInvitations(session)])

    const startButton = isAdmin && (
        <Link href="/programmes/new" className={buttonStyles()}>
            <Plus className="size-[18px]" />
            Start a programme
        </Link>
    )

    return (
        <>
            <PageHeader
                title="Programmes"
                description={isAdmin ? "Programmes you lead or deliver." : "The programmes you're on."}
                actions={programmes?.length > 0 && startButton}
            />

            {invitations.length > 0 && (
                <Section title="Invitations" count={invitations.length} className="mb-10">
                    <InvitationList invitations={invitations} />
                </Section>
            )}

            {programmes.length > 0 ? (
                <Section title="Your programmes">
                    <ProgrammesTable programmes={programmes} isAdmin={isAdmin} />
                </Section>
            ) : (
                <EmptyState
                    icon={Layers}
                    title="No programmes yet"
                    description={
                        isAdmin
                            ? `If ${session.organisation.name} leads a programme, start it as the prime. Subcontractors can't start a programme. They join when a prime invites them.`
                            : "You'll see programmes here once an admin adds you to one."
                    }
                    action={startButton}
                />
            )}
        </>
    )
}