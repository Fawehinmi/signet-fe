import { claimTotal, getClaim, getPeriod } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { formatDate, formatDateTime } from "@/lib/format"
import { canOpen, findProgramme } from "@/lib/navigation"
import { getSession } from "@/lib/session"

type ReceiptContext = {
  params: Promise<{ programmeId: string; claimId: string }>
}

export async function GET(_request: Request, { params }: ReceiptContext) {
  const { programmeId, claimId } = await params

  const session = await getSession()
  const programme = session ? findProgramme(session, programmeId) : undefined
  if (!session || !programme || !canOpen(session, programme, "claims")) {
    return new Response("Not found", { status: 404 })
  }

  const claim = await getClaim(programmeId, claimId)
  const period = claim ? await getPeriod(programmeId, claim.periodId) : null
  if (!claim?.submitted || !period) {
    return new Response("Not found", { status: 404 })
  }

  const details = await getProgrammeDetails(programmeId)

  const lines = [
    "Signet claim receipt",
    "",
    `Reference: ${claim.submitted.reference}`,
    `Programme: ${programme.name}`,
    `Period: ${period.label}`,
    `Version: ${claim.version}`,
    `Sealed as at: ${claim.asAt ? formatDate(claim.asAt) : ""}`,
    `Submitted by: ${claim.submitted.by}`,
    `Submitted on: ${formatDateTime(claim.submitted.on)}`,
    `Sent to: ${details?.commissioner ?? ""}`,
    ...(claim.accepted
      ? [
          `Accepted by: ${claim.accepted.by}, ${claim.accepted.organisation}`,
          `Accepted on: ${formatDateTime(claim.accepted.on)}`,
          `Receipt number: ${claim.accepted.receiptNumber}`,
        ]
      : []),
    "",
    "Counts by payment type",
    ...claim.counts.map(
      (count) =>
        `${count.label}: ${count.fromPartners} from partners, ${count.ownDelivery} own delivery, ${count.fromPartners + count.ownDelivery} in total`,
    ),
    `Results: ${claimTotal(claim)}`,
  ]

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${claim.submitted.reference}.txt"`,
    },
  })
}
