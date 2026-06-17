"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileEdit, X, Tag, Wallet, FileText, Check, ListChecks, Scale, Receipt, Lock, ExternalLink } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Competition } from "@/lib/competitions-data"
import { getRequestByRef } from "@/lib/dashboard-data"

const CURRENCIES = ["EUR", "USD", "GBP"]

export type TermsFocus = "all" | "scope" | "requirements" | "evaluation" | "payment"

const FOCUS_META: Record<TermsFocus, { title: string; subtitle: (ref: string) => string }> = {
  all: { title: "Edit competition terms", subtitle: (ref) => `Define the scope and budget for ${ref}.` },
  scope: { title: "Define scope & budget", subtitle: (ref) => `Set the budget and scope for ${ref}.` },
  requirements: {
    title: "Requirements & deliverables",
    subtitle: (ref) => `Specify what suppliers must deliver for ${ref}.`,
  },
  evaluation: { title: "Evaluation criteria", subtitle: (ref) => `Define how bids are scored for ${ref}.` },
  payment: { title: "Payment & contract terms", subtitle: (ref) => `Set payment and contract terms for ${ref}.` },
}

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
  focus?: TermsFocus
}

export function EditTermsDialog({ open, onOpenChange, competition, onSave, focus = "all" }: EditTermsDialogProps) {
  const router = useRouter()
  const [title, setTitle] = useState(competition.title)
  const [category, setCategory] = useState(competition.category)
  const [description, setDescription] = useState(competition.description)
  const [baseline, setBaseline] = useState(String(competition.baseline))
  const [currency, setCurrency] = useState(competition.currency)
  const [requirements, setRequirements] = useState(competition.requirements ?? "")
  const [evaluationCriteria, setEvaluationCriteria] = useState(competition.evaluationCriteria ?? "")
  const [paymentTerms, setPaymentTerms] = useState(competition.paymentTerms ?? "")

  // The budget is locked once it has been approved via a procurement request.
  // Changing it requires re-routing the request back through PR approval.
  const sourceRequest = competition.sourceRequestRef
    ? getRequestByRef(competition.sourceRequestRef)
    : undefined
  const budgetLocked = Boolean(competition.sourceRequestRef)

  const meta = FOCUS_META[focus]
  const showScope = focus === "all" || focus === "scope"
  const showRequirements = focus === "all" || focus === "requirements"
  const showEvaluation = focus === "all" || focus === "evaluation"
  const showPayment = focus === "all" || focus === "payment"

  function handleSave() {
    onSave({
      title: title.trim() || competition.title,
      category: category.trim() || competition.category,
      description: description.trim(),
      // Budget is never changed here when it is locked by an approved PR.
      baseline: budgetLocked ? competition.baseline : Number(baseline) || competition.baseline,
      currency: budgetLocked ? competition.currency : currency,
      requirements: requirements.trim(),
      evaluationCriteria: evaluationCriteria.trim(),
      paymentTerms: paymentTerms.trim(),
    })
    onOpenChange(false)
  }

  function handleRequestBudgetChange() {
    onOpenChange(false)
    if (sourceRequest) {
      router.push(`/requests/${sourceRequest.id}`)
    } else {
      router.push("/requests")
    }
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
              <h2 className="text-lg font-semibold text-foreground">{meta.title}</h2>
              <p className="text-sm text-muted-foreground">{meta.subtitle(competition.ref)}</p>
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
          {showScope && (
            <>
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
                {budgetLocked ? (
                  <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-base font-semibold text-foreground">
                        {new Intl.NumberFormat("en-US").format(competition.baseline)} {competition.currency}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-chart-3/15 px-2 py-1 text-xs font-medium text-chart-3">
                        <Lock className="size-3" />
                        Locked
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      This budget was approved on request{" "}
                      <span className="font-medium text-foreground">{competition.sourceRequestRef}</span>. To change
                      the amount, send the request back for re-approval.
                    </p>
                    <button
                      type="button"
                      onClick={handleRequestBudgetChange}
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <ExternalLink className="size-3.5" />
                      Request budget change
                    </button>
                  </div>
                ) : (
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
                )}
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
            </>
          )}

          {showRequirements && (
            <Field icon={ListChecks} label="Requirements & deliverables">
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="Mandatory requirements suppliers must meet (certifications, SLAs, references…)"
              />
            </Field>
          )}

          {showEvaluation && (
            <Field icon={Scale} label="Evaluation criteria">
              <textarea
                value={evaluationCriteria}
                onChange={(e) => setEvaluationCriteria(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="How bids are scored, e.g. Price 60% · Quality 30% · Delivery 10%"
              />
            </Field>
          )}

          {showPayment && (
            <Field icon={Receipt} label="Payment & contract terms">
              <textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="e.g. Net 30 · 12-month term · Termination for convenience"
              />
            </Field>
          )}
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
