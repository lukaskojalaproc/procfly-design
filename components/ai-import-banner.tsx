"use client"

import { useRef, useState } from "react"
import { Sparkles, Upload, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { extractCompetitionTerms, type ExtractedTerms } from "@/app/actions/extract-competition"

type Status =
  | { phase: "idle" }
  | { phase: "working"; fileName: string }
  | { phase: "done"; fileName: string; count: number }
  | { phase: "error"; message: string }

/**
 * Draft-stage banner: upload an RFP document (PDF / Excel / CSV) and let AI read
 * it and fill in the competition setup fields automatically.
 */
export function AiImportBanner({ onFilled }: { onFilled: (terms: ExtractedTerms) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ phase: "idle" })

  async function handleFile(file: File) {
    setStatus({ phase: "working", fileName: file.name })
    const formData = new FormData()
    formData.append("file", file)

    const result = await extractCompetitionTerms(formData)
    if (!result.ok) {
      setStatus({ phase: "error", message: result.error })
      return
    }
    onFilled(result.terms)
    const filled = countFilled(result.terms)
    setStatus({ phase: "done", fileName: file.name, count: filled })
  }

  const working = status.phase === "working"

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">Set up with AI</p>
          <p className="text-sm text-muted-foreground text-pretty">
            Upload an RFP, quote, or brief (PDF, Excel or CSV). AI reads it and fills in the scope, budget,
            requirements, evaluation criteria, and payment terms for you.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={working}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {working ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {working ? "Reading…" : "Upload file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ""
          }}
        />
      </div>

      {status.phase === "working" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          <FileText className="size-4 shrink-0" />
          <span className="truncate">Analyzing {status.fileName}…</span>
        </div>
      )}

      {status.phase === "done" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-chart-2/40 bg-chart-2/10 px-3 py-2 text-sm font-medium text-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-chart-2" />
          <span>
            Filled {status.count} field{status.count === 1 ? "" : "s"} from {status.fileName}. Review the steps below
            and adjust anything before moving to Ready.
          </span>
        </div>
      )}

      {status.phase === "error" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}
    </div>
  )
}

function countFilled(t: ExtractedTerms): number {
  let n = 0
  if (t.title) n++
  if (t.category) n++
  if (t.description) n++
  if (t.baseline) n++
  if (t.requirements.length > 0) n++
  if (t.evaluationCriteria.length > 0) n++
  if (t.paymentTerms) n++
  return n
}
