"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Drawer } from "@/components/app/drawer"
import { RadioCards } from "@/components/form/radio-cards"
import { TextareaInput } from "@/components/form/textarea-input"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { resultLabelTags } from "@/lib/programme-labels"
import { checkResultSchema, type CheckResultValues } from "@/lib/validations/claims"
import { checkResult } from "../actions"
import type { FixRow } from "./to-fix-table"

type CheckDrawerProps = {
  programmeId: string
  row: FixRow
  onClose: () => void
}

export function CheckDrawer({ programmeId, row, onClose }: CheckDrawerProps) {
  const check = row.check
  const sender = check?.by ?? "the caseworker"
  const claim = row.claim ? `the ${row.claim.label} claim` : "the next claim"

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkResultSchema),
    defaultValues: { outcome: "accept-as-is", reason: "" },
  })
  const accepting = watch("outcome") === "accept-as-is"

  async function onSubmit(values: CheckResultValues) {
    const response = await checkResult(programmeId, row.id, values)

    if (response.errors) {
      setError("reason", { message: Object.values(response.errors).flat()[0] })
      return
    }

    onClose()
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={`Check ${row.name ?? row.participantRef}'s ${row.noun}`}
      description={`${row.participantRef}, own delivery. Sent by ${sender} on ${check?.on}.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="check-form" loading={isSubmitting}>
            {accepting ? "Accept as is" : "Send back"}
          </Button>
        </>
      }
    >
      <form id="check-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        {check?.note && (
          <blockquote className="rounded-lg border-l-4 border-brand-300 bg-grey-50 px-4 py-3 text-sm leading-[22px] text-grey-800">
            &ldquo;{check.note}&rdquo;
          </blockquote>
        )}
        <DetailsList
          items={[
            { label: "Label", value: resultLabelTags[row.label].label },
            { label: "Reason", value: row.why || resultLabelTags[row.label].label },
            { label: "Evidence on file", value: check?.evidence.length ? check.evidence.join(". ") : "Nothing uploaded yet" },
            { label: "Claim", value: row.claim ? `${row.claim.label}, send by ${row.claim.sendBy}` : "Next claim, once it's ready" },
          ]}
        />
        <RadioCards
          legend="What do you want to do?"
          stacked
          options={[
            {
              value: "accept-as-is",
              label: "Accept as is",
              description: `It goes in ${claim}, marked Accepted as is. A Sign-off holder must approve it.`,
            },
            { value: "send-back", label: `Send back to ${sender}`, description: `It stays in Fixes. ${sender} sees your reason.` },
          ]}
          error={errors.outcome?.message}
          {...register("outcome")}
        />
        <TextareaInput
          label="Reason"
          rows={3}
          helper={accepting ? "Required. If you accept, the commissioner sees this reason." : `Required. ${sender} sees this reason.`}
          error={errors.reason?.message}
          {...register("reason")}
        />
      </form>
    </Drawer>
  )
}
