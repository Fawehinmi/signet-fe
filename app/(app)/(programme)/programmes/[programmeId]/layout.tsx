import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { BottomTabs } from "@/components/app/bottom-tabs"
import { ProgrammeSwitcher } from "@/components/app/programme-switcher"
import { Sidebar } from "@/components/app/sidebar"
import { Tag } from "@/components/ui/tag"
import { getProgrammeStatus } from "@/lib/data/rules"
import { findProgramme, programmeNavigation } from "@/lib/navigation"
import { jobRoleLabels, positionLabels, statusTags } from "@/lib/programme-labels"
import { getSession } from "@/lib/session"

export default async function ProgrammeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ programmeId: string }>
}) {
  const { programmeId } = await params
  const session = await getSession()
  if (!session?.organisation) redirect("/sign-in")

  const programme = findProgramme(session, programmeId)
  if (!programme) notFound()

  const items = programmeNavigation(session, programme)
  const status = statusTags[(await getProgrammeStatus(programme.id)) ?? programme.status]

  const backLink = (
    <Link href="/programmes" className="flex items-center gap-1.5 px-2 text-sm font-semibold text-brand-600">
      <ArrowLeft className="size-[18px]" />
      Programmes
    </Link>
  )

  const topBar = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <ProgrammeSwitcher
        current={{ id: programme.id, name: programme.name }}
        programmes={session.programmes.map(({ id, name }) => ({ id, name }))}
      />
      <span className="hidden items-center gap-2 sm:flex">
        <Tag tone="info">{positionLabels[programme.position]}</Tag>
        <Tag tone={status.tone}>{status.label}</Tag>
      </span>
    </div>
  )

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={items}
          top={backLink}
          user={{ name: session.user.name, role: jobRoleLabels[programme.jobRole] }}
        />
      }
      topBar={topBar}
      bottomTabs={programme.jobRole === "caseworker" ? <BottomTabs items={items} /> : undefined}
    >
      {children}
    </AppShell>
  )
}
