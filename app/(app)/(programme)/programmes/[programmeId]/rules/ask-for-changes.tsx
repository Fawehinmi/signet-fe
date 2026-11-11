"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Clock } from "lucide-react"
import { Drawer } from "@/components/app/drawer"
import { SelectInput } from "@/components/form/select-input"
import { TextareaInput } from "@/components/form/textarea-input"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { askForChangesSchema, type AskForChangesValues } from "@/lib/validations/rules"
import { askForRuleChanges } from "./actions"

type AskForChangesProps = {
  programmeId: string
  programmeName: string
  parts: string[]
}

export function AskForChanges({ programmeId, programmeName, parts }: AskForChangesProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(askForChangesSchema),
    defaultValues: { part: "", change: "" },
  })

  function openDrawer() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: AskForChangesValues) {
    const result = await askForRuleChanges(programmeId, values)

    if (result.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof AskForChangesValues, { message: messages?.[0] })
      }
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button variant="secondary" onClick={openDrawer}>
        Ask for changes
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Ask for changes"
        description={programmeName}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="ask-for-changes-form" loading={isSubmitting}>
              Ask for changes
            </Button>
          </>
        }
      >
        <form id="ask-for-changes-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            Tell us what needs to change. We&apos;ll update the rules and send them back for you to review.
          </p>
          <SelectInput
            label="Part of the rules (optional)"
            placeholder="Choose a part"
            options={parts.map((part) => ({ value: part, label: part }))}
            error={errors.part?.message}
            {...register("part")}
          />
          <TextareaInput
            label="What needs to change?"
            helper="Required. Point to the part of the contract if you can."
            error={errors.change?.message}
            {...register("change")}
          />
          <Banner icon={Clock} title="The rules go back to Preparing your rules">
            They won&apos;t go live until a Sign-off holder confirms them.
          </Banner>
        </form>
      </Drawer>
    </>
  )
}
