"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/app/page-header"
import { Stepper } from "@/components/app/stepper"
import { buttonStyles } from "@/components/ui/button"
import { describeScope, participantsInScope, suggestMatch, type CaseloadParticipant } from "@/lib/evidence-matching"
import { isReady, MatchFilesStep, type MatchRow } from "./match-files-step"
import { AddFilesStep } from "./add-files-step"
import { ReviewStep } from "./review-step"
import { ScopeStep } from "./scope-step"
import { uploadEvidence } from "../actions"
import type { ResultCheck } from "@/lib/result-checks"
import type { UploadScope } from "@/lib/validations/evidence"

type UploadWizardProps = {
  programmeId: string
  periods: { id: string; label: string }[]
  caseload: CaseloadParticipant[]
  pool: string
  aiOn: boolean
  checks: ResultCheck[]
  initialScope: UploadScope | null
}

export function UploadWizard({ programmeId, periods, caseload, pool, aiOn, checks, initialScope }: UploadWizardProps) {
  const [step, setStep] = useState(1)
  const [scope, setScope] = useState<UploadScope | null>(initialScope)
  const [files, setFiles] = useState<File[]>([])
  const [rows, setRows] = useState<MatchRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()

  const uploadsPath = `/programmes/${programmeId}/upload-evidence`
  const inScope = scope ? participantsInScope(caseload, scope) : []
  const described = scope ? describeScope(scope, periods, caseload) : null
  const chosenRefs = scope?.kind === "participant" || (scope?.kind === "month" && scope.who === "some") ? scope.participantRefs : []
  const chosenNames = chosenRefs.map((ref) => caseload.find((participant) => participant.ref === ref)?.name ?? ref)
  const onlyOne = chosenNames.length === 1 ? chosenNames[0] : null

  function matchFiles(chosenScope: UploadScope, chosenFiles: File[]) {
    const scoped = participantsInScope(caseload, chosenScope)

    return chosenFiles.map((file, index) => {
      const match = suggestMatch(file.name, caseload, scoped, chosenScope, aiOn)
      return {
        id: `${index}-${file.name}`,
        file,
        ...match,
        confirmed: match.status === "matched",
        unmatched: match.status === "out",
      }
    })
  }

  function unmatchedReason(row: MatchRow) {
    if (row.status !== "out") return "We couldn't tell who it's for."
    return chosenNames.length > 0 ? `It isn't for ${chosenNames.join(" or ")}.` : "It isn't for anyone in this upload."
  }

  function submit() {
    if (!scope) return
    setError(null)

    const ready = rows.filter(isReady)
    const formData = new FormData()
    formData.set(
      "request",
      JSON.stringify({
        scope,
        matches: ready.map(({ participantRef, evidenceType, result }) => ({ participantRef, evidenceType, result })),
        unmatched: rows
          .filter((row) => row.unmatched)
          .map((row) => ({ name: row.file.name, size: row.file.size, reason: unmatchedReason(row) })),
      }),
    )
    ready.forEach((row) => formData.append("files", row.file))

    startSaving(async () => {
      const result = await uploadEvidence(programmeId, formData)
      if (result?.error) setError(result.error)
    })
  }

  const matchTitle = onlyOne ? "Check each file" : "Check who each file is for"
  const matchDescription = onlyOne
    ? `You chose only ${onlyOne}, so every file is matched to them. Check the evidence type and result, then confirm each one. Files that can't be matched go to Unmatched.`
    : chosenNames.length > 0
      ? `Only ${chosenNames.join(" and ")} are listed. Files that don't match them go to Unmatched.`
      : scope?.kind === "month"
        ? `Only participants with a result in ${described?.month} are listed. Files that can't be matched go to Unmatched.`
        : `Only participants in ${pool} are listed. Files that can't be matched go to Unmatched.`

  return (
    <>
      <PageHeader
        title="Upload evidence"
        breadcrumbs={[{ label: "Upload evidence", href: uploadsPath }, { label: "New upload" }]}
        actions={
          <Link href={uploadsPath} className={buttonStyles({ variant: "secondary" })}>
            Cancel
          </Link>
        }
      />
      <div className="mb-8">
        <Stepper steps={["What it's for", "Add files", "Match files", "Preview"]} current={step} />
      </div>

      {step === 1 && (
        <ScopeStep
          initial={scope}
          periods={periods}
          caseload={caseload}
          pool={pool}
          onContinue={(chosen) => {
            setScope(chosen)
            setRows([])
            setStep(2)
          }}
        />
      )}

      {step === 2 && scope && described && (
        <AddFilesStep
          initial={files}
          scopeSentence={described.sentence}
          footNote={
            onlyOne ? `Only for ${onlyOne}.` : chosenNames.length > 0 ? "Only for the participants you chose." : `Only for participants in ${pool}.`
          }
          onChangeScope={() => setStep(1)}
          onContinue={(chosenFiles) => {
            const unchanged = chosenFiles.length === files.length && chosenFiles.every((file, index) => file === files[index])
            if (!unchanged || rows.length === 0) setRows(matchFiles(scope, chosenFiles))
            setFiles(chosenFiles)
            setStep(3)
          }}
        />
      )}

      {step === 3 && scope && described && (
        <MatchFilesStep
          rows={rows}
          inScope={inScope}
          scopeSentence={described.sentence}
          title={matchTitle}
          description={matchDescription}
          onRowsChange={setRows}
          onBack={() => setStep(2)}
          onContinue={() => setStep(4)}
        />
      )}

      {step === 4 && scope && described && (
        <ReviewStep
          rows={rows}
          inScope={inScope}
          scope={scope}
          checks={checks}
          scopeDetails={
            scope.kind === "participant"
              ? [{ label: "Participant", value: described.people }]
              : [
                  { label: "Month", value: described.month ?? "Whole programme" },
                  { label: "Participants", value: described.people },
                ]
          }
          saving={saving}
          error={error}
          onBack={() => setStep(3)}
          onSubmit={submit}
        />
      )}
    </>
  )
}
