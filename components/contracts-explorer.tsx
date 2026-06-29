"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  FileSignature,
  CheckCircle2,
  AlertTriangle,
  CircleSlash,
  CircleDollarSign,
  RefreshCw,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Trophy,
  ShoppingCart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/dashboard-data"
import {
  contracts,
  contractStats,
  expiryBucket,
  isAutoRenew,
  daysUntilEnd,
  contractRequestHref,
  contractCompetitionHref,
  contractOrderHref,
  type ContractStatus,
  type Contract,
} from "@/lib/contracts-data"

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
const pill = "inline-flex w-fit items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold"
const statusStyles: Record<ContractStatus, string> = {
  Draft:              `${pill} text-[#64748B]`,
  "Pending Approval": `${pill} text-[#92400e]`,
  Active:             `${pill} text-[#166534]`,
  "Expiring Soon":    `${pill} text-[#d97706]`,
  Expired:            `${pill} text-[#dc2626]`,
  Terminated:         `${pill} text-[#64748B]`,
}

function StatusPill({ status }: { status: ContractStatus }) {
  return <span className={statusStyles[status]}>{status}</span>
}

/** Highlights contracts approaching expiry (7 / 14 / 30 days). */
function ExpiryBadge({ contract }: { contract: Contract }) {
  const bucket = expiryBucket(contract)
  if (!bucket) return null
  const tone =
    bucket === 7
      ? "border border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]"
      : "border border-[#F1E4B5] bg-[#FEF3E8] text-[#B54708]"
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold", tone)}>
      <AlertTriangle className="size-3" />
      Expires in {bucket} days
    </span>
  )
}

/** Auto-renew vs manual renew indicator. */
function RenewBadge({ contract }: { contract: Contract }) {
  const auto = isAutoRenew(contract)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        auto ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      <RefreshCw className="size-3" />
      {auto ? "Auto Renew" : "Manual Renew"}
    </span>
  )
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------
function StatBar({ stats }: { stats: { label: string; value: string; sub?: string; accent?: boolean }[] }) {
  return (
    <div className="flex items-stretch divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
      {stats.map((s, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-0.5 px-5 py-3.5">
          <span className={cn(
            "text-[11px] font-medium uppercase tracking-widest",
            s.accent ? "text-[#B42318]" : "text-muted-foreground",
          )}>
            {s.label}
          </span>
          <span className={cn(
            "text-[1.6rem] font-bold leading-none tracking-tight tabular-nums",
            s.accent ? "text-[#B42318]" : "text-foreground",
          )}>
            {s.value}
          </span>
          {s.sub && <span className="text-[11px] text-muted-foreground">{s.sub}</span>}
        </div>
      ))}
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
          className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm font-medium text-foreground outline-none transition-colors focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
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
const TABS: (ContractStatus | "All")[] = [
  "Draft",
  "Pending Approval",
  "Active",
  "Expiring Soon",
  "Expired",
  "Terminated",
  "All",
]

const ALL_STATUSES = "All statuses"
const ANY = "Any"

function parseSortDate(s: string): number {
  const t = Date.parse(`${s}T00:00:00`)
  return Number.isNaN(t) ? 0 : t
}

// ---------------------------------------------------------------------------
// Explorer
// ---------------------------------------------------------------------------
export function ContractsExplorer() {
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading")

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<(typeof TABS)[number]>("All")
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const [supplierFilter, setSupplierFilter] = useState(ANY)
  const [ownerFilter, setOwnerFilter] = useState(ANY)
  const [categoryFilter, setCategoryFilter] = useState(ANY)
  const [typeFilter, setTypeFilter] = useState(ANY)
  const [renewalFilter, setRenewalFilter] = useState(ANY)
  const [endFilter, setEndFilter] = useState("Any end date")
  const [valueFilter, setValueFilter] = useState("Any value")
  const [sort, setSort] = useState("End date (soonest)")

  function load() {
    setLoadState("loading")
    const timer = setTimeout(() => setLoadState("ready"), 450)
    return () => clearTimeout(timer)
  }

  useEffect(() => {
    return load()
  }, [])

  const suppliers = useMemo(
    () => [ANY, ...Array.from(new Set(contracts.map((c) => c.supplier.name))).sort()],
    [],
  )
  const owners = useMemo(() => [ANY, ...Array.from(new Set(contracts.map((c) => c.owner))).sort()], [])
  const categories = useMemo(() => [ANY, ...Array.from(new Set(contracts.map((c) => c.category))).sort()], [])
  const types = useMemo(() => [ANY, ...Array.from(new Set(contracts.map((c) => c.contractType))).sort()], [])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: contracts.length }
    for (const t of TABS) {
      if (t === "All") continue
      counts[t] = contracts.filter((c) => c.status === t).length
    }
    return counts
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    const list = contracts.filter((c) => {
      if (tab !== "All" && c.status !== tab) return false
      if (statusFilter !== ALL_STATUSES && c.status !== statusFilter) return false
      if (supplierFilter !== ANY && c.supplier.name !== supplierFilter) return false
      if (ownerFilter !== ANY && c.owner !== ownerFilter) return false
      if (categoryFilter !== ANY && c.category !== categoryFilter) return false
      if (typeFilter !== ANY && c.contractType !== typeFilter) return false
      if (renewalFilter !== ANY && c.renewalType !== renewalFilter) return false

      if (endFilter !== "Any end date") {
        const days = daysUntilEnd(c)
        if (days === null) return false
        if (endFilter === "Next 30 days" && (days < 0 || days > 30)) return false
        if (endFilter === "Next 90 days" && (days < 0 || days > 90)) return false
        if (endFilter === "Already expired" && days >= 0) return false
      }

      if (valueFilter !== "Any value") {
        if (valueFilter === "Under 25,000" && c.value >= 25000) return false
        if (valueFilter === "25,000 – 100,000" && (c.value < 25000 || c.value > 100000)) return false
        if (valueFilter === "Over 100,000" && c.value <= 100000) return false
      }

      if (!q) return true
      return (
        c.number.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.supplier.name.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q) ||
        (c.requestRef?.toLowerCase().includes(q) ?? false) ||
        (c.poRef?.toLowerCase().includes(q) ?? false) ||
        (c.competitionRef?.toLowerCase().includes(q) ?? false)
      )
    })

    const sorted = [...list]
    switch (sort) {
      case "End date (latest)":
        sorted.sort((a, b) => parseSortDate(b.endDate) - parseSortDate(a.endDate))
        break
      case "Highest value":
        sorted.sort((a, b) => b.value - a.value)
        break
      case "Lowest value":
        sorted.sort((a, b) => a.value - b.value)
        break
      case "Supplier (A–Z)":
        sorted.sort((a, b) => a.supplier.name.localeCompare(b.supplier.name))
        break
      default: // End date (soonest)
        sorted.sort((a, b) => parseSortDate(a.endDate) - parseSortDate(b.endDate))
    }
    return sorted
  }, [
    query,
    tab,
    statusFilter,
    supplierFilter,
    ownerFilter,
    categoryFilter,
    typeFilter,
    renewalFilter,
    endFilter,
    valueFilter,
    sort,
  ])

  const activeFilterCount =
    (statusFilter !== ALL_STATUSES ? 1 : 0) +
    (supplierFilter !== ANY ? 1 : 0) +
    (ownerFilter !== ANY ? 1 : 0) +
    (categoryFilter !== ANY ? 1 : 0) +
    (typeFilter !== ANY ? 1 : 0) +
    (renewalFilter !== ANY ? 1 : 0) +
    (endFilter !== "Any end date" ? 1 : 0) +
    (valueFilter !== "Any value" ? 1 : 0)

  function clearFilters() {
    setStatusFilter(ALL_STATUSES)
    setSupplierFilter(ANY)
    setOwnerFilter(ANY)
    setCategoryFilter(ANY)
    setTypeFilter(ANY)
    setRenewalFilter(ANY)
    setEndFilter("Any end date")
    setValueFilter("Any value")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat bar */}
      <StatBar stats={[
        { label: "Active", value: `${contractStats.active}`, sub: "in force" },
        { label: "Expiring (30d)", value: `${contractStats.expiring30}`, sub: "need review", accent: contractStats.expiring30 > 0 },
        { label: "Expired", value: `${contractStats.expired}`, accent: contractStats.expired > 0 },
        { label: "Auto-renew", value: `${contractStats.autoRenew}` },
        { label: "Total Value", value: formatAmount(contractStats.totalValue), sub: "EUR" },
      ]} />

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
                tab === t ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {tabCounts[t] ?? 0}
            </span>
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />}
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
          placeholder="Search by contract number, name, supplier, request ID, PO number, or owner..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[ALL_STATUSES, ...TABS.filter((t) => t !== "All")]}
        />
        <FilterSelect label="Supplier" value={supplierFilter} onChange={setSupplierFilter} options={suppliers} />
        <FilterSelect label="Owner" value={ownerFilter} onChange={setOwnerFilter} options={owners} />
        <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={categories} />
        <FilterSelect label="Contract type" value={typeFilter} onChange={setTypeFilter} options={types} />
        <FilterSelect
          label="Renewal"
          value={renewalFilter}
          onChange={setRenewalFilter}
          options={[ANY, "Auto Renew", "Manual Renew"]}
        />
        <FilterSelect
          label="End date"
          value={endFilter}
          onChange={setEndFilter}
          options={["Any end date", "Next 30 days", "Next 90 days", "Already expired"]}
        />
        <FilterSelect
          label="Value"
          value={valueFilter}
          onChange={setValueFilter}
          options={["Any value", "Under 25,000", "25,000 – 100,000", "Over 100,000"]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-[220px]">
          <FilterSelect
            label="Sort by"
            value={sort}
            onChange={setSort}
            options={["End date (soonest)", "End date (latest)", "Highest value", "Lowest value", "Supplier (A–Z)"]}
          />
        </div>
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
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border p-5">
          <FileSignature className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">Contracts</h3>
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
                  <th className="px-5 py-3 font-medium">Contract</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Start</th>
                  <th className="px-5 py-3 font-medium">End</th>
                  <th className="px-5 py-3 text-right font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Renewal</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <ContractRow key={c.id} contract={c} />
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
function ContractRow({ contract: c }: { contract: Contract }) {
  return (
    <tr
      className="group cursor-pointer transition-colors hover:bg-muted/40"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) return
        window.location.href = `/contracts/${c.id}`
      }}
    >
      <td className="px-5 py-4">
        <Link
          href={`/contracts/${c.id}`}
          className="font-mono text-xs font-semibold text-muted-foreground transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
        >
          {c.number}
        </Link>
        <p className="mt-0.5 max-w-[260px] truncate font-medium text-foreground">{c.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <RefChip refLabel={c.requestRef} href={contractRequestHref(c)} icon={FileText} />
          <RefChip refLabel={c.competitionRef} href={contractCompetitionHref(c)} icon={Trophy} />
          <RefChip refLabel={c.poRef} href={contractOrderHref(c)} icon={ShoppingCart} />
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium text-foreground">{c.supplier.name}</p>
        <p className="text-xs text-muted-foreground">{c.contractType}</p>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{c.owner}</td>
      <td className="px-5 py-4 text-muted-foreground">{c.startDate}</td>
      <td className="px-5 py-4">
        <p className="text-foreground">{c.endDate}</p>
        <div className="mt-1">
          <ExpiryBadge contract={c} />
        </div>
      </td>
      <td className="px-5 py-4 text-right font-bold tabular-nums text-foreground">
        {formatAmount(c.value)} {c.currency}
      </td>
      <td className="px-5 py-4">
        <RenewBadge contract={c} />
      </td>
      <td className="px-5 py-4">
        <StatusPill status={c.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={`/contracts/${c.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          aria-label={`Open ${c.number}`}
        >
          View
          <ChevronRight className="size-4" />
        </Link>
      </td>
    </tr>
  )
}

/** Clickable procurement-chain reference (request / competition / PO). */
function RefChip({
  refLabel,
  href,
  icon: Icon,
}: {
  refLabel?: string
  href: string | null
  icon: typeof FileText
}) {
  if (!refLabel) return null
  if (!href) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
        <Icon className="size-3" />
        {refLabel}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
    >
      <Icon className="size-3" />
      {refLabel}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
function LoadingState() {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading contracts">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-56 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-28 animate-pulse rounded bg-muted" />
          </div>
          <div className="hidden h-3 w-32 animate-pulse rounded bg-muted sm:block" />
          <div className="hidden h-3 w-20 animate-pulse rounded bg-muted md:block" />
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
        <p className="font-medium text-foreground">Contracts could not be loaded</p>
        <p className="text-sm text-muted-foreground">Something went wrong while fetching your contracts.</p>
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
        <FileSignature className="size-6" />
      </span>
      <div>
        <p className="font-medium text-foreground">No contracts found</p>
        <p className="text-sm text-muted-foreground">
          {filtered ? "Try a different search or filter." : "Create your first contract to get started."}
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
          href="/orders"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <FileSignature className="size-4" />
          Create contract
        </Link>
      )}
    </div>
  )
}
