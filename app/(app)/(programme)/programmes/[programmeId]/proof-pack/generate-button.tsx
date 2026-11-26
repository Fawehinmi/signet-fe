"use client"

import { useState, useTransition } from "react"
import { LoaderCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateProofPack } from "./actions"

type GenerateButtonProps = {
  programmeId: string
  label: string
  generating?: boolean
  variant?: "primary" | "secondary"
  size?: "md" | "sm"
}

export function GenerateButton({ programmeId, label, generating = false, variant = "primary", size = "md" }: GenerateButtonProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const busy = generating || pending

  function generate() {
    startTransition(async () => {
      const response = await generateProofPack(programmeId)
      setError(response.errors?.message[0] ?? null)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant={variant} size={size} disabled={busy} onClick={generate}>
        {busy ? <LoaderCircle className="size-[18px] animate-spin" /> : <RefreshCw className="size-[18px]" />}
        {busy ? "Generating" : label}
      </Button>
      {error && (
        <p role="alert" className="text-[13px] text-danger-700">
          {error}
        </p>
      )}
    </div>
  )
}
