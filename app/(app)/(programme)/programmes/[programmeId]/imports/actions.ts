"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logPreviewViewed, saveImport } from "@/lib/data/imports"
import { getProgrammePage } from "@/lib/programme-page"
import { checkRows, importRequestSchema, matchColumnsSchema, type ImportRequest } from "@/lib/validations/imports"

export async function logPreview(programmeId: string, fileName: string) {
  const { session } = await getProgrammePage(programmeId, "imports")
  await logPreviewViewed(programmeId, session.user.name, fileName)
}

export async function runImport(programmeId: string, values: ImportRequest) {
  const { session } = await getProgrammePage(programmeId, "imports")

  const parsed = importRequestSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "This file can't be imported. Go back and check it." }
  }

  const { fileName, type, headers, rows, matching, saveMatching } = parsed.data

  if (!matchColumnsSchema(type).safeParse({ matching, saveMatching }).success) {
    return { error: "Match the required columns before you import." }
  }

  const { ready, problems } = checkRows(type, headers, rows, matching)
  if (ready.length === 0) {
    return { error: "No rows are ready to add." }
  }

  const savedMatching = Object.fromEntries(
    headers.map((header, index) => [header, matching[`col${index}`] ?? ""]).filter(([, field]) => field),
  )

  const record = await saveImport(programmeId, {
    fileName,
    type,
    importedBy: session.user.name,
    rows: ready.map((row) => row.values),
    problems: problems.map(({ row, problem, fix }) => ({ row, problem, fix })),
    matching: saveMatching ? savedMatching : undefined,
  })

  revalidatePath(`/programmes/${programmeId}/imports`, "layout")
  redirect(`/programmes/${programmeId}/imports/${record.id}`)
}
