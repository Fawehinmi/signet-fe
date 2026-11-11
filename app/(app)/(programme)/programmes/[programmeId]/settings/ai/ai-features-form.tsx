"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Switch } from "@/components/form/switch"
import { Button } from "@/components/ui/button"
import { aiFeaturesSchema, type AiFeaturesValues } from "@/lib/validations/programme-settings"
import { saveAiSetting } from "../actions"

const comparisons = [
  {
    title: "When AI features are on",
    items: [
      "Close matches are flagged when someone adds a participant who may already be on the programme.",
      "Payslips and invoices are read for you, so your team only checks the details.",
      "Column matches are suggested when you import a file.",
    ],
  },
  {
    title: "When AI features are off",
    items: [
      "Only exact matches are flagged as possible duplicates.",
      "Your team types evidence details by hand.",
      "Your team matches import columns by hand.",
    ],
  },
]

export function AiFeaturesForm({ programmeId, on, disabled }: { programmeId: string; on: boolean; disabled: boolean }) {
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(aiFeaturesSchema),
    defaultValues: { on },
  })

  const isOn = watch("on")

  async function onSubmit(values: AiFeaturesValues) {
    setSaved(false)
    const result = await saveAiSetting(programmeId, values)
    if (result.errors) return

    reset(values)
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <Switch
        label={`AI features are ${isOn ? "on" : "off"} for this programme`}
        description={
          isOn ? "Your team confirms every suggestion before it counts." : "Your team does these tasks by hand."
        }
        disabled={disabled}
        {...register("on")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {comparisons.map((comparison) => (
          <div key={comparison.title} className="rounded-lg border border-grey-200 p-5">
            <p className="mb-3 text-sm font-semibold text-grey-900">{comparison.title}</p>
            <ul className="flex flex-col gap-2.5">
              {comparison.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-grey-800">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {!disabled && (
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
