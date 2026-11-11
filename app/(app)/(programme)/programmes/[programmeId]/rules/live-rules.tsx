import Link from "next/link"
import { CircleCheck, Clock } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import type { ProgrammeRules } from "@/lib/data/rules"
import { formatDate } from "@/lib/format"
import { positionLabels } from "@/lib/programme-labels"
import { RulesSummary, rulesDescription } from "./rules-summary"

type LiveRulesProps = {
  rules: ProgrammeRules
  programmeId: string
  organisationId: string
}

export function LiveRules({ rules, programmeId, organisationId }: LiveRulesProps) {
  const commissioner = rules.confirmations.find((confirmation) => confirmation.position === "commissioner")
  const reviewNeeded = commissioner !== undefined && !commissioner.confirmed

  return (
    <>
      <PageHeader
        title="Rules"
        description={rulesDescription}
        tags={
          <>
            <Tag tone="info">Version {rules.version}</Tag>
            <Tag tone="ok">Live</Tag>
            {reviewNeeded && <Tag tone="warn">Commissioner review needed</Tag>}
          </>
        }
      />

      {commissioner && !commissioner.confirmed && !commissioner.invitedOn && (
        <Banner
          tone="warn"
          title="Commissioner review needed"
          className="mb-8"
          action={
            <Link
              href={`/programmes/${programmeId}/organisations`}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              Invite the commissioner
            </Link>
          }
        >
          {commissioner.organisation} hasn&apos;t confirmed these rules yet. Invite them so they can review.
        </Banner>
      )}

      <Columns
        main={
          <Section title="Rules summary">
            <RulesSummary rules={rules.summary} />
          </Section>
        }
        side={
          <>
            <Section title="Confirmations">
              <ul className="-mt-4 flex flex-col">
                {rules.confirmations.map((confirmation) => (
                  <li
                    key={confirmation.organisationId}
                    className="flex gap-3 border-b border-grey-200 py-3.5 last:border-b-0"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-display text-[13px] font-medium text-brand-700">
                      {confirmation.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-grey-900">
                        {confirmation.organisation}
                        {confirmation.organisationId === organisationId && (
                          <span className="rounded-full bg-brand-400 px-1.5 text-[11px] leading-4 font-bold text-white">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-grey-700">{positionLabels[confirmation.position]}</p>
                      {confirmation.confirmed ? (
                        <p className="mt-1.5 flex items-start gap-1.5 text-[13px] text-success-900">
                          <CircleCheck className="mt-px size-4 shrink-0 text-success-800" />
                          Confirmed by {confirmation.confirmed.by} on {formatDate(confirmation.confirmed.on)}
                        </p>
                      ) : (
                        <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-semibold text-warning-900">
                          <Clock className="mt-px size-4 shrink-0 text-warning-800" />
                          {confirmation.invitedOn
                            ? `Invited ${formatDate(confirmation.invitedOn)}. Waiting for them to confirm`
                            : "Not invited yet"}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Details">
              <DetailsList
                items={[
                  { label: "Version", value: `Version ${rules.version}` },
                  { label: "Effective from", value: formatDate(rules.effectiveFrom) },
                ]}
              />
            </Section>
          </>
        }
      />
    </>
  )
}
