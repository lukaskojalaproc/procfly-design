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

// All icons use a single neutral muted tone — no color variety.
const attentionTone: Record<AttentionItem["severity"], string> = {
  high: "bg-muted text-muted-foreground",
  medium: "bg-muted text-muted-foreground",
}

// Action button variants per action label.
// "Complete" = primary green. Everything else = neutral outline.
function ActionButton({ label }: { label: string }) {
  const isPrimary = label === "Complete"
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
        isPrimary
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-muted-foreground group-hover:border-border/80 group-hover:text-foreground",
      )}
    >
      {label}
      <ChevronRight className="size-3" />
    </span>
  )
}

// Activity feed icons: green = approved, red = rejected, gray = everything else.
// Yellow removed.
const feedIcon: Record<FeedKind, { icon: typeof CheckCircle2; cls: string }> = {
  approved: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
  submitted: { icon: Send, cls: "bg-muted text-muted-foreground" },
  rejected: { icon: XCircle, cls: "bg-red-50 text-red-500" },
  comment: { icon: MessageSquare, cls: "bg-muted text-muted-foreground" },
  updated: { icon: PenLine, cls: "bg-muted text-muted-foreground" },
}

export function SideColumn() {
  return (
    <div className="flex flex-col gap-4">
      {/* Needs Attention */}
      <Card className="card-shadow p-6">
        <div className="mb-4 flex items-center justify-between">
          {/* Title: 700 */}
          <h2 className="text-lg font-bold text-foreground">Needs Attention</h2>
          <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500">
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
                  className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", attentionTone[item.severity])}>
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* Body: 400 */}
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <ActionButton label={item.action} />
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Recent Activity */}
      <Card className="card-shadow p-6">
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
                {!isLast && (
                  <span className="absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-px bg-border" />
                )}
                <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full", cls)}>
                  <Icon className="size-4" />
                </span>
                <Link href={item.href} className="min-w-0 flex-1 rounded-lg py-0.5 hover:underline">
                  <p className="text-sm leading-snug text-foreground">
                    {/* Labels: 500 */}
                    <span className="font-medium">{item.actor}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>{" "}
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
