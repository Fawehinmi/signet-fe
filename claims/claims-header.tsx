import { Plus } from "lucide-react"
import { PageHeader } from "@/components/app/page-header"
import { Tabs } from "@/components/app/tabs"
import { Button } from "@/components/ui/button"
import { startClaim } from "./actions"

type ClaimsHeaderProps = {
  programmeId: string
  commissioner: string
  active: "claims" | "periods"
  claimCount: number
  canBuild: boolean
}

export function ClaimsHeader({ programmeId, commissioner, active, claimCount, canBuild }: ClaimsHeaderProps) {
  const base = `/programmes/${programmeId}/claims`

  return (
    <>
      <PageHeader
        title="Claims"
        description={`Build each month's claim from your partners' results, then a Sign-off holder submits it to ${commissioner}.`}
        actions={
          canBuild && (
            <form action={startClaim.bind(null, programmeId)}>
              <Button type="submit">
                <Plus className="size-[18px]" />
                Build claim
              </Button>
            </form>
          )
        }
      />
      <div className="-mt-3 mb-6">
        <Tabs
          tabs={[
            { label: "Claims", href: base, count: claimCount, active: active === "claims" },
            { label: "Claim periods", href: `${base}/periods`, active: active === "periods" },
          ]}
        />
      </div>
    </>
  )
}
