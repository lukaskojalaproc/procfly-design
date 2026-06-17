import { FileText, Clock, ShieldCheck, AlertOctagon, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { stats, totalCommitted, formatCompact } from "@/lib/dashboard-data"

const items = [
  {
    label: "Total Requests",
    value: stats.total.toString(),
    icon: FileText,
    iconClass: "bg-chart-3/10 text-chart-3",
  },
  {
    label: "Pending",
    value: stats.pending.toString(),
    icon: Clock,
    iconClass: "bg-chart-2/15 text-chart-2",
  },
  {
    label: "Approved",
    value: stats.approved.toString(),
    icon: ShieldCheck,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    label: "Rejected",
    value: stats.rejected.toString(),
    icon: AlertOctagon,
    iconClass: "bg-destructive/10 text-destructive",
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
      {/* Spend summary — gives every price on the page aggregate context */}
      <Card className="col-span-2 flex flex-col justify-between gap-3 border-0 bg-primary p-5 text-primary-foreground shadow-sm xl:col-span-1">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <TrendingUp className="size-5" />
          </div>
          <span className="text-sm font-medium text-primary-foreground/80">Total Spend</span>
        </div>
        <div>
          <p className="text-3xl font-bold leading-none tabular-nums">
            {formatCompact(totalCommitted)}
            <span className="ml-1 text-base font-medium text-primary-foreground/70">EUR</span>
          </p>
          <p className="mt-1 text-xs text-primary-foreground/70">Across all requests</p>
        </div>
      </Card>

      {items.map((item) => (
        <Card
          key={item.label}
          className="flex flex-row items-center gap-4 p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              item.iconClass,
            )}
          >
            <item.icon className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-bold leading-tight tabular-nums text-foreground">
              {item.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
