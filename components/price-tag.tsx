import { cn } from "@/lib/utils"
import { formatAmount, formatCompact, priceTier, type PriceTier } from "@/lib/dashboard-data"

interface PriceTagProps {
  amount: number
  currency: string
  /** maxAmount in the current list, used to size the magnitude bar */
  max: number
}

const tierStyles: Record<
  PriceTier,
  { amount: string; size: string; bar: string }
> = {
  none: {
    amount: "text-muted-foreground/70 font-medium",
    size: "text-sm",
    bar: "bg-transparent",
  },
  low: {
    amount: "text-foreground font-medium",
    size: "text-sm",
    bar: "bg-muted-foreground/20",
  },
  mid: {
    amount: "text-foreground font-semibold",
    size: "text-base",
    bar: "bg-muted-foreground/30",
  },
  high: {
    amount: "text-foreground font-semibold",
    size: "text-lg",
    bar: "bg-muted-foreground/40",
  },
  critical: {
    // High value: number stays foreground (black), no green
    amount: "text-foreground font-bold",
    size: "text-xl",
    bar: "bg-primary",
  },
}

export function PriceTag({ amount, currency, max }: PriceTagProps) {
  const tier = priceTier(amount)
  const style = tierStyles[tier]

  if (tier === "none") {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-medium text-muted-foreground/70">No cost</span>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground/50">
          {currency}
        </span>
      </div>
    )
  }

  const pct = max > 0 ? Math.max(6, Math.round((amount / max) * 100)) : 0
  const isLarge = tier === "high" || tier === "critical"

  return (
    <div className="flex w-36 flex-col items-end gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className={cn("tabular-nums leading-none", style.amount, style.size)}>
          {isLarge ? formatCompact(amount) : formatAmount(amount)}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {currency}
        </span>
      </div>
      {/* "High value request" label — outline badge, no fill */}
      {tier === "critical" && (
        <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[10px] font-medium text-primary">
          High value request
        </span>
      )}
      {/* Relative magnitude bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", style.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
