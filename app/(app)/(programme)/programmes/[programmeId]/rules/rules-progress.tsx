import { ProgressSteps } from "@/components/ui/progress-steps"
import type { ProgrammeRules } from "@/lib/data/rules"
import { formatDate } from "@/lib/format"

export function RulesProgress({ rules, reviewNote }: { rules: ProgrammeRules; reviewNote?: string }) {
  const preparing = rules.status === "rules-in-progress"
  const preparingNote = rules.changeRequest
    ? `Updating after ${rules.changeRequest.by.split(" ")[0]}'s comments`
    : "In progress"

  return (
    <ProgressSteps
      steps={[
        { label: "Documents received", note: rules.sentOn && formatDate(rules.sentOn), state: "done" },
        {
          label: "Preparing your rules",
          note: preparing ? preparingNote : rules.preparedOn && formatDate(rules.preparedOn),
          state: preparing ? "current" : "done",
        },
        { label: "Ready for review", note: reviewNote, state: preparing ? "todo" : "current" },
        { label: "Rules live", state: "todo" },
      ]}
    />
  )
}
