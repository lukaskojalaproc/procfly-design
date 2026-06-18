"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Package, Briefcase, UserPlus, MoreVertical, Users, ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PriceTag } from "@/components/price-tag"
import {
  requests,
  myRequests,
  currentUser,
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
    <Link
      href={`/requests/${request.id}`}
      className="group flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-muted/60"
    >
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
        onClick={(e) => e.preventDefault()}
      >
        <MoreVertical className="size-4" />
      </button>
    </Link>
  )
}

type Scope = "mine" | "all"

export function RequestList() {
  const isSuperAdmin = currentUser.role === "Super Admin"
  const mine = useMemo(() => myRequests(), [])
  const [scope, setScope] = useState<Scope>("mine")

  // Non-admins only ever see their own requests.
  const activeScope: Scope = isSuperAdmin ? scope : "mine"
  const list = activeScope === "all" ? requests : mine

  const tabs: { key: Scope; label: string; count: number }[] = [
    { key: "mine", label: "My Requests", count: mine.length },
    ...(isSuperAdmin ? [{ key: "all" as Scope, label: "All Requests", count: requests.length }] : []),
  ]

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Requests</h2>
          {isSuperAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3" />
              Super Admin
            </span>
          )}
        </div>
        <Link
          href="/requests"
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          View all requests
        </Link>
      </div>

      {/* Scope tabs */}
      <div className="mb-2 flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => {
          const active = activeScope === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setScope(tab.key)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  active ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col divide-y divide-border/60">
        {list.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            You haven&apos;t created any requests yet.
          </p>
        ) : (
          list.map((request) => <RequestRow key={request.id} request={request} />)
        )}
      </div>

      {list.length > 0 && (
        <div className="mt-4 pt-2">
          <p className="text-sm text-muted-foreground">
            {activeScope === "all"
              ? `Showing all ${list.length} requests in the workspace`
              : `Showing your ${list.length} request${list.length === 1 ? "" : "s"}`}
          </p>
        </div>
      )}
    </Card>
  )
}
