import type { PrimeDashboard } from "@/lib/dashboard"

export function KeyNumber({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-lg border border-grey-200 bg-white px-5 py-4">
      <p className="text-[13px] text-grey-700">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2.5 whitespace-nowrap">
        <span className="font-display text-[28px] leading-9 text-grey-900">{value}</span>
        {note && <span className="text-[13px] font-semibold text-warning-900">{note}</span>}
      </div>
    </div>
  )
}

export function KeyNumbers({ numbers }: { numbers: PrimeDashboard["numbers"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KeyNumber label="Results claimed" value={numbers.claimed} />
      {numbers.due && <KeyNumber label={numbers.due.label} value={numbers.due.value} />}
      <KeyNumber label="Open fixes" value={numbers.fixes} note={numbers.overdue > 0 ? `${numbers.overdue} over 14 days` : undefined} />
      <KeyNumber
        label="Partners on track"
        value={
          <>
            {numbers.partnersOnTrack} <span className="text-base text-grey-700">of {numbers.partners}</span>
          </>
        }
        note={numbers.partners > numbers.partnersOnTrack ? `${numbers.partners - numbers.partnersOnTrack} behind` : undefined}
      />
    </div>
  )
}
