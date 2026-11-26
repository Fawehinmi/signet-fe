"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { FileSlot } from "@/components/form/file-slot"
import { RadioGroup } from "@/components/form/radio-group"
import { Button } from "@/components/ui/button"
import { parseCsv } from "@/lib/csv"
import { plural } from "@/lib/format"
import { chooseFileSchema, importTypeLabels, type ChooseFileValues } from "@/lib/validations/imports"
import type { ImportFile } from "./import-wizard"

type ChooseFileStepProps = {
  initial: ImportFile | null
  onContinue: (file: ImportFile) => void
}

export function ChooseFileStep({ initial, onContinue }: ChooseFileStepProps) {
  const [rowCount, setRowCount] = useState<number | null>(initial ? initial.rows.length : null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChooseFileValues>({
    resolver: zodResolver(chooseFileSchema),
    mode: "onChange",
    defaultValues: { type: initial?.type ?? ("participants" as const), file: initial?.source },
  })

  const type = watch("type")

  async function countRows(file?: File) {
    if (!file) {
      setRowCount(null)
      return
    }

    const rows = parseCsv(await file.text())
    setRowCount(Math.max(rows.length - 1, 0))
  }

  async function onSubmit(values: ChooseFileValues) {
    const [headers, ...rows] = parseCsv(await values.file.text())

    if (!headers || rows.length === 0) {
      setError("file", { message: "The file has no rows to import" })
      return
    }

    onContinue({
      source: values.file,
      name: values.file.name,
      type: values.type,
      headers: headers.map((header) => header.trim()),
      rows,
    })
  }

  return (
    <Columns
      main={
        <Section title="Your file">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            <RadioGroup
              legend="What are you importing?"
              options={[
                { value: "participants", label: importTypeLabels.participants.label },
                { value: "support-records", label: importTypeLabels["support-records"].label },
              ]}
              error={errors.type?.message}
              {...register("type")}
            />
            <Controller
              control={control}
              name="file"
              render={({ field, fieldState }) => (
                <FileSlot
                  label="CSV file"
                  required
                  accept=".csv"
                  hint="Drop a CSV file here, or"
                  detail={rowCount !== null ? `${plural(rowCount, "row")}, added just now` : undefined}
                  file={field.value}
                  error={fieldState.error?.message}
                  onChange={(file) => {
                    field.onChange(file)
                    countRows(file)
                  }}
                />
              )}
            />
            <div className="flex flex-wrap items-center gap-3 border-t border-grey-200 pt-4">
              <p className="flex-1 text-xs text-grey-700">
                Only {importTypeLabels[type ?? "participants"].many} for your own delivery.
              </p>
              <Button type="submit" loading={isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </Section>
      }
    />
  )
}
