import type * as React from "react"
import { cn } from "@/lib/utils"

export const fieldLabelClassName =
  "text-xs font-black uppercase tracking-wide text-muted-foreground"

type FieldLabelProps = {
  htmlFor: string
  className?: string
  children: React.ReactNode
}

export function FieldLabel({ htmlFor, className, children }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn(fieldLabelClassName, className)}>
      {children}
    </label>
  )
}

type FieldCaptionProps = {
  className?: string
  children: React.ReactNode
}

export function FieldCaption({ className, children }: FieldCaptionProps) {
  return <span className={cn(fieldLabelClassName, className)}>{children}</span>
}
