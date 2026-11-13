"use client"

import { useState } from "react"
import { Drawer } from "@/components/app/drawer"
import { Button } from "@/components/ui/button"
import { DetailsList } from "@/components/ui/details-list"

type ViewAnswerProps = {
  question: { askedBy: string; organisation: string; question: string; about: string }
  answer: { text: string; by: string; on: string; files: string[]; accessEndsOn: string }
}

export function ViewAnswer({ question, answer }: ViewAnswerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="text" size="sm" onClick={() => setOpen(true)}>
        View
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Answer to ${question.askedBy}`}
        description={`${question.organisation}. About ${question.about}.`}
        footer={
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="flex flex-col gap-6">
          <blockquote className="border-l-2 border-brand-200 py-0.5 pl-4 text-sm leading-[22px] text-grey-800">
            {question.question}
          </blockquote>
          <p className="text-sm leading-[22px] text-grey-900">{answer.text}</p>
          <DetailsList
            items={[
              { label: "Answered by", value: `${answer.by}, ${answer.on}` },
              { label: "Files shared", value: answer.files.length > 0 ? answer.files.join(", ") : "None" },
              { label: "Access ends", value: answer.accessEndsOn },
            ]}
          />
        </div>
      </Drawer>
    </>
  )
}
