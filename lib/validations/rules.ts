import { z } from "zod"

const pdfOrWord = /\.(pdf|docx?)$/i
const maxFileSize = 10 * 1024 * 1024

function contractFile(missingMessage: string) {
  return z
    .file(missingMessage)
    .refine((file) => pdfOrWord.test(file.name), "Upload a PDF or Word file")
    .max(maxFileSize, "The file must be 10 MB or smaller")
}

export const contractDocumentsSchema = z.object({
  contract: contractFile("Add the contract"),
  deliveryPlan: contractFile("Add the delivery plan"),
  schedules: contractFile("Upload a PDF or Word file").optional(),
})

export const askForChangesSchema = z.object({
  part: z.string(),
  change: z.string().trim().min(1, "Tell us what needs to change").max(2000, "Keep it under 2,000 characters"),
})

export const confirmRulesSchema = z.object({
  confirmed: z.boolean().refine((value) => value, "Tick the box to confirm you've read the rules"),
})

export type ContractDocumentsValues = z.infer<typeof contractDocumentsSchema>
export type AskForChangesValues = z.infer<typeof askForChangesSchema>
export type ConfirmRulesValues = z.infer<typeof confirmRulesSchema>
