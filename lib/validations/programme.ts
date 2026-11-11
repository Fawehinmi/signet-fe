import { z } from "zod"

export const schemes = ["Connect to Work"] as const
export const areas = ["Midshire", "North Vale", "Northshire", "Westmoor"] as const

export const startProgrammeSchema = z
    .object({
        scheme: z.enum(schemes, "Choose a scheme"),
        area: z.enum(areas, "Choose an area"),
        commissioner: z.string().trim().min(1, "Enter the commissioner's name"),
        startDate: z.string().min(1, "Enter a start date"),
        endDate: z.string().min(1, "Enter an end date"),
        deliversDirectly: z.enum(["yes", "no"], "Choose yes or no"),
    })
    .refine((values) => values.endDate > values.startDate, {
        message: "The end date must be after the start date",
        path: ["endDate"],
    })

export type StartProgrammeValues = z.infer<typeof startProgrammeSchema>

export function programmeName(scheme?: string, area?: string) {
    return scheme && area ? `${scheme}: ${area}` : ""
}