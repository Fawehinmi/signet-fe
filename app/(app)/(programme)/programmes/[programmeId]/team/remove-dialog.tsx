"use client"

import { useState, useTransition } from "react"
import { KeyRound } from "lucide-react"
import { Dialog } from "@/components/app/dialog"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { removeTeamMember } from "./actions"
import type { MemberRow } from "./types"

type RemoveDialogProps = {
  programmeId: string
  member: MemberRow
  onlySignOff: boolean
  onlyLead: boolean
  onClose: () => void
  onRemoved: (message: string) => void
}

export function RemoveDialog({ programmeId, member, onlySignOff, onlyLead, onClose, onRemoved }: RemoveDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [removing, startRemoving] = useTransition()

  function remove() {
    startRemoving(async () => {
      const result = await removeTeamMember(programmeId, member.email)
      if (result.error) setError(result.error)
      else onRemoved(`${member.name} removed from the programme`)
    })
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Remove ${member.name} from this programme?`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={removing} onClick={remove}>
            Remove
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm leading-[22px] text-grey-800">
          They can&apos;t open the programme after this. Their name stays on past decisions, approvals, imports and uploads.
        </p>
        {onlyLead && (
          <Banner tone="warn" title={`${member.name} is the only Compliance lead`}>
            Nobody will be able to submit claims until someone else is a Compliance lead.
          </Banner>
        )}
        {onlySignOff && (
          <Banner tone="warn" icon={KeyRound} title={`${member.name} is the only Sign-off holder`}>
            Results accepted as is or challenged will wait until someone else has Sign-off.
          </Banner>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger-700">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  )
}
