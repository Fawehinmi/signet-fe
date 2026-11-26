import { formatDate, formatDateRange } from "@/lib/format"
import type { ProofPackKind, ProofPackVersion } from "@/lib/data/proof-packs"
import { renderPdf, type PdfBlock } from "@/lib/pdf"

type ProofPackDocument = {
  programme: string
  prime: string
  commissioner: string
  version: ProofPackVersion
}

const kinds: ProofPackKind[] = ["Enrolled", "Onboarded", "Outcome", "Revision"]

export function proofPackPartners(version: ProofPackVersion) {
  return [...new Set(version.results.flatMap((result) => (result.partnerName ? [result.partnerName] : [])))]
}

export function proofPackPdf({ programme, prime, commissioner, version }: ProofPackDocument) {
  const { results } = version
  const own = (kind: ProofPackKind) => results.filter((result) => result.kind === kind && !result.partnerName).length
  const fromPartners = (kind: ProofPackKind) => results.filter((result) => result.kind === kind && result.partnerName).length
  const usedKinds = kinds.filter((kind) => own(kind) + fromPartners(kind) > 0)
  const ownTotal = results.filter((result) => !result.partnerName).length

  const heading = (text: string): PdfBlock[] => [{ kind: "gap", height: 18 }, { kind: "text", text, size: 12, bold: true }]

  const blocks: PdfBlock[] = [
    { kind: "text", text: "Proof pack", size: 10, bold: true, muted: true },
    { kind: "text", text: programme, size: 20, bold: true },
    { kind: "text", text: `Version ${version.version}, made by Signet on ${formatDate(version.madeOn)}`, muted: true },
    { kind: "rule" },
    ...[
      ["Prime", prime],
      ["Commissioner", commissioner],
      ["Period covered", formatDateRange(version.periodStart, version.periodEnd)],
      ["Results included", String(results.length)],
    ].map((cells): PdfBlock => ({ kind: "row", cells, widths: [140, 343] })),

    ...heading("Results by payment type"),
    { kind: "row", cells: ["Payment type", "Own delivery", "Partners", "Total"], widths: [200, 100, 100, 83], bold: true },
    ...usedKinds.map(
      (kind): PdfBlock => ({
        kind: "row",
        cells: [kind, String(own(kind)), String(fromPartners(kind)), String(own(kind) + fromPartners(kind))],
        widths: [200, 100, 100, 83],
      }),
    ),
    {
      kind: "row",
      cells: ["Total", String(ownTotal), String(results.length - ownTotal), String(results.length)],
      widths: [200, 100, 100, 83],
      bold: true,
    },

    ...heading("Who delivered"),
    { kind: "row", cells: ["Delivered by", "Results"], widths: [300, 183], bold: true },
    { kind: "row", cells: [`${prime}, own delivery`, String(ownTotal)], widths: [300, 183] },
    ...proofPackPartners(version).map(
      (partner): PdfBlock => ({
        kind: "row",
        cells: [partner, String(results.filter((result) => result.partnerName === partner).length)],
        widths: [300, 183],
      }),
    ),

    ...heading("Results by claim"),
    { kind: "row", cells: ["Claim", "Results"], widths: [300, 183], bold: true },
    ...version.months.map(
      (month): PdfBlock => ({
        kind: "row",
        cells: [month, String(results.filter((result) => result.claim === month).length)],
        widths: [300, 183],
      }),
    ),

    ...heading("Each result's proof"),
    {
      kind: "row",
      cells: ["Reference", "Payment type", "Claim", "Proof", "Evidence held by"],
      widths: [70, 80, 90, 120, 123],
      bold: true,
      repeat: true,
    },
    ...results.map(
      (result): PdfBlock => ({
        kind: "row",
        cells: [result.participantRef, result.kind, result.claim, result.proof, result.partnerName ?? prime],
        widths: [70, 80, 90, 120, 123],
      }),
    ),

    { kind: "gap", height: 12 },
    { kind: "rule" },
    {
      kind: "text",
      text: "Evidence files stay with whoever holds them. This pack lists the checks each result passed and who holds the evidence. Participant names aren't included.",
      size: 9,
      muted: true,
    },
  ]

  return renderPdf(blocks, {
    title: `${programme} proof pack, Version ${version.version}`,
    footer: (page, pages) => `${programme} proof pack, Version ${version.version}. Page ${page} of ${pages}.`,
  })
}
