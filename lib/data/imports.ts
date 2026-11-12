import type { ImportType } from "@/lib/validations/imports"

export type ImportProblem = {
  row: number
  problem: string
  fix: string
}

export type ImportRecord = {
  id: string
  fileName: string
  type: ImportType
  importedBy: string
  on: string
  rowsAdded: number
  problems: ImportProblem[]
}

const importsByProgramme: Record<string, ImportRecord[]> = {
  "ctw-northshire": [
    {
      id: "imp-0729",
      fileName: "meridian_referrals_jul.csv",
      type: "participants",
      importedBy: "Marcus Webb",
      on: "2027-07-29T10:05:00Z",
      rowsAdded: 18,
      problems: [],
    },
    {
      id: "imp-0827",
      fileName: "meridian_referrals_aug.csv",
      type: "participants",
      importedBy: "Marcus Webb",
      on: "2027-08-27T13:40:00Z",
      rowsAdded: 22,
      problems: [{ row: 9, problem: "Missing date of birth", fix: "Add the date of birth in your file." }],
    },
    {
      id: "imp-0903",
      fileName: "meridian_support_aug.csv",
      type: "support-records",
      importedBy: "Marcus Webb",
      on: "2027-09-03T09:12:00Z",
      rowsAdded: 96,
      problems: [],
    },
  ],
}

const savedMatchings: Record<string, Record<string, string>> = {}
const ownDelivery: { ref: string; programmeId: string; type: ImportType; values: Record<string, string> }[] = []
const viewLog: { programmeId: string; viewedBy: string; fileName: string; on: string }[] = []

export async function getImports(programmeId: string) {
  return [...(importsByProgramme[programmeId] ?? [])].reverse()
}

export async function getImport(programmeId: string, importId: string) {
  return (importsByProgramme[programmeId] ?? []).find((item) => item.id === importId) ?? null
}

export async function getSavedMatching(programmeId: string, type: ImportType) {
  return savedMatchings[`${programmeId}:${type}`] ?? {}
}

export async function logPreviewViewed(programmeId: string, viewedBy: string, fileName: string) {
  viewLog.push({ programmeId, viewedBy, fileName, on: new Date().toISOString() })
}

type SaveImportValues = {
  fileName: string
  type: ImportType
  importedBy: string
  rows: Record<string, string>[]
  problems: ImportProblem[]
  matching?: Record<string, string>
}

export async function saveImport(programmeId: string, values: SaveImportValues) {
  const record: ImportRecord = {
    id: crypto.randomUUID(),
    fileName: values.fileName,
    type: values.type,
    importedBy: values.importedBy,
    on: new Date().toISOString(),
    rowsAdded: values.rows.length,
    problems: values.problems,
  }

  importsByProgramme[programmeId] = [...(importsByProgramme[programmeId] ?? []), record]

  values.rows.forEach((row) => {
    ownDelivery.push({
      ref: `OD-${String(ownDelivery.length + 1).padStart(4, "0")}`,
      programmeId,
      type: values.type,
      values: row,
    })
  })

  if (values.matching) {
    savedMatchings[`${programmeId}:${values.type}`] = values.matching
  }

  return record
}
