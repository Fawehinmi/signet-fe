"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Users } from "lucide-react"
import { organisationSchema, type OrganisationValues } from "@/lib/validations/auth"
import { RadioCards } from "@/components/form/radio-cards"
import { TextInput } from "@/components/form/text-input"
import { SelectInput } from "@/components/form/select-input"
import { Checkbox } from "@/components/form/checkbox"
import { Button } from "@/components/ui/button"
import { createOrganisation } from "./actions"

const typeOptions = [
  {
    value: "provider",
    label: "Provider",
    description: "We deliver programmes as a prime or subcontractor.",
    icon: <Users className="size-5" />,
  },
  {
    value: "commissioner",
    label: "Commissioner",
    description: "We fund or commission programmes.",
    icon: <Building2 className="size-5" />,
  },
]

const categoryOptions = [
  { value: "company", label: "Company" },
  { value: "charity", label: "Charity" },
  { value: "cic", label: "Community interest company" },
  { value: "public-body", label: "Public body" },
  { value: "other", label: "Other" },
]

export function OrganisationForm({ emailDomain }: { emailDomain: string }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(organisationSchema),
    defaultValues: { name: "", registrationNumber: "", address: "", website: "", jobTitle: "", authorised: false },
  })

  async function onSubmit(values: OrganisationValues) {
    const result = await createOrganisation(values)

    if (result?.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof OrganisationValues, { message: messages?.[0] })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full flex-col gap-5">
      <RadioCards
        legend="How does your organisation work with programmes?"
        options={typeOptions}
        error={errors.type?.message}
        {...register("type")}
      />
      <TextInput label="Organisation name" autoComplete="organization" error={errors.name?.message} {...register("name")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectInput label="Category" options={categoryOptions} error={errors.category?.message} {...register("category")} />
        <TextInput
          label="Registration number"
          helper="Charity or Companies House number"
          error={errors.registrationNumber?.message}
          {...register("registrationNumber")}
        />
      </div>
      <TextInput
        label="Registered address"
        autoComplete="street-address"
        error={errors.address?.message}
        {...register("address")}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Website" inputMode="url" error={errors.website?.message} {...register("website")} />
        <TextInput
          label="Your job title"
          autoComplete="organization-title"
          error={errors.jobTitle?.message}
          {...register("jobTitle")}
        />
      </div>
      <TextInput label="Email domain" value={emailDomain} readOnly helper="Taken from your email address" />
      <Checkbox
        label="I'm authorised to set up this organisation on Signet."
        error={errors.authorised?.message}
        {...register("authorised")}
      />
      <Button type="submit" fullWidth loading={isSubmitting}>
        Create organisation
      </Button>
    </form>
  )
}
