import Link from "next/link"
import {
  AlertTriangle,
  FileClock,
  XCircle,
  Building2,
  ChevronRight,
  CheckCircle2,
  Send,
  MessageSquare,
  PenLine,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { needsAttention, activityFeed, type AttentionItem, type FeedKind } from "@/lib/dashboard-data"

const attentionIcon: Record<AttentionItem["type"], typeof AlertTriangle> = {
  approval: AlertTriangle,
  contract: FileClock,
  rejected: XCircle,
  supplier: Building2,
}

const attentionTone: Record<AttentionItem["severity"], string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-chart-2/15 text-chart-2",
}

const feedIcon: Record<FeedKind, { icon: typeof CheckCircle2; cls: string }> = {
  approved: { icon: CheckCircle2, cls: "bg-primary/12 text-primary" },
  submitted: { icon: Send, cls: "bg-chart-3/12 text-chart-3" },
  rejected: { icon: XCircle, cls: "bg-destructive/12 text-destructive" },
  comment: { icon: MessageSquare, cls: "bg-accent text-accent-foreground" },
  updated: { icon: PenLine, cls: "bg-muted text-muted-foreground" },
}

export function SideColumn() {
  return (
    <div className="flex flex-col gap-4">
      {/* Needs Attention — actionable items */}
      <Card className="card-shadow p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Needs Attention</h2>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            {needsAttention.length}
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {needsAttention.map((item) => {
            const Icon = attentionIcon[item.type]
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      attentionTone[item.severity],
                    )}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                    {item.action}
                    <ChevronRight className="size-3.5" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Recent Activity — who did what, to which request */}
      <Card className="card-shadow p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
          <Link href="/approvals" className="btn-secondary py-1 text-xs">
            View all
          </Link>
        </div>
        <ol className="flex flex-col gap-1">
          {activityFeed.map((item, i) => {
            const { icon: Icon, cls } = feedIcon[item.kind]
            const isLast = i === activityFeed.length - 1
            return (
              <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!isLast && <span className="absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-px bg-border" />}
                <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full", cls)}>
                  <Icon className="size-4" />
                </span>
                <Link href={item.href} className="min-w-0 flex-1 rounded-lg py-0.5 hover:underline">
                  <p className="text-sm leading-snug text-foreground">
                    <span className="font-semibold">{item.actor}</span> {item.action}{" "}
                    <span className="text-muted-foreground">{item.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </Link>
              </li>
            )
          })}
        </ol>
      </Card>
    </div>
  )
}
