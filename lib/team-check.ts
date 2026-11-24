import type { JobRole, Permission } from "@/lib/session"

type Member = { email: string; name: string; jobRole: JobRole; permissions: Permission[] }

export type TeamCheck = {
  tone: "ok" | "warn" | "error"
  title: string
  text: string
}

export function checkTeam(team: Member[]): TeamCheck {
  const leads = team.filter((member) => member.jobRole === "compliance-lead")
  const holders = team.filter((member) => member.permissions.includes("sign-off"))

  if (leads.length === 0) {
    return {
      tone: "error",
      title: "Nobody can submit claims",
      text: "There's no Compliance lead on this programme. Change someone's job role to Compliance lead.",
    }
  }

  if (holders.length === 0) {
    return {
      tone: "error",
      title: "Nobody can sign off",
      text: "Results accepted as is or challenged can't be approved, so claims with them can't be submitted. Give someone Sign-off.",
    }
  }

  const stuck = leads.find((lead) => holders.every((holder) => holder.email === lead.email))
  if (stuck) {
    return {
      tone: "error",
      title: `Nobody can approve ${stuck.name}'s decisions`,
      text: `${stuck.name} is the only Sign-off holder and can't approve their own decisions. Give Sign-off to someone else.`,
    }
  }

  if (holders.length === 1) {
    return {
      tone: "warn",
      title: `Only ${holders[0].name} can sign off`,
      text: "If they're away, results accepted as is or challenged wait for them. Give Sign-off to someone who isn't the Compliance lead.",
    }
  }

  return {
    tone: "ok",
    title: `${holders.length} Sign-off holders and ${leads.length === 1 ? "a Compliance lead" : `${leads.length} Compliance leads`}`,
    text: "Results can always be approved by someone other than whoever decided them.",
  }
}
