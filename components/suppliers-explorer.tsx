"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  Network,
  CheckCircle2,
  Clock,
  Star,
  Ban,
  Users,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  X,
  ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/dashboard-data"
import {
  suppliers,
  supplierStats,
  supplierTotalSpend,
  supplierLastActivity,
  supplierCategories,
  supplierCountries,
  supplierOwners,
  supplierTypes,
  type SupplierStatus,
  type RiskStatus,
  type Supplier,
} from "@/lib/suppliers-data"

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
const statusStyles: Record<SupplierStatus, { dot: string; text: string; bg: string }> = {
  Pending:   { dot: "bg-[#d97706]", text: "text-[#92400e]", bg: "border border-[#fde68a] bg-[#fffbeb]" },
  Active:    { dot: "bg-[#16a34a]", text: "text-[#166534]", bg: "border border-[#bbf7d0] bg-[#f0fdf4]" },
  Preferred: { dot: "bg-[#9ca3af]", text: "text-[#6b7280]", bg: "border border-[#e5e7eb] bg-[#f9fafb]" },
  Blocked:   { dot: "bg-[#dc2626]", text: "text-[#991b1b]", bg: "border border-[#fecaca] bg-[#fef2f2]" },
  Archived:  { dot: "bg-[#9ca3af]", text: "text-[#6b7280]", bg: "border border-[#e5e7eb] bg-[#f9fafb]" },
}

function StatusPill({ status }: { status: SupplierStatus }) {
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

const riskStyles: Record<RiskStatus, string> = {
  "Low Risk": "border border-[#E2E8F0] bg-[#F8FAFC] text-[#667085]",
  "Medium Risk": "border border-[#F1E4B5] bg-[#FEF3E8] text-[#B54708]",
  "High Risk": "border border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]",
}

function RiskBadge({ risk }: { risk: RiskStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", riskStyles[risk])}>
      <ShieldAlert className="size-3" />
      {risk}
    </span>
  )
}

/** Preferred-partner star badge. */
function PreferredBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
      <Star className="size-3 fill-foreground" />
      Preferred
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
const TABS: (SupplierStatus | "All")[] = ["Active", "Pending", "Preferred", "Blocked", "Archived", "All"]

const ALL_STATUSES = "All statuses"
const ANY = "Any"

// ---------------------------------------------------------------------------
// Explorer
// ---------------------------------------------------------------------------
export function SuppliersExplorer() {
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading")

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<(typeof TABS)[number]>("All")
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const [categoryFilter, setCategoryFilter] = useState(ANY)
  const [countryFilter, setCountryFilter] = useState(ANY)
  const [typeFilter, setTypeFilter] = useState(ANY)
  const [ratingFilter, setRatingFilter] = useState(ANY)
  const [sort, setSort] = useState("Total spend (high)")

  function load() {
    setLoadState("loading")
    const timer = setTimeout(() => setLoadState("ready"), 450)
    return () => clearTimeout(timer)
  }

  useEffect(() => {
    return load()
  }, [])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: suppliers.length }
    for (const t of TABS) {
      if (t === "All") continue
      counts[t] = suppliers.filter((s) => s.status === t).length
    }
    return counts
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    const list = suppliers.filter((s) => {
      if (tab !== "All" && s.status !== tab) return false
      if (statusFilter !== ALL_STATUSES && s.status !== statusFilter) return false
      if (categoryFilter !== ANY && s.category !== categoryFilter) return false
      if (countryFilter !== ANY && s.country !== countryFilter) return false
      if (typeFilter !== ANY && s.type !== typeFilter) return false
      if (ratingFilter !== ANY && s.risk !== ratingFilter) return false

      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.legalName.toLowerCase().includes(q) ||
        s.tax.vatNumber.toLowerCase().includes(q) ||
        s.tax.registrationNumber.toLowerCase().includes(q) ||
        s.contact.email.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.owner.toLowerCase().includes(q)
      )
    })

    const sorted = [...list]
    switch (sort) {
      case "Total spend (low)":
        sorted.sort((a, b) => supplierTotalSpend(a) - supplierTotalSpend(b))
        break
      case "Name (A–Z)":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "Risk (high first)": {
        const order: Record<RiskStatus, number> = { "High Risk": 0, "Medium Risk": 1, "Low Risk": 2 }
        sorted.sort((a, b) => order[a.risk] - order[b.risk])
        break
      }
      default: // Total spend (high)
        sorted.sort((a, b) => supplierTotalSpend(b) - supplierTotalSpend(a))
    }
    return sorted
  }, [query, tab, statusFilter, categoryFilter, countryFilter, typeFilter, ratingFilter, sort])

  const activeFilterCount =
    (statusFilter !== ALL_STATUSES ? 1 : 0) +
    (categoryFilter !== ANY ? 1 : 0) +
    (countryFilter !== ANY ? 1 : 0) +
    (typeFilter !== ANY ? 1 : 0) +
    (ratingFilter !== ANY ? 1 : 0)

  function clearFilters() {
    setStatusFilter(ALL_STATUSES)
    setCategoryFilter(ANY)
    setCountryFilter(ANY)
    setTypeFilter(ANY)
    setRatingFilter(ANY)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat bar */}
      <StatBar stats={[
        { label: "Active", value: `${supplierStats.active}`, sub: "ready to trade" },
        { label: "Pending", value: `${supplierStats.pending}`, sub: "onboarding" },
        { label: "Preferred", value: `${supplierStats.preferred}`, sub: "strategic partners" },
        { label: "Blocked", value: `${supplierStats.blocked}`, accent: supplierStats.blocked > 0 },
        { label: "Total", value: `${supplierStats.total}` },
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
          placeholder="Search by name, VAT number, registration number, contact email, or category..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[ALL_STATUSES, ...TABS.filter((t) => t !== "All")]}
        />
        <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={[ANY, ...supplierCategories]} />
        <FilterSelect label="Country" value={countryFilter} onChange={setCountryFilter} options={[ANY, ...supplierCountries]} />
        <FilterSelect label="Supplier type" value={typeFilter} onChange={setTypeFilter} options={[ANY, ...supplierTypes]} />
        <FilterSelect
          label="Rating"
          value={ratingFilter}
          onChange={setRatingFilter}
          options={[ANY, "Low Risk", "Medium Risk", "High Risk"]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-[220px]">
          <FilterSelect
            label="Sort by"
            value={sort}
            onChange={setSort}
            options={["Total spend (high)", "Total spend (low)", "Name (A–Z)", "Risk (high first)"]}
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
          <Network className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">Suppliers</h3>
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
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Country</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 text-right font-medium">Total spend</th>
                  <th className="px-5 py-3 font-medium">Last activity</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <SupplierRow key={s.id} supplier={s} />
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
function SupplierRow({ supplier: s }: { supplier: Supplier }) {
  const spend = supplierTotalSpend(s)
  const last = supplierLastActivity(s)
  return (
    <tr
      className="group cursor-pointer transition-colors hover:bg-muted/40"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) return
        window.location.href = `/suppliers/${s.id}`
      }}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/suppliers/${s.id}`}
            className="font-medium text-foreground transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
          >
            {s.name}
          </Link>
          {s.preferred && <PreferredBadge />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {s.category} · VAT {s.tax.vatNumber}
        </p>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{s.type}</td>
      <td className="px-5 py-4 text-muted-foreground">{s.country}</td>
      <td className="px-5 py-4 text-muted-foreground">{s.owner}</td>
      <td className="px-5 py-4">
        <RiskBadge risk={s.risk} />
      </td>
      <td className="px-5 py-4 text-right font-bold tabular-nums text-foreground">
        {spend > 0 ? `${formatAmount(spend)} EUR` : "—"}
      </td>
      <td className="px-5 py-4">
        {last ? (
          <>
            <p className="text-foreground">{last.date}</p>
            <p className="text-xs text-muted-foreground">{last.label}</p>
          </>
        ) : (
          <span className="text-muted-foreground">No activity</span>
        )}
      </td>
      <td className="px-5 py-4">
        <StatusPill status={s.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={`/suppliers/${s.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          aria-label={`Open ${s.name}`}
        >
          View
          <ChevronRight className="size-4" />
        </Link>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
function LoadingState() {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading suppliers">
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
        <ShieldAlert className="size-6" />
      </span>
      <div>
        <p className="font-medium text-foreground">Suppliers could not be loaded</p>
        <p className="text-sm text-muted-foreground">Something went wrong while fetching your suppliers.</p>
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
        <Network className="size-6" />
      </span>
      <div>
        <p className="font-medium text-foreground">No suppliers found</p>
        <p className="text-sm text-muted-foreground">
          {filtered ? "Try a different search or filter." : "Add your first supplier to get started."}
        </p>
      </div>
      {filtered && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" />
          Clear search & filters
        </button>
      )}
    </div>
  )
}
