import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/cn"

type ButtonVariant = "primary" | "secondary" | "text" | "danger"
type ButtonSize = "md" | "sm"

type ButtonStyleOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-400 text-white hover:bg-brand-500",
  secondary: "border border-brand-400 bg-white text-brand-500 hover:bg-brand-50",
  text: "text-brand-500 hover:bg-brand-50",
  danger: "border border-danger-400 bg-white text-danger-700 hover:bg-danger-50",
}

export function buttonStyles({ variant = "primary", size = "md", fullWidth = false }: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center rounded font-semibold tracking-[0.5px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" ? "h-8 gap-1.5 text-[13px]" : "h-10 gap-2 text-sm",
    variant === "text" ? (size === "sm" ? "px-1.5" : "px-2") : size === "sm" ? "px-3.5" : "px-5",
    variants[variant],
    fullWidth && "w-full",
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    loading?: boolean
  }

export function Button({
  variant,
  size,
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
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
