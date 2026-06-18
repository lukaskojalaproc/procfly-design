"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
  FileEdit,
  X,
  Tag,
  Wallet,
  FileText,
  Check,
  ListChecks,
  Scale,
  Receipt,
  Lock,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  HelpCircle,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Competition } from "@/lib/competitions-data"
import { getRequestByRef } from "@/lib/dashboard-data"

/** Split a stored multi-line string into editable line items (never empty). */
function toLines(value?: string): string[] {
  const lines = (value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.length > 0 ? lines : [""]
}

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
  questions: string[]
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
  const [requirements, setRequirements] = useState<string[]>(toLines(competition.requirements))
  const [evaluationCriteria, setEvaluationCriteria] = useState<string[]>(toLines(competition.evaluationCriteria))
  const [paymentTerms, setPaymentTerms] = useState(competition.paymentTerms ?? "")
  const [questions, setQuestions] = useState<string[]>(
    competition.questions && competition.questions.length > 0 ? competition.questions : [""],
  )
  const [importError, setImportError] = useState<string | null>(null)

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
      requirements: requirements.map((l) => l.trim()).filter(Boolean).join("\n"),
      evaluationCriteria: evaluationCriteria.map((l) => l.trim()).filter(Boolean).join("\n"),
      paymentTerms: paymentTerms.trim(),
      questions: questions.map((q) => q.trim()).filter(Boolean),
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

  // Parse an uploaded .xlsx / .csv file into line items. Each non-empty cell in
  // the first column (or the whole row joined) becomes one item.
  async function importFromExcel(file: File, setItems: (lines: string[]) => void) {
    setImportError(null)
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, blankrows: false })
      const lines = rows
        .map((row) =>
          (Array.isArray(row) ? row : [row])
            .map((cell) => String(cell ?? "").trim())
            .filter(Boolean)
            .join(" — "),
        )
        .filter(Boolean)
      if (lines.length === 0) {
        setImportError("No rows found in that file.")
        return
      }
      // Drop a likely header row (e.g. "Requirement", "Criteria").
      const body = /^(requirement|criteria|criterion|item|description|name)/i.test(lines[0])
        ? lines.slice(1)
        : lines
      setItems(body.length > 0 ? body : lines)
    } catch {
      setImportError("Could not read that file. Use .xlsx or .csv.")
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
            <LineItemsField
              icon={ListChecks}
              label="Requirements & deliverables"
              items={requirements}
              onChange={setRequirements}
              onImport={(file) => importFromExcel(file, setRequirements)}
              placeholder="e.g. ISO 27001 certified"
              addLabel="Add requirement"
              importError={importError}
            />
          )}

          {showEvaluation && (
            <LineItemsField
              icon={Scale}
              label="Evaluation criteria"
              items={evaluationCriteria}
              onChange={setEvaluationCriteria}
              onImport={(file) => importFromExcel(file, setEvaluationCriteria)}
              placeholder="e.g. Price — 60%"
              addLabel="Add criterion"
              importError={importError}
            />
          )}

          {showRequirements && (
            <LineItemsField
              icon={HelpCircle}
              label="Questions for suppliers"
              items={questions}
              onChange={setQuestions}
              onImport={(file) => importFromExcel(file, setQuestions)}
              placeholder="e.g. What is your typical onboarding timeline?"
              addLabel="Add question"
              importError={importError}
            />
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

function LineItemsField({
  icon: Icon,
  label,
  items,
  onChange,
  onImport,
  placeholder,
  addLabel,
  importError,
}: {
  icon: typeof Tag
  label: string
  items: string[]
  onChange: (items: string[]) => void
  onImport: (file: File) => void
  placeholder: string
  addLabel: string
  importError: string | null
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function updateItem(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? value : item)))
  }
  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index)
    onChange(next.length > 0 ? next : [""])
  }
  function addItem() {
    onChange([...items, ""])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Icon className="size-4 text-muted-foreground" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Upload className="size-3.5" />
          Import Excel
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImport(file)
            e.target.value = ""
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              disabled={items.length === 1 && !items[0]}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Remove item ${i + 1}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {importError && <p className="text-xs font-medium text-destructive">{importError}</p>}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" />
        {addLabel}
      </button>
    </div>
  )
}
