import { FilterChips } from "@/components/app/filter-chips"
import { getPartners, getReceivedResults } from "@/lib/data/partners"
import { canOpen } from "@/lib/navigation"
import { getProgrammePage } from "@/lib/programme-page"
import { NoPartners } from "../no-partners"
import { PartnersHeader } from "../partners-header"
import { ReceivedTable } from "./received-table"
import { resultFilters } from "./result-filters"

type ReceivedResultsPageProps = {
    params: Promise<{ programmeId: string }>
    searchParams: Promise<{ filter?: string }>
}

export default async function ReceivedResultsPage({ params, searchParams }: ReceivedResultsPageProps) {
    const { programmeId } = await params
    const { filter } = await searchParams
    const { session, programme } = await getProgrammePage(programmeId, "partners")
    const [partners, results] = await Promise.all([getPartners(programmeId), getReceivedResults(programmeId)])

    if (partners.length === 0) {
        return <NoPartners programmeId={programmeId} canImport={canOpen(session, programme, "imports")} />
    }

    const base = `/programmes/${programmeId}/partners/received`
    const activeFilter = resultFilters.find((item) => item.key === filter) ?? resultFilters[0]
    const shown = results.filter(activeFilter.match)

    return (
        <>
            <PartnersHeader
                programmeId={programmeId}
                active="received"
                partnerCount={partners.length}
                resultCount={results.length}
            />
            <FilterChips
                chips={resultFilters.map((item) => ({
                    label: item.label,
                    href: item.key === "all" ? base : `${base}?filter=${item.key}`,
                    count: results.filter(item.match).length,
                    active: item.key === activeFilter.key,
                }))}
            />
            {shown.length > 0 ? (
                <ReceivedTable results={shown} />
            ) : (
                <p className="py-10 text-center text-sm text-grey-700">No results match this filter.</p>
            )}
            <p className="mt-3 text-[13px] text-grey-700">
                Showing {shown.length} of {results.length} results
            </p>
        </>
    )
}