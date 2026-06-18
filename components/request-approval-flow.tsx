"use client"

import { useState } from "react"
import { Check, X, Clock, CornerUpLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { initials, type ApprovalStep, type ApprovalState } from "@/lib/dashboard-data"
import { useStepDecisions, recordDecision, type ActivityEvent } from "@/lib/request-activity-store"

const approvalBadge: Record<ApprovalState, { label: string; cls: string; icon: typeof Check }> = {
  approved: { label: "Approved", cls: "bg-primary/12 text-primary", icon: Check },
  pending: { label: "Pending", cls: "bg-chart-2/15 text-chart-2", icon: Clock },
  rejected: { label: "Rejected", cls: "bg-destructive/12 text-destructive", icon: X },
}

type ActionKind = "approve" | "reject" | "changes"

const actionConfig: Record<
  ActionKind,
  { label: string; state: ApprovalState; event: Exclude<ActivityEvent, "comment">; cls: string; icon: typeof Check }
> = {
  approve: { label: "Approve", state: "approved", event: "approved", cls: "bg-primary text-primary-foreground", icon: Check },
  reject: { label: "Reject", state: "rejected", event: "rejected", cls: "bg-destructive text-destructive-foreground", icon: X },
  changes: {
    label: "Request changes",
    state: "pending",
    event: "changes_requested",
    cls: "border border-border bg-background text-foreground",
    icon: CornerUpLeft,
  },
}

export function RequestApprovalFlow({
  requestId,
  approvals,
}: {
  requestId: string
  approvals: ApprovalStep[]
}) {
  const decisions = useStepDecisions(requestId)
  const [activeAction, setActiveAction] = useState<{ index: number; kind: ActionKind } | null>(null)
  const [comment, setComment] = useState("")

  // Merge seed approvals with any recorded decisions.
  const merged = approvals.map((step, i) => {
    const d = decisions[i]
    return d ? { ...step, state: d.state, comment: d.comment || step.comment, date: localDate(d.at) } : step
  })

  const completed = merged.filter((a) => a.state === "approved").length
  const total = merged.length
  const progressPct = Math.round((completed / total) * 100)

  // The current step is the first one still pending (after step 1 / creator).
  const currentIndex = merged.findIndex((s, i) => i > 0 && s.state === "pending")

  function openAction(index: number, kind: ActionKind) {
    setActiveAction({ index, kind })
    setComment("")
  }

  function confirmAction() {
    if (!activeAction) return
    const step = merged[activeAction.index]
    const cfg = actionConfig[activeAction.kind]
    recordDecision({
      requestId,
      stepIndex: activeAction.index,
      step: step.role,
      state: cfg.state,
      event: cfg.event,
      by: step.name,
      comment: comment.trim(),
    })
    setActiveAction(null)
    setComment("")
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Approval flow</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {completed} of {total} completed
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <ol className="mt-6 flex flex-col">
        {merged.map((step, i) => {
          const badge = approvalBadge[step.state]
          const BadgeIcon = badge.icon
          const isLast = i === merged.length - 1
          const done = step.state === "approved"
          const isCurrent = i === currentIndex
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
                  done
                    ? "border-primary text-primary"
                    : step.state === "rejected"
                      ? "border-destructive text-destructive"
                      : "border-chart-2 text-chart-2",
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

                {/* Decision actions on the current pending step */}
                {isCurrent && (
                  <div className="mt-3 border-t border-border pt-3">
                    {activeAction?.index === i ? (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-foreground">
                          {actionConfig[activeAction.kind].label} — add a note
                          {activeAction.kind === "approve" ? " (optional)" : ""}
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={2}
                          autoFocus
                          placeholder={
                            activeAction.kind === "changes"
                              ? "What needs to change before this can be approved?"
                              : "Add a short rationale for the record"
                          }
                          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={confirmAction}
                            disabled={activeAction.kind !== "approve" && !comment.trim()}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40",
                              actionConfig[activeAction.kind].cls,
                            )}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveAction(null)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {(["approve", "changes", "reject"] as ActionKind[]).map((kind) => {
                          const cfg = actionConfig[kind]
                          const Icon = cfg.icon
                          return (
                            <button
                              key={kind}
                              type="button"
                              onClick={() => openAction(i, kind)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90",
                                cfg.cls,
                              )}
                            >
                              <Icon className="size-3.5" />
                              {cfg.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
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
