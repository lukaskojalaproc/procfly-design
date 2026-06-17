"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Trophy, PartyPopper, TrendingDown, FileCheck, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AwardCelebrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: string
  amount: string
  saving: string
  pct: number
}

// A small piece of falling confetti with randomized position, delay and color.
interface Confetto {
  left: number
  delay: number
  duration: number
  color: string
  size: number
  rotate: number
}

export function AwardCelebrationDialog({
  open,
  onOpenChange,
  supplier,
  amount,
  saving,
  pct,
}: AwardCelebrationDialogProps) {
  // Re-generate confetti each time the dialog opens so it always animates.
  const [burst, setBurst] = useState(0)
  useEffect(() => {
    if (open) setBurst((b) => b + 1)
  }, [open])

  const confetti = useMemo<Confetto[]>(() => {
    const colors = [
      "var(--primary)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ]
    return Array.from({ length: 70 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.6,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burst])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden border-none bg-card p-0 sm:max-w-md"
      >
        {/* Confetti layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {confetti.map((c, i) => (
            <span
              key={`${burst}-${i}`}
              className="absolute top-0 block rounded-[2px]"
              style={{
                left: `${c.left}%`,
                width: `${c.size}px`,
                height: `${c.size * 0.4}px`,
                backgroundColor: c.color,
                transform: `rotate(${c.rotate}deg)`,
                animation: `award-confetti-fall ${c.duration}s ${c.delay}s ease-in forwards`,
              }}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="relative z-[1] flex flex-col items-center gap-5 px-6 py-10 text-center">
          {/* Trophy badge */}
          <span className="flex size-20 items-center justify-center rounded-full bg-chart-2/15 text-chart-2 ring-8 ring-chart-2/5">
            <Trophy className="size-10" />
          </span>

          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <PartyPopper className="size-3.5" />
              Competition awarded
            </span>
            <h2 className="mt-2 text-balance text-2xl font-bold text-foreground">
              Congratulations!
            </h2>
            <p className="text-pretty text-sm text-muted-foreground">
              You awarded this competition to
            </p>
            <p className="text-xl font-bold text-foreground">{supplier}</p>
          </div>

          {/* Result figures */}
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Final price</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{amount}</p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="size-3.5 text-primary" />
                Saved
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-primary">{saving}</p>
              <p className="text-[10px] uppercase tracking-wide text-primary">{pct}% vs. baseline</p>
            </div>
          </div>

          <div className="w-full rounded-xl border border-border bg-muted/30 p-3 text-left">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
              <FileCheck className="size-3.5 text-primary" />
              All invited suppliers have been notified.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3",
              "text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
            )}
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
