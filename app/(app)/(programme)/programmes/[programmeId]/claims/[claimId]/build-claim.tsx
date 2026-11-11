import Link from "next/link"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Button, buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { claimTotal, getNextPeriod, getPeriodClaims, type Claim, type ClaimPeriod } from "@/lib/data/claims"
import { formatDate, formatPeriod, plural, today } from "@/lib/format"
import { sendForSignOff } from "../actions"
import { ClaimChanges } from "./claim-changes"
import { ClaimCounts } from "./claim-counts"
import { LeaveOut } from "./leave-out"

type BuildClaimProps = {
  programmeId: string
  claim: Claim
  period: ClaimPeriod
}

export async function BuildClaim({ programmeId, claim, period }: BuildClaimProps) {
  const [versions, nextPeriod] = await Promise.all([
    getPeriodClaims(programmeId, period.id),
    getNextPeriod(programmeId, period.id),
  ])

  const previous = versions.find((version) => version.version === claim.version - 1)
  const total = claimTotal(claim)
  const asAt = formatDate(today())
  const claimsPath = `/programmes/${programmeId}/claims`
  const newVersion = claim.version > 1

  return (
    <>
      <PageHeader
        title={newVersion ? `${period.label} claim, Version ${claim.version}` : `Build the ${period.label} claim`}
        tags={newVersion ? <Tag tone="neutral">Draft</Tag> : undefined}
        breadcrumbs={[
          { label: "Claims", href: claimsPath },
          { label: period.label },
          ...(newVersion ? [{ label: `Version ${claim.version}` }] : []),
        ]}
        description={
          previous?.asAt
            ? `As at ${asAt}. Version ${previous.version} was as at ${formatDate(previous.asAt)}.`
            : `As at ${asAt}. Claims show counts, never money amounts.`
        }
        actions={
          <>
            <Link
              href={`${claimsPath}/${claim.id}/preview`}
              className={buttonStyles({ variant: newVersion ? "secondary" : "primary" })}
            >
              Preview claim
            </Link>
            {newVersion && (
              <form action={sendForSignOff.bind(null, programmeId, claim.id)}>
                <Button type="submit">Send for Sign-off</Button>
              </form>
            )}
          </>
        }
      />
      <Columns
        main={
          <>
            {claim.changes.length > 0 && (
              <Section title="What changed" description={`Since Version ${claim.version - 1}.`}>
                <ClaimChanges changes={claim.changes} />
              </Section>
            )}
            <Section title="Counts by payment type">
              <ClaimCounts counts={claim.counts} />
            </Section>
            <Section title="Results in this claim">
              {claim.results.length > 0 ? (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Participant ref</Th>
                        <Th>Result</Th>
                        <Th>Partner</Th>
                        <Th>Verified</Th>
                        <Th>
                          <span className="sr-only">Actions</span>
                        </Th>
                      </tr>
                    </thead>
                    <tbody>
                      {claim.results.map((result) => (
                        <tr key={result.id}>
                          <Td className="font-semibold text-grey-900">{result.participantRef}</Td>
                          <Td>{result.result}</Td>
                          <Td>{result.partnerName}</Td>
                          <Td>
                            <Tag tone="ok">Verified</Tag>
                          </Td>
                          <Td className="text-right">
                            <LeaveOut
                              programmeId={programmeId}
                              claimId={claim.id}
                              periodLabel={period.label}
                              nextPeriodLabel={nextPeriod?.label}
                              result={result}
                            />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <p className="mt-3 text-[13px] text-grey-700">
                    Showing {claim.results.length} of {plural(total, "result")}
                  </p>
                </>
              ) : (
                <p className="text-sm text-grey-700">No results to show.</p>
              )}
            </Section>
          </>
        }
        side={
          <Section title="Summary">
            <DetailsList
              items={[
                { label: "Period", value: formatPeriod(period.start, period.end) },
                { label: "As at", value: asAt },
                { label: "Results", value: total },
                { label: "Verification", value: `All ${plural(total, "result")} verified` },
                { label: "Left out", value: claim.leftOut.length },
              ]}
            />
          </Section>
        }
      />
    </>
  )
}
