import { z } from "zod"

const reason = z.string().trim().min(1, "Give a reason").max(1000, "Keep it under 1,000 characters")

export const chaseSchema = z.object({
  resultIds: z.array(z.string()).min(1, "Choose at least one result").max(50, "Choose up to 50 results"),
  message: z.string().trim().min(1, "Say what's needed").max(1000, "Keep it under 1,000 characters"),
})

export const decideResultSchema = z.object({
  kind: z.enum(["accept-as-is", "challenge"], "Choose a decision"),
  reason,
})

export const leaveOutSchema = z.object({
  to: z.enum(["to-fix", "next-month"], "Choose what happens to it"),
  reason,
})

export const signOffSchema = z
  .object({
    outcome: z.enum(["approve", "reject"], "Choose approve or reject"),
    note: z.string().trim().max(1000, "Keep it under 1,000 characters"),
  })
  .superRefine((values, context) => {
    if (values.outcome === "reject" && !values.note) {
      context.addIssue({ code: "custom", path: ["note"], message: "Say why you're rejecting it" })
    }
  })

export const submitClaimSchema = z.object({
  confirmed: z.boolean().refine((value) => value, "Tick the box to confirm you've checked the claim"),
})

export type ChaseValues = z.infer<typeof chaseSchema>
export type DecideResultValues = z.infer<typeof decideResultSchema>
export type LeaveOutValues = z.infer<typeof leaveOutSchema>
export type SignOffValues = z.infer<typeof signOffSchema>
export type SubmitClaimValues = z.infer<typeof submitClaimSchema>
