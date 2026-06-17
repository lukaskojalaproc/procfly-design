"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  ShoppingCart,
  FileEdit,
  Send,
  CheckCircle2,
  CircleDollarSign,
  ChevronRight,
  ListChecks,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/dashboard-data"
import {
  purchaseOrders,
  orderStats,
  orderTotal,
  type OrderStatus,
  type PurchaseOrder,
} from "@/lib/orders-data"

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
const statusStyles: Record<OrderStatus, { dot: string; text: string; bg: string }> = {
  Draft: { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted" },
  Sent: { dot: "bg-chart-3", text: "text-chart-3", bg: "bg-chart-3/10" },
  Completed: { dot: "bg-primary", text: "text-primary", bg: "bg-primary/10" },
  Cancelled: { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
}

function StatusPill({ status }: { status: OrderStatus }) {
  const s = statusStyles[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        s.bg,
        s.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Summary stat card
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  active,
  onClick,
}: {
  icon: typeof ShoppingCart
  label: string
  value: string
  sub?: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors",
        active ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/30",
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-2xl font-bold leading-none tabular-nums text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Explorer
// ---------------------------------------------------------------------------
export function OrdersExplorer() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return purchaseOrders.filter((po) => {
      if (statusFilter !== "all" && po.status !== statusFilter) return false
      if (!q) return true
      return (
        po.number.toLowerCase().includes(q) ||
        po.supplier.name.toLowerCase().includes(q) ||
        po.category.toLowerCase().includes(q)
      )
    })
  }, [query, statusFilter])

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={ListChecks}
          label="All orders"
          value={`${orderStats.total}`}
          sub="purchase orders"
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <StatCard
          icon={FileEdit}
          label="Draft"
          value={`${orderStats.draft}`}
          sub="not yet sent"
          active={statusFilter === "Draft"}
          onClick={() => setStatusFilter("Draft")}
        />
        <StatCard
          icon={Send}
          label="Sent"
          value={`${orderStats.sent}`}
          sub="awaiting delivery"
          active={statusFilter === "Sent"}
          onClick={() => setStatusFilter("Sent")}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Committed"
          value={`${formatAmount(orderStats.committed)}`}
          sub="EUR across orders"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for all purchase orders"
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border p-5">
          <ShoppingCart className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">All Purchase Orders</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {filtered.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Package className="size-6" />
            </span>
            <div>
              <p className="font-medium text-foreground">No purchase orders found</p>
              <p className="text-sm text-muted-foreground">Try a different search or filter.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">PO number</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 text-center font-medium">Lines</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((po) => (
                  <OrderRow key={po.id} po={po} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderRow({ po }: { po: PurchaseOrder }) {
  return (
    <tr className="group transition-colors hover:bg-muted/40">
      <td className="px-5 py-4">
        <Link
          href={`/orders/${po.id}`}
          className="font-mono text-sm font-semibold text-foreground transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
        >
          {po.number}
        </Link>
        {po.sourceRef && (
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">from {po.sourceRef}</p>
        )}
      </td>
      <td className="px-5 py-4">
        <p className="font-medium text-foreground">{po.supplier.name}</p>
        <p className="text-xs text-muted-foreground">{po.category}</p>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{po.created}</td>
      <td className="px-5 py-4 text-center tabular-nums text-muted-foreground">{po.lines.length}</td>
      <td className="px-5 py-4 text-right font-bold tabular-nums text-foreground">
        {formatAmount(orderTotal(po))} {po.currency}
      </td>
      <td className="px-5 py-4">
        <StatusPill status={po.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={`/orders/${po.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          aria-label={`Open ${po.number}`}
        >
          View
          <ChevronRight className="size-4" />
        </Link>
      </td>
    </tr>
  )
}
