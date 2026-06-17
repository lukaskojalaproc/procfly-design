"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Trophy,
  X,
  Calendar,
  Users,
  Wallet,
  Tag,
  FileText,
  ListChecks,
  ShoppingCart,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ProcurementRequest } from "@/lib/dashboard-data"

/**
 * Action bar shown on an approved request: choose between a competitive
 * sourcing event (opens the setup dialog) or a direct purchase order.
 */
export function ApprovedRequestActions({ request }: { request: ProcurementRequest }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">This request is approved</p>
        <p className="text-xs text-muted-foreground">Source it competitively, or raise a direct purchase order.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Trophy className="size-4 text-primary" />
          Convert to Competition
        </button>
        <Link
          href={`/orders/from-request/${request.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ShoppingCart className="size-4" />
          Convert to PO
        </Link>
      </div>
      <ConvertToCompetitionDialog open={open} onOpenChange={setOpen} request={request} />
    </div>
  )
}

/**
 * Standalone "Convert to Competition" button (used in lists) that opens the
 * setup dialog instead of navigating directly.
 */
export function ConvertToCompetitionButton({
  request,
  className,
}: {
  request: ProcurementRequest
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
          className,
        )}
      >
        <Trophy className="size-4" />
        Convert to Competition
      </button>
      <ConvertToCompetitionDialog open={open} onOpenChange={setOpen} request={request} />
    </>
  )
}

const CATEGORIES = ["Software", "Hardware", "Logistics", "Cloud", "Services", "Facilities", "Marketing", "Other"]

const DEADLINE_OPTIONS = [
  { label: "24 hours", value: 24 },
  { label: "3 days", value: 72 },
  { label: "1 week", value: 168 },
  { label: "2 weeks", value: 336 },
]

interface ConvertToCompetitionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: ProcurementRequest
}

export function ConvertToCompetitionDialog({ open, onOpenChange, request }: ConvertToCompetitionDialogProps) {
  const router = useRouter()

  const [title, setTitle] = useState(request.title)
  const [category, setCategory] = useState(request.category)
  const [baseline, setBaseline] = useState(String(request.amount))
  const [deadline, setDeadline] = useState<number>(72)
  const [invited, setInvited] = useState("5")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")

  function handleLaunch() {
    const params = new URLSearchParams()
    if (title.trim() && title !== request.title) params.set("title", title.trim())
    if (category && category !== request.category) params.set("category", category)
    const baselineNum = Number(baseline)
    if (baselineNum && baselineNum !== request.amount) params.set("baseline", String(baselineNum))
    params.set("deadline", String(deadline))
    if (invited) params.set("invited", invited)
    if (description.trim()) params.set("description", description.trim())
    if (requirements.trim()) params.set("requirements", requirements.trim())

    onOpenChange(false)
    router.push(`/competitions/from/${request.id}?${params.toString()}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Set up competition</h2>
              <p className="text-sm text-muted-foreground">
                Define the terms before inviting suppliers — from request {request.ref}.
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
        <div className="flex max-h-[calc(90vh-9rem-5rem)] flex-col gap-5 overflow-y-auto p-6">
          <Field icon={FileText} label="Competition title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="What are you sourcing?"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field icon={Tag} label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field icon={Wallet} label={`Baseline budget (${request.currency})`}>
              <input
                value={baseline}
                onChange={(e) => setBaseline(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder="Approved budget"
              />
            </Field>
          </div>

          <Field icon={Calendar} label="Bidding deadline">
            <div className="flex flex-wrap gap-2">
              {DEADLINE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeadline(opt.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    deadline === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field icon={Users} label="Suppliers to invite">
            <input
              value={invited}
              onChange={(e) => setInvited(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="e.g. 5"
            />
          </Field>

          <Field icon={FileText} label="Scope / description" optional>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="Describe the scope suppliers are bidding on..."
            />
          </Field>

          <Field icon={ListChecks} label="Submission requirements" optional>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="e.g. Pricing breakdown, delivery timeline, references, compliance docs..."
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
            onClick={handleLaunch}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Trophy className="size-4" />
            Create competition
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  icon: Icon,
  label,
  optional,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Icon className="size-3.5 text-muted-foreground" />
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
    </div>
  )
}
