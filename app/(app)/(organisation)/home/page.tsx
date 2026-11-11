import { getSession } from "@/lib/session"

export default async function HomePage() {
  const session = await getSession()

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-display text-[32px] leading-10 text-grey-900">Welcome, {session?.user.name.split(" ")[0]}</h1>
      <p className="text-base text-grey-700">Your work across every programme, in one place.</p>
    </div>
  )
}
