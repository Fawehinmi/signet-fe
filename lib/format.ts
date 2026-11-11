export function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
        new Date(value),
    )
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