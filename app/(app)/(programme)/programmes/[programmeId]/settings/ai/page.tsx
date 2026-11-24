import { notFound } from "next/navigation"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { DetailsList } from "@/components/ui/details-list"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { formatDate } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { SettingsHeader } from "../settings-header"
import { AiFeaturesForm } from "./ai-features-form"

type AiSettingsPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function AiSettingsPage({ params }: AiSettingsPageProps) {
  const { programmeId } = await params
  const { organisation, programme } = await getProgrammePage(programmeId, "settings")

  const details = await getProgrammeDetails(programmeId)
  if (!details) notFound()

  return (
    <>
      <SettingsHeader programmeId={programmeId} active="ai" />
      <Columns
        main={
          <>
            <Section title="AI features" description={`Only affects ${organisation.name}'s team on ${programme.name}.`}>
              <AiFeaturesForm programmeId={programmeId} on={details.aiFeatures.on} disabled={Boolean(details.endedOn)} />
            </Section>
            <Section title="About this setting">
              <DetailsList
                items={[
                  { label: "Applies to", value: "This programme only" },
                  { label: "Who can change this", value: "Organisation admins" },
                  {
                    label: "Last changed",
                    value: `${details.aiFeatures.changedBy}, ${formatDate(details.aiFeatures.changedOn)}`,
                  },
                ]}
              />
            </Section>
          </>
        }
      />
    </>
  )
}
