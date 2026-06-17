"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import {
  UploadCloud,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileText,
  X,
  Send,
  Clock,
  Building2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { extractProposalFromFile } from "@/app/actions/extract-proposal"
import { addProposal, type StoredDocument } from "@/lib/proposal-store"
import { fileKind, formatFileSize, fileToDataUrl, MAX_INLINE_BYTES } from "@/lib/file-utils"

interface PickedFile {
  file: File
  doc: StoredDocument
}

export function SupplierSubmissionForm({
  competitionId,
  ref_,
  title,
  description,
  category,
  currency,
  requirements,
  paymentTerms,
  deadlineInHours,
}: {
  competitionId: string
  ref_: string
  title: string
  description: string
  category: string
  currency: string
  requirements: string
  paymentTerms: string
  deadlineInHours: number | null
}) {
  const [supplier, setSupplier] = useState("")
  const [contact, setContact] = useState("")
  const [amount, setAmount] = useState("")
  const [summary, setSummary] = useState("")
  const [files, setFiles] = useState<PickedFile[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [aiNote, setAiNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reqList = requirements.split("\n").map((r) => r.trim()).filter(Boolean)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setError(null)
    const picked: PickedFile[] = []
    for (const file of Array.from(fileList)) {
      const doc: StoredDocument = {
        name: file.name,
        kind: fileKind(file.name, file.type),
        size: formatFileSize(file.size),
        dataUrl: file.size <= MAX_INLINE_BYTES ? await fileToDataUrl(file) : undefined,
      }
      picked.push({ file, doc })
    }
    setFiles((prev) => [...prev, ...picked])

    // Auto-read the first uploaded file with AI to fill in the fields.
    await analyzeFile(picked[0].file)
  }

  async function analyzeFile(file: File) {
    setAnalyzing(true)
    setAiNote(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await extractProposalFromFile(fd)
      if (res.ok) {
        const p = res.proposal
        const filled: string[] = []
        if (p.supplier && !supplier) {
          setSupplier(p.supplier)
          filled.push("supplier")
        }
        if (p.amount != null && !amount) {
          setAmount(String(p.amount))
          filled.push("bid amount")
        }
        if (p.summary && !summary) {
          setSummary(p.summary)
          filled.push("summary")
        }
        if (p.contact && !contact) {
          setContact(p.contact)
          filled.push("contact")
        }
        setAiNote(
          filled.length > 0
            ? `AI filled ${filled.join(", ")} from your file — review and edit below.`
            : "We read your file but couldn't find new details to fill. Please complete the fields below.",
        )
      } else {
        setAiNote(res.error)
      }
    } catch {
      setAiNote("Couldn't analyze that file automatically. Please fill in the fields manually.")
    } finally {
      setAnalyzing(false)
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const amountNum = Number.parseFloat(amount.replace(/[^0-9.]/g, ""))
    if (!supplier.trim()) return setError("Please enter your company name.")
    if (!Number.isFinite(amountNum) || amountNum <= 0) return setError("Please enter a valid bid amount.")
    if (files.length === 0) return setError("Please attach at least one proposal document.")

    addProposal({
      competitionId,
      supplier: supplier.trim(),
      amount: amountNum,
      summary: summary.trim() || undefined,
      contact: contact.trim() || undefined,
      documents: files.map((f) => f.doc),
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-foreground">Proposal submitted</h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            Thank you, {supplier}. Your bid of{" "}
            <span className="font-semibold text-foreground">
              {new Intl.NumberFormat("en-US").format(Number.parseFloat(amount.replace(/[^0-9.]/g, "")))} {currency}
            </span>{" "}
            for <span className="font-medium text-foreground">{title}</span> has been received. The buyer will be in
            touch with next steps.
          </p>
          <div className="mt-6 rounded-xl bg-muted/50 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted documents</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <FileText className="size-4 text-primary" />
                  {f.doc.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4">
        {/* Brand header */}
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            PF
          </span>
          <span className="text-lg font-bold text-foreground">Procfly</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Building2 className="size-3.5" />
            Supplier portal
          </span>
        </div>

        {/* Competition summary */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{ref_}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {category}
            </span>
            {deadlineInHours != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-chart-3/15 px-2 py-0.5 text-[10px] font-semibold text-chart-3">
                <Clock className="size-3" />
                Bidding open
              </span>
            )}
          </div>
          <h1 className="mt-3 text-balance text-xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">{description}</p>
          {(reqList.length > 0 || paymentTerms) && (
            <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              {reqList.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requirements</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {reqList.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {paymentTerms && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment terms</p>
                  <p className="mt-2 text-sm text-foreground">{paymentTerms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submission form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-foreground">Submit your proposal</h2>
            <p className="text-sm text-muted-foreground">
              Upload your proposal, quote, or pricing file — our AI reads it and fills in the details for you.
            </p>
          </div>

          {/* Upload dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
            className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center transition-colors hover:border-primary/60"
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.txt,.md,.json,.zip"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {analyzing ? <Loader2 className="size-6 animate-spin" /> : <UploadCloud className="size-6" />}
            </span>
            <p className="mt-3 text-sm font-medium text-foreground">
              {analyzing ? "Reading your document with AI…" : "Drop files here or click to upload"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, Excel, CSV, Word, ZIP — any proposal file</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={analyzing}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <UploadCloud className="size-4" />
              Choose files
            </button>
          </div>

          {aiNote && (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{aiNote}</span>
            </div>
          )}

          {files.length > 0 && (
            <ul className="flex flex-col gap-2">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <FileText className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">{f.doc.name}</span>
                  <span className="text-xs text-muted-foreground">{f.doc.size}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${f.doc.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Fields (AI-filled, editable) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" required>
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Your company"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Field>
            <Field label="Contact email">
              <input
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Field>
          </div>

          <Field label={`Bid amount (${currency})`} required>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold tabular-nums text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          <Field label="Proposal summary">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Brief summary of your proposal"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={analyzing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Send className="size-4" />
            Submit proposal
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Powered by Procfly ·{" "}
            <Link href="/competitions" className="underline hover:text-foreground">
              Back to Procfly
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {children}
    </label>
  )
}
