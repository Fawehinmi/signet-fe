import { addDays, today } from "@/lib/format"
import type { ResultKind } from "@/lib/result-checks"
import type { AnswerQuestionValues } from "@/lib/validations/questions"

export type CommissionerQuestion = {
  id: string
  askedBy: string
  organisation: string
  askedOn: string
  question: string
  participantRef: string
  result: ResultKind
  periodId: string
  files: string[]
  answer?: { text: string; by: string; on: string; files: string[]; accessEndsOn: string }
}

const questionsByProgramme: Record<string, CommissionerQuestion[]> = {
  "ctw-northshire": [
    {
      id: "q-0912",
      askedBy: "Emma Lawson",
      organisation: "Northshire Strategic Authority",
      askedOn: "2027-09-12",
      question: "Can you confirm the start date for NS-0187? The start form and the referral don't match.",
      participantRef: "NS-0187",
      result: "Start",
      periodId: "2027-08",
      files: ["NS-0187_start_form.pdf", "NS-0187_referral_letter.pdf"],
    },
    {
      id: "q-0911",
      askedBy: "Emma Lawson",
      organisation: "Northshire Strategic Authority",
      askedOn: "2027-09-11",
      question: "Is NS-0416's employer the same one named on the payslips?",
      participantRef: "NS-0416",
      result: "Job outcome",
      periodId: "2027-08",
      files: ["NS-0416_employer_letter.pdf", "NS-0416_payslip_aug.pdf"],
      answer: {
        text: "Yes. Both are from Northgate Logistics. The signed letter confirms 13 weeks of work from 2 Jun 2027.",
        by: "Ruth Adeyemi",
        on: "2027-09-11",
        files: ["NS-0416_employer_letter.pdf"],
        accessEndsOn: "2027-09-25",
      },
    },
  ],
}

export const accessDays = 14

export async function getQuestions(programmeId: string) {
  return [...(questionsByProgramme[programmeId] ?? [])].sort(
    (a, b) => Number(Boolean(a.answer)) - Number(Boolean(b.answer)) || b.askedOn.localeCompare(a.askedOn),
  )
}

export async function getQuestion(programmeId: string, questionId: string) {
  return (questionsByProgramme[programmeId] ?? []).find((question) => question.id === questionId) ?? null
}

export async function saveAnswer(programmeId: string, questionId: string, values: AnswerQuestionValues, by: string) {
  const question = await getQuestion(programmeId, questionId)
  if (!question) return

  question.answer = { text: values.answer, by, on: today(), files: values.files, accessEndsOn: addDays(today(), accessDays) }
}
