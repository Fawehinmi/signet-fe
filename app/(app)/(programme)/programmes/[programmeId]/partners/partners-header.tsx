import { PageHeader } from "@/components/app/page-header"
import { Tabs } from "@/components/app/tabs"

type PartnersHeaderProps = {
    programmeId: string
    active: "partners" | "received"
    partnerCount: number
    resultCount: number
}

export function PartnersHeader({ programmeId, active, partnerCount, resultCount }: PartnersHeaderProps) {
    const base = `/programmes/${programmeId}/partners`

    return (
        <>
            <PageHeader title="Our partners" description="How each partner is doing. Partners at risk come first." />
            <div className="-mt-3 mb-6">
                <Tabs
                    tabs={[
                        { label: "Partners", href: base, count: partnerCount, active: active === "partners" },
                        { label: "Received results", href: `${base}/received`, count: resultCount, active: active === "received" },
                    ]}
                />
            </div>
        </>
    )
}