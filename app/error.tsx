"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

// Route-segment error boundary. Without this, any error thrown while rendering
// a client component blanks the entire route (white screen) with no feedback.
// This catches the crash, surfaces the message, and offers a recovery action.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] route error boundary caught:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-xl border border-border bg-card p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/12 text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This page hit an unexpected error and could not be displayed. You can try again, and if
            it keeps happening, please share the message below.
          </p>
        </div>
        {error?.message && (
          <pre className="max-h-40 w-full overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
            {error.message}
            {error.digest ? `\n\nDigest: ${error.digest}` : ""}
          </pre>
        )}
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
      </div>
    </div>
  )
}
