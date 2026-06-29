"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Package, Briefcase, UserPlus, Users, ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { RequestRowMenu } from "@/components/request-row-menu"
import {
  requests,
  myRequests,
  maxAmount,
  initials,
  statusMeta,
  formatAmount,
  formatCompact,
  priceTier,
  type ProcurementRequest,
  type RequestKind,
} from "@/lib/dashboard-data"
import { useCurrentRole } from "@/lib/role-store"

/**
 * Amount block — stacked vertically: number on top, currency below.
 * Gives the amount its own column with breathing room.
 */
function AmountDisplay({ amount, currency }: { amount: number; currency: string }) {
  const tier = priceTier(amount)
  if (tier === "none") {
    return (
      <span className="flex shrink-0 flex-col items-end leading-none">
        <span className="text-sm tabular-nums text-muted-foreground/40">—</span>
      </span>
    )
  }
  const isLarge = tier === "high" || tier === "critical"
  const amountStr = isLarge ? formatCompact(amount) : formatAmount(amount)
  return (
    <span className="flex shrink-0 flex-col items-end leading-none tabular-nums">
      <span className={cn(
        "font-semibold",
        tier === "critical" ? "text-foreground" : "text-foreground/80",
        isLarge ? "text-base" : "text-sm",
      )}>
        {amountStr}
      </span>
      <span className="mt-1 text-[10px] font-normal uppercase tracking-wider text-muted-foreground/50">
        {currency}
      </span>
    </span>
  )
}

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
}

function RequestRow({ request }: { request: ProcurementRequest }) {
  const Icon = kindIcon[request.kind]
  return (
    <Link
      href={`/requests/${request.id}`}
      className="group flex items-center gap-4 rounded-xl px-3 py-5 transition-colors table-row-hover"
    >
      {/* Left accent bar */}
      <span className="h-11 w-1 shrink-0 rounded-full bg-border transition-colors group-hover:bg-primary" />
      {/* Icon — neutral, not green. Green reserved for CTA only. */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>

      {/* Title + metadata */}
      <div className="min-w-0 flex-1">
        {/* Row 1: ref + title + amount right-aligned */}
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground shrink-0">
            {request.ref}
          </span>
          <p className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold leading-snug text-foreground">
            {request.title}
          </p>
          {/* Amount lives here — right-aligned, plenty of room, no competition */}
          <AmountDisplay amount={request.amount} currency={request.currency} />
        </div>
        {/* Row 2: metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-4.5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              {initials(request.requester)}
            </span>
            {request.requester}
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <span className="size-[3px] rounded-full bg-border/60" />
            {request.department}
          </span>
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <span className="size-[3px] rounded-full bg-border/60" />
            {request.date}
          </span>
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <span className="size-[3px] rounded-full bg-border/60" />
            {request.kind}
          </span>
          {request.quotes > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              <Users className="size-3" />
              {request.quotes} quotes
            </span>
          )}
        </div>
      </div>

      <span
        className={cn(
          "hidden shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:inline-flex",
          statusMeta[request.status].badge,
        )}
      >
        {statusMeta[request.status].label}
      </span>

      <RequestRowMenu request={request} />
    </Link>
  )
}

type Scope = "mine" | "all"

export function RequestList() {
  const role = useCurrentRole()
  const isSuperAdmin = role === "Super Admin"
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
    <Card className="card-shadow p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Requests</h2>
          {isSuperAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-3" />
              Super Admin
            </span>
          )}
        </div>
        <Link
          href="/requests"
          className="btn-secondary"
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
              {/* Count badge: neutral always, no green */}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
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
