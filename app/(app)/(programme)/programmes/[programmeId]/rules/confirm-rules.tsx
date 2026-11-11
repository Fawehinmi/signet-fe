"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@/components/app/dialog"
import { Checkbox } from "@/components/form/checkbox"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { formatDate } from "@/lib/format"
import { confirmRulesSchema, type ConfirmRulesValues } from "@/lib/validations/rules"
import { confirmRules } from "./actions"

type ConfirmRulesProps = {
  programmeId: string
  programmeName: string
  organisationName: string
  commissionerName?: string
  userName: string
  version: number
  effectiveFrom: string
}

export function ConfirmRules({
  programmeId,
  programmeName,
  organisationName,
  commissionerName,
  userName,
  version,
  effectiveFrom,
}: ConfirmRulesProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(confirmRulesSchema),
    defaultValues: { confirmed: false },
  })

  function openDialog() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: ConfirmRulesValues) {
    const result = await confirmRules(programmeId, values)

    if (result.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof ConfirmRulesValues, { message: messages?.[0] })
      }
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button onClick={openDialog}>Confirm rules</Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm the rules?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="confirm-rules-form" loading={isSubmitting}>
              Confirm rules
            </Button>
          </>
        }
      >
        <form id="confirm-rules-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            The rules become Version {version} and go live for {programmeName}. You&apos;ll be recorded as confirming
            them for {organisationName}.{commissionerName && ` ${commissionerName} will be asked to review them too.`}
          </p>
          <DetailsList
            items={[
              { label: "Version", value: `Version ${version}` },
              { label: "Effective from", value: formatDate(effectiveFrom) },
              { label: "Confirmed by", value: userName },
            ]}
          />
          <Checkbox
            label="I've read the rules and they match the contract."
            error={errors.confirmed?.message}
            {...register("confirmed")}
          />
        </form>
      </Dialog>
    </>
  )
}
