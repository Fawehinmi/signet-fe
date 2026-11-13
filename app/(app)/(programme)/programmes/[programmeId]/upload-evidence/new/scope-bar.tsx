import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScopeBar({ sentence, onChange }: { sentence: string; onChange?: () => void }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-tint py-3 pr-3 pl-4 text-sm text-grey-900">
      <CalendarDays className="size-5 shrink-0 text-brand-600" />
      <p className="flex-1">
        <span className="text-grey-700">This upload is for</span> {sentence}
      </p>
      {onChange && (
        <Button variant="text" size="sm" onClick={onChange}>
          Change
        </Button>
      )}
    </div>
  )
}
