import { partnerLabel } from "@/lib/claim-labels"

type ResultCellProps = {
  participantRef: string
  result?: string
  partnerName: string | null
}

export function ResultCell({ participantRef, result, partnerName }: ResultCellProps) {
  return (
    <>
      <p className="font-semibold text-grey-900">{participantRef}</p>
      <p className="text-xs text-grey-700">{result ? `${result}, ${partnerLabel(partnerName)}` : partnerLabel(partnerName)}</p>
    </>
  )
}
