"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Zap,
  Send,
  ShieldCheck,
  Network,
  Search,
  TrendingDown,
  CircleDollarSign,
  Flame,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Users,
  Trophy,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  competitions,
  competitionStats,
  totalSavings,
  liveValue,
  bestBid,
  savingsAmount,
  savingsPct,
  type Competition,
  type CompetitionStatus,
} from "@/lib/competitions-data"
import { formatAmount, initials } from "@/lib/dashboard-data"

function fmtEur(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M`
  if (n >= 1000) return `€${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`
  return `€${n}`
}

function deadlineLabel(hours: number | null): string {
  if (hours == null) return "—"
  if (hours < 1) return `${Math.round(hours * 60)}m left`
  if (hours < 48) return `${Math.round(hours)}h left`
  return `${Math.round(hours / 24)}d left`
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
const statusStyles: Record<CompetitionStatus, { dot: string; text: string; bg: string }> = {
  Draft: { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted" },
  Ready: { dot: "bg-chart-3", text: "text-chart-3", bg: "bg-chart-3/10" },
  Active: { dot: "bg-primary", text: "text-primary", bg: "bg-primary/10" },
  Awarded: { dot: "bg-chart-2", text: "text-chart-2", bg: "bg-chart-2/15" },
  Closed: { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
}

function StatusPill({ status, live }: { status: CompetitionStatus; live?: boolean }) {
  const s = statusStyles[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        s.bg,
        s.text,
      )}
    >
      <span className="relative flex size-1.5">
        {live && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", s.dot)} />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", s.dot)} />
      </span>
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
  iconClass,
}: {
  icon: typeof Zap
  label: string
  value: string
  sub: string
  iconClass: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className={cn("flex size-9 items-center justify-center rounded-lg", iconClass)}>
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
// Competition row
// ---------------------------------------------------------------------------
function CompetitionRow({ competition }: { competition: Competition }) {
  const best = bestBid(competition)
  const pct = savingsPct(competition)
  const saving = savingsAmount(competition)
  const isActive = competition.status === "Active"
  const isAwarded = competition.status === "Awarded"
  const responded = competition.bids.length
  const invited = competition.invitedSuppliers

  return (
    <Link
      href={`/competitions/${competition.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:flex-row lg:items-center lg:gap-4"
    >
      {/* Identity */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{competition.ref}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {competition.category}
          </span>
          <StatusPill status={competition.status} live={isActive} />
        </div>
        <h4 className="mt-1 line-clamp-1 font-semibold text-foreground">{competition.title}</h4>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground">
              {initials(competition.owner)}
            </span>
            {competition.owner}
          </span>
          {competition.sourceRequestRef && (
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3" />
              {competition.sourceRequestRef}
            </span>
          )}
          {competition.deadlineInHours != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {deadlineLabel(competition.deadlineInHours)}
            </span>
          )}
        </div>
      </div>

      {/* Supplier responses */}
      <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground lg:w-32 lg:flex-col lg:items-start lg:gap-0.5">
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground lg:order-1">
          <Users className="size-3" />
          Responses
        </span>
        <span className="font-semibold tabular-nums text-foreground">
          {responded} / {invited} responded
        </span>
      </div>

      {/* Best bid + savings */}
      <div className="flex shrink-0 items-end justify-between gap-4 border-t border-border pt-3 lg:w-48 lg:border-0 lg:pt-0">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {isAwarded ? "Awarded at" : best ? "Best bid" : "Baseline"}
          </p>
          <p className="text-base font-bold tabular-nums text-foreground">
            {best ? formatAmount(best.amount) : formatAmount(competition.baseline)}
            <span className="ml-1 text-xs font-medium text-muted-foreground">{competition.currency}</span>
          </p>
          {isAwarded && competition.awardedTo && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-chart-2">
              <Trophy className="size-3" />
              {competition.awardedTo}
            </p>
          )}
        </div>
        {pct > 0 && (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              <TrendingDown className="size-3.5" />
              {Math.round(pct * 100)}%
            </span>
            <p className="mt-1 text-[11px] text-muted-foreground">{fmtEur(saving)} saved</p>
          </div>
        )}
      </div>

      {/* Action */}
      <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground lg:w-auto">
        Open Competition
        <ChevronRight className="size-3.5" />
      </span>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
type Tab = "Active" | "Ready to Start" | "Awarded" | "Cancelled" | "All"

const tabToStatus: Record<Exclude<Tab, "All">, CompetitionStatus[]> = {
  Active: ["Active"],
  "Ready to Start": ["Ready", "Draft"],
  Awarded: ["Awarded"],
  Cancelled: ["Closed"],
}

// ===========================================================================
// Main explorer
// ===========================================================================
export function CompetitionsExplorer() {
  const [tab, setTab] = useState<Tab>("Active")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [categoryFilter, setCategoryFilter] = useState("All categories")
  const [ownerFilter, setOwnerFilter] = useState("All owners")
  const [supplierFilter, setSupplierFilter] = useState("Any suppliers")
  const [sourceFilter, setSourceFilter] = useState("All sources")
  const [sort, setSort] = useState("Newest")

  const categories = useMemo(
    () => ["All categories", ...Array.from(new Set(competitions.map((c) => c.category))).sort()],
    [],
  )
  const owners = useMemo(
    () => ["All owners", ...Array.from(new Set(competitions.map((c) => c.owner))).sort()],
    [],
  )

  const tabCounts = useMemo(() => {
    const count = (statuses: CompetitionStatus[]) =>
      competitions.filter((c) => statuses.includes(c.status)).length
    return {
      Active: count(["Active"]),
      "Ready to Start": count(["Ready", "Draft"]),
      Awarded: count(["Awarded"]),
      Cancelled: count(["Closed"]),
      All: competitions.length,
    }
  }, [])

  const filtered = useMemo(() => {
    let list = [...competitions]

    // Tab
    if (tab !== "All") list = list.filter((c) => tabToStatus[tab].includes(c.status))

    // Search
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.ref.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.owner.toLowerCase().includes(q) ||
          (c.sourceRequestRef ?? "").toLowerCase().includes(q),
      )
    }

    // Filters
    if (statusFilter !== "All statuses") list = list.filter((c) => c.status === statusFilter)
    if (categoryFilter !== "All categories") list = list.filter((c) => c.category === categoryFilter)
    if (ownerFilter !== "All owners") list = list.filter((c) => c.owner === ownerFilter)
    if (supplierFilter !== "Any suppliers") {
      list = list.filter((c) => {
        if (supplierFilter === "1–3 suppliers") return c.invitedSuppliers >= 1 && c.invitedSuppliers <= 3
        if (supplierFilter === "4–6 suppliers") return c.invitedSuppliers >= 4 && c.invitedSuppliers <= 6
        if (supplierFilter === "7+ suppliers") return c.invitedSuppliers >= 7
        return true
      })
    }
    if (sourceFilter !== "All sources") {
      list = list.filter((c) => (sourceFilter === "From request" ? !!c.sourceRequestRef : !c.sourceRequestRef))
    }

    // Sort
    switch (sort) {
      case "Highest savings":
        list.sort((a, b) => savingsAmount(b) - savingsAmount(a))
        break
      case "Closing soon":
        list.sort((a, b) => (a.deadlineInHours ?? Infinity) - (b.deadlineInHours ?? Infinity))
        break
      case "Most responses":
        list.sort((a, b) => b.bids.length - a.bids.length)
        break
      case "Highest value":
        list.sort((a, b) => b.baseline - a.baseline)
        break
      default:
        list.sort((a, b) => b.created.localeCompare(a.created))
    }

    return list
  }, [tab, query, statusFilter, categoryFilter, ownerFilter, supplierFilter, sourceFilter, sort])

  const activeFilterCount =
    (statusFilter !== "All statuses" ? 1 : 0) +
    (categoryFilter !== "All categories" ? 1 : 0) +
    (ownerFilter !== "All owners" ? 1 : 0) +
    (supplierFilter !== "Any suppliers" ? 1 : 0) +
    (sourceFilter !== "All sources" ? 1 : 0)

  function clearFilters() {
    setStatusFilter("All statuses")
    setCategoryFilter("All categories")
    setOwnerFilter("All owners")
    setSupplierFilter("Any suppliers")
    setSourceFilter("All sources")
  }

  const tabs: Tab[] = ["Active", "Ready to Start", "Awarded", "Cancelled", "All"]

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          icon={Zap}
          label="Active Competitions"
          value={`${competitionStats.active}`}
          sub="bidding live now"
          iconClass="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={Send}
          label="Ready to Start"
          value={`${tabCounts["Ready to Start"]}`}
          sub="awaiting launch"
          iconClass="bg-chart-3/10 text-chart-3"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Awarded"
          value={`${competitionStats.awarded}`}
          sub={`of ${competitionStats.total} total`}
          iconClass="bg-chart-2/15 text-chart-2"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Total Savings"
          value={fmtEur(totalSavings)}
          sub="across awarded events"
          iconClass="bg-chart-2/15 text-chart-2"
        />
        <KpiCard
          icon={Flame}
          label="Live Bid Value"
          value={fmtEur(liveValue)}
          sub="spend up for bid"
          iconClass="bg-primary/10 text-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border">
        {tabs.map((t) => (
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
              {tabCounts[t]}
            </span>
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search competitions by title, ID, owner, category, or request..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["All statuses", "Active", "Ready", "Draft", "Awarded", "Closed"]}
        />
        <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={categories} />
        <FilterSelect label="Request Owner" value={ownerFilter} onChange={setOwnerFilter} options={owners} />
        <FilterSelect
          label="Supplier Count"
          value={supplierFilter}
          onChange={setSupplierFilter}
          options={["Any suppliers", "1–3 suppliers", "4–6 suppliers", "7+ suppliers"]}
        />
        <FilterSelect
          label="Source"
          value={sourceFilter}
          onChange={setSourceFilter}
          options={["All sources", "From request", "Standalone"]}
        />
        <FilterSelect
          label="Sort By"
          value={sort}
          onChange={setSort}
          options={["Newest", "Closing soon", "Highest savings", "Most responses", "Highest value"]}
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

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          competition{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <CompetitionRow key={c.id} competition={c} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Network className="size-6" />
          </span>
          <div>
            <p className="font-semibold text-foreground">No competitions found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters to see more results.
            </p>
          </div>
          {(activeFilterCount > 0 || query) && (
            <button
              onClick={() => {
                clearFilters()
                setQuery("")
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" />
              Clear search & filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
