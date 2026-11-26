"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, CircleAlert, Download, LoaderCircle, X } from "lucide-react"
import { buttonStyles } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { generationSteps, type ProofPackProgress } from "@/lib/proof-pack-progress"
import { GenerateButton } from "./generate-button"

type GenerationProgressProps = {
  programmeId: string
  progress: ProofPackProgress
  downloadHref: string
}

const tones = {
  generating: "border-brand-200 bg-brand-50",
  ready: "border-success-200 bg-success-50",
  failed: "border-danger-200 bg-danger-50",
}

export function GenerationProgress({ programmeId, progress, downloadHref }: GenerationProgressProps) {
  const router = useRouter()
  const generating = progress.status === "generating"

  useEffect(() => {
    if (!generating) return
    const timer = window.setInterval(() => router.refresh(), 1500)
    return () => window.clearInterval(timer)
  }, [generating, router])

  const title = {
    generating: `Generating Version ${progress.version}`,
    ready: `Version ${progress.version} is ready`,
    failed: `Version ${progress.version} couldn't be generated`,
  }[progress.status]

  return (
    <div role="status" className={cn("rounded-lg border px-5 py-4", tones[progress.status])}>
      <div className="flex items-center gap-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white">
          {progress.status === "generating" && <LoaderCircle className="size-5 animate-spin text-brand-600" />}
          {progress.status === "ready" && <Check className="size-5 text-success-800" strokeWidth={2.6} />}
          {progress.status === "failed" && <CircleAlert className="size-5 text-danger-700" />}
        </span>
        <p className="flex-1 text-[15px] font-semibold text-grey-900">{title}</p>
        {generating && <span className="font-display text-xl text-brand-700">{progress.percent}%</span>}
        {progress.status === "ready" && (
          <a href={downloadHref} download className={buttonStyles({ size: "sm" })}>
            <Download className="size-4" />
            Download
          </a>
        )}
        {progress.status === "failed" && (
          <GenerateButton programmeId={programmeId} label="Try again" variant="secondary" size="sm" />
        )}
      </div>

      {generating && (
        <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-brand-500 transition-[width] duration-700" style={{ width: `${progress.percent}%` }} />
        </div>
      )}

      <ol className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2">
        {generationSteps.map((step, index) => {
          const failed = progress.status === "failed" && index === progress.step
          const done = !failed && (index < progress.step || progress.status === "ready")
          const current = progress.status === "generating" && index === progress.step

          return (
            <li key={step} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-[18px] items-center justify-center rounded-full border-2 border-grey-300 bg-white text-white",
                  done && (progress.status === "ready" ? "border-success-800 bg-success-800" : "border-brand-500 bg-brand-500"),
                  current && "border-brand-500",
                  failed && "border-danger-700 bg-danger-700",
                )}
              >
                {done && <Check className="size-2.5" strokeWidth={3.2} />}
                {failed && <X className="size-2.5" strokeWidth={3.2} />}
                {current && <span className="size-1.5 rounded-full bg-brand-500" />}
              </span>
              <span className={cn("text-[13px] text-grey-700", (done || current || failed) && "font-semibold text-grey-900")}>
                {step}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
