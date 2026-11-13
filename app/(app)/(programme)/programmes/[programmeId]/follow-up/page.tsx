import { MessageSquare } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { EmptyState } from "@/components/ui/empty-state"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { getClaimPeriods } from "@/lib/data/claims"
import { accessDays, getQuestions } from "@/lib/data/questions"
import { formatDate, plural } from "@/lib/format"
import { getProgrammePage } from "@/lib/programme-page"
import { AnswerQuestion } from "./answer-question"
import { ViewAnswer } from "./view-answer"

type FollowUpPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function FollowUpPage({ params }: FollowUpPageProps) {
  const { programmeId } = await params
  const { programme } = await getProgrammePage(programmeId, "follow-up")

  const [questions, periods] = await Promise.all([getQuestions(programmeId), getClaimPeriods(programmeId)])
  const canAnswer = programme.jobRole === "compliance-lead"
  const waiting = questions.filter((question) => !question.answer).length

  return (
    <>
      <PageHeader title="Follow up" description="Questions from the commissioner about your claims." />
      {questions.length > 0 ? (
        <Columns
          main={
            <Section title="Questions from the commissioner" count={waiting > 0 ? waiting : undefined}>
              <Table>
                <thead>
                  <tr>
                    <Th>Question</Th>
                    <Th>About</Th>
                    <Th>Status</Th>
                    <Th>
                      <span className="sr-only">Actions</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => {
                    const month = periods.find((period) => period.id === question.periodId)?.label ?? question.periodId
                    const about = `${question.participantRef}, ${month} claim`
                    const details = {
                      id: question.id,
                      askedBy: question.askedBy,
                      organisation: question.organisation,
                      question: question.question,
                      about,
                      files: question.files,
                    }

                    return (
                      <tr key={question.id}>
                        <Td className="min-w-[260px] whitespace-normal py-3">
                          <p className="text-grey-900">{question.question}</p>
                          <p className="text-xs text-grey-700">
                            {question.askedBy}, {formatDate(question.askedOn)}
                          </p>
                        </Td>
                        <Td>
                          <p className="font-semibold text-grey-900">{question.participantRef}</p>
                          <p className="text-xs text-grey-700">{month} claim</p>
                        </Td>
                        <Td>
                          {question.answer ? <Tag tone="ok">Answered</Tag> : <Tag tone="warn">Waiting for you</Tag>}
                        </Td>
                        <Td className="text-right">
                          {question.answer ? (
                            <ViewAnswer
                              question={details}
                              answer={{
                                ...question.answer,
                                on: formatDate(question.answer.on),
                                accessEndsOn: formatDate(question.answer.accessEndsOn),
                              }}
                            />
                          ) : (
                            canAnswer && <AnswerQuestion programmeId={programmeId} question={details} accessDays={accessDays} />
                          )}
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
              <p className="mt-3 text-[13px] text-grey-700">Showing {plural(questions.length, "question")}</p>
            </Section>
          }
          side={
            <Section title="Sharing">
              <p className="text-sm leading-[22px] text-grey-800">
                {canAnswer ? "Answer directly. You choose" : "The Compliance lead answers and chooses"} what to share.
                The commissioner can only view it, and access ends after {accessDays} days.
              </p>
            </Section>
          }
        />
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No questions yet"
          description="When the commissioner asks about a claim, the question shows here."
        />
      )}
    </>
  )
}
