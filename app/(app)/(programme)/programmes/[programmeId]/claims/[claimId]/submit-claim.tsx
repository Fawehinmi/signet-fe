"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@/components/app/dialog"
import { Checkbox } from "@/components/form/checkbox"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { submitClaimSchema, type SubmitClaimValues } from "@/lib/validations/claims"
import { submitClaim } from "../actions"

type SubmitClaimProps = {
  programmeId: string
  claimId: string
  periodLabel: string
  commissioner: string
  version: number
  asAt: string
  results: number
}

export function SubmitClaim({ programmeId, claimId, periodLabel, commissioner, version, asAt, results }: SubmitClaimProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(submitClaimSchema),
    defaultValues: { confirmed: false },
  })

  function openDialog() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: SubmitClaimValues) {
    const result = await submitClaim(programmeId, claimId, values)

    if (result?.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof SubmitClaimValues, { message: messages?.[0] })
      }
    }
  }

  return (
    <>
      <Button onClick={openDialog}>Submit claim</Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Submit the ${periodLabel} claim?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="submit-claim-form" loading={isSubmitting}>
              Submit claim
            </Button>
          </>
        }
      >
        <form id="submit-claim-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            The claim is sealed as at {asAt} and sent to {commissioner}. You can&apos;t change it after you submit.
          </p>
          <DetailsList
            items={[
              { label: "Version", value: `Version ${version}` },
              { label: "As at", value: asAt },
              { label: "Results", value: results },
            ]}
          />
          <Checkbox
            label="I've checked this claim and it's ready to submit."
            error={errors.confirmed?.message}
            {...register("confirmed")}
          />
        </form>
      </Dialog>
    </>
  )
}
