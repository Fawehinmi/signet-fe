"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Clock } from "lucide-react"
import { Drawer } from "@/components/app/drawer"
import { TextareaInput } from "@/components/form/textarea-input"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"
import { joinNames } from "@/lib/claim-labels"
import { resultLabelTags } from "@/lib/programme-labels"
import { chaseSchema, type ChaseValues } from "@/lib/validations/claims"
import { chaseResults } from "../actions"
import type { FixRow } from "./to-fix-table"

type ChaseDrawerProps = {
  programmeId: string
  rows: FixRow[]
  onClose: () => void
  onSent: () => void
}

export function ChaseDrawer({ programmeId, rows, onClose, onSent }: ChaseDrawerProps) {
  const one = rows.length === 1 ? rows[0] : null
  const recipients = [...new Set(rows.map((row) => row.recipient))]

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(chaseSchema),
    defaultValues: { resultIds: rows.map((row) => row.id), message: "" },
  })

  async function onSubmit(values: ChaseValues) {
    const response = await chaseResults(programmeId, values)

    if (response.errors) {
      setError("message", { message: Object.values(response.errors).flat()[0] })
      return
    }

    onSent()
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={one ? `Chase ${one.participantRef}` : `Chase ${rows.length} results`}
      description={
        one
          ? `${one.result}, from ${one.from}. ${resultLabelTags[one.label].label}.`
          : recipients.length === 1
            ? `The request goes to ${recipients[0]}.`
            : "Each request goes to the right person."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="chase-form" loading={isSubmitting}>
            {one ? "Send request" : `Send ${rows.length} requests`}
          </Button>
        </>
      }
    >
      <form id="chase-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        {one ? (
          <DetailsList
            items={[
              { label: "Why", value: one.why || resultLabelTags[one.label].label },
              { label: "Claim", value: one.claim ? `${one.claim.label}, send by ${one.claim.sendBy}` : "Next claim, once it's ready" },
              { label: "Send to", value: one.recipient },
            ]}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {rows.map((row) => (
                <span
                  key={row.id}
                  className="inline-flex h-7 items-center rounded-full border border-brand-200 bg-brand-50 px-3 text-[13px] font-semibold text-brand-700"
                >
                  {row.participantRef}
                </span>
              ))}
            </div>
            <DetailsList items={[{ label: "Send to", value: joinNames(recipients) }]} />
          </>
        )}
        <TextareaInput
          label="What's needed"
          rows={4}
          helper={`${joinNames(recipients)} ${recipients.length === 1 ? "sees" : "see"} this message. Files go in through Upload evidence.`}
          error={errors.message?.message ?? errors.resultIds?.message}
          {...register("message")}
        />
        <Banner icon={Clock} title={`${one ? "It stays" : "They stay"} in To fix until the evidence arrives`}>
          When the files are uploaded, Signet checks {one ? "the result" : "each result"} again.
        </Banner>
      </form>
    </Drawer>
  )
}
