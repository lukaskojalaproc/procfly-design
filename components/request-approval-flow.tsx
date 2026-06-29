"use client"

import { Check, X, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { initials, type ApprovalStep, type ApprovalState } from "@/lib/dashboard-data"
import { useStepDecisions } from "@/lib/request-activity-store"

type DisplayState = "approved" | "in_progress" | "not_started" | "rejected"

function displayStateFor(state: ApprovalState, isCurrent: boolean): DisplayState {
  if (state === "approved") return "approved"
  if (state === "rejected") return "rejected"
  return isCurrent ? "in_progress" : "not_started"
}

const stateStyles: Record<DisplayState, {
  card: string
  dot: string
  label: string
  labelCls: string
  icon: typeof Check
}> = {
  // Green — only Approved
  approved: {
    card: "border-border bg-card",
    dot: "bg-[#16a34a] ring-[#bbf7d0]",
    label: "Approved",
    labelCls: "text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0]",
    icon: Check,
  },
  // Dark/neutral — In Progress
  in_progress: {
    card: "border-border bg-card",
    dot: "bg-[#374151] ring-[#d1d5db]",
    label: "In Progress",
    labelCls: "text-[#111827] bg-[#f3f4f6] border border-[#d1d5db]",
    icon: Clock,
  },
  // Dark/neutral — Not Started
  not_started: {
    card: "border-border/60 bg-card",
    dot: "bg-[#d1d5db] ring-[#e5e7eb]",
    label: "Not Started",
    labelCls: "text-[#6b7280] bg-[#f9fafb] border border-[#e5e7eb]",
    icon: Clock,
  },
  // Red — only Rejected
  rejected: {
    card: "border-[#fecaca]/60 bg-card",
    dot: "bg-[#dc2626] ring-[#fecaca]",
    label: "Rejected",
    labelCls: "text-[#991b1b] bg-[#fef2f2] border border-[#fecaca]",
    icon: X,
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

  const merged = approvals.map((step, i) => {
    const d = decisions[i]
    return d
      ? { ...step, state: d.state, comment: d.comment || step.comment, date: localDate(d.at) }
      : step
  })

  const approverSteps = merged.slice(1)
  const completed = approverSteps.filter((a) => a.state === "approved").length
  const total = approverSteps.length
  const progressPct = total ? Math.round((completed / total) * 100) : 0
  const currentIndex = merged.findIndex((s, i) => i > 0 && s.state === "pending")

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Approval Flow
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{completed} of {total} approved</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#15803D] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal scrollable steps */}
      <div className="overflow-x-auto px-5 py-5">
        <div className="flex min-w-max items-start gap-0">
          {merged.map((step, i) => {
            const isCurrent = i === currentIndex
            const dState = displayStateFor(step.state, isCurrent)
            const s = stateStyles[dState]
            const Icon = s.icon
            const isCreator = i === 0

            return (
              <div key={i} className="flex items-start">
                {/* Step card */}
                <div
                  className={cn(
                    "w-[210px] shrink-0 rounded-xl border p-4 transition-all duration-150",
                    s.card,
                    dState === "not_started" && "opacity-60",
                  )}
                >
                  {/* Top: avatar + name */}
                  <div className="flex items-start gap-2.5">
                    <span className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ring-1",
                      dState === "not_started"
                        ? "bg-muted text-muted-foreground ring-border/40"
                        : "bg-background text-foreground ring-border",
                    )}>
                      {initials(step.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-[13px] font-semibold leading-tight",
                        dState === "not_started" ? "text-muted-foreground" : "text-foreground",
                      )}>
                        {step.name}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{step.role}</p>
                    </div>
                  </div>

                  {/* Status badge + dot */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      // Creator step is a neutral past event — never green
                      isCreator
                        ? "text-[#374151] bg-[#f3f4f6] border border-[#d1d5db]"
                        : s.labelCls,
                    )}>
                      <Icon className="size-2.5" />
                      {isCreator ? "Created" : s.label}
                    </span>
                    <span className={cn("size-2 rounded-full ring-2",
                      isCreator ? "bg-[#374151] ring-[#d1d5db]" : s.dot
                    )} />
                  </div>

                  {/* Date — always shown */}
                  {step.date && (
                    <p className="mt-2 truncate text-[10px] text-muted-foreground">{step.date}</p>
                  )}

                  {/* Comment — only for active or completed steps */}
                  {step.comment && (dState === "in_progress" || dState === "approved" || dState === "rejected") && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] italic text-muted-foreground">
                      &ldquo;{step.comment}&rdquo;
                    </p>
                  )}
                </div>

                {/* Arrow connector */}
                {i < merged.length - 1 && (
                  <div className="flex h-[88px] w-8 shrink-0 items-center justify-center">
                    <ChevronRight className="size-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
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
