export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(value))
    .replace("Sept", "Sep")
}

export function plural(count: number, word: string, pluralWord = `${word}s`) {
  return `${count} ${count === 1 ? word : pluralWord}`
}

export function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024)
  return megabytes >= 1 ? `${megabytes.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  const day = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  })
    .format(date)
    .replace("Sept", "Sep")
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(date)

  return `${day} at ${time}`
}

export function formatPeriod(start: string, end: string) {
  return `${new Date(start).getUTCDate()} to ${formatDate(end)}`
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function addDays(date: string, days: number) {
  const value = new Date(`${date.slice(0, 10)}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function formatDateRange(start: string, end: string) {
  const from = formatDate(start)
  return start.slice(0, 4) === end.slice(0, 4) ? `${from.slice(0, -5)} to ${formatDate(end)}` : `${from} to ${formatDate(end)}`
}
