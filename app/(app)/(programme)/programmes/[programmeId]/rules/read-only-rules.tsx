import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import type { ProgrammeRules } from "@/lib/data/rules"
import { formatDate } from "@/lib/format"
import { statusTags } from "@/lib/programme-labels"
import { DocumentList } from "./document-list"
import { RulesSummary } from "./rules-summary"

export function ReadOnlyRules({ rules }: { rules: ProgrammeRules }) {
  const setBy = rules.confirmations.find((confirmation) => confirmation.position === rules.startedBy)
  const status = statusTags[rules.status]

  return (
    <>
      <PageHeader
        title="Rules"
        description={`Read only. ${setBy?.organisation ?? "Another organisation"} set these rules.`}
        tags={
          <>
            <Tag tone="info">Version {rules.version}</Tag>
            <Tag tone={status.tone}>{status.label}</Tag>
          </>
        }
      />
      <Columns
        main={
          <Section title="Rules summary">
            <RulesSummary rules={rules.summary} />
          </Section>
        }
        side={
          <>
            <Section title="Details">
              <DetailsList
                items={[
                  { label: "Confirmed by", value: setBy?.confirmed?.by },
                  { label: "Organisation", value: setBy?.organisation },
                  { label: "Confirmed on", value: setBy?.confirmed && formatDate(setBy.confirmed.on) },
                  { label: "Effective from", value: formatDate(rules.effectiveFrom) },
                ]}
              />
            </Section>
            <Section title="Documents">
              <DocumentList documents={rules.documents} />
            </Section>
          </>
        }
      />
    </>
  )
}
