"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "lucide-react"
import { Drawer } from "@/components/app/drawer"
import { Checkbox } from "@/components/form/checkbox"
import { TextareaInput } from "@/components/form/textarea-input"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { answerQuestionSchema, type AnswerQuestionValues } from "@/lib/validations/questions"
import { answerQuestion } from "./actions"

type AnswerQuestionProps = {
  programmeId: string
  question: { id: string; askedBy: string; organisation: string; question: string; about: string; files: string[] }
  accessDays: number
}

export function AnswerQuestion({ programmeId, question, accessDays }: AnswerQuestionProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(answerQuestionSchema),
    defaultValues: { answer: "", files: [] as string[] },
  })

  function openDrawer() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: AnswerQuestionValues) {
    const response = await answerQuestion(programmeId, question.id, values)

    if (response.errors) {
      for (const [field, messages] of Object.entries(response.errors)) {
        setError(field as keyof AnswerQuestionValues, { message: messages?.[0] })
      }
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={openDrawer}>
        Answer
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Answer ${question.askedBy}`}
        description={`${question.organisation}. About ${question.about}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={`answer-${question.id}`} loading={isSubmitting}>
              Send answer
            </Button>
          </>
        }
      >
        <form id={`answer-${question.id}`} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
          <blockquote className="border-l-2 border-brand-200 py-0.5 pl-4 text-sm leading-[22px] text-grey-800">
            {question.question}
          </blockquote>
          <TextareaInput label="Your answer" rows={4} error={errors.answer?.message} {...register("answer")} />
          {question.files.length > 0 && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-semibold text-grey-900">Share files (optional)</legend>
              {question.files.map((file) => (
                <Checkbox key={file} label={file} value={file} {...register("files")} />
              ))}
              {errors.files?.message && <p className="text-xs text-danger-700">{errors.files.message}</p>}
            </fieldset>
          )}
          <Banner icon={Lock} title={`They can view these for ${accessDays} days`}>
            Read only. They can&apos;t download them, and nothing else is shared.
          </Banner>
        </form>
      </Drawer>
    </>
  )
}
