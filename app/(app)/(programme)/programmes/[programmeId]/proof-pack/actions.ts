"use server"

import { revalidatePath } from "next/cache"
import { startProofPack } from "@/lib/data/proof-packs"
import { getProgrammePage } from "@/lib/programme-page"

export async function generateProofPack(programmeId: string) {
  const { session, programme } = await getProgrammePage(programmeId, "proof-pack")
  if (programme.position !== "prime") {
    return { errors: { message: ["Only the prime can generate the proof pack."] } }
  }

  const job = await startProofPack(programmeId, session.user.name)
  if (!job) {
    return { errors: { message: ["A version is already being generated."] } }
  }

  revalidatePath(`/programmes/${programmeId}`, "layout")
  return { errors: null }
}
