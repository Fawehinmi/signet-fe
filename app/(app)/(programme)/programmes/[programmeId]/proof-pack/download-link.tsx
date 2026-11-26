import { Download } from "lucide-react"
import { buttonStyles } from "@/components/ui/button"

export function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} download aria-label={label} className={buttonStyles({ variant: "secondary", size: "sm" })}>
      <Download className="size-4" />
      Download
    </a>
  )
}
