import type { ReceivedResult } from "@/lib/data/partners"

export const resultFilters = [
    { key: "all", label: "All", match: () => true },
    { key: "needs-evidence", label: "Needs evidence", match: (result: ReceivedResult) => result.label === "needs-evidence" },
    { key: "cannot-be-claimed", label: "Can't be claimed", match: (result: ReceivedResult) => result.label === "cannot-be-claimed" },
    { key: "changed", label: "Changed", match: (result: ReceivedResult) => result.note === "changed" },
    { key: "failed", label: "Failed", match: (result: ReceivedResult) => !result.verified },
]