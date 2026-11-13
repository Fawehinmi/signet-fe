import { z } from "zod"

export const answerQuestionSchema = z.object({
  answer: z.string().trim().min(1, "Write your answer").max(2000, "Keep it under 2,000 characters"),
  files: z.array(z.string()).max(10, "Share up to 10 files"),
})

export type AnswerQuestionValues = z.infer<typeof answerQuestionSchema>
