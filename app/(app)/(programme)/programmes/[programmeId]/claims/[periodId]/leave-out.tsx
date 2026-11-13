"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@/components/app/dialog"
import { RadioCards } from "@/components/form/radio-cards"
import { TextareaInput } from "@/components/form/textarea-input"
import { Button } from "@/components/ui/button"
import { leaveOutSchema, type LeaveOutValues } from "@/lib/validations/claims"
import { leaveOutResult } from "../actions"

type LeaveOutProps = {
  programmeId: string
  periodId: string
  periodLabel: string
  nextPeriodLabel: string | null
  item: { resultId: string; participantRef: string }
}

export function LeaveOut({ programmeId, periodId, periodLabel, nextPeriodLabel, item }: LeaveOutProps) {
  const [open, setOpen] = useState(false)
  const formId = `leave-out-${item.resultId}`

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(leaveOutSchema),
    defaultValues: { to: "to-fix" as const, reason: "" },
  })

  function openDialog() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: LeaveOutValues) {
    const response = await leaveOutResult(programmeId, periodId, item.resultId, values)

    if (response.errors) {
      for (const [field, messages] of Object.entries(response.errors)) {
        setError(field as keyof LeaveOutValues, { message: messages?.[0] })
      }
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button variant="text" size="sm" aria-label={`Leave out ${item.participantRef}`} onClick={openDialog}>
        Leave out
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Leave ${item.participantRef} out?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              Leave out
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            It won&apos;t be in the {periodLabel} claim, and it doesn&apos;t need Sign-off.
          </p>
          <RadioCards
            legend="What happens to it?"
            stacked
            options={[
              { value: "to-fix", label: "Back to To fix", description: "Keep chasing it. It goes in the next claim once it's ready." },
              ...(nextPeriodLabel
                ? [
                    {
                      value: "next-month",
                      label: `Move to the ${nextPeriodLabel} claim`,
                      description: `It goes in the ${nextPeriodLabel} claim, ready or not.`,
                    },
                  ]
                : []),
            ]}
            error={errors.to?.message}
            {...register("to")}
          />
          <TextareaInput
            label="Reason"
            rows={3}
            helper="Required. Only your team sees this."
            error={errors.reason?.message}
            {...register("reason")}
          />
        </form>
      </Dialog>
    </>
  )
}
