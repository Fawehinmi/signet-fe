"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/ui/logo"

const signedOutRoutes = ["/sign-up", "/verify-email/expired"]
const linkClass = "font-semibold text-brand-600 underline underline-offset-2"

export function AuthTopBar({ email }: { email?: string }) {
  const pathname = usePathname()
  const signedIn = email && !signedOutRoutes.includes(pathname)

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-6 lg:justify-end lg:px-12 lg:py-8">
      <Logo className="lg:hidden" />
      <div className="flex items-center gap-3 text-sm">
        {signedIn ? (
          <>
            <span className="hidden text-grey-700 sm:inline">{email}</span>
            <Link href="/sign-out" className={linkClass}>
              Sign out
            </Link>
          </>
        ) : (
          <>
            <span className="hidden text-grey-700 sm:inline">Already have an account?</span>
            <Link href="/sign-in" className={linkClass}>
              Sign in
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
