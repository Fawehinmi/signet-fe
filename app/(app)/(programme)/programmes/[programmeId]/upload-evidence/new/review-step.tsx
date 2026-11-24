"use client"

import { FileIcon } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import type { CaseloadParticipant } from "@/lib/evidence-matching"
import { resultLabelTags } from "@/lib/programme-labels"
import { labelAfter, resultNouns, type ResultCheck } from "@/lib/result-checks"
import type { UploadScope } from "@/lib/validations/evidence"
import { isReady, type MatchRow } from "./match-files-step"

type ReviewStepProps = {
  rows: MatchRow[]
  inScope: CaseloadParticipant[]
  scope: UploadScope
  checks: ResultCheck[]
  scopeDetails: { label: string; value: string }[]
  saving: boolean
  error: string | null
  onBack: () => void
  onSubmit: () => void
}

function LabelTag({ label }: { label: ResultCheck["label"] }) {
  const tag = resultLabelTags[label]
  return <Tag tone={tag.tone}>{tag.label}</Tag>
}

export function ReviewStep({ rows, inScope, scope, checks, scopeDetails, saving, error, onBack, onSubmit }: ReviewStepProps) {
  const ready = rows.filter(isReady)
  const unmatched = rows.filter((row) => row.unmatched)
  const nameOf = (ref: string) => inScope.find((participant) => participant.ref === ref)?.name ?? ref

  const changes = checks
    .filter((check) => scope.kind !== "month" || check.periodId === scope.periodId)
    .map((check) => {
      const types = ready
        .filter((row) => row.participantRef === check.participantRef && row.result === check.result)
        .map((row) => row.evidenceType)
      return { check, after: labelAfter(check, types) }
    })
    .filter(({ check, after }) => after !== check.label)

  const inSubmitted = changes.filter(({ check }) => check.claim?.status === "submitted")
  const inAccepted = changes.filter(({ check }) => check.claim?.status === "accepted")

  return (
    <>
      {inSubmitted.map(({ check }) => (
        <Banner
          key={check.resultId}
          tone="warn"
          title={`${nameOf(check.participantRef)}'s ${resultNouns[check.result]} is in a submitted claim`}
          className="mb-4"
        >
          It&apos;s in the {check.claim?.periodLabel} claim, Version {check.claim?.version}, which hasn&apos;t been accepted
          yet. Confirming makes a new version of that claim for your Compliance lead to review.
        </Banner>
      ))}
      {inAccepted.map(({ check }) => (
        <Banner
          key={check.resultId}
          title={`${nameOf(check.participantRef)}'s ${resultNouns[check.result]} is in a closed claim`}
          className="mb-4"
        >
          The {check.claim?.periodLabel} claim is closed, so confirming adds a revision to a later month&apos;s claim.
        </Banner>
      ))}

      <div className={inSubmitted.length + inAccepted.length > 0 ? "mt-8" : undefined}>
        <Columns
          main={
            <>
              <Section title="This upload is for">
                <DetailsList items={scopeDetails} />
              </Section>
              {unmatched.length > 0 && (
                <Section title="Unmatched" count={unmatched.length}>
                  <ul className="-mt-1 flex flex-col gap-3">
                    {unmatched.map((row) => (
                      <li key={row.id}>
                        <p className="truncate text-sm font-semibold text-grey-900">{row.file.name}</p>
                        <p className="text-sm text-grey-700">Goes to Unmatched. It affects nothing until it&apos;s matched.</p>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              <Section
                title="Labels that will change"
                description="Signet checks each result against the rules again when you confirm."
                count={changes.length}
              >
                {changes.length > 0 ? (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Participant</Th>
                        <Th>Result</Th>
                        <Th>Label now</Th>
                        <Th>Label after</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {changes.map(({ check, after }) => (
                        <tr key={check.resultId}>
                          <Td>
                            <p className="font-semibold text-grey-900">{nameOf(check.participantRef)}</p>
                            <p className="text-xs text-grey-700">{check.participantRef}</p>
                          </Td>
                          <Td>{check.result}</Td>
                          <Td>
                            <LabelTag label={check.label} />
                          </Td>
                          <Td>
                            <LabelTag label={after} />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-sm leading-[22px] text-grey-800">
                    No labels change. The evidence is still added to each participant&apos;s proof pack.
                  </p>
                )}
              </Section>

              <Section title="Files matched" count={ready.length}>
                <Table>
                  <thead>
                    <tr>
                      <Th>File</Th>
                      <Th>Participant</Th>
                      <Th>Evidence type</Th>
                      <Th>Result</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {ready.map((row) => (
                      <tr key={row.id}>
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <FileIcon className="size-5 shrink-0 text-brand-600" />
                            <span className="max-w-[220px] truncate font-semibold text-grey-900">{row.file.name}</span>
                          </div>
                        </Td>
                        <Td>{nameOf(row.participantRef)}</Td>
                        <Td>{row.evidenceType}</Td>
                        <Td>{row.result}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {error && (
                  <p role="alert" className="mt-3 text-sm text-danger-700">
                    {error}
                  </p>
                )}
                <div className="mt-6 flex justify-between gap-3 border-t border-grey-200 pt-4">
                  <Button variant="secondary" onClick={onBack}>
                    Back
                  </Button>
                  <Button loading={saving} onClick={onSubmit}>
                    Confirm
                  </Button>
                </div>
              </Section>
            </>
          }
        />
      </div>
    </>
  )
}
