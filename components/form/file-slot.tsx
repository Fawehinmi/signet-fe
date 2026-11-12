"use client"

import { useId, useRef, useState } from "react"
import { FileIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { formatFileSize } from "@/lib/format"

type FileSlotProps = {
  label: string
  required?: boolean
  file?: File
  error?: string
  accept?: string
  hint?: string
  detail?: string
  onChange: (file?: File) => void
}

export function FileSlot({
  label,
  required,
  file,
  error,
  accept = ".pdf,.doc,.docx",
  hint = "Drop a PDF or Word file here, or",
  detail,
  onChange,
}: FileSlotProps) {
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function choose(files: FileList | null) {
    if (files?.[0]) onChange(files[0])
  }

  function openPicker() {
    inputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-semibold text-grey-900">{label}</span>
        <span className={cn("text-xs font-semibold", required ? "text-brand-600" : "text-grey-700")}>
          {required ? "Required" : "Optional"}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          choose(event.target.files)
          event.target.value = ""
        }}
      />
      {file ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border py-3 pr-2 pl-4",
            error ? "border-danger-400" : "border-grey-300",
          )}
        >
          <FileIcon className="size-[22px] shrink-0 text-brand-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-grey-900">{file.name}</p>
            <p className="text-xs text-grey-700">{detail ?? `${formatFileSize(file.size)}, added just now`}</p>
          </div>
          <Button variant="text" size="sm" aria-label={`Replace ${label}`} aria-describedby={error ? errorId : undefined} onClick={openPicker}>
            Replace
          </Button>
          <Button variant="text" size="sm" aria-label={`Remove ${label}`} onClick={() => onChange(undefined)}>
            Remove
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            choose(event.dataTransfer.files)
          }}
          className={cn(
            "flex flex-wrap items-center gap-3 rounded-lg border-[1.5px] border-dashed px-4 py-3.5",
            error && "border-danger-400 bg-danger-50",
            !error && dragging && "border-brand-400 bg-brand-50",
            !error && !dragging && "border-brand-200 bg-brand-tint",
          )}
        >
          <Upload className="size-5 shrink-0 text-brand-600" />
          <span className="flex-1 text-sm text-grey-700">{hint}</span>
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Choose file for ${label}`}
            aria-describedby={error ? errorId : undefined}
            onClick={openPicker}
          >
            Choose file
          </Button>
        </div>
      )}
      {error && (
        <p id={errorId} className="pl-4 text-xs leading-4 text-danger-700">
          {error}
        </p>
      )}
    </div>
  )
}
