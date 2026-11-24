import { CircleAlert, CircleCheck, KeyRound } from "lucide-react"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { Table, Td, Th } from "@/components/ui/table"
import { joinNames } from "@/lib/claim-labels"
import { getRemovedMembers, getStaff, getTeam } from "@/lib/data/team"
import { formatDate } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { jobRoleLabels } from "@/lib/programme-labels"
import { checkTeam } from "@/lib/team-check"
import { PersonCell } from "./person-cell"
import { TeamManager } from "./team-manager"

type TeamPageProps = {
  params: Promise<{ programmeId: string }>
}

const bannerIcons = { ok: CircleCheck, warn: KeyRound, error: CircleAlert }

export default async function TeamPage({ params }: TeamPageProps) {
  const { programmeId } = await params
  const { session, organisation, programme } = await getProgrammePage(programmeId, "team")

  const [team, removed, staff] = await Promise.all([
    getTeam(programmeId),
    getRemovedMembers(programmeId),
    getStaff(organisation.id),
  ])
  const canManage = organisation.access === "admin"
  const admins = staff.filter((person) => person.admin).map((person) => person.name)
  const check = programme.position === "prime" ? checkTeam(team) : null

  return (
    <TeamManager
      programmeId={programmeId}
      currentEmail={session.user.email}
      canManage={canManage}
      description={
        canManage
          ? "People from your organisation who work on this programme."
          : `People from your organisation who work on this programme. Only an organisation admin can change it${admins.length > 0 ? `, like ${joinNames(admins, "or")}` : ""}.`
      }
      members={team.map((member) => ({
        email: member.email,
        name: member.name,
        jobTitle: member.jobTitle,
        admin: Boolean(member.admin),
        jobRole: member.jobRole,
        permissions: member.permissions,
        addedOn: member.addedOn,
      }))}
      staff={staff.map((person) => ({
        email: person.email,
        name: person.name,
        jobTitle: person.jobTitle,
        onTeam: team.some((member) => member.email === person.email),
      }))}
      banner={
        check && (
          <Banner tone={check.tone} icon={bannerIcons[check.tone]} title={check.title} className="mb-8">
            {check.text}
          </Banner>
        )
      }
      removed={
        removed.length > 0 && (
          <Section
            title="Removed from this programme"
            description="They can't open the programme. Their name stays on past decisions and uploads."
          >
            <Table>
              <thead>
                <tr>
                  <Th>Person</Th>
                  <Th>Job role</Th>
                  <Th>Removed</Th>
                </tr>
              </thead>
              <tbody>
                {removed.map((member) => (
                  <tr key={`${member.email}-${member.removedOn}`}>
                    <Td className="py-2.5">
                      <PersonCell name={member.name} jobTitle={member.jobTitle} muted />
                    </Td>
                    <Td className="text-grey-700">{jobRoleLabels[member.jobRole]}</Td>
                    <Td>
                      <p className="text-grey-900">{formatDate(member.removedOn)}</p>
                      <p className="text-xs text-grey-700">By {member.removedBy}</p>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        )
      }
    />
  )
}
