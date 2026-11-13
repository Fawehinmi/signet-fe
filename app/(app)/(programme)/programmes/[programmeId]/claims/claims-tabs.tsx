import { PageHeader } from "@/components/app/page-header"
import { Tabs } from "@/components/app/tabs"

type ClaimsTabsProps = {
  programmeId: string
  commissioner: string
  active: "months" | "to-fix"
  toFix: number
}

export function ClaimsTabs({ programmeId, commissioner, active, toFix }: ClaimsTabsProps) {
  const base = `/programmes/${programmeId}/claims`

  return (
    <>
      <PageHeader
        title="Claims"
        description={`Each month's claim to ${commissioner}. Signet drafts it when the month ends. Counts only, never money amounts.`}
      />
      <div className="-mt-3 mb-8">
        <Tabs
          tabs={[
            { label: "Months", href: base, active: active === "months" },
            { label: "To fix", href: `${base}/to-fix`, count: toFix, active: active === "to-fix" },
          ]}
        />
      </div>
    </>
  )
}
