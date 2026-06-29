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
  approved: {
    card: "border-[#BBF7D0] bg-[#ECFDF3]",
    dot: "bg-[#15803D] ring-[#BBF7D0]",
    label: "Approved",
    labelCls: "text-[#15803D] bg-[#ECFDF3] border border-[#BBF7D0]",
    icon: Check,
  },
  in_progress: {
    card: "border-[#F1E4B5] bg-[#FFFBEB] ring-1 ring-[#F1E4B5]",
    dot: "bg-[#B54708] ring-[#F1E4B5]",
    label: "In Progress",
    labelCls: "text-[#B54708] bg-[#FEF6E8] border border-[#F1E4B5]",
    icon: Clock,
  },
  not_started: {
    card: "border-border bg-muted/30",
    dot: "bg-muted-foreground/30 ring-border",
    label: "Not Started",
    labelCls: "text-muted-foreground bg-muted border border-border",
    icon: Clock,
  },
  rejected: {
    card: "border-[#F3D6D2] bg-[#FEF3F2]",
    dot: "bg-[#B42318] ring-[#F3D6D2]",
    label: "Rejected",
    labelCls: "text-[#B42318] bg-[#FEF3F2] border border-[#F3D6D2]",
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
                    "w-[180px] shrink-0 rounded-xl border p-4 transition-shadow",
                    s.card,
                    isCurrent && "shadow-md",
                  )}
                >
                  {/* Top: avatar + name */}
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-bold text-foreground shadow-sm ring-1 ring-border">
                      {initials(step.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                        {step.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{step.role}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        s.labelCls,
                      )}
                    >
                      <Icon className="size-2.5" />
                      {isCreator ? "Created" : s.label}
                    </span>
                    <span
                      className={cn(
                        "size-2.5 rounded-full ring-2",
                        s.dot,
                      )}
                    />
                  </div>

                  {/* Date / comment */}
                  {step.date && (
                    <p className="mt-2 truncate text-[10px] text-muted-foreground">{step.date}</p>
                  )}
                  {step.comment && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] italic text-muted-foreground">
                      &ldquo;{step.comment}&rdquo;
                    </p>
                  )}
                </div>

                {/* Arrow connector */}
                {i < merged.length - 1 && (
                  <div className="flex h-[72px] w-8 shrink-0 items-center justify-center">
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
