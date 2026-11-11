import { AuthHeading } from "@/components/auth/auth-heading"
import { SignUpForm } from "./sign-up-form"

export default function SignUpPage() {
  return (
    <>
      <AuthHeading title="Create your account" description="Use your work email. You'll add your organisation next." />
      <SignUpForm />
    </>
  )
}
