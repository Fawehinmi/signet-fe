"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@/components/app/dialog"
import { TextareaInput } from "@/components/form/textarea-input"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { sendForCheckingSchema, type SendForCheckingValues } from "@/lib/validations/evidence"
import { sendForChecking } from "./actions"

type SendForCheckingProps = {
  programmeId: string
  row: { id: string; participantRef: string; title: string; why: string; evidence: string[] }
  admins: string
}

export function SendForChecking({ programmeId, row, admins }: SendForCheckingProps) {
  const [open, setOpen] = useState(false)
  const formId = `check-${row.id}`

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(sendForCheckingSchema),
    defaultValues: { note: "" },
  })

  function openDialog() {
    reset()
    setOpen(true)
  }

  async function onSubmit(values: SendForCheckingValues) {
    const response = await sendForChecking(programmeId, row.id, values)

    if (response.errors) {
      setError("note", { message: Object.values(response.errors).flat()[0] })
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Button variant="text" size="sm" aria-label={`Send ${row.participantRef} for checking`} onClick={openDialog}>
        Send for checking
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Send ${row.title} for checking?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              Send for checking
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <p className="text-sm leading-[22px] text-grey-800">
            {admins}, your organisation admin, checks it by hand. If it&apos;s accepted as is, a Sign-off holder must approve it
            before it&apos;s claimed.
          </p>
          <DetailsList
            items={[
              { label: "Reason", value: row.why },
              { label: "Evidence on file", value: row.evidence.length > 0 ? row.evidence.join(". ") : "Nothing uploaded yet" },
            ]}
          />
          <TextareaInput
            label="What should they know?"
            rows={4}
            helper="Required. Say what you uploaded and why it should count."
            error={errors.note?.message}
            {...register("note")}
          />
        </form>
      </Dialog>
    </>
  )
}
