"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth"
import { TextInput } from "@/components/form/text-input"
import { PasswordInput } from "@/components/form/password-input"
import { Checkbox } from "@/components/form/checkbox"
import { Button } from "@/components/ui/button"
import { createAccount } from "./actions"

const linkClass = "font-semibold text-brand-600 underline underline-offset-2"

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", acceptTerms: false },
  })

  async function onSubmit(values: SignUpValues) {
    const result = await createAccount(values)

    if (result?.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        setError(field as keyof SignUpValues, { message: messages?.[0] })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full flex-col gap-5">
      <TextInput label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
      <TextInput
        label="Company email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordInput
        label="Password"
        autoComplete="new-password"
        helper="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <Checkbox
        label={
          <>
            I accept the{" "}
            <Link href="/terms" className={linkClass}>
              Terms of use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className={linkClass}>
              Privacy notice
            </Link>
          </>
        }
        error={errors.acceptTerms?.message}
        {...register("acceptTerms")}
      />
      <Button type="submit" fullWidth loading={isSubmitting}>
        Create account
      </Button>
    </form>
  )
}
