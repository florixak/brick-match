"use client"

import { useEffect } from "react"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
          padding: "32px",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          Application error
        </h2>
        <p style={{ color: "#666", maxWidth: "400px", margin: 0 }}>
          A critical error occurred. Please reload the page.
          {error.digest && (
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                marginTop: "8px",
              }}
            >
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
