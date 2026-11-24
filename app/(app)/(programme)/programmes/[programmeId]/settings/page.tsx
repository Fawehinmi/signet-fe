import { notFound } from "next/navigation"
import { Lock } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { formatDate } from "@/lib/format"
import { positionLabels } from "@/lib/programme-labels"
import { getProgrammePage } from "@/lib/programme-page"
import { DetailsForm } from "./details-form"
import { EndProgramme } from "./end-programme"
import { SettingsHeader } from "./settings-header"

type ProgrammeSettingsPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function ProgrammeSettingsPage({ params }: ProgrammeSettingsPageProps) {
  const { programmeId } = await params
  const { programme } = await getProgrammePage(programmeId, "settings")

  const details = await getProgrammeDetails(programmeId)
  if (!details) notFound()

  const ownProgramme = details.startedBy === programme.position
  const canEdit = ownProgramme && !details.endedOn

  return (
    <>
      <SettingsHeader programmeId={programmeId} active="details" />

      {details.endedOn && (
        <Banner tone="neutral" icon={Lock} title={`This programme ended on ${formatDate(details.endedOn)}`} className="mb-8">
          It&apos;s read-only for everyone on it.
        </Banner>
      )}

      <Columns
        main={
          <>
            <Section
              title="Programme details"
              description={ownProgramme ? undefined : `${details.commissioner} manages these details.`}
            >
              <DetailsForm
                programmeId={programmeId}
                name={programme.name}
                scheme={details.scheme}
                area={details.area}
                startDate={details.startDate}
                endDate={details.endDate}
                canEdit={canEdit}
              />
            </Section>
            {canEdit && (
              <Section title="End programme" className="[&>div:first-child]:border-danger-200">
                {details.commissionerJoined ? (
                  <p className="text-sm leading-[22px] text-grey-800">
                    You can&apos;t end this programme because {details.commissioner} has joined it.
                  </p>
                ) : (
                  <>
                    <p className="text-sm leading-[22px] text-grey-800">
                      You can end this programme because {details.commissioner} hasn&apos;t joined yet. It becomes
                      read-only for everyone on it.
                    </p>
                    <div className="mt-4">
                      <EndProgramme programmeId={programmeId} programmeName={programme.name} />
                    </div>
                  </>
                )}
              </Section>
            )}
            <Section title="About this programme">
              <DetailsList
                items={[
                  { label: "Position", value: <Tag tone="info">{positionLabels[programme.position]}</Tag> },
                  {
                    label: "Commissioner",
                    value: details.commissionerJoined ? (
                      details.commissioner
                    ) : (
                      <span className="text-grey-600">{details.commissioner}, not joined</span>
                    ),
                  },
                  { label: "Created by", value: details.createdBy },
                  { label: "Created", value: formatDate(details.createdOn) },
                ]}
              />
            </Section>
          </>
        }
      />
    </>
  )
}
