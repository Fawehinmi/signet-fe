import { redirect } from "next/navigation"
import { AppShell } from "@/components/app/app-shell"
import { Sidebar } from "@/components/app/sidebar"
import { Logo } from "@/components/ui/logo"
import { orgNavigation } from "@/lib/navigation"
import { getSession } from "@/lib/session"

export default async function OrganisationLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.organisation) redirect("/sign-in")

  const { organisation, user } = session
  const initials = organisation.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  const organisationBox = (
    <div className="flex items-center gap-2.5 rounded-lg border border-grey-200 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-display text-[13px] font-medium text-brand-700">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-grey-900">{organisation.name}</p>
        <p className="truncate text-xs text-grey-700">{organisation.description}</p>
      </div>
    </div>
  )

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={orgNavigation(session)}
          top={organisationBox}
          user={{ name: user.name, role: organisation.access === "admin" ? "Admin" : "Member" }}
        />
      }
      topBar={<Logo className="lg:hidden" />}
    >
      {children}
    </AppShell>
  )
}
