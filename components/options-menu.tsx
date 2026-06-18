"use client"

import { useEffect, useRef, useState } from "react"
import { MoreVertical, ShieldCheck, UserCog, Check, Download, RefreshCw, Settings, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { currentUser, requests, myRequests, type ProcurementRequest } from "@/lib/dashboard-data"
import { ROLES, setRole, useCurrentRole } from "@/lib/role-store"

/** Build a CSV string from the given requests and trigger a browser download. */
function exportRequestsCsv(rows: ProcurementRequest[], filename: string) {
  const headers = ["Ref", "Title", "Requester", "Department", "Category", "Type", "Amount", "Currency", "Status", "Created"]
  const escape = (v: string | number) => {
    const s = String(v ?? "")
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.ref, r.title, r.requester, r.department, r.category, r.kind, r.amount, r.currency, r.status, r.date]
        .map(escape)
        .join(","),
    ),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function OptionsMenu() {
  const role = useCurrentRole()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted",
          open && "bg-muted text-foreground",
        )}
        aria-label="More options"
        aria-expanded={open}
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {/* Acting user */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
              {currentUser.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{currentUser.name}</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="size-3" />
                {role}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-2 py-2">
            <button
              type="button"
              onClick={() => {
                const all = role === "Super Admin"
                exportRequestsCsv(all ? requests : myRequests(), all ? "requests-all.csv" : "requests-mine.csv")
                setOpen(false)
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Download className="size-4 text-muted-foreground" />
              Eksportuoti duomenis
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCw className="size-4 text-muted-foreground" />
              Atnaujinti
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Settings className="size-4 text-muted-foreground" />
              Nustatymai
            </button>
            <a
              href="mailto:support@procfly.app?subject=Procfly%20help"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <HelpCircle className="size-4 text-muted-foreground" />
              Pagalba
            </a>
          </div>

          <div className="border-t border-border" />

          {/* Role switcher */}
          <div className="px-2 py-2">
            <p className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <UserCog className="size-3.5" />
              View as role
            </p>
            {ROLES.map((r) => {
              const active = r.role === role
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    setRole(r.role)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted",
                    active && "bg-muted/60",
                  )}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center pt-0.5">
                    {active && <Check className="size-4 text-primary" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{r.label}</span>
                    <span className="block text-xs text-muted-foreground">{r.description}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <p className="text-pretty text-[11px] text-muted-foreground">
              Demo only — switching role changes which requests you can see. No real account is affected.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
