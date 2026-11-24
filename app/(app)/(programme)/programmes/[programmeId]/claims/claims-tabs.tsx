import { PageHeader } from "@/components/app/page-header"
import { Tabs } from "@/components/app/tabs"
import { filterQuery, type ClaimFilters } from "@/lib/claim-filters"

type ClaimsTabsProps = {
  programmeId: string
  commissioner: string
  active: "months" | "to-fix" | "completed"
  toFix: number
  filters: ClaimFilters
}

export function ClaimsTabs({ programmeId, commissioner, active, toFix, filters }: ClaimsTabsProps) {
  const base = `/programmes/${programmeId}/claims`
  const query = filterQuery(filters)

  return (
    <>
      <PageHeader
        title="Claims"
        description={`Each month's claim to ${commissioner}. Signet drafts it when the month ends. Counts only, never money amounts.`}
      />
      <div className="-mt-3 mb-8">
        <Tabs
          tabs={[
            { label: "Months", href: `${base}${query}`, active: active === "months" },
            { label: "Fixes", href: `${base}/to-fix${query}`, count: toFix, active: active === "to-fix" },
            { label: "Completed", href: `${base}/completed${query}`, active: active === "completed" },
          ]}
        />
      </div>
    </>
  )
}
