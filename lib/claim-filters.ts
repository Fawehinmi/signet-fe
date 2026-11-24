export type ClaimFilters = {
  q: string
  month: string
}

export const nextClaim = "next"

export function readFilters(params: { q?: string; month?: string }, months: string[]): ClaimFilters {
  const q = (params.q ?? "").trim().slice(0, 100)
  const month = params.month && months.includes(params.month) ? params.month : ""
  return { q, month }
}

export function filterQuery(filters: { q?: string; month?: string }) {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.month) params.set("month", filters.month)
  const query = params.toString()
  return query ? `?${query}` : ""
}

export function matchesSearch(q: string, participantRef: string, name?: string | null) {
  if (!q) return true
  const text = q.toLowerCase()
  return participantRef.toLowerCase().includes(text) || Boolean(name?.toLowerCase().includes(text))
}
