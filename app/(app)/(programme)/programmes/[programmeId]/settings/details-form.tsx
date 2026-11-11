"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TextInput } from "@/components/form/text-input"
import { Button } from "@/components/ui/button"
import { programmeDatesSchema, type ProgrammeDatesValues } from "@/lib/validations/programme-settings"
import { saveDates } from "./actions"

type DetailsFormProps = {
  programmeId: string
  name: string
  scheme: string
  area: string
  startDate: string
  endDate: string
  canEdit: boolean
}

export function DetailsForm({ programmeId, name, scheme, area, startDate, endDate, canEdit }: DetailsFormProps) {
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(programmeDatesSchema),
    defaultValues: { startDate, endDate },
  })

  async function onSubmit(values: ProgrammeDatesValues) {
    setSaved(false)
    const result = await saveDates(programmeId, values)

    if (result.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof ProgrammeDatesValues, { message: messages?.[0] })
      }
      return
    }

    reset(values)
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <TextInput
        label="Programme name"
        value={name}
        readOnly
        helper="The name, scheme and area identify the programme on Signet, so they can't be changed."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Scheme" value={scheme} readOnly />
        <TextInput label="Area" value={area} readOnly />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Start date"
          type="date"
          readOnly={!canEdit}
          error={errors.startDate?.message}
          {...register("startDate")}
        />
        <TextInput
          label="End date"
          type="date"
          readOnly={!canEdit}
          error={errors.endDate?.message}
          {...register("endDate")}
        />
      </div>
      {canEdit && (
        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-grey-200 pt-4">
          {saved && (
            <p role="status" className="text-sm text-success-900">
              Changes saved.
            </p>
          )}
          <Button type="submit" disabled={!isDirty} loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      )}
    </form>
  )
}
