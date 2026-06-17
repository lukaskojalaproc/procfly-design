"use client"

import { useState } from "react"
import { Rocket, X, Calendar, Users, Bell, Zap } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Competition } from "@/lib/competitions-data"
import { formatAmount } from "@/lib/dashboard-data"

const DEADLINE_OPTIONS = [
  { label: "24 hours", value: 24 },
  { label: "3 days", value: 72 },
  { label: "1 week", value: 168 },
  { label: "2 weeks", value: 336 },
]

export interface LaunchSettings {
  deadlineInHours: number
  invitedSuppliers: number
  notify: boolean
}

interface LaunchCompetitionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  competition: Competition
  onLaunch: (settings: LaunchSettings) => void
}

export function LaunchCompetitionDialog({
  open,
  onOpenChange,
  competition,
  onLaunch,
}: LaunchCompetitionDialogProps) {
  const [deadline, setDeadline] = useState<number>(72)
  const [invited, setInvited] = useState(String(Math.max(1, competition.invitedSuppliers || 3)))
  const [notify, setNotify] = useState(true)

  function handleLaunch() {
    onLaunch({
      deadlineInHours: deadline,
      invitedSuppliers: Number(invited) || competition.invitedSuppliers,
      notify,
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
              <Rocket className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Launch competition</h2>
              <p className="text-sm text-muted-foreground">
                Opens the bidding window for {competition.ref} and notifies invited suppliers.
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
          {/* Summary */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Baseline budget</span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {formatAmount(competition.baseline)} {competition.currency}
            </span>
          </div>

          <Field icon={Calendar} label="Bidding window">
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
              placeholder="e.g. 3"
            />
          </Field>

          <button
            type="button"
            onClick={() => setNotify((v) => !v)}
            className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <span className="flex items-center gap-2.5">
              <Bell className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Notify invited suppliers</span>
            </span>
            <span
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                notify ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-4 rounded-full bg-background transition-transform",
                  notify ? "translate-x-4" : "translate-x-0.5",
                )}
              />
            </span>
          </button>
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
            <Zap className="size-4" />
            Go live
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
  icon: typeof Calendar
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
