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
  priceTier,
  type ProcurementRequest,
  type RequestKind,
} from "@/lib/dashboard-data"
import { useCurrentRole } from "@/lib/role-store"

/** Amount — uniform plain text, semibold for large values. No color variation. */
function AmountDisplay({ amount, currency }: { amount: number; currency: string }) {
  const tier = priceTier(amount)
  if (tier === "none") {
    return <span className="shrink-0 text-sm tabular-nums text-[#94A3B8]">—</span>
  }
  const isLarge = tier === "high" || tier === "critical"
  const amountStr = formatAmount(amount)
  const display = currency === "EUR" ? `€${amountStr}` : `${amountStr} ${currency}`
  return (
    <span className={cn(
      "shrink-0 tabular-nums text-[#0F172A]",
      tier === "critical" ? "text-[15px] font-bold" : isLarge ? "text-[14px] font-semibold" : "text-[14px] font-medium"
    )}>
      {display}
    </span>
  )
}

/** Budget bar — single muted bar inline with "X left of Y" label. No traffic-light colors. */
function BudgetBar({ amount, budgetTotal, currency }: { amount: number; budgetTotal: number; currency: string }) {
  const pct = Math.min((amount / budgetTotal) * 100, 100)
  const remaining = Math.max(budgetTotal - amount, 0)
  const remainingStr = currency === "EUR" ? `€${formatAmount(remaining)}` : `${formatAmount(remaining)} ${currency}`
  const totalStr = currency === "EUR" ? `€${formatAmount(budgetTotal)}` : `${formatAmount(budgetTotal)} ${currency}`

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
        <span className="text-[11px] font-semibold text-[#374151]">{remainingStr}</span>
        <span className="text-[10px] text-[#9CA3AF]">/ {totalStr}</span>
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
  return (
    <div className={cn(
      "rounded-xl",
      isCritical && "border-l-[3px] border-l-[#0C6B58] bg-[#F7FAFA] pl-[1px]",
    )}>
    <Link
      href={`/requests/${request.id}`}
      className={cn(
        "group flex items-center gap-4 rounded-r-xl px-3 py-[1.125rem] transition-colors table-row-hover",
        isCritical ? "rounded-l-none" : "rounded-xl",
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg text-[#94A3B8]",
        isCritical ? "bg-[#0C6B58]/[0.07]" : "bg-muted/60",
      )}>
        <Icon className="size-4" />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Row 1: ref + title */}
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#94A3B8]">
            {request.ref}
          </span>
          <p className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium leading-snug text-[#0F172A]">
            {request.title}
          </p>
          {isCritical && (
            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: "#0C6B58", background: "#E6F4F1" }}>
              High Value
            </span>
          )}
        </div>
        {/* Row 2: metadata */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#475569]">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-[#E2E8F0] text-[9px] font-semibold text-[#475569]">
              {initials(request.requester)}
            </span>
            {request.requester}
          </span>
          <span className="hidden sm:inline">{request.department}</span>
          <span className="hidden md:inline">{request.date}</span>
          <span className="hidden md:inline">{request.kind}</span>
          {request.quotes > 0 && (
            <span className="inline-flex items-center gap-1 text-[#64748B]">
              <Users className="size-3" />
              {quotesLabel(request.quotes)}
            </span>
          )}
        </div>
        {/* Row 3: budget bar — subtle, inline, only when budgetTotal exists */}
        {request.budgetTotal && (
          <div className="mt-2">
            <BudgetBar
              amount={request.amount}
              budgetTotal={request.budgetTotal}
              currency={request.currency}
            />
          </div>
        )}
      </div>

      {/* Right side: amount + status — generous gap between them */}
      <div className="flex shrink-0 items-center gap-5">
        <AmountDisplay amount={request.amount} currency={request.currency} />
        <span
          className={cn(
            "w-20 rounded-full px-2.5 py-0.5 text-center text-[11px] font-medium",
            status.badge,
          )}
        >
          {status.label}
        </span>
      </div>

      <RequestRowMenu request={request} />
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
