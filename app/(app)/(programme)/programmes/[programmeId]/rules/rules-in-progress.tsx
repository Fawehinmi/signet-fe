import { Clock } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import type { ProgrammeRules } from "@/lib/data/rules"
import { formatDate } from "@/lib/format"
import { DocumentList } from "./document-list"
import { RulesProgress } from "./rules-progress"
import { rulesDescription } from "./rules-summary"

export function RulesInProgress({ rules }: { rules: ProgrammeRules }) {
  const request = rules.changeRequest

  return (
    <>
      <PageHeader title="Rules" description={rulesDescription} />
      <Banner icon={Clock} title={request ? "We're updating your rules" : "We're preparing your rules"} className="mb-8">
        No action needed. We&apos;ll email you when they&apos;re ready for review{request ? " again" : ""}.
      </Banner>
      <Columns
        main={
          <>
            {request && (
              <Section title="Changes requested">
                <p className="text-sm font-semibold text-grey-900">{request.by} asked for changes</p>
                <p className="text-xs text-grey-700">
                  {formatDate(request.on)}
                  {request.part && `. About ${request.part}`}
                </p>
                <blockquote className="mt-3 border-l-2 border-brand-200 pl-4 text-sm leading-[22px] text-grey-800">
                  {request.text}
                </blockquote>
              </Section>
            )}
            <Section title="Progress">
              <RulesProgress rules={rules} />
            </Section>
          </>
        }
        side={
          <Section
            title="Documents"
            description={rules.sentOn && `Sent ${formatDate(rules.sentOn)}. You can't change these now.`}
          >
            <DocumentList documents={rules.documents} />
          </Section>
        }
      />
    </>
  )
}
