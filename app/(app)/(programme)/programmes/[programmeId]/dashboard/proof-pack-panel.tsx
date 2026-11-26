import { FileCheck } from "lucide-react"
import type { PrimeDashboard } from "@/lib/dashboard"
import { DownloadLink } from "../proof-pack/download-link"
import { Panel, PanelLink } from "./panel"

type ProofPackPanelProps = {
  programmeId: string
  pack: PrimeDashboard["proofPack"]
  className?: string
}

export function ProofPackPanel({ programmeId, pack, className }: ProofPackPanelProps) {
  return (
    <Panel
      title="Proof pack"
      action={<PanelLink href={`/programmes/${programmeId}/proof-pack`}>All versions</PanelLink>}
      className={className}
    >
      {pack ? (
        <>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <FileCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-grey-900">Version {pack.version}</p>
              <p className="text-xs text-grey-700">{pack.madeOn}</p>
            </div>
          </div>
          <div className="mt-4 [&>a]:w-full">
            <DownloadLink href={pack.href} label={`Download Version ${pack.version}`} />
          </div>
        </>
      ) : (
        <p className="py-6 text-center text-sm text-grey-700">No proof pack yet</p>
      )}
    </Panel>
  )
}
