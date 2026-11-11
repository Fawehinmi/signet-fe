import { notFound, redirect } from "next/navigation"
import { canOpen, findProgramme } from "@/lib/navigation"
import { getSession } from "@/lib/session"

export async function getProgrammePage(programmeId: string, pageKey: string) {
    const session = await getSession()
    if (!session?.organisation) redirect("/sign-in")

    const programme = findProgramme(session, programmeId)
    if (!programme || !canOpen(session, programme, pageKey)) notFound()

    return { session, organisation: session.organisation, programme }
}