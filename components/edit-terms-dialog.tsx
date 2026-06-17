"use client"

import { useState } from "react"
import { FileEdit, X, Tag, Wallet, FileText, Check, ListChecks, Scale, Receipt } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Competition } from "@/lib/competitions-data"

const CURRENCIES = ["EUR", "USD", "GBP"]

export interface CompetitionTermsEdit {
  title: string
  category: string
  description: string
  baseline: number
  currency: string
  requirements: string
  evaluationCriteria: string
  paymentTerms: string
}

interface EditTermsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  competition: Competition
  onSave: (terms: CompetitionTermsEdit) => void
}

export function EditTermsDialog({ open, onOpenChange, competition, onSave }: EditTermsDialogProps) {
  const [title, setTitle] = useState(competition.title)
  const [category, setCategory] = useState(competition.category)
  const [description, setDescription] = useState(competition.description)
  const [baseline, setBaseline] = useState(String(competition.baseline))
  const [currency, setCurrency] = useState(competition.currency)
  const [requirements, setRequirements] = useState(competition.requirements ?? "")
  const [evaluationCriteria, setEvaluationCriteria] = useState(competition.evaluationCriteria ?? "")
  const [paymentTerms, setPaymentTerms] = useState(competition.paymentTerms ?? "")

  function handleSave() {
    onSave({
      title: title.trim() || competition.title,
      category: category.trim() || competition.category,
      description: description.trim(),
      baseline: Number(baseline) || competition.baseline,
      currency,
      requirements: requirements.trim(),
      evaluationCriteria: evaluationCriteria.trim(),
      paymentTerms: paymentTerms.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileEdit className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Edit competition terms</h2>
              <p className="text-sm text-muted-foreground">
                Define the scope and budget for {competition.ref}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 overflow-y-auto p-6">
          <Field icon={FileEdit} label="Competition title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="e.g. Marketing agency retainer — Q3"
            />
          </Field>

          <Field icon={Tag} label="Category">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="e.g. Marketing"
            />
          </Field>

          <Field icon={Wallet} label="Baseline budget">
            <div className="flex gap-2">
              <input
                value={baseline}
                onChange={(e) => setBaseline(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="e.g. 18900"
              />
              <div className="flex shrink-0 gap-1">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      currency === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field icon={FileText} label="Scope & description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="Describe what suppliers are bidding on, requirements, deliverables…"
            />
          </Field>

          <Field icon={ListChecks} label="Requirements & deliverables">
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="Mandatory requirements suppliers must meet (certifications, SLAs, references…)"
            />
          </Field>

          <Field icon={Scale} label="Evaluation criteria">
            <textarea
              value={evaluationCriteria}
              onChange={(e) => setEvaluationCriteria(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="How bids are scored, e.g. Price 60% · Quality 30% · Delivery 10%"
            />
          </Field>

          <Field icon={Receipt} label="Payment & contract terms">
            <textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="e.g. Net 30 · 12-month term · Termination for convenience"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Check className="size-4" />
            Save terms
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Tag
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Icon className="size-4 text-muted-foreground" />
        {label}
      </label>
      {children}
    </div>
  )
}
