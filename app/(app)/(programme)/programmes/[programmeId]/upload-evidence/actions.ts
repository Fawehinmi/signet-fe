"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getClaimPeriods } from "@/lib/data/claims"
import { getUpload, getUploadPool, saveUnmatchedMatch, saveUpload } from "@/lib/data/evidence"
import { claimParticipants } from "@/lib/data/participants"
import { claimResults } from "@/lib/data/results"
import { evidenceTypes, participantsInScope } from "@/lib/evidence-matching"
import { getProgrammePage } from "@/lib/programme-page"
import {
  evidenceFilesSchema,
  fileMatchSchema,
  uploadRequestSchema,
  type FileMatchValues,
  type UploadScope,
} from "@/lib/validations/evidence"

function readRequest(value: FormDataEntryValue | null) {
  try {
    return typeof value === "string" ? JSON.parse(value) : null
  } catch {
    return null
  }
}

async function claimCaseload(programmeId: string, refs: string[], caseworker: string) {
  const claimed = await claimParticipants(programmeId, [...new Set(refs)], caseworker)
  await claimResults(programmeId, claimed, caseworker)
}

function cleanScope(scope: UploadScope): UploadScope {
  if (scope.kind === "programme") return { kind: "programme", periodId: "", who: "all", participantRefs: [] }
  if (scope.kind === "participant") return { kind: "participant", periodId: "", who: "some", participantRefs: scope.participantRefs }
  return scope
}

export async function uploadEvidence(programmeId: string, formData: FormData) {
  const { session, programme } = await getProgrammePage(programmeId, "upload-evidence")

  const request = uploadRequestSchema.safeParse(readRequest(formData.get("request")))
  const files = evidenceFilesSchema.safeParse(formData.getAll("files"))
  if (!request.success || !files.success || request.data.matches.length !== files.data.length) {
    return { error: "These files can't be added. Go back and check them." }
  }

  const { matches, unmatched } = request.data
  const scope = cleanScope(request.data.scope)
  const periods = await getClaimPeriods(programmeId)
  if (scope.kind === "month" && !periods.some((period) => period.id === scope.periodId)) {
    return { error: "Choose a month from the programme's claim periods." }
  }

  const caseload = await getUploadPool(programmeId)
  const allowed = participantsInScope(caseload, scope).map((participant) => participant.ref)
  const outside = matches.some((match) => !allowed.includes(match.participantRef))
  const unknownType = matches.some((match) => !evidenceTypes.some((type) => type.label === match.evidenceType))
  const unknownPeople =
    scope.kind !== "programme" && scope.participantRefs.some((ref) => !caseload.some((participant) => participant.ref === ref))

  if (outside || unknownType || unknownPeople) {
    return { error: "Some files are matched to people outside this upload. Go back and check them." }
  }

  const upload = await saveUpload(programmeId, {
    uploadedBy: session.user.name,
    scope,
    files: files.data.map((file, index) => ({ name: file.name, size: file.size, ...matches[index] })),
    unmatched,
  })
  if (programme.jobRole === "caseworker") await claimCaseload(programmeId, matches.map((match) => match.participantRef), session.user.name)

  revalidatePath(`/programmes/${programmeId}`, "layout")
  redirect(`/programmes/${programmeId}/upload-evidence/${upload.id}`)
}

export async function matchUnmatched(programmeId: string, uploadId: string, fileName: string, values: FileMatchValues) {
  const { session, programme } = await getProgrammePage(programmeId, "upload-evidence")

  const upload = await getUpload(programmeId, uploadId)
  if (!upload || upload.uploadedBy !== session.user.name || !upload.unmatched.some((file) => file.name === fileName)) {
    return { error: "This file can't be matched now. Refresh the page to see the latest." }
  }

  const parsed = fileMatchSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Choose a participant, an evidence type and a result." }
  }

  const caseload = await getUploadPool(programmeId)
  const allowed = participantsInScope(caseload, upload.scope).some((participant) => participant.ref === parsed.data.participantRef)
  const knownType = evidenceTypes.some((type) => type.label === parsed.data.evidenceType)

  if (!allowed || !knownType) {
    return { error: "Choose someone this upload was for." }
  }

  await saveUnmatchedMatch(programmeId, uploadId, fileName, parsed.data)
  if (programme.jobRole === "caseworker") await claimCaseload(programmeId, [parsed.data.participantRef], session.user.name)
  revalidatePath(`/programmes/${programmeId}`, "layout")

  return { error: null }
}
