import { CircleCheck, Inbox } from "lucide-react"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { EmptyState } from "@/components/ui/empty-state"
import { matchesSearch, nextClaim, readFilters } from "@/lib/claim-filters"
import { joinNames, partnerLabel } from "@/lib/claim-labels"
import { getClaimPeriods, getToFix } from "@/lib/data/claims"
import { getEvidenceOnFile } from "@/lib/data/evidence"
import { getParticipantNames } from "@/lib/data/participants"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { recipientFor, waitingDays, type ProgrammeResult } from "@/lib/data/results"
import { formatDate, plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { resultNouns } from "@/lib/result-checks"
import { ClaimFilters } from "../claim-filters"
import { ClaimsTabs } from "../claims-tabs"
import { ToFixTable, type FollowUp } from "./to-fix-table"

type ToFixPageProps = {
  params: Promise<{ programmeId: string }>
  searchParams: Promise<{ q?: string; month?: string }>
}

function followUpFor(result: ProgrammeResult): FollowUp | null {
  if (result.heldDecision) return { kind: "accepted", by: result.heldDecision.by, on: formatDate(result.heldDecision.on) }
  if (result.check && !result.check.answer) return { kind: "checking", by: result.check.by, on: formatDate(result.check.on) }

  const chase = result.chases[result.chases.length - 1]
  const answer = result.check?.answer
  if (answer && (!chase || answer.on >= chase.on)) return { kind: "sent-back", by: result.check?.by ?? "", on: formatDate(answer.on) }
  return chase ? { kind: "chased", by: chase.to, on: formatDate(chase.on) } : null
}

export default async function ToFixPage({ params, searchParams }: ToFixPageProps) {
  const { programmeId } = await params
  const { organisation, programme } = await getProgrammePage(programmeId, "claims")

  const [rows, periods, details, names] = await Promise.all([
    getToFix(programmeId),
    getClaimPeriods(programmeId),
    getProgrammeDetails(programmeId),
    getParticipantNames(programmeId),
  ])
  const filters = readFilters(await searchParams, [...periods.map((period) => period.id), nextClaim])

  const anyResult = programme.jobRole === "compliance-lead"
  const admin = organisation.access === "admin"

  const results = await Promise.all(
    rows.map(async ({ result, period }) => {
      const followUp = followUpFor(result)
      const checking = followUp?.kind === "checking"
      const evidence = checking ? await getEvidenceOnFile(programmeId, result.participantRef, result.result) : []

      return {
        id: result.id,
        participantRef: result.participantRef,
        name: names[result.participantRef] ?? null,
        from: partnerLabel(result.partnerName),
        ownDelivery: !result.partnerName,
        result: result.result,
        noun: resultNouns[result.result],
        label: result.label,
        why: result.why,
        monthId: period?.id ?? nextClaim,
        claim: period ? { label: period.label, sendBy: formatDate(period.sendBy) } : null,
        waiting: waitingDays(result),
        followUp,
        recipient: recipientFor(result),
        hasCaseworker: Boolean(result.caseworker),
        canChase: followUp?.kind !== "accepted" && !(admin && checking) && (anyResult || (admin && !result.partnerName)),
        check:
          admin && checking && result.check
            ? {
                by: result.check.by,
                on: formatDate(result.check.on),
                note: result.check.note,
                evidence: evidence.map((file) => `${file.evidenceType}, uploaded ${formatDate(file.on)}`),
              }
            : null,
      }
    }),
  )
  const shown = results.filter(
    (row) => (!filters.month || row.monthId === filters.month) && matchesSearch(filters.q, row.participantRef, row.name),
  )
  const toCheck = results.filter((row) => row.check)
  const senders = [...new Set(toCheck.map((row) => row.check?.by ?? ""))]

  const description = admin
    ? "Nearest send-by date first. As an organisation admin you can chase caseworkers about your own delivery, and check results they send you. Waiting turns amber after 14 days."
    : "Nearest send-by date first. Chase the missing evidence before the month's claim is drafted. Anything still not ready shows in that claim, where the Compliance lead decides what to do. Waiting turns amber after 14 days."

  return (
    <>
      <ClaimsTabs
        programmeId={programmeId}
        commissioner={details?.commissioner ?? "the commissioner"}
        active="to-fix"
        toFix={rows.length}
        filters={filters}
      />
      {toCheck.length > 0 && (
        <Banner icon={Inbox} title={`${joinNames(senders)} sent ${plural(toCheck.length, "result")} for checking`} className="mb-8">
          Accept {toCheck.length === 1 ? "it" : "each one"} as is, which still needs Sign-off, or send it back with a reason.
        </Banner>
      )}
      {results.length > 0 ? (
        <Section title="Results to fix" description={description}>
          <ClaimFilters
            q={filters.q}
            month={filters.month}
            months={[
              ...[...periods].reverse().map((period) => ({ value: period.id, label: period.label })),
              { value: nextClaim, label: "Next claim, once it's ready" },
            ]}
            empty={shown.length === 0}
            noun="results"
          >
            <ToFixTable programmeId={programmeId} rows={shown} total={results.length} />
          </ClaimFilters>
        </Section>
      ) : (
        <EmptyState
          icon={CircleCheck}
          title="Nothing to fix"
          description="Every result is ready to claim, or it's being decided in its month's claim."
        />
      )}
    </>
  )
}
