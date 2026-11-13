"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { SelectInput } from "@/components/form/select-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import type { CaseloadParticipant } from "@/lib/evidence-matching"
import { initials } from "@/lib/format"
import { uploadScopeSchema, type UploadScope } from "@/lib/validations/evidence"

type ScopeStepProps = {
  initial: UploadScope | null
  periods: { id: string; label: string }[]
  caseload: CaseloadParticipant[]
  pool: string
  onContinue: (scope: UploadScope) => void
}

const card = (on: boolean) => cn("rounded-lg border bg-white p-5", on ? "border-2 border-brand-400 p-[19px]" : "border-grey-300")
const dot =
  "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-grey-600 peer-checked:border-brand-400 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200"
const dotFill = "size-2.5 scale-0 rounded-full bg-brand-400 transition-transform group-has-[:checked]:scale-100"

function Person({ participant, note }: { participant: CaseloadParticipant; note: string }) {
  return (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
        {initials(participant.name)}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-grey-900">{participant.name}</span>
        <span className="block text-xs text-grey-700">
          {participant.ref}, {note}
        </span>
      </span>
    </>
  )
}

type ParticipantPickerProps = {
  id: string
  label: string
  hint: string
  options: CaseloadParticipant[]
  chosen: CaseloadParticipant[]
  error?: string
  noteFor: (participant: CaseloadParticipant) => string
  onChoose: (ref: string) => void
  onRemove: (ref: string) => void
}

function ParticipantPicker({ id, label, hint, options, chosen, error, noteFor, onChoose, onRemove }: ParticipantPickerProps) {
  const [query, setQuery] = useState("")
  const search = query.trim().toLowerCase()
  const found = search
    ? options
        .filter((participant) => !chosen.some((item) => item.ref === participant.ref))
        .filter((participant) => `${participant.name} ${participant.ref}`.toLowerCase().includes(search))
        .slice(0, 6)
    : []

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-grey-900">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-2.5 rounded border bg-white px-3.5 focus-within:border-2 focus-within:border-brand-400 focus-within:px-[13px]",
          error ? "border-2 border-danger-400 px-[13px]" : "border-brand-300",
        )}
      >
        <Search className="size-5 shrink-0 text-grey-600" />
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or reference"
          autoComplete="off"
          className="h-full flex-1 bg-transparent text-[15px] text-grey-900 outline-none placeholder:text-grey-600"
        />
      </div>
      {error ? (
        <p role="alert" className="pl-4 text-xs text-danger-700">
          {error}
        </p>
      ) : (
        <p className="pl-4 text-xs text-grey-700">{hint}</p>
      )}

      {search && (
        <ul className="overflow-hidden rounded-lg border border-grey-300 shadow-[0_8px_24px_rgba(33,33,33,0.14)]">
          {found.length > 0 ? (
            found.map((participant) => (
              <li key={participant.ref}>
                <button
                  type="button"
                  onClick={() => {
                    onChoose(participant.ref)
                    setQuery("")
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none"
                >
                  <Person participant={participant} note={noteFor(participant)} />
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-grey-700">No one matches &quot;{query}&quot;.</li>
          )}
        </ul>
      )}

      {chosen.length > 0 && (
        <ul className="mt-2 rounded-lg border border-grey-200">
          {chosen.map((participant) => (
            <li key={participant.ref} className="flex items-center gap-3 border-b border-grey-200 py-2.5 pr-2 pl-3.5 last:border-b-0">
              <Person participant={participant} note={noteFor(participant)} />
              <Button variant="text" size="sm" aria-label={`Remove ${participant.name}`} onClick={() => onRemove(participant.ref)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ScopeStep({ initial, periods, caseload, pool, onContinue }: ScopeStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(uploadScopeSchema),
    defaultValues: initial ?? {
      kind: "programme" as const,
      periodId: periods[periods.length - 1]?.id ?? "",
      who: "all" as const,
      participantRefs: [] as string[],
    },
  })

  const [kind, periodId, who, chosenRefs] = watch(["kind", "periodId", "who", "participantRefs"])
  const month = periods.find((period) => period.id === periodId)
  const inMonth = caseload.filter((participant) => participant.results.some((item) => item.periodId === periodId))
  const chosen = caseload.filter((participant) => chosenRefs.includes(participant.ref))
  const kindField = register("kind", { onChange: () => setValue("participantRefs", []) })

  function resultsOf(participant: CaseloadParticipant) {
    const kinds = [...new Set(participant.results.map((item) => item.result.toLowerCase()))]
    return kinds.length > 0 ? kinds.join(" and ") : "no results yet"
  }

  function resultIn(participant: CaseloadParticipant) {
    const result = participant.results.find((item) => item.periodId === periodId)?.result ?? "result"
    return `${result.toLowerCase()} in ${month?.label}`
  }

  const note =
    kind === "participant"
      ? chosen.length === 0
        ? "No participant chosen yet."
        : `Files can only be matched to ${chosen[0].name}.`
      : kind === "programme"
        ? `Files can be matched to anyone in ${pool}.`
        : who === "all"
          ? `Files can be matched to anyone in ${pool} with a result in ${month?.label ?? "that month"}.`
          : chosen.length === 0
            ? "No participants chosen yet."
            : `${chosen.length === 1 ? "1 participant" : `${chosen.length} participants`} chosen. Files can only be matched to them.`

  return (
    <Columns
      main={
        <Section title="What's this upload for?" description="Choose before you add files.">
          <form onSubmit={handleSubmit(onContinue)} noValidate className="flex flex-col gap-3">
            <div className={card(kind === "participant")}>
              <label className="group flex cursor-pointer gap-4">
                <input type="radio" value="participant" className="peer sr-only" {...kindField} />
                <span className={cn(dot, "mt-0.5")}>
                  <span className={dotFill} />
                </span>
                <span>
                  <span className="block font-display text-lg text-grey-900">One participant</span>
                  <span className="block text-sm text-grey-700">Files for one person, for any of their results.</span>
                </span>
              </label>

              {kind === "participant" && (
                <div className="mt-5 border-t border-grey-200 pt-5 sm:ml-9">
                  <ParticipantPicker
                    id="one-participant"
                    label="Participant"
                    hint={`Anyone in ${pool}.`}
                    options={caseload}
                    chosen={chosen}
                    error={errors.participantRefs?.message}
                    noteFor={resultsOf}
                    onChoose={(ref) => setValue("participantRefs", [ref], { shouldValidate: true })}
                    onRemove={() => setValue("participantRefs", [], { shouldValidate: true })}
                  />
                </div>
              )}
            </div>

            <div className={card(kind === "month")}>
              <label className="group flex flex-1 cursor-pointer gap-4">
                <input type="radio" value="month" disabled={periods.length === 0} className="peer sr-only" {...kindField} />
                <span className={cn(dot, "mt-0.5")}>
                  <span className={dotFill} />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-lg text-grey-900">A specific month</span>
                  <span className="block text-sm text-grey-700">
                    {periods.length > 0
                      ? "Files for one claim period, for everyone or for chosen participants."
                      : "There are no claim periods on this programme yet."}
                  </span>
                </span>
              </label>

              {kind === "month" && (
                <div className="mt-5 flex flex-col gap-5 border-t border-grey-200 pt-5 sm:ml-9">
                  <SelectInput
                    label="Month"
                    options={periods.map((period) => ({ value: period.id, label: period.label }))}
                    helper="Months follow the programme's claim periods."
                    error={errors.periodId?.message}
                    {...register("periodId", { onChange: () => setValue("participantRefs", []) })}
                  />

                  <fieldset className="flex flex-col gap-3">
                    <legend className="mb-1 text-sm font-semibold text-grey-900">Which participants?</legend>
                    {[
                      { value: "all", label: "All participants", text: `Anyone in ${pool} with a result in ${month?.label ?? "this month"}.` },
                      { value: "some", label: "Specific participants", text: "Choose who the files are for." },
                    ].map((option) => (
                      <label key={option.value} className="group flex cursor-pointer items-start gap-3">
                        <input type="radio" value={option.value} className="peer sr-only" {...register("who")} />
                        <span className={cn(dot, "mt-px")}>
                          <span className={dotFill} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-grey-900">{option.label}</span>
                          <span className="block text-[13px] text-grey-700">{option.text}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>

                  {who === "some" && (
                    <ParticipantPicker
                      id="month-participants"
                      label="Choose participants"
                      hint={`Only participants in ${pool} with a result in this month are listed.`}
                      options={inMonth}
                      chosen={chosen}
                      error={errors.participantRefs?.message}
                      noteFor={resultIn}
                      onChoose={(ref) => setValue("participantRefs", [...chosenRefs, ref], { shouldValidate: true })}
                      onRemove={(ref) =>
                        setValue(
                          "participantRefs",
                          chosenRefs.filter((item) => item !== ref),
                          { shouldValidate: true },
                        )
                      }
                    />
                  )}
                </div>
              )}
            </div>

            <label className={cn("group flex cursor-pointer gap-4", card(kind === "programme"))}>
              <input type="radio" value="programme" className="peer sr-only" {...kindField} />
              <span className={cn(dot, "mt-0.5")}>
                <span className={dotFill} />
              </span>
              <span>
                <span className="block font-display text-lg text-grey-900">The whole programme</span>
                <span className="block text-sm text-grey-700">
                  Files that aren&apos;t tied to one month, like consent forms and referral letters.
                </span>
              </span>
            </label>

            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-grey-200 pt-4">
              <p className="flex-1 text-xs text-grey-700">{note}</p>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </Section>
      }
      side={
        <>
          <Section title="Why we ask">
            <p className="text-sm leading-[22px] text-grey-800">
              Matching only looks inside what you choose. It&apos;s saved with the upload, so you can see later what it
              was for.
            </p>
          </Section>
          <Section title="Participants">
            <p className="text-sm leading-[22px] text-grey-800">
              Participants come from Imports. You can only match files to people already on the programme.
            </p>
          </Section>
        </>
      }
    />
  )
}
