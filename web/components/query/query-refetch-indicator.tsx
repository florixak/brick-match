"use client"

import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

type QueryRefetchIndicatorProps = {
  isFetching: boolean
  isLoading: boolean
  isStale?: boolean
  className?: string
}

export function QueryRefetchIndicator({
  isFetching,
  isLoading,
  isStale = false,
  className,
}: QueryRefetchIndicatorProps) {
  if (isLoading || !isFetching) {
    return null
  }

  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-xs",
        className,
      )}
      aria-live="polite"
    >
      <Loader2Icon className="size-3 animate-spin" aria-hidden="true" />
      <span>{isStale ? "Updating stale data…" : "Refreshing…"}</span>
    </div>
  )
}
