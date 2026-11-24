import { today } from "@/lib/format"
import type { ProgrammePosition, ProgrammeStatus } from "@/lib/session"
import type { AskForChangesValues, ContractDocumentsValues } from "@/lib/validations/rules"

export type Rule = {
  heading: string
  text: string
}

export type Confirmation = {
  organisationId: string
  organisation: string
  initials: string
  position: ProgrammePosition
  confirmed?: { by: string; on: string }
  invitedOn?: string
}

export type ChangeRequest = {
  by: string
  on: string
  part: string
  text: string
}

export type ProgrammeRules = {
  status: ProgrammeStatus
  startedBy: ProgrammePosition
  version: number
  effectiveFrom: string
  summary: Rule[]
  documents: { id: string; name: string }[]
  sentOn?: string
  preparedOn?: string
  signOffHolders: string[]
  confirmations: Confirmation[]
  changeRequest?: ChangeRequest
}

function connectToWorkRules(area: string): Rule[] {
  return [
    { heading: "Payment", text: "Claims pay per enrolment, onboarding and outcome. Changes to a closed claim come through as revisions." },
    {
      heading: "Who's eligible",
      text: `Lives in ${area}, aged 18 or over, with a referral recorded before the start date.`,
    },
    { heading: "Outcome checks", text: "Due 13 weeks after a job starts. 26 weeks for self-employed participants." },
    { heading: "When no check is needed", text: "When DWP confirms paid work through HMRC earnings data." },
    { heading: "Self-employment", text: "Needs an invoice or trading record for the period." },
  ]
}

const rulesByProgramme: Record<string, ProgrammeRules> = {
  "ctw-northshire": {
    status: "live",
    startedBy: "commissioner",
    version: 1,
    effectiveFrom: "2027-04-01",
    summary: connectToWorkRules("Northshire"),
    documents: [
      { id: "ns-grant", name: "Northshire_CtW_Grant_Agreement.pdf" },
      { id: "ns-plan", name: "Northshire_Delivery_Plan_v2.docx" },
    ],
    sentOn: "2026-11-06",
    preparedOn: "2026-11-12",
    signOffHolders: ["Emma Lawson"],
    confirmations: [
      {
        organisationId: "northshire-strategic-authority",
        organisation: "Northshire Strategic Authority",
        initials: "NS",
        position: "commissioner",
        confirmed: { by: "Emma Lawson", on: "2026-11-20" },
      },
    ],
  },
  "ctw-westmoor": {
    status: "waiting-for-confirmation",
    startedBy: "prime",
    version: 1,
    effectiveFrom: "2028-01-01",
    summary: connectToWorkRules("Westmoor"),
    documents: [
      { id: "wm-grant", name: "Westmoor_CtW_Grant_Agreement.pdf" },
      { id: "wm-plan", name: "Westmoor_Delivery_Plan.docx" },
    ],
    sentOn: "2027-09-01",
    preparedOn: "2027-09-08",
    signOffHolders: ["Marcus Webb"],
    confirmations: [
      { organisationId: "meridian-employment", organisation: "Meridian Employment", initials: "ME", position: "prime" },
      { organisationId: "westmoor-council", organisation: "Westmoor Council", initials: "WC", position: "commissioner" },
    ],
  },
}

export async function getRules(programmeId: string) {
  return rulesByProgramme[programmeId] ?? null
}

export async function getProgrammeStatus(programmeId: string) {
  return rulesByProgramme[programmeId]?.status
}

export async function saveContractDocuments(programmeId: string, values: ContractDocumentsValues) {
  const rules = rulesByProgramme[programmeId]
  if (!rules) return

  const files = [values.contract, values.deliveryPlan, values.schedules].filter((file): file is File => Boolean(file))

  rules.status = "rules-in-progress"
  rules.sentOn = today()
  rules.documents = files.map((file) => ({ id: crypto.randomUUID(), name: file.name }))
}

export async function saveConfirmation(programmeId: string, organisationId: string, name: string) {
  const rules = rulesByProgramme[programmeId]
  if (!rules) return

  rules.status = "live"
  rules.confirmations = rules.confirmations.map((confirmation) =>
    confirmation.organisationId === organisationId ? { ...confirmation, confirmed: { by: name, on: today() } } : confirmation,
  )
}

export async function saveChangeRequest(programmeId: string, name: string, values: AskForChangesValues) {
  const rules = rulesByProgramme[programmeId]
  if (!rules) return

  rules.status = "rules-in-progress"
  rules.changeRequest = { by: name, on: today(), part: values.part, text: values.change }
}
