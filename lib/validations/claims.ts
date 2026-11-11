import { z } from "zod"

export const leaveOutSchema = z.object({
  action: z.enum(["move", "return"], "Choose what happens to it"),
  reason: z.string().trim().min(1, "Give a reason").max(1000, "Keep it under 1,000 characters"),
})

export const submitClaimSchema = z.object({
  confirmed: z.boolean().refine((value) => value, "Tick the box to confirm you've checked the claim"),
})

export const sendByDateSchema = z.object({
  sendBy: z.string().min(1, "Enter a send-by date"),
})

export type LeaveOutValues = z.infer<typeof leaveOutSchema>
export type SubmitClaimValues = z.infer<typeof submitClaimSchema>
export type SendByDateValues = z.infer<typeof sendByDateSchema>
