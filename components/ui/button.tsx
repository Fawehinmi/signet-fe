import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/cn"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "text"
  fullWidth?: boolean
  loading?: boolean
}

const variants = {
  primary: "bg-brand-400 px-5 text-white hover:bg-brand-500",
  secondary: "border border-brand-400 bg-white px-5 text-brand-500 hover:bg-brand-50",
  text: "px-2 text-brand-500 hover:bg-brand-50",
}

export function Button({
  variant = "primary",
  fullWidth,
  loading,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded text-sm font-semibold tracking-[0.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
