"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { TextInput } from "./text-input"

type PasswordInputProps = Omit<React.ComponentPropsWithoutRef<typeof TextInput>, "type" | "trailing">

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <TextInput
      ref={ref}
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex rounded text-grey-700 hover:text-grey-900 focus-visible:outline-2 focus-visible:outline-brand-400"
        >
          {visible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
        </button>
      }
    />
  )
})
