"use client"

import { useRef, useState } from "react"
import { FileIcon, FilePlus, X } from "lucide-react"
import { Columns } from "@/components/app/columns"
import { Section } from "@/components/app/section"
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { formatFileSize, plural } from "@/lib/format"
import { evidenceFileSchema, evidenceFilesSchema } from "@/lib/validations/evidence"
import { ScopeBar } from "./scope-bar"

type AddFilesStepProps = {
  initial: File[]
  scopeSentence: string
  footNote: string
  sidePanel: React.ReactNode
  onChangeScope: () => void
  onContinue: (files: File[]) => void
}

export function AddFilesStep({ initial, scopeSentence, footNote, sidePanel, onChangeScope, onContinue }: AddFilesStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>(initial)
  const [rejected, setRejected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function addFiles(list: FileList | null) {
    if (!list) return

    const added: File[] = []
    const problems: string[] = []

    Array.from(list).forEach((file) => {
      const parsed = evidenceFileSchema.safeParse(file)
      const duplicate = [...files, ...added].some((item) => item.name === file.name && item.size === file.size)

      if (!parsed.success) problems.push(`${file.name}: ${parsed.error.issues[0]?.message}`)
      else if (!duplicate) added.push(file)
    })

    setFiles([...files, ...added])
    setRejected(problems)
    setError(null)
  }

  function remove(index: number) {
    setFiles(files.filter((_, position) => position !== index))
  }

  function next() {
    const parsed = evidenceFilesSchema.safeParse(files)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your files")
      return
    }

    onContinue(files)
  }

  return (
    <>
      <ScopeBar sentence={scopeSentence} onChange={onChangeScope} />
      <Columns
        main={
          <Section
            title="Your files"
            action={
              <span className="rounded-full bg-grey-100 px-2 text-xs leading-5 font-semibold text-grey-800">
                {files.length}
              </span>
            }
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx"
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ""
              }}
            />
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                addFiles(event.dataTransfer.files)
              }}
              className={cn(
                "flex flex-wrap items-center gap-4 rounded-lg border-[1.5px] border-dashed px-6 py-5",
                dragging ? "border-brand-400 bg-brand-50" : "border-brand-200 bg-brand-tint",
              )}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <FilePlus className="size-6" />
              </span>
              <div className="min-w-[200px] flex-1">
                <p className="font-semibold text-grey-900">Drag files here</p>
                <p className="text-sm text-grey-700">
                  Payslips, employer letters, start forms, consent forms and referral letters.
                </p>
              </div>
              <Button variant="secondary" onClick={() => inputRef.current?.click()}>
                Choose files
              </Button>
            </div>

            {rejected.length > 0 && (
              <Banner tone="warn" title={`${plural(rejected.length, "file")} can't be added`} className="mt-4">
                <ul className="mt-1 list-disc pl-5">
                  {rejected.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              </Banner>
            )}

            {files.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}`}
                    className="flex h-11 items-center gap-2.5 rounded-md border border-grey-200 pr-1 pl-3"
                  >
                    <FileIcon className="size-[18px] shrink-0 text-brand-600" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-grey-900">{file.name}</span>
                    <span className="shrink-0 text-xs text-grey-700">{formatFileSize(file.size)}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => remove(index)}
                      className="flex size-8 items-center justify-center rounded text-grey-600 hover:bg-grey-100"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p role="alert" className="mt-3 text-sm text-danger-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-grey-200 pt-4">
              <p className="flex-1 text-xs text-grey-700">{footNote}</p>
              <Button disabled={files.length === 0} onClick={next}>
                Match {plural(files.length, "file")}
              </Button>
            </div>
          </Section>
        }
        side={
          <>
            <Section title="Before you add files">
              <p className="text-sm leading-[22px] text-grey-800">
                Photos and scans are fine if they&apos;re clear. Put the participant reference in the file name, like
                NS-0433, and the file is matched for you.
              </p>
            </Section>
            {sidePanel}
          </>
        }
      />
    </>
  )
}
