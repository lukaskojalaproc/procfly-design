"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Package, Briefcase, UserPlus, Users, ShieldCheck, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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

/** Amount — pill with background and border so it reads as the primary value at a glance. */
function AmountDisplay({ amount, currency }: { amount: number; currency: string }) {
  const tier = priceTier(amount)
  if (tier === "none") {
    return <span className="shrink-0 text-sm tabular-nums text-[#94A3B8]">—</span>
  }
  const isCritical = tier === "critical"
  const isLarge = tier === "high" || isCritical
  const amountStr = formatAmount(amount)
  const display = currency === "EUR" ? `€${amountStr}` : `${amountStr} ${currency}`
  return (
    <span className={cn(
      "shrink-0 rounded-lg border border-border bg-background px-2.5 py-1 tabular-nums text-[#0F172A] shadow-sm",
      isCritical ? "text-[15px] font-bold" : isLarge ? "text-[14px] font-semibold" : "text-[13px] font-medium",
    )}>
      {display}
    </span>
  )
}

/** Budget bar — single muted bar inline with "X left of Y" label. No traffic-light colors. */
function BudgetBar({ amount, budgetTotal, currency }: { amount: number; budgetTotal: number; currency: string }) {
  const pct = Math.min((amount / budgetTotal) * 100, 100)
  const remaining = Math.max(budgetTotal - amount, 0)
  const remainingStr = currency === "EUR" ? `€${formatCompact(remaining)}` : `${formatCompact(remaining)} ${currency}`
  const totalStr = currency === "EUR" ? `€${formatCompact(budgetTotal)}` : `${formatCompact(budgetTotal)} ${currency}`

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {/* Track */}
      <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
        <div
          className="h-full rounded-full bg-[#94A3B8] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Two-part label: remaining prominent, total secondary with slash separator */}
      <div className="flex shrink-0 items-baseline gap-1 whitespace-nowrap">
        <span className="text-[11px] font-semibold text-[#475569]">{remainingStr}</span>
        <span className="text-[10px] text-[#94A3B8]">/ {totalStr}</span>
      </div>
    </div>
  )
}

/** Lithuanian pluralization for quotes. */
function quotesLabel(n: number) {
  if (n === 1) return "1 pasiūlymas"
  if (n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 10 || n % 100 >= 20)) return `${n} pasiūlymai`
  return `${n} pasiūlymų`
}

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
}

function RequestRow({ request }: { request: ProcurementRequest }) {
  const Icon = kindIcon[request.kind]
  const status = statusMeta[request.status]
  const isCritical = priceTier(request.amount) === "critical"
  const amountStr = formatAmount(request.amount)
  const display = request.currency === "EUR" ? `€${amountStr}` : `${amountStr} ${request.currency}`

  return (
    <div className="flex flex-col">
      <Link
        href={`/requests/${request.id}`}
        className="group grid rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-foreground/25 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        style={{ gridTemplateColumns: "minmax(0,2fr) minmax(140px,1fr) minmax(180px,1fr) auto" }}
      >
        {/* Col 1 — Identity */}
        <div className="min-w-0 pr-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">{request.ref}</span>
            {isCritical && (
              <span className="shrink-0 rounded-full border border-[#CBD5E1] bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0F172A]">
                High Value
              </span>
            )}
          </div>
          <h4 className="mt-1 line-clamp-1 font-semibold text-foreground">{request.title}</h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-[#E2E8F0] text-[9px] font-semibold text-[#475569]">
                {initials(request.requester)}
              </span>
              <span className="font-medium text-foreground">{request.requester}</span>
            </span>
            <span>{request.department}</span>
            <span className="hidden md:inline">{request.date}</span>
            <span className="hidden md:inline">{request.kind}</span>
            {request.quotes > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3" />
                {quotesLabel(request.quotes)}
              </span>
            )}
          </div>
        </div>

        {/* Col 2 — Status */}
        <div className="flex flex-col justify-center gap-0.5 border-l border-border pl-6">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Status</span>
          <span className={cn(
            "mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
            status.badge,
          )}>
            {status.label}
          </span>
        </div>

        {/* Col 3 — Amount */}
        <div className="flex flex-col justify-center gap-0.5 border-l border-border pl-6">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Amount</p>
          <p className={cn(
            "tabular-nums text-foreground",
            isCritical ? "text-[15px] font-bold" : "text-lg font-bold",
          )}>
            {display}
          </p>
          {request.budgetTotal && (
            <BudgetBar amount={request.amount} budgetTotal={request.budgetTotal} currency={request.currency} />
          )}
        </div>

        {/* Col 4 — Open */}
        <div className="flex items-center pl-4">
          <span className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors whitespace-nowrap group-hover:bg-foreground group-hover:text-background">
            Open
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </Link>
    </div>
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
                  ? "border-foreground text-foreground"
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
