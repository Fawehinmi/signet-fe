import { AuthHeading } from "@/components/auth/auth-heading"
import { getSessionEmail } from "@/lib/session"
import { OrganisationForm } from "./organisation-form"

export default async function NewOrganisationPage() {
  const email = await getSessionEmail()
  const emailDomain = email?.split("@")[1] ?? ""

  return (
    <>
      <AuthHeading
        title="Add your organisation"
        description="You'll be its Organisation admin, so you can invite your team and choose settings."
      />
      <OrganisationForm emailDomain={emailDomain} />
    </>
  )
}
