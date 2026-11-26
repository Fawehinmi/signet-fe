export type ProofPackProgress = {
  version: number
  status: "generating" | "ready" | "failed"
  percent: number
  step: number
}

export const generationSteps = ["Gathering results", "Building", "Ready to download"]
