import { notFound } from "next/navigation"
import { getRules } from "@/lib/data/rules"
import { getProgrammePage } from "@/lib/programme-page"
import { LiveRules } from "./live-rules"
import { ReadOnlyRules } from "./read-only-rules"
import { RulesInProgress } from "./rules-in-progress"
import { RulesReview } from "./rules-review"
import { UploadDocuments } from "./upload-documents"

type RulesPageProps = {
  params: Promise<{ programmeId: string }>
}

export default async function RulesPage({ params }: RulesPageProps) {
  const { programmeId } = await params
  const { session, organisation, programme } = await getProgrammePage(programmeId, "rules")

  const rules = await getRules(programmeId)
  if (!rules) notFound()

  if (rules.startedBy !== programme.position) {
    return <ReadOnlyRules rules={rules} />
  }

  if (rules.status === "waiting-for-documents") {
    return <UploadDocuments programmeId={programmeId} />
  }

  if (rules.status === "rules-in-progress") {
    return <RulesInProgress rules={rules} />
  }

  if (rules.status === "waiting-for-confirmation") {
    return (
      <RulesReview
        rules={rules}
        programme={{ id: programme.id, name: programme.name }}
        organisationName={organisation.name}
        userName={session.user.name}
        canSignOff={programme.permissions.includes("sign-off")}
      />
    )
  }

  return <LiveRules rules={rules} programmeId={programmeId} organisationId={organisation.id} />
}
