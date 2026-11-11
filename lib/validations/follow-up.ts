import { z } from "zod"

export const followUpSchema = z.object({
    type: z.enum(["follow-up", "more-detail"]),
    about: z.string().min(1, "Choose what it's about"),
    message: z.string().trim().min(1, "Write a message").max(2000, "Keep it under 2,000 characters"),
})

export type FollowUpValues = z.infer<typeof followUpSchema>