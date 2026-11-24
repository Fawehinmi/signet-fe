import { notFound } from "next/navigation"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Stats } from "@/components/app/stats"
import { ActivityList } from "@/components/ui/activity-list"
import { Tag } from "@/components/ui/tag"
import { getFollowUps, getPartner, getPartnerResults } from "@/lib/data/partners"
import { formatDate, plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { PartnerActions } from "./partner-actions"
import { PartnerResultsTable } from "./partner-results-table"
import { resultNouns } from "@/lib/result-checks"

type PartnerPageProps = {
  params: Promise<{ programmeId: string; partnerId: string }>
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { programmeId, partnerId } = await params
  const { programme } = await getProgrammePage(programmeId, "partners")

  const partner = await getPartner(programmeId, partnerId)
  if (!partner) notFound()

  const [results, followUps] = await Promise.all([getPartnerResults(programmeId, partner.name), getFollowUps(partner.id)])

  const issueOptions = [
    partner.overdueChecks > 0 && plural(partner.overdueChecks, "overdue check"),
    partner.needsEvidence > 0 && plural(partner.needsEvidence, "result that needs evidence", "results that need evidence"),
    partner.cannotBeClaimed > 0 && plural(partner.cannotBeClaimed, "result that can't be claimed", "results that can't be claimed"),
    "Something else",
  ]
    .filter((option): option is string => Boolean(option))
    .map((option) => ({ value: option, label: option }))

  const resultOptions = results.map((result) => ({
    value: result.participantRef,
    label: `${result.participantRef}, ${resultNouns[result.result]}`,
  }))

  return (
    <>
      <PageHeader
        title={partner.name}
        breadcrumbs={[{ label: "Our partners", href: `/programmes/${programmeId}/partners` }, { label: partner.name }]}
        tags={partner.atRisk ? <Tag tone="warn">At risk</Tag> : <Tag tone="ok">On track</Tag>}
        description={`Subcontractor since ${formatDate(partner.since)}.`}
        actions={
          <PartnerActions
            programmeId={programmeId}
            programmeName={programme.name}
            partner={{ id: partner.id, name: partner.name, contact: partner.contact }}
            issueOptions={issueOptions}
            resultOptions={resultOptions}
          />
        }
      />

      <Stats
        items={[
          { label: "Sent results", value: partner.sentResults },
          {
            label: "Fixes",
            value: partner.overdueChecks + partner.needsEvidence,
            warn: partner.overdueChecks + partner.needsEvidence > 0,
          },
          { label: "Can't be claimed", value: partner.cannotBeClaimed },
        ]}
      />

      <Columns
        main={
          <>
            <Section title="Sent results">
            <PartnerResultsTable results={results} />
            <p className="mt-3 text-[13px] text-grey-700">
              Showing {results.length} of {plural(partner.sentResults, "result")}
            </p>
          </Section>
            <Section title="Receipts">
              <ul className="-mt-4 flex flex-col">
                {partner.receipts.map((receipt) => (
                  <li key={receipt.id} className="border-b border-grey-200 py-3.5 last:border-b-0">
                    <p className="text-sm font-semibold text-grey-900">Receipt {receipt.reference}</p>
                    <p className="text-xs text-grey-700">
                      {plural(receipt.results, "result")}, {formatDate(receipt.sentOn)}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Follow-up history">
              {followUps.length > 0 ? (
                <ActivityList items={followUps} />
              ) : (
                <p className="text-sm text-grey-700">No follow-ups yet.</p>
              )}
            </Section>
          </>
        }
      />
    </>
  )
}
