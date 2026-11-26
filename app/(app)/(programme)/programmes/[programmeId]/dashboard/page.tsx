import { getCaseworkerDashboard } from "@/lib/caseworker"
import { cn } from "@/lib/cn"
import { getPrimeDashboard } from "@/lib/dashboard"
import { getProgrammePage } from "@/lib/programme-page"
import { CaseworkerDashboard } from "./caseworker-dashboard"
import { ClaimPanel } from "./claim-panel"
import { KeyNumbers } from "./key-numbers"
import { NeedsYou } from "./needs-you"
import { PartnersPanel } from "./partners-panel"
import { ProofPackPanel } from "./proof-pack-panel"
import { ResultsChart } from "./results-chart"
import { TeamPanel } from "./team-panel"

type DashboardPageProps = {
  params: Promise<{ programmeId: string }>
}

function Placeholder() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-display text-[32px] leading-10 text-grey-900">Dashboard</h1>
      <p className="text-base text-grey-700">Everything for this programme, in one place.</p>
    </div>
  )
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { programmeId } = await params
  const { session, organisation, programme } = await getProgrammePage(programmeId, "dashboard")
  if (programme.position !== "prime") return <Placeholder />
  if (programme.jobRole === "caseworker") {
    return (
      <CaseworkerDashboard programmeId={programmeId} dashboard={await getCaseworkerDashboard(programmeId, session.user.name)} />
    )
  }

  const dashboard = await getPrimeDashboard(programmeId, {
    name: session.user.name,
    jobRole: programme.jobRole,
    admin: organisation.access === "admin",
  })
  const wide = "lg:col-span-8"
  const narrow = "lg:col-span-4"

  return (
    <div className="flex flex-col gap-4">
      <h1 className="mb-2 font-display text-[28px] leading-9 text-grey-900">Dashboard</h1>
      <KeyNumbers numbers={dashboard.numbers} />
      <div className="grid gap-4 lg:grid-cols-12">
        <NeedsYou items={dashboard.needs} className={dashboard.claim ? wide : "lg:col-span-12"} />
        {dashboard.claim && <ClaimPanel claim={dashboard.claim} className={narrow} />}
        <PartnersPanel
          programmeId={programmeId}
          month={dashboard.claim ? dashboard.claim.label.split(" ")[0] : null}
          rows={dashboard.partners}
          className={cn(dashboard.team ? wide : "lg:col-span-12")}
        />
        {dashboard.team && <TeamPanel programmeId={programmeId} team={dashboard.team} className={narrow} />}
        <ResultsChart months={dashboard.chart} className={wide} />
        <ProofPackPanel programmeId={programmeId} pack={dashboard.proofPack} className={narrow} />
      </div>
    </div>
  )
}
