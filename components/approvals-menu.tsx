"use client"

import { useEffect, useRef, useState } from "react"
import {
  MoreVertical,
  Download,
  Columns3,
  Bookmark,
  RefreshCw,
  SlidersHorizontal,
  Check,
  X,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCurrentRole } from "@/lib/role-store"
import {
  getApprovalTasks,
  taskStatusMeta,
  formatTaskAmount,
} from "@/lib/approvals-data"
import {
  ALL_COLUMNS,
  COLUMN_LABELS,
  toggleColumn,
  resetColumns,
  triggerRefresh,
  useApprovalPrefs,
} from "@/lib/approvals-prefs"

function exportApprovalHistory() {
  const tasks = getApprovalTasks()
  const headers = [
    "Request ID",
    "Title",
    "Requester",
    "Department",
    "Type",
    "Category",
    "Approval Step",
    "Step",
    "Task Status",
    "Due Date",
    "Amount",
    "Currency",
    "Priority",
  ]
  const escape = (v: string | number) => {
    const s = String(v ?? "")
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = tasks.map((t) =>
    [
      t.request.ref,
      t.request.title,
      t.request.requester,
      t.request.department,
      t.request.kind,
      t.request.category,
      t.stepRole,
      `${t.stepNumber}/${t.totalSteps}`,
      taskStatusMeta[t.taskStatus].label,
      t.deadline ?? "—",
      t.request.amount > 0 ? t.request.amount : "No cost",
      t.request.amount > 0 ? t.request.currency : "",
      t.priority,
    ]
      .map(escape)
      .join(","),
  )
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "approval-history.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export function ApprovalsMenu() {
  const role = useCurrentRole()
  const prefs = useApprovalPrefs()
  const isAdmin = role === "Super Admin"
  const [open, setOpen] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  function saveView() {
    // Columns already persist on toggle; this confirms the saved view.
    try {
      window.localStorage.setItem("procfly.approvals.savedView.v1", JSON.stringify(prefs.columns))
    } catch {
      // ignore
    }
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
    setOpen(false)
  }

  const items: { label: string; icon: typeof Download; onClick: () => void }[] = [
    { label: "Export Approval History", icon: Download, onClick: () => { exportApprovalHistory(); setOpen(false) } },
    { label: "Customize Columns", icon: Columns3, onClick: () => { setShowColumns(true); setOpen(false) } },
    { label: "Save Current View", icon: Bookmark, onClick: saveView },
    { label: "Refresh Data", icon: RefreshCw, onClick: () => { triggerRefresh(); setOpen(false) } },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted",
          open && "bg-muted text-foreground",
        )}
        aria-label="Approvals options"
        aria-expanded={open}
      >
        <MoreVertical className="size-4" />
      </button>

      {savedFlash && (
        <span className="absolute right-0 top-full z-30 mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
          <Check className="size-3.5" />
          View saved
        </span>
      )}

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="px-2 py-2">
            {items.map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <>
              <div className="border-t border-border" />
              <div className="px-2 py-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                  Manage Approval Rules
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Customize Columns dialog */}
      {showColumns && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setShowColumns(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Columns3 className="size-4" />
                </span>
                <div>
                  <h2 className="font-semibold text-foreground">Customize columns</h2>
                  <p className="text-xs text-muted-foreground">Choose which fields appear in the list.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowColumns(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-2">
              {/* Request ID + title are always shown. */}
              <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground">
                <span className="flex size-4 items-center justify-center">
                  <Check className="size-4 text-muted-foreground/50" />
                </span>
                Request ID & title (always)
              </div>
              {ALL_COLUMNS.map((key) => {
                const checked = prefs.columns[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleColumn(key)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded border",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </span>
                    {COLUMN_LABELS[key]}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={resetColumns}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                Reset to default
              </button>
              <button
                type="button"
                onClick={() => setShowColumns(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
