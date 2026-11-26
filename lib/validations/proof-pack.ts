import { z } from "zod"

export const proofPackVersionSchema = z.coerce.number().int().positive()
