"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  ShoppingCart,
  FileEdit,
  Send,
  Truck,
  PackageCheck,
  CircleDollarSign,
  ChevronRight,
  ChevronDown,
  ListChecks,
  Package,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount, getRequestByRef } from "@/lib/dashboard-data"
import { getCompetitionByRef } from "@/lib/competitions-data"
import {
  purchaseOrders,
  orderStats,
  orderTotal,
  type OrderStatus,
  type PurchaseOrder,
} from "@/lib/orders-data"

/** Resolve a request ref (e.g. "REQ-1025") to its detail route, or null. */
function requestHref(ref?: string): string | null {
  if (!ref) return null
  const r = getRequestByRef(ref)
  return r ? `/requests/${r.id}` : null
}

/** Resolve a competition ref (e.g. "CMP-2017") to its detail route, or null. */
function competitionHref(ref?: string): string | null {
  if (!ref) return null
  const c = getCompetitionByRef(ref)
  return c ? `/competitions/${c.id}` : null
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
const statusStyles: Record<OrderStatus, { dot: string; text: string; bg: string }> = {
  Draft: { dot: "bg-[#667085]", text: "text-[#667085]", bg: "border border-[#E2E8F0] bg-[#F8FAFC]" },
  Sent: { dot: "bg-[#667085]", text: "text-[#667085]", bg: "border border-[#E2E8F0] bg-[#F8FAFC]" },
  "Awaiting Delivery": { dot: "bg-[#B54708]", text: "text-[#B54708]", bg: "border border-[#F1E4B5] bg-[#FEF3E8]" },
  "Partially Delivered": { dot: "bg-[#B54708]", text: "text-[#B54708]", bg: "border border-[#F1E4B5] bg-[#FEF3E8]" },
  Delivered: { dot: "bg-[#15803D]", text: "text-[#15803D]", bg: "border border-[#ABEFC6] bg-[#ECFDF3]" },
  Closed: { dot: "bg-[#667085]", text: "text-[#667085]", bg: "border border-[#E2E8F0] bg-[#F8FAFC]" },
  Cancelled: { dot: "bg-[#B42318]", text: "text-[#B42318]", bg: "border border-[#FECDCA] bg-[#FEF3F2]" },
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
// KPI card
// ---------------------------------------------------------------------------
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof ShoppingCart
  label: string
  value: string
  sub: string
  iconClass?: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4.5" />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none tracking-tight tabular-nums text-foreground">{value}</p>
        <p className="mt-1 text-xs font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filter dropdown
// ---------------------------------------------------------------------------
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  )
}

// ---------------------------------------------------------------------------
// Lifecycle tabs
// ---------------------------------------------------------------------------
const TABS: (OrderStatus | "All")[] = [
  "Draft",
  "Sent",
  "Awaiting Delivery",
  "Partially Delivered",
  "Delivered",
  "Closed",
  "Cancelled",
  "All",
]

const ALL_STATUSES = "All statuses"
const ANY = "Any"

function parseDate(s: string): number {
  const t = Date.parse(s.replace(" ", "T"))
  return Number.isNaN(t) ? 0 : t
}

// ---------------------------------------------------------------------------
// Explorer
// ---------------------------------------------------------------------------
export function OrdersExplorer() {
  // Simulated load lifecycle so the module shows real loading / error states.
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading")

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<(typeof TABS)[number]>("All")
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const [supplierFilter, setSupplierFilter] = useState(ANY)
  const [categoryFilter, setCategoryFilter] = useState(ANY)
  const [ownerFilter, setOwnerFilter] = useState(ANY)
  const [rangeFilter, setRangeFilter] = useState("Any time")
  const [amountFilter, setAmountFilter] = useState("Any amount")
  const [sort, setSort] = useState("Newest")

  function load() {
    setLoadState("loading")
    const timer = setTimeout(() => setLoadState("ready"), 450)
    return () => clearTimeout(timer)
  }

  useEffect(() => {
    return load()
  }, [])

  // Filter option lists derived from the data.
  const suppliers = useMemo(
    () => [ANY, ...Array.from(new Set(purchaseOrders.map((o) => o.supplier.name))).sort()],
    [],
  )
  const categories = useMemo(
    () => [ANY, ...Array.from(new Set(purchaseOrders.map((o) => o.category))).sort()],
    [],
  )
  const owners = useMemo(
    () => [ANY, ...Array.from(new Set(purchaseOrders.map((o) => o.owner))).sort()],
    [],
  )

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: purchaseOrders.length }
    for (const t of TABS) {
      if (t === "All") continue
      counts[t] = purchaseOrders.filter((o) => o.status === t).length
    }
    return counts
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const now = Date.now()
    const ranges: Record<string, number> = {
      "Last 7 days": 7 * 864e5,
      "Last 30 days": 30 * 864e5,
      "Last 90 days": 90 * 864e5,
    }

    const list = purchaseOrders.filter((po) => {
      if (tab !== "All" && po.status !== tab) return false
      if (statusFilter !== ALL_STATUSES && po.status !== statusFilter) return false
      if (supplierFilter !== ANY && po.supplier.name !== supplierFilter) return false
      if (categoryFilter !== ANY && po.category !== categoryFilter) return false
      if (ownerFilter !== ANY && po.owner !== ownerFilter) return false

      if (rangeFilter !== "Any time") {
        const span = ranges[rangeFilter]
        if (span && now - parseDate(po.created) > span) return false
      }

      if (amountFilter !== "Any amount") {
        const total = orderTotal(po)
        if (amountFilter === "Under 5,000" && total >= 5000) return false
        if (amountFilter === "5,000 – 25,000" && (total < 5000 || total > 25000)) return false
        if (amountFilter === "Over 25,000" && total <= 25000) return false
      }

      if (!q) return true
      return (
        po.number.toLowerCase().includes(q) ||
        po.supplier.name.toLowerCase().includes(q) ||
        po.category.toLowerCase().includes(q) ||
        po.owner.toLowerCase().includes(q) ||
        (po.requestRef?.toLowerCase().includes(q) ?? false) ||
        (po.competitionRef?.toLowerCase().includes(q) ?? false)
      )
    })

    const sorted = [...list]
    switch (sort) {
      case "Oldest":
        sorted.sort((a, b) => parseDate(a.created) - parseDate(b.created))
        break
      case "Highest value":
        sorted.sort((a, b) => orderTotal(b) - orderTotal(a))
        break
      case "Lowest value":
        sorted.sort((a, b) => orderTotal(a) - orderTotal(b))
        break
      case "Supplier (A–Z)":
        sorted.sort((a, b) => a.supplier.name.localeCompare(b.supplier.name))
        break
      default: // Newest
        sorted.sort((a, b) => parseDate(b.created) - parseDate(a.created))
    }
    return sorted
  }, [query, tab, statusFilter, supplierFilter, categoryFilter, ownerFilter, rangeFilter, amountFilter, sort])

  const activeFilterCount =
    (statusFilter !== ALL_STATUSES ? 1 : 0) +
    (supplierFilter !== ANY ? 1 : 0) +
    (categoryFilter !== ANY ? 1 : 0) +
    (ownerFilter !== ANY ? 1 : 0) +
    (rangeFilter !== "Any time" ? 1 : 0) +
    (amountFilter !== "Any amount" ? 1 : 0)

  function clearFilters() {
    setStatusFilter(ALL_STATUSES)
    setSupplierFilter(ANY)
    setCategoryFilter(ANY)
    setOwnerFilter(ANY)
    setRangeFilter("Any time")
    setAmountFilter("Any amount")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <KpiCard
          icon={ListChecks}
          label="All orders"
          value={`${orderStats.total}`}
          sub="purchase orders"
          iconClass="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={FileEdit}
          label="Draft"
          value={`${orderStats.draft}`}
          sub="not yet sent"
          iconClass="bg-muted text-muted-foreground"
        />
        <KpiCard
          icon={Send}
          label="Sent"
          value={`${orderStats.sent}`}
          sub="awaiting response"
          iconClass="bg-chart-3/10 text-chart-3"
        />
        <KpiCard
          icon={Truck}
          label="Awaiting delivery"
          value={`${orderStats.awaitingDelivery}`}
          sub="in transit"
          iconClass="bg-chart-4/10 text-chart-4"
        />
        <KpiCard
          icon={PackageCheck}
          label="Delivered"
          value={`${orderStats.delivered}`}
          sub="received & closed"
          iconClass="bg-chart-2/15 text-chart-2"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Committed"
          value={`${formatAmount(orderStats.committed)}`}
          sub="EUR across orders"
          iconClass="bg-primary/10 text-primary"
        />
      </div>

      {/* Lifecycle tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                tab === t ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {tabCounts[t] ?? 0}
            </span>
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by PO number, supplier, request ID, competition ID, or owner..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[ALL_STATUSES, ...TABS.filter((t) => t !== "All")]}
        />
        <FilterSelect label="Supplier" value={supplierFilter} onChange={setSupplierFilter} options={suppliers} />
        <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={categories} />
        <FilterSelect label="Owner" value={ownerFilter} onChange={setOwnerFilter} options={owners} />
        <FilterSelect
          label="Date range"
          value={rangeFilter}
          onChange={setRangeFilter}
          options={["Any time", "Last 7 days", "Last 30 days", "Last 90 days"]}
        />
        <FilterSelect
          label="Amount"
          value={amountFilter}
          onChange={setAmountFilter}
          options={["Any amount", "Under 5,000", "5,000 – 25,000", "Over 25,000"]}
        />
        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={["Newest", "Oldest", "Highest value", "Lowest value", "Supplier (A–Z)"]}
        />
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied
          </span>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <X className="size-3" />
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border p-5">
          <ShoppingCart className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">Purchase orders</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {loadState === "ready" ? filtered.length : "—"}
          </span>
        </div>

        {loadState === "loading" ? (
          <LoadingState />
        ) : loadState === "error" ? (
          <ErrorState onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            filtered={activeFilterCount > 0 || query.length > 0}
            onClear={() => {
              clearFilters()
              setQuery("")
              setTab("All")
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">PO number</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Expected delivery</th>
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

// ---------------------------------------------------------------------------
// Row — the whole row is clickable; "View" is an optional explicit action.
// ---------------------------------------------------------------------------
function OrderRow({ po }: { po: PurchaseOrder }) {
  return (
    <tr
      className="group cursor-pointer transition-colors hover:bg-muted/40"
      onClick={(e) => {
        // Let inner links handle their own navigation.
        if ((e.target as HTMLElement).closest("a")) return
        window.location.href = `/orders/${po.id}`
      }}
    >
      <td className="px-5 py-4">
        <Link
          href={`/orders/${po.id}`}
          className="font-mono text-sm font-semibold text-foreground transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
        >
          {po.number}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <RefChip refLabel={po.requestRef} href={requestHref(po.requestRef)} />
          {po.requestRef && po.competitionRef && (
            <ChevronRight className="size-3 text-muted-foreground" />
          )}
          <RefChip refLabel={po.competitionRef} href={competitionHref(po.competitionRef)} />
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium text-foreground">{po.supplier.name}</p>
        <p className="text-xs text-muted-foreground">{po.category}</p>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{po.owner}</td>
      <td className="px-5 py-4 text-muted-foreground">{po.expectedDelivery}</td>
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

/** Clickable procurement-chain reference (request / competition). */
function RefChip({ refLabel, href }: { refLabel?: string; href: string | null }) {
  if (!refLabel) return null
  if (!href) {
    return <span className="font-mono text-[11px] text-muted-foreground">{refLabel}</span>
  }
  return (
    <Link
      href={href}
      className="font-mono text-[11px] text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
    >
      {refLabel}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
function LoadingState() {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading purchase orders">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="hidden h-3 w-32 animate-pulse rounded bg-muted sm:block" />
          <div className="hidden h-3 w-24 animate-pulse rounded bg-muted md:block" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <div>
        <p className="font-medium text-foreground">Purchase orders could not be loaded</p>
        <p className="text-sm text-muted-foreground">Something went wrong while fetching your orders.</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <RotateCcw className="size-4" />
        Try again
      </button>
    </div>
  )
}

function EmptyState({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Package className="size-6" />
      </span>
      <div>
        <p className="font-medium text-foreground">No purchase orders found</p>
        <p className="text-sm text-muted-foreground">
          {filtered ? "Try a different search or filter." : "Create your first purchase order to get started."}
        </p>
      </div>
      {filtered ? (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" />
          Clear search & filters
        </button>
      ) : (
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ShoppingCart className="size-4" />
          Create purchase order
        </Link>
      )}
    </div>
  )
}
