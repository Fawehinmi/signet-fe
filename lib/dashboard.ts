import { joinNames } from "@/lib/claim-labels"
import { claimTotal, getClaimCounts, getMonths, getToFix, type ClaimMonth } from "@/lib/data/claims"
import { getLastUpload } from "@/lib/data/evidence"
import { getPartner, getPartners } from "@/lib/data/partners"
import { getParticipantNames } from "@/lib/data/participants"
import { getProofPackVersions } from "@/lib/data/proof-packs"
import { getMonthResults, waitingDays } from "@/lib/data/results"
import { getTeam } from "@/lib/data/team"
import { formatDate, plural, today } from "@/lib/format"
import { jobRoleLabels } from "@/lib/programme-labels"
import { resultKinds, resultNouns } from "@/lib/result-checks"
import type { JobRole } from "@/lib/session"
import { checkTeam } from "@/lib/team-check"

export type Viewer = { name: string; jobRole: JobRole; admin: boolean }

export type NeedItem = {
  key: string
  kind: "check" | "chase" | "partner" | "team" | "asked" | "sent-back" | "waiting" | "needs"
  title: string
  action: string
  href: string
}

export const claimStages = ["Ready to review", "Waiting for Sign-off", "Ready to submit", "Submitted", "Closed"]

const stageIndex: Record<ClaimMonth["status"], number> = {
  open: -1,
  "ready-to-review": 0,
  "sent-back": 0,
  "waiting-for-sign-off": 1,
  "ready-to-submit": 2,
  submitted: 3,
  accepted: 4,
}

function daysUntil(date: string) {
  return Math.round((new Date(date).getTime() - new Date(today()).getTime()) / 86400000)
}

function dueLabel(sendBy: string) {
  const days = daysUntil(sendBy)
  if (days < 0) return "Overdue"
  if (days === 0) return "Today"
  return days <= 14 ? plural(days, "day") : formatDate(sendBy)
}

export async function getPrimeDashboard(programmeId: string, viewer: Viewer) {
  const base = `/programmes/${programmeId}`
  const [months, toFix, partners, team, names, versions, lastUpload] = await Promise.all([
    getMonths(programmeId),
    getToFix(programmeId),
    getPartners(programmeId),
    getTeam(programmeId),
    getParticipantNames(programmeId),
    getProofPackVersions(programmeId),
    getLastUpload(programmeId),
  ])

  const current = months.find((month) => month.latest?.status === "draft") ?? months.find((month) => month.status === "open") ?? null
  const currentResults = current ? await getMonthResults(programmeId, current.period.id) : []
  const leads = team.filter((member) => member.jobRole === "compliance-lead").map((member) => member.name)
  const signOff = team.filter((member) => member.permissions.includes("sign-off")).map((member) => member.name)
  const stage = current ? stageIndex[current.status] : -1
  const stageNotes = [joinNames(leads), joinNames(signOff), joinNames(leads), "", ""]

  const claimed = months.filter((month) => month.status === "accepted").reduce((total, month) => total + month.results, 0)
  const overdue = toFix.filter((row) => waitingDays(row.result) >= 14).length
  const nameOf = (ref: string) => names[ref] ?? ref

  const needs: NeedItem[] = []
  if (viewer.admin) {
    for (const { result } of toFix.filter((row) => row.result.check && !row.result.check.answer)) {
      needs.push({
        key: `check-${result.id}`,
        kind: "check",
        title: `${nameOf(result.participantRef)}'s ${resultNouns[result.result]} was sent for checking`,
        action: "Check",
        href: `${base}/claims/to-fix`,
      })
    }
  }
  const canChaseAll = viewer.jobRole === "compliance-lead"
  for (const { result } of toFix) {
    const pending = result.heldDecision || (result.check && !result.check.answer) || result.chases.length > 0
    const allowed = canChaseAll || (viewer.admin && !result.partnerName)
    if (pending || !allowed || waitingDays(result) < 14) continue
    needs.push({
      key: `chase-${result.id}`,
      kind: "chase",
      title: `${nameOf(result.participantRef)}'s ${resultNouns[result.result]} has waited ${plural(waitingDays(result), "day")}`,
      action: "Chase",
      href: `${base}/claims/to-fix`,
    })
  }
  if (viewer.admin || viewer.jobRole === "programme-manager") {
    for (const partner of partners.filter((item) => item.atRisk)) {
      needs.push({
        key: `partner-${partner.id}`,
        kind: "partner",
        title:
          partner.overdueChecks > 0
            ? `${partner.name} has ${plural(partner.overdueChecks, "overdue check")}`
            : `${partner.name} is behind`,
        action: "Follow up",
        href: `${base}/partners/${partner.id}`,
      })
    }
  }
  const teamCheck = checkTeam(team)
  if (viewer.admin && teamCheck.tone !== "ok") {
    needs.push({
      key: "team",
      kind: "team",
      title: teamCheck.title,
      action: teamCheck.tone === "warn" ? "Add another" : "Fix team",
      href: `${base}/team`,
    })
  }

  const partnerRows = await Promise.all(
    partners.map(async (partner) => {
      const details = await getPartner(programmeId, partner.id)
      const sent = details?.receipts.map((receipt) => receipt.sentOn).sort().at(-1)

      return {
        key: partner.id,
        name: partner.name,
        href: `${base}/partners/${partner.id}`,
        results: currentResults.filter((result) => result.partnerName === partner.name).length,
        fixes: partner.overdueChecks + partner.needsEvidence,
        lastSent: sent ? formatDate(sent) : "Not yet",
        behind: partner.atRisk,
      }
    }),
  )
  partnerRows.push({
    key: "own",
    name: "Your own delivery",
    href: "",
    results: currentResults.filter((result) => !result.partnerName).length,
    fixes: toFix.filter((row) => !row.result.partnerName).length,
    lastSent: lastUpload ? formatDate(lastUpload) : "Not yet",
    behind: false,
  })

  const chart = await Promise.all(
    [...months]
      .reverse()
      .filter((month) => month.latest)
      .map(async (month) => {
        const counts = month.latest ? await getClaimCounts(programmeId, month.latest) : []
        const sum = (kind: string) =>
          counts.filter((count) => count.kind === kind).reduce((total, count) => total + count.fromPartners + count.ownDelivery, 0)

        return {
          key: month.period.id,
          month: month.period.label.split(" ")[0].slice(0, 3),
          label: month.period.label,
          closed: month.status === "accepted",
          total: claimTotal(counts),
          parts: Object.fromEntries(resultKinds.map((kind) => [kind, sum(kind)])) as Record<(typeof resultKinds)[number], number>,
          revisions: sum("Adjustment"),
        }
      }),
  )

  const latestPack = versions[0] ?? null

  return {
    numbers: {
      claimed,
      due: current ? { label: `${current.period.label.split(" ")[0]} claim due`, value: dueLabel(current.period.sendBy) } : null,
      fixes: toFix.length,
      overdue,
      partnersOnTrack: partners.filter((partner) => !partner.atRisk).length,
      partners: partners.length,
    },
    needs,
    claim: current
      ? {
          label: `${current.period.label} claim`,
          href: `${base}/claims/${current.period.id}`,
          results: current.results,
          ready: current.results - current.issues,
          fixes: current.issues,
          stages: claimStages.map((name, index) => ({
            name,
            state: index < stage ? "done" : index === stage ? "current" : "next",
            note: index === stage ? stageNotes[index] : "",
          })),
        }
      : null,
    partners: partnerRows,
    team: viewer.admin
      ? team.map((member) => ({
          email: member.email,
          name: member.name,
          role: `${jobRoleLabels[member.jobRole]}${member.admin ? ", admin" : ""}`,
          signOff: member.permissions.includes("sign-off"),
        }))
      : null,
    chart,
    proofPack: latestPack
      ? {
          version: latestPack.version,
          madeOn: formatDate(latestPack.madeOn),
          href: `${base}/proof-pack/download?version=${latestPack.version}`,
        }
      : null,
  }
}

export type PrimeDashboard = Awaited<ReturnType<typeof getPrimeDashboard>>
