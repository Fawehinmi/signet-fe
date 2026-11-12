import { toCsv } from "@/lib/csv"
import { getImport } from "@/lib/data/imports"
import { canOpen, findProgramme } from "@/lib/navigation"
import { getSession } from "@/lib/session"

type ProblemsContext = {
  params: Promise<{ programmeId: string; importId: string }>
}

export async function GET(_request: Request, { params }: ProblemsContext) {
  const { programmeId, importId } = await params

  const session = await getSession()
  const programme = session ? findProgramme(session, programmeId) : undefined
  if (!session || !programme || !canOpen(session, programme, "imports")) {
    return new Response("Not found", { status: 404 })
  }

  const record = await getImport(programmeId, importId)
  if (!record) {
    return new Response("Not found", { status: 404 })
  }

  const csv = toCsv([
    ["Row", "Problem", "How to fix"],
    ...record.problems.map((problem) => [problem.row, problem.problem, problem.fix]),
  ])

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${record.fileName.replace(/\.csv$/i, "")}_problems.csv"`,
    },
  })
}
