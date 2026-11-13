import Link from "next/link"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Stats } from "@/components/app/stats"
import { buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import { readyLabel, type ClaimPeriod } from "@/lib/data/claims"
import { getMonthResults } from "@/lib/data/results"
import { addDays, formatDate, formatPeriod } from "@/lib/format"

export async function OpenMonth({ programmeId, period }: { programmeId: string; period: ClaimPeriod }) {
  const results = await getMonthResults(programmeId, period.id)
  const notReady = results.filter((result) => result.label !== readyLabel).length
  const claimsPath = `/programmes/${programmeId}/claims`

  return (
    <>
      <PageHeader
        title={`${period.label} claim`}
        tags={<Tag tone="neutral">Open</Tag>}
        breadcrumbs={[{ label: "Claims", href: claimsPath }, { label: period.label }]}
        description={`Signet drafts it on ${formatDate(addDays(period.end, 1))}, when the month ends.`}
        actions={
          notReady > 0 && (
            <Link href={`${claimsPath}/to-fix`} className={buttonStyles({ variant: "secondary" })}>
              Open To fix
            </Link>
          )
        }
      />
      <Stats
        items={[
          { label: "Results so far", value: results.length },
          { label: "Ready", value: results.length - notReady },
          { label: "Not ready", value: notReady, warn: notReady > 0 },
        ]}
      />
      <Columns
        main={
          <Section title="Before the month ends">
            <p className="text-sm leading-[22px] text-grey-800">
              Chase anything that isn&apos;t ready from To fix. Whatever is still not ready when the claim is drafted shows
              under Has issues, where the Compliance lead decides what to do.
            </p>
          </Section>
        }
        side={
          <Section title="Claim">
            <DetailsList
              items={[
                { label: "Period", value: formatPeriod(period.start, period.end) },
                { label: "Drafted on", value: formatDate(addDays(period.end, 1)) },
                { label: "Send by", value: formatDate(period.sendBy) },
              ]}
            />
          </Section>
        }
      />
    </>
  )
}
