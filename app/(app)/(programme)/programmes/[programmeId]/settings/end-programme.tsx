"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Ban } from "lucide-react"
import { Dialog } from "@/components/app/dialog"
import { Checkbox } from "@/components/form/checkbox"
import { Button } from "@/components/ui/button"
import { endProgrammeSchema, type EndProgrammeValues } from "@/lib/validations/programme-settings"
import { endProgramme } from "./actions"

export function EndProgramme({ programmeId, programmeName }: { programmeId: string; programmeName: string }) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(endProgrammeSchema),
    defaultValues: { confirmed: false },
  })

  function openDialog() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: EndProgrammeValues) {
    const result = await endProgramme(programmeId, values)

    if (result.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof EndProgrammeValues, { message: messages?.[0] })
      }
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button variant="danger" onClick={openDialog}>
        <Ban className="size-[18px]" />
        End programme
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`End ${programmeName}?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" form="end-programme-form" loading={isSubmitting}>
              End programme
            </Button>
          </>
        }
      >
        <form id="end-programme-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            It becomes read-only for everyone on it. You can&apos;t undo this.
          </p>
          <Checkbox
            label="I understand that ending the programme can't be undone."
            error={errors.confirmed?.message}
            {...register("confirmed")}
          />
        </form>
      </Dialog>
    </>
  )
}
