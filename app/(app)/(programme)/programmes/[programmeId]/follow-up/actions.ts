"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getQuestion, saveAnswer } from "@/lib/data/questions"
import { getProgrammePage } from "@/lib/programme-page"
import { answerQuestionSchema, type AnswerQuestionValues } from "@/lib/validations/questions"

export async function answerQuestion(programmeId: string, questionId: string, values: AnswerQuestionValues) {
  const { session, programme } = await getProgrammePage(programmeId, "follow-up")

  const question = await getQuestion(programmeId, questionId)
  if (programme.jobRole !== "compliance-lead" || !question || question.answer) {
    return { errors: { answer: ["You can't answer this question now. Refresh the page to see the latest."] } }
  }

  const parsed = answerQuestionSchema.safeParse(values)
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  if (parsed.data.files.some((file) => !question.files.includes(file))) {
    return { errors: { files: ["Only share files for this result."] } }
  }

  await saveAnswer(programmeId, questionId, parsed.data, session.user.name)
  revalidatePath(`/programmes/${programmeId}/follow-up`)

  return { errors: null }
}
