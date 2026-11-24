"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Drawer } from "@/components/app/drawer"
import { RadioCards } from "@/components/form/radio-cards"
import { TextareaInput } from "@/components/form/textarea-input"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { decisionLabels, partnerLabel } from "@/lib/claim-labels"
import type { ClaimItem, Decision } from "@/lib/data/claims"
import { resultLabelTags } from "@/lib/programme-labels"
import { signOffSchema, type SignOffValues } from "@/lib/validations/claims"
import { signOffResult } from "../actions"

type ReviewSignOffProps = {
  programmeId: string
  periodId: string
  periodLabel: string
  item: ClaimItem & { decision: Decision }
  askedOn: string
}

export function ReviewSignOff({ programmeId, periodId, periodLabel, item, askedOn }: ReviewSignOffProps) {
  const [open, setOpen] = useState(false)
  const formId = `sign-off-${item.resultId}`
  const labels = decisionLabels[item.decision.kind]

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signOffSchema),
    defaultValues: { outcome: "approve" as const, note: "" },
  })

  const outcome = watch("outcome")

  function openDrawer() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: SignOffValues) {
    const response = await signOffResult(programmeId, periodId, item.resultId, values)

    if (response.errors) {
      for (const [field, messages] of Object.entries(response.errors)) {
        setError(field as keyof SignOffValues, { message: messages?.[0] })
      }
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button variant="secondary" size="sm" aria-label={`Review ${item.participantRef}`} onClick={openDrawer}>
        Review
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Sign off ${item.participantRef}?`}
        description={`${item.result}, from ${partnerLabel(item.partnerName)}. In the ${periodLabel} claim.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              {outcome === "reject" ? "Reject" : "Approve"}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
          <DetailsList
            items={[
              { label: "Label", value: resultLabelTags[item.label].label },
              { label: "Why", value: item.why },
              { label: "Decision", value: labels.action },
              { label: "Asked by", value: `${item.decision.by}, ${askedOn}` },
            ]}
          />
          <blockquote className="border-l-2 border-brand-200 py-0.5 pl-4 text-sm leading-[22px] text-grey-800">
            {item.decision.reason}
          </blockquote>
          <RadioCards
            legend="Your decision"
            stacked
            options={[
              {
                value: "approve",
                label: "Approve",
                description: `It counts in the claim, marked ${labels.done}. The commissioner sees the reason.`,
              },
              { value: "reject", label: "Reject", description: "It's left out of the claim and goes back to Fixes." },
            ]}
            error={errors.outcome?.message}
            {...register("outcome")}
          />
          <TextareaInput
            label="Note"
            rows={3}
            helper="Optional when you approve. Required when you reject."
            error={errors.note?.message}
            {...register("note")}
          />
        </form>
      </Drawer>
    </>
  )
}
