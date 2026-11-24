"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Pencil } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { Stepper } from "@/components/app/stepper"
import { RadioGroup } from "@/components/form/radio-group"
import { SelectInput } from "@/components/form/select-input"
import { TextInput } from "@/components/form/text-input"
import { Banner } from "@/components/ui/banner"
import { Button, buttonStyles } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { Tag } from "@/components/ui/tag"
import type { ExistingProgramme } from "@/lib/data/programmes"
import { formatDate } from "@/lib/format"
import {
  areas,
  programmeName,
  schemes,
  startProgrammeSchema,
  type StartProgrammeValues,
} from "@/lib/validations/programme"
import { checkProgramme, createProgramme } from "./actions"

type FieldErrors = Partial<Record<keyof StartProgrammeValues, string[]>>

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }))

export function StartProgrammeForm({ organisationName }: { organisationName: string }) {
  const [reviewing, setReviewing] = useState<StartProgrammeValues | null>(null)
  const [existing, setExisting] = useState<ExistingProgramme | null>(null)
  const [creating, startCreating] = useTransition()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(startProgrammeSchema),
    defaultValues: { commissioner: "", startDate: "", endDate: "" },
  })

  const name = programmeName(watch("scheme"), watch("area"))

  function showErrors(fieldErrors: FieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      setError(field as keyof StartProgrammeValues, { message: messages?.[0] })
    }
  }

  async function onContinue(values: StartProgrammeValues) {
    const result = await checkProgramme(values)

    if (result.errors) {
      showErrors(result.errors)
      return
    }

    setExisting(result.existing)
    if (!result.existing) setReviewing(values)
  }

  function onCreate() {
    if (!reviewing) return

    startCreating(async () => {
      const result = await createProgramme(reviewing)

      if (result?.errors) {
        setReviewing(null)
        showErrors(result.errors)
      }
    })
  }

  return (
    <>
      <PageHeader
        title="Start a programme"
        breadcrumbs={[{ label: "Programmes", href: "/programmes" }, { label: "Start a programme" }]}
        actions={
          <Link href="/programmes" className={buttonStyles({ variant: "secondary" })}>
            Cancel
          </Link>
        }
      />
      <div className="mb-8">
        <Stepper steps={["Programme details", "Review"]} current={reviewing ? 2 : 1} />
      </div>

      {reviewing ? (
        <Columns
          main={
            <>
              <Section title="Filled in for you">
                <DetailsList
                  items={[
                    { label: "Programme name", value: name || <span className="text-grey-600">Choose a scheme and area</span> },
                    { label: "Organisation", value: organisationName },
                    { label: "Position", value: <Tag tone="info">Prime</Tag> },
                  ]}
                />
              </Section>
              <Section
                title="Review your programme"
                description="Check the details before you create it."
                action={
                  <Button variant="text" size="sm" onClick={() => setReviewing(null)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                }
              >
                <DetailsList
                  items={[
                    { label: "Programme name", value: programmeName(reviewing.scheme, reviewing.area) },
                    { label: "Scheme", value: reviewing.scheme },
                    { label: "Area", value: reviewing.area },
                    { label: "Commissioner", value: reviewing.commissioner },
                    { label: "Dates", value: `${formatDate(reviewing.startDate)} to ${formatDate(reviewing.endDate)}` },
                    { label: "Delivers directly", value: reviewing.deliversDirectly === "yes" ? "Yes" : "No" },
                    { label: "Your position", value: <Tag tone="info">Prime</Tag> },
                  ]}
                />
                <div className="mt-6 flex justify-between gap-3 border-t border-grey-200 pt-4">
                  <Button variant="secondary" onClick={() => setReviewing(null)}>
                    Back
                  </Button>
                  <Button loading={creating} onClick={onCreate}>
                    Create programme
                  </Button>
                </div>
              </Section>
            </>
          }
        />
      ) : (
        <Columns
          main={
            <Section title="Programme details" description="All fields are required.">
              <form onSubmit={handleSubmit(onContinue)} noValidate className="flex flex-col gap-6">
                {existing ? (
                  <Banner tone="warn" title={`${existing.name} is already on Signet`}>
                    Its rules are already live, so it can&apos;t be started again. To take part, ask its prime or
                    commissioner to invite {organisationName}.
                  </Banner>
                ) : (
                  <Banner icon={KeyRound} title="You'll be the prime on this programme">
                    You lead it, and you invite the commissioner and your subcontractors.
                  </Banner>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectInput
                    label="Scheme"
                    options={toOptions(schemes)}
                    error={errors.scheme?.message}
                    {...register("scheme")}
                  />
                  <SelectInput
                    label="Area"
                    options={toOptions(areas)}
                    error={errors.area?.message}
                    {...register("area")}
                  />
                </div>
                <TextInput
                  label="Commissioner"
                  helper="We'll ask you to invite them once the rules are live."
                  error={errors.commissioner?.message}
                  {...register("commissioner")}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label="Start date"
                    type="date"
                    error={errors.startDate?.message}
                    {...register("startDate")}
                  />
                  <TextInput label="End date" type="date" error={errors.endDate?.message} {...register("endDate")} />
                </div>
                <RadioGroup
                  legend={`Does ${organisationName} deliver directly?`}
                  helper="Choose Yes if your own staff will support participants, as well as your partners."
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  error={errors.deliversDirectly?.message}
                  {...register("deliversDirectly")}
                />
                <div className="flex justify-end border-t border-grey-200 pt-4">
                  <Button type="submit" loading={isSubmitting}>
                    Continue
                  </Button>
                </div>
              </form>
            </Section>
          }
        />
      )}
    </>
  )
}
