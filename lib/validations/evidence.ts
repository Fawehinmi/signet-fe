import { z } from "zod"

const allowedFile = /\.(pdf|jpe?g|png|heic|docx?)$/i
const maxFileSize = 10 * 1024 * 1024
const maxTotalSize = 30 * 1024 * 1024

export const evidenceResults = ["Start", "Job outcome"] as const
export type EvidenceResult = (typeof evidenceResults)[number]

export const uploadScopeSchema = z
  .object({
    kind: z.enum(["participant", "month", "programme"], "Choose what the upload is for"),
    periodId: z.string(),
    who: z.enum(["all", "some"]),
    participantRefs: z.array(z.string()),
  })
  .superRefine((scope, context) => {
    if (scope.kind === "participant" && scope.participantRefs.length !== 1) {
      context.addIssue({ code: "custom", path: ["participantRefs"], message: "Choose a participant" })
    }
    if (scope.kind === "month" && !scope.periodId) {
      context.addIssue({ code: "custom", path: ["periodId"], message: "Choose a month" })
    }
    if (scope.kind === "month" && scope.who === "some" && scope.participantRefs.length === 0) {
      context.addIssue({ code: "custom", path: ["participantRefs"], message: "Choose at least one participant" })
    }
  })

export type UploadScope = z.infer<typeof uploadScopeSchema>

export const evidenceFileSchema = z
  .file("Add a file")
  .refine((file) => allowedFile.test(file.name), "Upload a PDF, photo or Word file")
  .max(maxFileSize, "Each file must be 10 MB or smaller")

export const evidenceFilesSchema = z
  .array(evidenceFileSchema)
  .min(1, "Add at least one file")
  .max(20, "Add up to 20 files at a time")
  .refine((files) => files.reduce((total, file) => total + file.size, 0) <= maxTotalSize, "Files must add up to 30 MB or less")

export const fileMatchSchema = z.object({
  participantRef: z.string().min(1, "Choose a participant"),
  evidenceType: z.string().min(1, "Choose an evidence type"),
  result: z.enum(evidenceResults, "Choose a result"),
})

export type FileMatchValues = z.infer<typeof fileMatchSchema>

export const uploadRequestSchema = z.object({
  scope: uploadScopeSchema,
  matches: z.array(fileMatchSchema).min(1),
  unmatched: z
    .array(z.object({ name: z.string().max(255), size: z.number().int().min(0), reason: z.string().max(300) }))
    .max(20),
})

export type UploadRequest = z.infer<typeof uploadRequestSchema>
