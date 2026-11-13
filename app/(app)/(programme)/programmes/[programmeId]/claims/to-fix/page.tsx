import { CircleCheck } from "lucide-react"
import { Section } from "@/components/app/section"
import { EmptyState } from "@/components/ui/empty-state"
import { partnerLabel } from "@/lib/claim-labels"
import { getToFix } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { recipientFor } from "@/lib/data/results"
import { formatDate } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { ClaimsTabs } from "../claims-tabs"
import { ToFixTable } from "./to-fix-table"

type ToFixPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function ToFixPage({ params }: ToFixPageProps) {
  const { programmeId } = await params
  const { programme } = await getProgrammePage(programmeId, "claims")

  const [rows, details] = await Promise.all([getToFix(programmeId), getProgrammeDetails(programmeId)])

  const results = rows.map(({ result, period }) => {
    const chase = result.chases[result.chases.length - 1]

    return {
      id: result.id,
      participantRef: result.participantRef,
      from: partnerLabel(result.partnerName),
      result: result.result,
      label: result.label,
      why: result.why,
      claim: period ? { label: period.label, sendBy: formatDate(period.sendBy) } : null,
      chased: chase ? { on: formatDate(chase.on), to: chase.to } : null,
      recipient: recipientFor(result),
    }
  })

  return (
    <>
      <ClaimsTabs
        programmeId={programmeId}
        commissioner={details?.commissioner ?? "the commissioner"}
        active="to-fix"
        toFix={rows.length}
      />
      {results.length > 0 ? (
        <Section
          title="Results to fix"
          description="Nearest send-by date first. Chase the missing evidence before the month's claim is drafted. Anything still not ready shows in that claim, where the Compliance lead decides what to do."
        >
          <ToFixTable programmeId={programmeId} rows={results} canChase={programme.jobRole === "compliance-lead"} />
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
