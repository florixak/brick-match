"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

type PasswordFieldProps = {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  autoComplete?: string
  className?: string
}

const PasswordField = ({
  id,
  value,
  onChange,
  disabled,
  placeholder = "••••••••",
  autoComplete,
  className,
}: PasswordFieldProps) => {
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        id={id}
        type={showPwd ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full border-2 border-border rounded-xl px-4 py-3 bg-card focus:outline-none focus:border-primary text-sm font-semibold pr-11 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setShowPwd((p) => !p)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
        aria-label={showPwd ? "Hide password" : "Show password"}
      >
        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default PasswordField
