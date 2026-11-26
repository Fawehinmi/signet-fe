import type { Permission, ProgrammeMembership, Session } from "@/lib/session"

export type IconName =
  | "home"
  | "layers"
  | "users"
  | "sliders"
  | "grid"
  | "partners"
  | "inbox"
  | "file-check"
  | "upload"
  | "message"
  | "building"
  | "book"
  | "person"
  | "clipboard"
  | "alert"
  | "check-circle"
  | "send"
  | "shield"
  | "file-text"
  | "file-plus"

export type NavItem = {
  key: string
  label: string
  href: string
  icon: IconName
  mobileLabel?: string
  divider?: boolean
}

export function orgNavigation(session: Session): NavItem[] {
  const items: NavItem[] = [
    { key: "home", label: "Home", href: "/home", icon: "home" },
    { key: "programmes", label: "Programmes", href: "/programmes", icon: "layers" },
  ]

  if (session.organisation?.access === "admin") {
    items.push(
      { key: "personnel", label: "Personnel", href: "/personnel", icon: "users" },
      { key: "settings", label: "Settings", href: "/settings", icon: "sliders" },
    )
  }

  return items
}

export function programmeNavigation(session: Session, programme: ProgrammeMembership): NavItem[] {
  const isAdmin = session.organisation?.access === "admin"
  const has = (permission: Permission) => programme.permissions.includes(permission)
  const item = (key: string, label: string, icon: IconName, mobileLabel?: string): NavItem => ({
    key,
    label,
    icon,
    mobileLabel,
    href: `/programmes/${programme.id}/${key}`,
  })
  const when = (condition: boolean, navItem: NavItem) => (condition ? [navItem] : [])

  const home = { ...item("home", "Home", "home"), divider: true }
  const dashboard = item("dashboard", "Dashboard", "grid")
  const participants = item("participants", "Participants", "person")
  const outcomeChecks = item("outcome-checks", "Outcome checks", "clipboard", "Checks")
  const claims = item("claims", "Claims", "inbox")
  const proofPack = item("proof-pack", "Proof pack", "file-check")
  const imports = item("imports", "Imports", "upload")
  const uploadEvidence = item("upload-evidence", "Upload evidence", "file-plus", "Upload")
  const questions = item("questions", "Questions", "message")
  const organisations = item("organisations", "Organisations", "building")
  const rules = item("rules", "Rules", "book")
  const team = item("team", "Programme team", "users")
  const settings = item("settings", "Programme settings", "sliders")
  const needsEvidence = item("needs-evidence", "Needs evidence", "alert")

  if (programme.position === "prime" && programme.jobRole === "caseworker") {
    return [
      dashboard,
      item("participants", "My participants", "users", "Participants"),
      needsEvidence,
      ...when(has("bulk-upload"), uploadEvidence),
    ]
  }

  if (programme.jobRole === "caseworker") {
    return [
      home,
      dashboard,
      participants,
      outcomeChecks,
      ...when(has("bulk-upload"), uploadEvidence),
    ]
  }

  if (programme.position === "commissioner") {
    if (programme.status !== "live") {
      return [dashboard, rules, organisations, team, ...when(isAdmin, settings)]
    }

    return [
      home,
      dashboard,
      rules,
      organisations,
      team,
      claims,
      questions,
      item("dwp-return", "DWP return", "file-text"),
      proofPack,
      ...when(isAdmin, settings),
    ]
  }

  if (programme.position === "prime") {
    return [
      dashboard,
      ...when(has("bulk-import"), imports),
      rules,
      claims,
      proofPack,
      item("follow-up", "Follow up", "message"),
      item("partners", "Our partners", "partners"),
      team,
      ...when(isAdmin, settings),
    ]
  }

  return [
    home,
    dashboard,
    participants,
    outcomeChecks,
    needsEvidence,
    ...when(has("sign-off"), item("approvals", "Approvals", "check-circle")),
    item("send-to-prime", "Send to prime", "send"),
    proofPack,
    ...when(has("bulk-import"), imports),
    ...when(has("bulk-upload"), uploadEvidence),
    questions,
    ...when(has("privacy"), item("privacy", "Privacy", "shield")),
    rules,
    ...when(isAdmin, organisations),
    team,
    ...when(isAdmin, settings),
  ]
}

export function findProgramme(session: Session, programmeId: string) {
  return session.programmes.find((programme) => programme.id === programmeId)
}

export function canOpen(session: Session, programme: ProgrammeMembership, key: string) {
  return programmeNavigation(session, programme).some((navItem) => navItem.key === key)
}
