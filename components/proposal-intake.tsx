"use client"

import { useState, useRef } from "react"
import {
  Link2,
  Copy,
  Check,
  UploadCloud,
  Loader2,
  Sparkles,
  FileText,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { inviteLink, addProposal, type StoredDocument } from "@/lib/proposal-store"
import { extractProposalFromFile } from "@/app/actions/extract-proposal"
import { fileKind, formatFileSize, fileToDataUrl, MAX_INLINE_BYTES } from "@/lib/file-utils"
import type { Competition } from "@/lib/competitions-data"

/**
 * Buyer-side intake panel shown on the Proposals and Suppliers tabs.
 * Two ways to collect proposals:
 *  1. Copy a shareable invite link suppliers open to submit themselves.
 *  2. Upload a supplier's document directly — AI reads it and files the proposal.
 */
export function ProposalIntake({ competition }: { competition: Competition }) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const link = inviteLink(competition.id)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Could not copy the link. Copy it manually.")
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)
    setDone(null)

    try {
      const fileArr = Array.from(files)
      // Use the first file for AI extraction (usually the proposal PDF).
      const primary = fileArr[0]
      const form = new FormData()
      form.append("file", primary)
      form.append("currency", competition.currency)
      const result = await extractProposalFromFile(form)

      if (!result.ok) {
        setError(result.error)
        return
      }

      // Store all uploaded files as documents (inline data URL for small files).
      const documents: StoredDocument[] = []
      for (const f of fileArr) {
        documents.push({
          name: f.name,
          kind: fileKind(f.name),
          size: formatFileSize(f.size),
          dataUrl: f.size <= MAX_INLINE_BYTES ? await fileToDataUrl(f) : undefined,
        })
      }

      const supplier = result.proposal.supplier?.trim() || "Uploaded supplier"
      addProposal({
        competitionId: competition.id,
        supplier,
        amount: result.proposal.amount ?? 0,
        summary: result.proposal.summary ?? undefined,
        documents,
      })
      setDone(`Added proposal from ${supplier}.`)
    } catch {
      setError("Something went wrong reading that file. Try again.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">Collect proposals</h3>
          <p className="text-sm text-muted-foreground">
            Invite suppliers to submit through a link, or upload a document and let AI file it for you.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Invite by link */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Link2 className="size-4 text-primary" />
            Invite suppliers by link
          </p>
          <p className="text-xs text-muted-foreground">
            Share this link. Suppliers upload their documents and AI fills in their proposal.
          </p>
          <div className="mt-1 flex items-center gap-2">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground"
              aria-label="Supplier invite link"
            />
            <button
              onClick={copyLink}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                copied
                  ? "bg-chart-2/15 text-chart-2"
                  : "bg-primary text-primary-foreground hover:opacity-90",
              )}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        {/* Upload on supplier's behalf */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <UploadCloud className="size-4 text-primary" />
            Upload a proposal
          </p>
          <p className="text-xs text-muted-foreground">
            Got a proposal by email? Drop the file here — AI reads the supplier, price and summary.
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/50 bg-background px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
            {busy ? "Reading document…" : "Choose file"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">
            <X className="size-3.5" />
          </button>
        </div>
      )}
      {done && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-chart-2/10 px-3 py-2 text-xs font-medium text-chart-2">
          <Check className="size-3.5" />
          {done}
        </div>
      )}
    </div>
  )
}
