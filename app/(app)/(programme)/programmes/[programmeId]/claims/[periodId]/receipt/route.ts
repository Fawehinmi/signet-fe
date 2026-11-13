import { claimTotal, getPeriod, getPeriodClaims } from "@/lib/data/claims"
import { getProgrammeDetails } from "@/lib/data/programmes"
import { formatDate, formatDateTime } from "@/lib/format"
import { canOpen, findProgramme } from "@/lib/navigation"
import { getSession } from "@/lib/session"

type ReceiptContext = {
  params: Promise<{ programmeId: string; periodId: string }>
}

export async function GET(request: Request, { params }: ReceiptContext) {
  const { programmeId, periodId } = await params
  const version = new URL(request.url).searchParams.get("version")

  const session = await getSession()
  const programme = session ? findProgramme(session, programmeId) : undefined
  if (!session || !programme || !canOpen(session, programme, "claims")) {
    return new Response("Not found", { status: 404 })
  }

  const period = await getPeriod(programmeId, periodId)
  const versions = await getPeriodClaims(programmeId, periodId)
  const claim = version ? versions.find((item) => String(item.version) === version) : versions.find((item) => item.submitted)
  if (!period || !claim?.submitted) {
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
    `Sealed as at: ${formatDate(claim.asAt)}`,
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
    `Total: ${claimTotal(claim.counts)}`,
  ]

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${claim.submitted.reference}.txt"`,
    },
  })
}
