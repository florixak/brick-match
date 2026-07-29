import type * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

export const fieldLabelClassName =
  "text-xs font-black uppercase tracking-wide text-muted-foreground"

type FieldLabelProps = {
  htmlFor: string
  className?: string
  children: React.ReactNode
}

export function FieldLabel({ htmlFor, className, children }: FieldLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={cn(fieldLabelClassName, className)}>
      {children}
    </Label>
  )
}

type FieldCaptionProps = {
  className?: string
  children: React.ReactNode
}

export function FieldCaption({ className, children }: FieldCaptionProps) {
  return <span className={cn(fieldLabelClassName, className)}>{children}</span>
}
