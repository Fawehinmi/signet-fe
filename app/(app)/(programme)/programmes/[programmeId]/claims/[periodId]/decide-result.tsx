"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@/components/app/dialog"
import { TextareaInput } from "@/components/form/textarea-input"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { resultLabelTags, type ResultLabel } from "@/lib/programme-labels"
import { decideResultSchema, type DecideResultValues } from "@/lib/validations/claims"
import { decideResult } from "../actions"

type DecideResultProps = {
  programmeId: string
  periodId: string
  item: { resultId: string; participantRef: string; label: ResultLabel; why: string }
}

export function DecideResult({ programmeId, periodId, item }: DecideResultProps) {
  const [open, setOpen] = useState(false)
  const kind = item.label === "cannot-be-claimed" ? "challenge" : "accept-as-is"
  const formId = `decide-${item.resultId}`

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(decideResultSchema),
    defaultValues: { kind, reason: "" },
  })

  function openDialog() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: DecideResultValues) {
    const response = await decideResult(programmeId, periodId, item.resultId, values)

    if (response.errors) {
      setError("reason", { message: Object.values(response.errors).flat()[0] })
      return
    }

    setOpen(false)
  }

  const challenge = kind === "challenge"

  return (
    <>
      <Button variant="secondary" size="sm" aria-label={`${challenge ? "Challenge" : "Accept as is"} ${item.participantRef}`} onClick={openDialog}>
        {challenge ? "Challenge" : "Accept as is"}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={challenge ? `Challenge ${item.participantRef}'s label?` : `Accept ${item.participantRef} as is?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              Send for Sign-off
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            It goes in the claim, marked {challenge ? "Challenged" : "Accepted as is"}. A Sign-off holder must approve it
            before you can submit. That can&apos;t be you.
          </p>
          <DetailsList
            items={[
              { label: "Label", value: resultLabelTags[item.label].label },
              { label: "Why", value: item.why },
            ]}
          />
          <TextareaInput
            label="Reason"
            rows={3}
            helper="Required. The commissioner sees this reason."
            error={errors.reason?.message}
            {...register("reason")}
          />
        </form>
      </Dialog>
    </>
  )
}
