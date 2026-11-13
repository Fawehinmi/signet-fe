"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@/components/app/dialog"
import { SelectInput } from "@/components/form/select-input"
import { Button } from "@/components/ui/button"
import { evidenceTypes, type CaseloadParticipant } from "@/lib/evidence-matching"
import { evidenceResults, fileMatchSchema, type FileMatchValues } from "@/lib/validations/evidence"

type MatchDialogProps = {
  fileName: string
  initial: { participantRef: string; evidenceType: string; result: string }
  participants: CaseloadParticipant[]
  error?: string | null
  saving?: boolean
  onCancel: () => void
  onLeaveUnmatched?: () => void
  onConfirm: (values: FileMatchValues) => void
}

export function MatchDialog({ fileName, initial, participants, error, saving, onCancel, onLeaveUnmatched, onConfirm }: MatchDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fileMatchSchema),
    defaultValues: {
      participantRef: participants.some((participant) => participant.ref === initial.participantRef) ? initial.participantRef : "",
      evidenceType: initial.evidenceType,
      result: initial.result as FileMatchValues["result"],
    },
  })

  return (
    <Dialog
      open
      onClose={onCancel}
      title={fileName}
      footer={
        <>
          {onLeaveUnmatched && (
            <Button variant="text" className="mr-auto" onClick={onLeaveUnmatched}>
              Leave unmatched
            </Button>
          )}
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" form="match-file-form" loading={saving}>
            Confirm match
          </Button>
        </>
      }
    >
      <form id="match-file-form" onSubmit={handleSubmit(onConfirm)} noValidate className="flex flex-col gap-5">
        <p className="text-sm leading-[22px] text-grey-800">Check who the file is for before you confirm.</p>
        <SelectInput
          label="Participant"
          placeholder="Choose a participant"
          options={participants.map((participant) => ({
            value: participant.ref,
            label: `${participant.name}, ${participant.ref}`,
          }))}
          helper="Only participants in this upload are listed."
          error={errors.participantRef?.message}
          {...register("participantRef")}
        />
        <SelectInput
          label="Evidence type"
          options={evidenceTypes.map((type) => ({ value: type.label, label: type.label }))}
          error={errors.evidenceType?.message}
          {...register("evidenceType")}
        />
        <SelectInput
          label="Result"
          options={evidenceResults.map((result) => ({ value: result, label: result }))}
          error={errors.result?.message}
          {...register("result")}
        />
        {error && (
          <p role="alert" className="text-sm text-danger-700">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  )
}
