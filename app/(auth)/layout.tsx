import Link from "next/link"
import { CircleHelp } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { AuthSteps, AuthStepsCompact } from "@/components/auth/auth-steps"
import { AuthTopBar } from "@/components/auth/auth-top-bar"
import { getSessionEmail } from "@/lib/session"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const email = await getSessionEmail()

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[440px] shrink-0 flex-col justify-between overflow-y-auto bg-brand-50 px-12 py-10 lg:flex">
        <Logo />
        <div className="py-10">
          <h2 className="mb-3 max-w-[320px] font-display text-[30px] leading-[38px] tracking-[0.25px] text-grey-900">
            Set up Signet for your organisation
          </h2>
          <p className="mb-10 max-w-[330px] text-base text-grey-800">
            Three short steps. Once you&apos;re in, you can invite your team.
          </p>
          <AuthSteps />
        </div>
        <p className="flex items-center gap-2 text-sm text-grey-800">
          <CircleHelp className="size-[18px] text-brand-600" />
          Need help?
          <Link href="/help" className="font-semibold text-brand-600 underline underline-offset-2">
            Contact Signet
          </Link>
        </p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AuthTopBar email={email} />
        <main className="mx-auto w-full max-w-[480px] flex-1 px-6 pt-4 pb-16 lg:pt-16">
          <div className="mb-8 lg:hidden">
            <AuthStepsCompact />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
