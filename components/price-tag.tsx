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
  { amount: string; size: string; bar: string; label?: string }
> = {
  none: {
    amount: "text-muted-foreground/70 font-medium",
    size: "text-sm",
    bar: "bg-transparent",
  },
  low: {
    amount: "text-foreground font-semibold",
    size: "text-base",
    bar: "bg-muted-foreground/30",
  },
  mid: {
    amount: "text-foreground font-semibold",
    size: "text-lg",
    bar: "bg-primary/50",
  },
  high: {
    amount: "text-foreground font-bold",
    size: "text-xl",
    bar: "bg-primary",
  },
  critical: {
    amount: "text-primary font-bold",
    size: "text-2xl",
    bar: "bg-primary",
    label: "High value",
  },
}

export function PriceTag({ amount, currency, max }: PriceTagProps) {
  const tier = priceTier(amount)
  const style = tierStyles[tier]

  // Zero-cost requests (e.g. "Add New Supplier") have no meaningful price.
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
        {style.label && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
            {style.label}
          </span>
        )}
        <span className={cn("tabular-nums leading-none", style.amount, style.size)}>
          {isLarge ? formatCompact(amount) : formatAmount(amount)}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {currency}
        </span>
      </div>
      {/* Relative magnitude bar — lets you compare request sizes at a glance */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", style.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
