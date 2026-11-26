import { getProgrammeDetails } from "@/lib/data/programmes"
import { getProofPackVersion } from "@/lib/data/proof-packs"
import { canOpen, findProgramme } from "@/lib/navigation"
import { proofPackPdf } from "@/lib/proof-pack-document"
import { getSession } from "@/lib/session"
import { proofPackVersionSchema } from "@/lib/validations/proof-pack"

type DownloadContext = {
  params: Promise<{ programmeId: string }>
}

export async function GET(request: Request, { params }: DownloadContext) {
  const { programmeId } = await params
  const parsed = proofPackVersionSchema.safeParse(new URL(request.url).searchParams.get("version"))

  const session = await getSession()
  const programme = session ? findProgramme(session, programmeId) : undefined
  if (
    !parsed.success ||
    !session?.organisation ||
    !programme ||
    programme.position !== "prime" ||
    !canOpen(session, programme, "proof-pack")
  ) {
    return new Response("Not found", { status: 404 })
  }

  const version = await getProofPackVersion(programmeId, parsed.data)
  if (!version) {
    return new Response("Not found", { status: 404 })
  }

  const details = await getProgrammeDetails(programmeId)
  const pdf = proofPackPdf({
    programme: programme.name,
    prime: session.organisation.name,
    commissioner: details?.commissioner ?? "",
    version,
  })

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${programmeId}-proof-pack-version-${version.version}.pdf"`,
    },
  })
}
