"use client"

import { useEffect } from "react"

// Last-resort boundary: catches errors thrown in the root layout itself.
// Must render its own <html>/<body> because it replaces the root layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] global error boundary caught:", error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            padding: 32,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#fff",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
            The application hit an unexpected error. Please try again.
          </p>
          {error?.message && (
            <pre
              style={{
                maxHeight: 160,
                overflow: "auto",
                background: "#f1f5f9",
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                color: "#64748b",
                textAlign: "left",
              }}
            >
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#059669",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
