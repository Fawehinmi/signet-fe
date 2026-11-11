import { z } from "zod"

const personalEmailDomains = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
]

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name"),
  email: z
    .email("Enter a valid email address")
    .refine(
      (email) => !personalEmailDomains.some((domain) => email.toLowerCase().endsWith(`@${domain}`)),
      "Use your company email address",
    ),
  password: z.string().min(8, "Use at least 8 characters"),
  acceptTerms: z.boolean().refine((accepted) => accepted, "Accept the Terms of use and Privacy notice to continue"),
})

export type SignUpValues = z.infer<typeof signUpSchema>

export const organisationTypes = ["provider", "commissioner"] as const
export const organisationCategories = ["company", "charity", "cic", "public-body", "other"] as const

export const organisationSchema = z.object({
  type: z.enum(organisationTypes, "Choose how your organisation works with programmes"),
  name: z.string().trim().min(1, "Enter your organisation's name"),
  category: z.enum(organisationCategories, "Choose a category"),
  registrationNumber: z.string().trim().min(1, "Enter your registration number"),
  address: z.string().trim().min(1, "Enter your registered address"),
  website: z.string().trim().min(1, "Enter your website"),
  jobTitle: z.string().trim().min(1, "Enter your job title"),
  authorised: z.boolean().refine((authorised) => authorised, "Confirm you're authorised to set up this organisation"),
})

export type OrganisationValues = z.infer<typeof organisationSchema>
