import { Package, Briefcase, UserPlus, MoreVertical, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PriceTag } from "@/components/price-tag"
import {
  requests,
  maxAmount,
  initials,
  type ProcurementRequest,
  type RequestKind,
  type RequestStatus,
} from "@/lib/dashboard-data"

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
}

const statusStyles: Record<RequestStatus, string> = {
  Pending: "bg-chart-2/15 text-chart-2",
  Approved: "bg-primary/12 text-primary",
  Rejected: "bg-destructive/12 text-destructive",
}

const accentByStatus: Record<RequestStatus, string> = {
  Pending: "bg-chart-2",
  Approved: "bg-primary",
  Rejected: "bg-destructive",
}

function RequestRow({ request }: { request: ProcurementRequest }) {
  const Icon = kindIcon[request.kind]
  return (
    <div className="group flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-muted/60">
      <span className={cn("h-10 w-1 shrink-0 rounded-full", accentByStatus[request.status])} />
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
            {request.ref}
          </span>
          <p className="truncate font-semibold text-foreground">{request.title}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
              {initials(request.requester)}
            </span>
            {request.requester}
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <span className="size-1 rounded-full bg-border" />
            {request.department}
          </span>
          <span className="hidden items-center gap-1 md:inline-flex">
            <span className="size-1 rounded-full bg-border" />
            {request.date} · {request.kind}
          </span>
          {request.quotes > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              <Users className="size-3" />
              {request.quotes} quotes
            </span>
          )}
        </div>
      </div>

      <PriceTag amount={request.amount} currency={request.currency} max={maxAmount} />

      <span
        className={cn(
          "hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex",
          statusStyles[request.status],
        )}
      >
        {request.status}
      </span>

      <button
        className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
        aria-label="More options"
      >
        <MoreVertical className="size-4" />
      </button>
    </div>
  )
}

export function RequestList() {
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">My Requests</h2>
        <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          View All My Requests
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border/60">
        {requests.map((request) => (
          <RequestRow key={request.id} request={request} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">Showing 1-8 of 13 requests</p>
        <div className="flex items-center gap-1">
          <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted">
            Previous
          </button>
          <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
            1
          </button>
          <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
            2
          </button>
          <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
