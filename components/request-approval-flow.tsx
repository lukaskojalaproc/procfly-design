"use client"

import { Check, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { initials, type ApprovalStep, type ApprovalState } from "@/lib/dashboard-data"
import { useStepDecisions } from "@/lib/request-activity-store"

// Display state for a step in the read-only progress view. The request creator
// is never counted as an approval; a pending step is either the one currently
// In Progress or a future step that has Not Started.
type DisplayState = "approved" | "in_progress" | "not_started" | "rejected"

const displayBadge: Record<DisplayState, { label: string; cls: string; icon: typeof Check }> = {
  approved: { label: "Approved", cls: "bg-primary/12 text-primary", icon: Check },
  in_progress: { label: "In Progress", cls: "bg-chart-2/15 text-chart-2", icon: Clock },
  not_started: { label: "Not Started", cls: "bg-muted text-muted-foreground", icon: Clock },
  rejected: { label: "Rejected", cls: "bg-destructive/12 text-destructive", icon: X },
}

function displayStateFor(state: ApprovalState, isCurrent: boolean): DisplayState {
  if (state === "approved") return "approved"
  if (state === "rejected") return "rejected"
  return isCurrent ? "in_progress" : "not_started"
}

/**
 * Read-only visualization of the approval workflow. It shows what has happened
 * and what is next — it never renders decision actions. All decision-making
 * lives in the Approval Review banner on the request detail page.
 */
export function RequestApprovalFlow({
  requestId,
  approvals,
}: {
  requestId: string
  approvals: ApprovalStep[]
}) {
  const decisions = useStepDecisions(requestId)

  // Merge seed approvals with any recorded decisions.
  const merged = approvals.map((step, i) => {
    const d = decisions[i]
    return d ? { ...step, state: d.state, comment: d.comment || step.comment, date: localDate(d.at) } : step
  })

  // Progress is measured over approval steps only — the creator (step 1) does
  // not count as an approval.
  const approverSteps = merged.slice(1)
  const completed = approverSteps.filter((a) => a.state === "approved").length
  const total = approverSteps.length
  const progressPct = total ? Math.round((completed / total) * 100) : 0

  // The current step is the first one still pending (after step 1 / creator).
  const currentIndex = merged.findIndex((s, i) => i > 0 && s.state === "pending")

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Approval Flow</p>
        <span className="text-xs font-medium text-muted-foreground">
          {completed} of {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/60 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <ol className="mt-5 flex flex-col">
        {merged.map((step, i) => {
          const isLast = i === merged.length - 1
          const done = step.state === "approved"
          const isCurrent = i === currentIndex
          const dState = displayStateFor(step.state, isCurrent)
          const badge = displayBadge[dState]
          const BadgeIcon = badge.icon
          return (
            <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-0.5",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                  dState === "approved"
                    ? "border-primary text-primary"
                    : dState === "rejected"
                      ? "border-destructive text-destructive"
                      : dState === "in_progress"
                        ? "border-chart-2 text-chart-2"
                        : "border-border text-muted-foreground",
                )}
              >
                <BadgeIcon className="size-4" />
              </span>

              <div
                className={cn(
                  "flex-1 rounded-xl border bg-muted/30 p-4",
                  isCurrent ? "border-primary/40 ring-1 ring-primary/15" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                      {initials(step.name)}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.role}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      badge.cls,
                    )}
                  >
                    <BadgeIcon className="size-3" />
                    {badge.label}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{step.comment ?? "No comment yet"}</span>
                  <span className="text-muted-foreground">{step.date}</span>
                </div>

                {/* Read-only assignment hint on the active step */}
                {isCurrent && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-chart-2" />
                    Assigned to: <span className="font-medium text-foreground">{step.name}</span>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function localDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}
