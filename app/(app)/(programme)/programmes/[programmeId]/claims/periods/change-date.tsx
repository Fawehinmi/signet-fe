"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil } from "lucide-react"
import { Dialog } from "@/components/app/dialog"
import { TextInput } from "@/components/form/text-input"
import { Button } from "@/components/ui/button"
import { sendByDateSchema, type SendByDateValues } from "@/lib/validations/claims"
import { changeSendByDate } from "../actions"

type ChangeDateProps = {
  programmeId: string
  period: { id: string; label: string; sendBy: string }
}

export function ChangeDate({ programmeId, period }: ChangeDateProps) {
  const [open, setOpen] = useState(false)
  const formId = `send-by-${period.id}`

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(sendByDateSchema),
    defaultValues: { sendBy: period.sendBy },
  })

  function openDialog() {
    reset({ sendBy: period.sendBy })
    setOpen(true)
  }

  async function onSubmit(values: SendByDateValues) {
    const result = await changeSendByDate(programmeId, period.id, values)

    if (result.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof SendByDateValues, { message: messages?.[0] })
      }
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button variant="text" size="sm" aria-label={`Change the ${period.label} send-by date`} onClick={openDialog}>
        <Pencil className="size-4" />
        Change date
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Change the ${period.label} send-by date`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              Save date
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            Your partners see this date, so they know when to send their {period.label} results.
          </p>
          <TextInput label="Send-by date" type="date" error={errors.sendBy?.message} {...register("sendBy")} />
        </form>
      </Dialog>
    </>
  )
}
