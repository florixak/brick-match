"use client"

import type { ReactNode } from "react"
import { QueryRefetchIndicator } from "@/components/query/query-refetch-indicator"
import { Button } from "@/components/ui/button"

type AsyncQueryStateProps<TData> = {
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  isSuccess: boolean
  isStale?: boolean
  error: Error | null
  data: TData | undefined
  isEmpty?: (data: TData) => boolean
  onRetry?: () => void
  skeleton?: ReactNode
  empty?: ReactNode
  errorFallback?: (error: Error, retry: () => void) => ReactNode
  children: (data: TData) => ReactNode
}

export function AsyncQueryState<TData>({
  isLoading,
  isFetching,
  isError,
  isSuccess,
  isStale = false,
  error,
  data,
  isEmpty,
  onRetry,
  skeleton,
  empty,
  errorFallback,
  children,
}: AsyncQueryStateProps<TData>) {
  if (isLoading) {
    return (
      skeleton ?? <div className="text-muted-foreground text-sm">Loading…</div>
    )
  }

  if (isError && error) {
    if (errorFallback) {
      return (
        <>
          {errorFallback(error, () => {
            onRetry?.()
          })}
        </>
      )
    }

    return (
      <div className="space-y-3 rounded-none border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-destructive text-sm">{error.message}</p>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    )
  }

  if (isSuccess && data !== undefined) {
    const showEmpty = isEmpty?.(data) ?? false

    if (showEmpty) {
      return (
        empty ?? (
          <div className="text-muted-foreground text-sm">Nothing here yet.</div>
        )
      )
    }

    return (
      <div className="space-y-3">
        <QueryRefetchIndicator
          isFetching={isFetching}
          isLoading={isLoading}
          isStale={isStale}
        />
        <div data-stale={isStale ? "true" : undefined}>{children(data)}</div>
      </div>
    )
  }

  return null
}
