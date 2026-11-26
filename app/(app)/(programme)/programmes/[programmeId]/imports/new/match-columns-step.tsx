"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { Checkbox } from "@/components/form/checkbox"
import { Button } from "@/components/ui/button"
import { Table, Td, Th } from "@/components/ui/table"
import { Tag } from "@/components/ui/tag"
import { importFields, matchColumnsSchema, suggestField, type MatchColumnsValues } from "@/lib/validations/imports"
import type { ImportFile } from "./import-wizard"

type MatchColumnsStepProps = {
  file: ImportFile
  aiOn: boolean
  saved: Record<string, string>
  initial: MatchColumnsValues | null
  onBack: () => void
  onContinue: (values: MatchColumnsValues) => void
}

function startingMatch(file: ImportFile, aiOn: boolean, saved: Record<string, string>) {
  const used = new Set<string>()
  const matching: Record<string, string> = {}
  const sources: Record<string, "saved" | "suggested"> = {}

  file.headers.forEach((header, index) => {
    const key = `col${index}`
    const savedField = saved[header] ?? ""
    const suggested = aiOn ? suggestField(file.type, header) : ""
    const field = [savedField, suggested].find((option) => option && !used.has(option)) ?? ""

    matching[key] = field
    if (field) {
      used.add(field)
      sources[key] = field === savedField ? "saved" : "suggested"
    }
  })

  return { matching, sources }
}

export function MatchColumnsStep({ file, aiOn, saved, initial, onBack, onContinue }: MatchColumnsStepProps) {
  const start = startingMatch(file, aiOn, saved)
  const fields = importFields[file.type]

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(matchColumnsSchema(file.type)),
    defaultValues: initial ?? { matching: start.matching, saveMatching: true },
  })

  const current = watch("matching")

  return (
    <Columns
      main={
        <Section
          title="Match columns"
          description={`Check each match. Nothing is imported until you confirm. Required: ${fields
            .filter((field) => field.required)
            .map((field) => field.label)
            .join(", ")}.`}
        >
          <form onSubmit={handleSubmit(onContinue)} noValidate className="flex flex-col gap-5">
            <Table>
              <thead>
                <tr>
                  <Th>Column in your file</Th>
                  <Th>Example</Th>
                  <Th>Signet field</Th>
                  <Th>
                    <span className="sr-only">How it was matched</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {file.headers.map((header, index) => {
                  const key = `col${index}`
                  const source = start.sources[key]
                  const unchanged = current?.[key] === start.matching[key]

                  return (
                    <tr key={key}>
                      <Td className="font-semibold text-grey-900">{header || `Column ${index + 1}`}</Td>
                      <Td className="max-w-[160px] truncate">{file.rows[0]?.[index] ?? ""}</Td>
                      <Td>
                        <select
                          aria-label={`Signet field for ${header || `column ${index + 1}`}`}
                          className="h-10 w-full min-w-[170px] cursor-pointer rounded border border-brand-300 bg-white px-3 text-sm text-grey-900 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 focus:outline-none"
                          {...register(`matching.${key}`)}
                        >
                          <option value="">Don&apos;t import</option>
                          {fields.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </Td>
                      <Td className="text-right">
                        {source && unchanged ? (
                          <Tag tone={source === "saved" ? "neutral" : "info"}>
                            {source === "saved" ? "Saved" : "Suggested"}
                          </Tag>
                        ) : current?.[key] ? (
                          <span className="text-grey-700">Set by you</span>
                        ) : null}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
            {((errors.matching as { root?: { message?: string }; message?: string })?.root?.message ??
              (errors.matching as { message?: string })?.message) && (
              <p role="alert" className="text-sm text-danger-700">
                {(errors.matching as { root?: { message?: string }; message?: string })?.root?.message ??
                  (errors.matching as { message?: string })?.message}
              </p>
            )}
            <Checkbox label="Save this matching for next time" {...register("saveMatching")} />
            <div className="flex justify-between gap-3 border-t border-grey-200 pt-4">
              <Button variant="secondary" onClick={onBack}>
                Back
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </Section>
      }
    />
  )
}
