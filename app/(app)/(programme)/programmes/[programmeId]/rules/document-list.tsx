import { FileIcon } from "lucide-react"

export function DocumentList({ documents }: { documents: { id: string; name: string }[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {documents.map((document) => (
        <li key={document.id} className="flex items-center gap-2.5 py-1.5 text-sm text-grey-800">
          <FileIcon className="size-[18px] shrink-0 text-brand-600" />
          <span className="min-w-0 truncate">{document.name}</span>
        </li>
      ))}
    </ul>
  )
}
