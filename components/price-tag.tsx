import { cn } from "@/lib/utils"
import { formatAmount, formatCompact, priceTier, type PriceTier } from "@/lib/dashboard-data"

interface PriceTagProps {
  amount: number
  currency: string
  /** maxAmount in the current list, used to size the magnitude bar */
  max: number
}

const tierStyles: Record<PriceTier, { amountCls: string; sizeCls: string; barCls: string }> = {
  none: {
    amountCls: "text-muted-foreground/70 font-medium",
    sizeCls: "text-sm",
    barCls: "bg-transparent",
  },
  low: {
    amountCls: "text-foreground font-medium",
    sizeCls: "text-sm",
    barCls: "bg-muted-foreground/20",
  },
  mid: {
    amountCls: "text-foreground font-semibold",
    sizeCls: "text-base",
    barCls: "bg-muted-foreground/25",
  },
  high: {
    amountCls: "text-foreground font-semibold",
    sizeCls: "text-lg",
    barCls: "bg-muted-foreground/35",
  },
  critical: {
    amountCls: "text-foreground font-bold",
    sizeCls: "text-xl",
    barCls: "bg-primary",
  },
}

export function PriceTag({ amount, currency, max }: PriceTagProps) {
  const tier = priceTier(amount)
  const style = tierStyles[tier]

  if (tier === "none") {
    return (
      <div className="w-32 shrink-0 text-right">
        <p className="text-sm font-medium text-muted-foreground/60">—</p>
      </div>
    )
  }

  const pct = max > 0 ? Math.max(6, Math.round((amount / max) * 100)) : 0
  const isLarge = tier === "high" || tier === "critical"

  return (
    <div className="w-32 shrink-0">
      {/* Amount: hero — large, foreground black */}
      <p className="text-right">
        <span className={cn("tabular-nums leading-none", style.amountCls, style.sizeCls)}>
          {isLarge ? formatCompact(amount) : formatAmount(amount)}
        </span>
      </p>
      {/* Currency: secondary — small gray, below amount */}
      <p className="mt-0.5 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
        {currency}
      </p>
      {/* High value badge — tight, outline, metadata-level */}
      {tier === "critical" && (
        <p className="mt-1 text-right">
          <span className="inline-flex rounded border border-primary/30 px-1.5 py-px text-[9px] font-medium uppercase tracking-wide text-primary/80">
            High value
          </span>
        </p>
      )}
      {/* Relative magnitude bar */}
      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", style.barCls)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
