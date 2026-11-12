import { z } from "zod"

export const importTypes = ["participants", "support-records"] as const
export type ImportType = (typeof importTypes)[number]

export const importTypeLabels: Record<ImportType, { label: string; one: string; many: string }> = {
  participants: { label: "Participants", one: "participant", many: "participants" },
  "support-records": { label: "Support records", one: "support record", many: "support records" },
}

type ImportField = { key: string; label: string; required: boolean; date?: boolean; names: string[] }

export const importFields: Record<ImportType, ImportField[]> = {
  participants: [
    { key: "firstName", label: "First name", required: true, names: ["first name", "firstname", "forename", "given name"] },
    { key: "lastName", label: "Last name", required: true, names: ["last name", "lastname", "surname", "family name"] },
    { key: "dateOfBirth", date: true, label: "Date of birth", required: true, names: ["date of birth", "dob", "birth date"] },
    { key: "postcode", label: "Postcode", required: true, names: ["postcode", "post code", "postal code"] },
    { key: "referralDate", date: true, label: "Referral date", required: true, names: ["referral date", "ref date", "referred on"] },
  ],
  "support-records": [
    { key: "participantRef", label: "Participant ref", required: true, names: ["participant ref", "participant reference", "ref", "reference"] },
    { key: "supportDate", date: true, label: "Support date", required: true, names: ["support date", "date", "session date"] },
    { key: "supportType", label: "Type of support", required: true, names: ["type of support", "support type", "type", "activity"] },
    { key: "minutes", label: "Minutes", required: false, names: ["minutes", "duration", "length"] },
  ],
}

const maxFileSize = 5 * 1024 * 1024
const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i

export const chooseFileSchema = z.object({
  type: z.enum(importTypes, "Choose what you're importing"),
  file: z
    .file("Add a CSV file")
    .refine((file) => /\.csv$/i.test(file.name), "Upload a CSV file")
    .max(maxFileSize, "The file must be 5 MB or smaller"),
})

export type ChooseFileValues = z.infer<typeof chooseFileSchema>

export const importRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  type: z.enum(importTypes),
  headers: z.array(z.string()).min(1).max(100),
  rows: z.array(z.array(z.string())).min(1).max(20000),
  matching: z.record(z.string(), z.string()),
  saveMatching: z.boolean(),
})

export type ImportRequest = z.infer<typeof importRequestSchema>

export function matchColumnsSchema(type: ImportType) {
  return z
    .object({
      matching: z.record(z.string(), z.string()),
      saveMatching: z.boolean(),
    })
    .superRefine((values, context) => {
      const chosen = Object.values(values.matching).filter(Boolean)
      const missing = importFields[type].filter((field) => field.required && !chosen.includes(field.key))
      const doubled = importFields[type].filter((field) => chosen.filter((key) => key === field.key).length > 1)

      if (missing.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["matching"],
          message: `Match a column to ${missing.map((field) => field.label).join(", ")}`,
        })
      } else if (doubled.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["matching"],
          message: `Only one column can be ${doubled.map((field) => field.label).join(", ")}`,
        })
      }
    })
}

export type MatchColumnsValues = z.infer<ReturnType<typeof matchColumnsSchema>>

export function suggestField(type: ImportType, header: string) {
  const name = header.toLowerCase().replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim()
  return importFields[type].find((field) => field.names.includes(name))?.key ?? ""
}

function parseDate(value: string) {
  const text = value.trim()
  const uk = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const [year, month, day] = uk ? [uk[3], uk[2], uk[1]] : iso ? [iso[1], iso[2], iso[3]] : []
  if (!year) return null

  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  const valid = date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day)
  return valid ? date.toISOString().slice(0, 10) : null
}

function dateField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `Missing ${label}`)
    .refine((value) => parseDate(value) !== null, `${label.charAt(0).toUpperCase()}${label.slice(1)} not valid`)
    .transform((value) => parseDate(value) ?? value)
}

export const rowSchemas = {
  participants: z.object({
    firstName: z.string().trim().min(1, "Missing first name"),
    lastName: z.string().trim().min(1, "Missing last name"),
    dateOfBirth: dateField("date of birth"),
    postcode: z.string().trim().min(1, "Missing postcode").regex(postcodePattern, "Postcode not valid"),
    referralDate: dateField("referral date"),
  }),
  "support-records": z.object({
    participantRef: z.string().trim().min(1, "Missing participant ref"),
    supportDate: dateField("support date"),
    supportType: z.string().trim().min(1, "Missing type of support"),
    minutes: z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d+$/.test(value), "Minutes not valid"),
  }),
}

function fixFor(problem: string) {
  if (problem === "Possible duplicate") return "This person appears more than once in your file."
  if (problem.startsWith("Missing ")) return `Add the ${problem.slice(8)} in your file.`
  return `Check the ${problem.replace(" not valid", "").toLowerCase()} in your file.`
}

export type CheckedRow = { row: number; values: Record<string, string> }
export type ProblemRow = CheckedRow & { problem: string; fix: string }

export function checkRows(type: ImportType, headers: string[], rows: string[][], matching: Record<string, string>) {
  const ready: CheckedRow[] = []
  const problems: ProblemRow[] = []
  const seen = new Set<string>()

  rows.forEach((cells, index) => {
    const mapped: Record<string, string> = {}
    headers.forEach((_, column) => {
      const field = matching[`col${column}`]
      if (field) mapped[field] = cells[column] ?? ""
    })

    const row = index + 2
    const parsed = rowSchemas[type].safeParse(mapped)

    if (!parsed.success) {
      const problem = parsed.error.issues[0]?.message ?? "Row not valid"
      problems.push({ row, values: mapped, problem, fix: fixFor(problem) })
      return
    }

    const values = parsed.data as Record<string, string>
    const key = type === "participants" ? `${values.firstName}|${values.lastName}|${values.dateOfBirth}`.toLowerCase() : ""

    if (key && seen.has(key)) {
      problems.push({ row, values: mapped, problem: "Possible duplicate", fix: fixFor("Possible duplicate") })
      return
    }

    if (key) seen.add(key)
    ready.push({ row, values })
  })

  return { ready, problems }
}
