import { Lock } from "lucide-react"
import { getPartners, getReceivedResults } from "@/lib/data/partners"
import { canOpen } from "@/lib/navigation"
import { getProgrammePage } from "@/lib/programme-page"
import { NoPartners } from "./no-partners"
import { PartnersHeader } from "./partners-header"
import { PartnersTable } from "./partners-table"

export default async function PartnersPage({ params }: { params: Promise<{ programmeId: string }> }) {
    const { programmeId } = await params
    const { session, programme } = await getProgrammePage(programmeId, "partners")
    const [partners, results] = await Promise.all([getPartners(programmeId), getReceivedResults(programmeId)])

    if (partners.length === 0) {
        return <NoPartners programmeId={programmeId} canImport={canOpen(session, programme, "imports")} />
    }

    return (
        <>
            <PartnersHeader
                programmeId={programmeId}
                active="partners"
                partnerCount={partners.length}
                resultCount={results.length}
            />
            <PartnersTable programmeId={programmeId} partners={partners} />
            <p className="mt-3 flex items-center gap-1.5 text-[13px] text-grey-700">
                <Lock className="size-3.5" />
                Participant details stay with each partner. You see results and references only.
            </p>
        </>
    )
}