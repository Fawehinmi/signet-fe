"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@/components/app/dialog"
import { RadioGroup } from "@/components/form/radio-group"
import { TextareaInput } from "@/components/form/textarea-input"
import { Button } from "@/components/ui/button"
import { leaveOutSchema, type LeaveOutValues } from "@/lib/validations/claims"
import { leaveOutResult } from "../actions"

type LeaveOutProps = {
  programmeId: string
  claimId: string
  periodLabel: string
  nextPeriodLabel?: string
  result: { id: string; participantRef: string; partnerName: string | null }
}

export function LeaveOut({ programmeId, claimId, periodLabel, nextPeriodLabel, result }: LeaveOutProps) {
  const [open, setOpen] = useState(false)
  const formId = `leave-out-${result.id}`

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeaveOutValues>({
    resolver: zodResolver(leaveOutSchema),
    defaultValues: { to: "next-month", reason: "" },
  })

  function openDialog() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: LeaveOutValues) {
    const response = await leaveOutResult(programmeId, claimId, result.id, values)

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
      <Button variant="text" size="sm" aria-label={`Leave out ${result.participantRef}`} onClick={openDialog}>
        Leave out
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Leave out ${result.participantRef}?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              Leave out result
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            It won&apos;t be in the {periodLabel} claim. We&apos;ll tell {result.partnerName ?? "partner"} why.
          </p>
          <RadioGroup
            legend="What happens to it?"
            options={[
              {
                value: "next-month",
                label: nextPeriodLabel ? `Move it to the ${nextPeriodLabel} claim` : "Move it to the next claim",
              },
              { value: "to-fix", label: `Return it to ${result.partnerName ?? "partner"}` },
            ]}
            error={errors.to?.message}
            {...register("to")}
          />
          <TextareaInput
            label="Reason"
            rows={3}
            helper={`Required. ${result.partnerName ?? "Partner"} will see this.`}
            error={errors.reason?.message}
            {...register("reason")}
          />
        </form>
      </Dialog>
    </>
  )
}
