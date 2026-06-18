"use client"

import { useState } from "react"
import { Trophy, X, FileText, Search, ChevronRight, Inbox } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ConvertToCompetitionDialog } from "@/components/convert-to-competition-dialog"
import { requests, formatAmount, initials } from "@/lib/dashboard-data"
import type { ProcurementRequest } from "@/lib/dashboard-data"

/**
 * Header action for the Competitions page. A competition can only be created
 * from an APPROVED request, so this button first opens a picker of approved
 * requests, then hands the chosen one to the existing setup dialog.
 */
export function StartCompetitionButton() {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selected, setSelected] = useState<ProcurementRequest | null>(null)
  const [query, setQuery] = useState("")

  const approved = requests.filter((r) => r.status === "Approved")
  const q = query.trim().toLowerCase()
  const filtered = q
    ? approved.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ref.toLowerCase().includes(q) ||
          r.requester.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      )
    : approved

  function choose(r: ProcurementRequest) {
    setPickerOpen(false)
    // Defer opening the setup dialog so the picker can close cleanly first.
    setTimeout(() => setSelected(r), 0)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Trophy className="size-4" />
        Start Competition
      </button>

      {/* Approved-request picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden p-0" showCloseButton={false}>
          <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Trophy className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Start a competition</h2>
                <p className="text-sm text-muted-foreground">
                  Choose an approved request to source competitively.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search approved requests..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-2">
            {filtered.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {filtered.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => choose(r)}
                      className="group flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-border hover:bg-muted"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        {initials(r.requester)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">{r.ref}</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {r.category}
                          </span>
                        </div>
                        <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.requester} · {formatAmount(r.amount)} {r.currency}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Inbox className="size-5" />
                </span>
                <p className="text-sm font-semibold text-foreground">No approved requests</p>
                <p className="text-xs text-muted-foreground">
                  A request must be approved before you can start a competition for it.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <FileText className="size-3.5" />
            Competitions can only be created from approved requests.
          </div>
        </DialogContent>
      </Dialog>

      {/* Setup dialog for the chosen request */}
      {selected && (
        <ConvertToCompetitionDialog
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
          request={selected}
        />
      )}
    </>
  )
}
