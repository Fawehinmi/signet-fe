import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { StartProgrammeForm } from "./start-programme-form"

export default async function StartProgrammePage() {
    const session = await getSession()
    if (session?.organisation?.access !== "admin") redirect("/programmes")

    return <StartProgrammeForm organisationName={session.organisation.name} />
}