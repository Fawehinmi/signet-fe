import { PageHeader } from "@/components/app/page-header"
import { Tabs } from "@/components/app/tabs"

export function SettingsHeader({ programmeId, active }: { programmeId: string; active: "details" | "ai" }) {
  const base = `/programmes/${programmeId}/settings`

  return (
    <>
      <PageHeader title="Programme settings" description="Settings for this programme only." />
      <div className="-mt-3 mb-6">
        <Tabs
          tabs={[
            { label: "Programme details", href: base, active: active === "details" },
            { label: "AI features", href: `${base}/ai`, active: active === "ai" },
          ]}
        />
      </div>
    </>
  )
}
