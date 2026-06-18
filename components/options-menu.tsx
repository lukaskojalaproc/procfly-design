"use client"

import { useEffect, useRef, useState } from "react"
import { MoreVertical, ShieldCheck, UserCog, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/dashboard-data"
import { ROLES, setRole, useCurrentRole } from "@/lib/role-store"

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
