import { z } from "zod"

export const jobRoles = ["partner-manager", "compliance-lead", "caseworker"] as const
export const teamPermissions = ["sign-off", "bulk-import", "bulk-upload"] as const

const access = {
  jobRole: z.enum(jobRoles, "Choose a job role"),
  permissions: z.array(z.enum(teamPermissions)).max(teamPermissions.length),
}

function caseworkerCheck(values: { jobRole: string; permissions: string[] }, context: z.RefinementCtx) {
  if (values.jobRole === "caseworker" && values.permissions.some((permission) => permission !== "bulk-upload")) {
    context.addIssue({ code: "custom", path: ["permissions"], message: "Caseworkers can only have Bulk upload" })
  }
}

export const accessSchema = z.object(access).superRefine(caseworkerCheck)

export const addMemberSchema = z
  .object({ email: z.string().trim().min(1, "Choose someone to add"), ...access })
  .superRefine(caseworkerCheck)

export type AccessValues = z.infer<typeof accessSchema>
export type AddMemberValues = z.infer<typeof addMemberSchema>
