import type * as React from "react"
import { cn } from "@/lib/utils"

export const fieldLabelClassName =
  "text-xs font-black uppercase tracking-wide text-muted-foreground"

type FieldLabelProps = React.ComponentProps<"label">

export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  return (
    <label
      htmlFor={props.htmlFor}
      className={cn(fieldLabelClassName, className)}
      {...props}
    >
      {children}
    </label>
  )
}
