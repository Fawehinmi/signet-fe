"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/app/page-header"
import { Stepper } from "@/components/app/stepper"
import { buttonStyles } from "@/components/ui/button"
import type { ImportType, MatchColumnsValues } from "@/lib/validations/imports"
import { ChooseFileStep } from "./choose-file-step"
import { MatchColumnsStep } from "./match-columns-step"
import { PreviewStep } from "./preview-step"

export type ImportFile = {
  source: File
  name: string
  type: ImportType
  headers: string[]
  rows: string[][]
}

type ImportWizardProps = {
  programmeId: string
  aiOn: boolean
  savedMatchings: Record<ImportType, Record<string, string>>
}

export function ImportWizard({ programmeId, aiOn, savedMatchings }: ImportWizardProps) {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<ImportFile | null>(null)
  const [matching, setMatching] = useState<MatchColumnsValues | null>(null)
  const importsPath = `/programmes/${programmeId}/imports`

  return (
    <>
      <PageHeader
        title="Import file"
        breadcrumbs={[{ label: "Imports", href: importsPath }, { label: "Import file" }]}
        actions={
          <Link href={importsPath} className={buttonStyles({ variant: "secondary" })}>
            Cancel
          </Link>
        }
      />
      <div className="mb-8">
        <Stepper steps={["Choose file", "Match columns", "Preview", "Confirm"]} current={step} />
      </div>

      {step === 1 && (
        <ChooseFileStep
          initial={file}
          onContinue={(chosen) => {
            if (chosen.source !== file?.source || chosen.type !== file?.type) setMatching(null)
            setFile(chosen)
            setStep(2)
          }}
        />
      )}

      {step === 2 && file && (
        <MatchColumnsStep
          file={file}
          aiOn={aiOn}
          saved={savedMatchings[file.type]}
          initial={matching}
          onBack={() => setStep(1)}
          onContinue={(values) => {
            setMatching(values)
            setStep(3)
          }}
        />
      )}

      {step >= 3 && file && matching && (
        <PreviewStep
          programmeId={programmeId}
          file={file}
          matching={matching}
          confirming={step === 4}
          onBack={() => setStep(2)}
          onConfirm={() => setStep(4)}
          onCancelConfirm={() => setStep(3)}
        />
      )}
    </>
  )
}
