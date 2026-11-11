import { Clock, KeyRound } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import type { ProgrammeRules } from "@/lib/data/rules"
import { formatDate } from "@/lib/format"
import { AskForChanges } from "./ask-for-changes"
import { ConfirmRules } from "./confirm-rules"
import { DocumentList } from "./document-list"
import { RulesProgress } from "./rules-progress"
import { RulesSummary, rulesDescription } from "./rules-summary"

type RulesReviewProps = {
  rules: ProgrammeRules
  programme: { id: string; name: string }
  organisationName: string
  userName: string
  canSignOff: boolean
}

export function RulesReview({ rules, programme, organisationName, userName, canSignOff }: RulesReviewProps) {
  const holder = rules.signOffHolders.length === 1 ? rules.signOffHolders[0] : null
  const commissioner = rules.confirmations.find((confirmation) => confirmation.position === "commissioner")

  return (
    <>
      <PageHeader title="Rules" description={rulesDescription} />

      {canSignOff ? (
        <Banner icon={KeyRound} title="These rules are ready for you to review" className="mb-8">
          You&apos;re a Sign-off holder for {organisationName}. Read the summary, then confirm the rules or ask for
          changes.
        </Banner>
      ) : (
        <Banner icon={Clock} title={`Waiting for ${holder ?? "a Sign-off holder"} to confirm the rules`} className="mb-8">
          Only Sign-off holders can confirm them. We&apos;ll email you once they&apos;re confirmed.
        </Banner>
      )}

      <Columns
        main={
          <Section
            title="Rules summary"
            description={
              canSignOff
                ? `Version ${rules.version}. Goes live from ${formatDate(rules.effectiveFrom)} once confirmed.`
                : "Read only."
            }
          >
            <RulesSummary rules={rules.summary} />
            {canSignOff && (
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-grey-200 pt-4">
                <p className="flex-1 text-xs text-grey-700">Only Sign-off holders can confirm the rules.</p>
                <AskForChanges
                  programmeId={programme.id}
                  programmeName={programme.name}
                  parts={rules.summary.map((rule) => rule.heading)}
                />
                <ConfirmRules
                  programmeId={programme.id}
                  programmeName={programme.name}
                  organisationName={organisationName}
                  commissionerName={commissioner && !commissioner.confirmed ? commissioner.organisation : undefined}
                  userName={userName}
                  version={rules.version}
                  effectiveFrom={rules.effectiveFrom}
                />
              </div>
            )}
          </Section>
        }
        side={
          <>
            <Section title="Progress">
              <RulesProgress
                rules={rules}
                reviewNote={`Waiting for ${canSignOff ? "you" : (holder?.split(" ")[0] ?? "a Sign-off holder")}`}
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
