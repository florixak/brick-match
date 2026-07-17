"use client"

import { useEffect } from "react"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        {error.digest
          ? `Error ID: ${error.digest}`
          : "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium"
      >
        Try again
      </button>
    </div>
  )
}
