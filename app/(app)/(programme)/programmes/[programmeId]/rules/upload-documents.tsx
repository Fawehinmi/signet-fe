"use client"

import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Send } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { PageHeader } from "@/components/app/page-header"
import { Section } from "@/components/app/section"
import { FileSlot } from "@/components/form/file-slot"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { contractDocumentsSchema, type ContractDocumentsValues } from "@/lib/validations/rules"
import { sendContractDocuments } from "./actions"

export function UploadDocuments({ programmeId }: { programmeId: string }) {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(contractDocumentsSchema),
    mode: "onChange",
  })

  const [contract, deliveryPlan] = watch(["contract", "deliveryPlan"])
  const missing = !contract ? "the contract" : !deliveryPlan ? "the delivery plan" : null

  async function onSubmit(values: ContractDocumentsValues) {
    const formData = new FormData()
    formData.set("contract", values.contract)
    formData.set("deliveryPlan", values.deliveryPlan)
    if (values.schedules) formData.set("schedules", values.schedules)

    const result = await sendContractDocuments(programmeId, formData)

    if (result.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof ContractDocumentsValues, { message: messages?.[0] })
      }
    }
  }

  return (
    <>
      <PageHeader title="Rules" description="Upload the contract documents so we can prepare your rules." />
      <Columns
        main={
          <>
            <div className="flex flex-col gap-4">
              <Banner tone="warn" title="Remove participant details first">
                Contracts shouldn&apos;t include names or other details about participants. Remove them before you
                upload.
              </Banner>
              <Link
                href="/help/contracts"
                className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 underline"
              >
                <Lock className="size-3.5 text-grey-600" />
                How we process and store your contracts
              </Link>
            </div>
            <Section title="Contract documents">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                <Controller
                  control={control}
                  name="contract"
                  render={({ field, fieldState }) => (
                    <FileSlot
                      label="Contract"
                      required
                      file={field.value}
                      error={fieldState.error?.message}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="deliveryPlan"
                  render={({ field, fieldState }) => (
                    <FileSlot
                      label="Delivery plan"
                      required
                      file={field.value}
                      error={fieldState.error?.message}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="schedules"
                  render={({ field, fieldState }) => (
                    <FileSlot
                      label="Schedules or variations"
                      file={field.value}
                      error={fieldState.error?.message}
                      onChange={field.onChange}
                    />
                  )}
                />
                <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-grey-200 pt-4">
                  <p className="flex-1 text-xs text-grey-700">
                    {missing ? `Add ${missing} to continue.` : "We'll start preparing your rules once you send these."}
                  </p>
                  <Button type="submit" disabled={!!missing} loading={isSubmitting}>
                    {!isSubmitting && <Send className="size-[18px]" />}
                    Send to Signet
                  </Button>
                </div>
              </form>
            </Section>
          </>
        }
      />
    </>
  )
}
