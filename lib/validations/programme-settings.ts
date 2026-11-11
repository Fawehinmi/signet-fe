import { z } from "zod"

export const programmeDatesSchema = z
  .object({
    startDate: z.string().min(1, "Enter a start date"),
    endDate: z.string().min(1, "Enter an end date"),
  })
  .refine((values) => values.endDate > values.startDate, {
    message: "The end date must be after the start date",
    path: ["endDate"],
  })

export const aiFeaturesSchema = z.object({
  on: z.boolean(),
})

export const endProgrammeSchema = z.object({
  confirmed: z.boolean().refine((value) => value, "Tick the box to confirm"),
})

export type ProgrammeDatesValues = z.infer<typeof programmeDatesSchema>
export type AiFeaturesValues = z.infer<typeof aiFeaturesSchema>
export type EndProgrammeValues = z.infer<typeof endProgrammeSchema>
