"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
  Network as NetworkIcon,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  X,
  Package,
  Briefcase,
  UserPlus,
  Users,
  ChevronLeft,
  Inbox,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  requests,
  myRequests,
  draftRequests,
  archivedRequests,
  initials,
  statusMeta,
  formatAmount,
  formatCompact,
  priceTier,
  type ProcurementRequest,
  type RequestKind,
} from "@/lib/dashboard-data"
import { RequestRowMenu } from "@/components/request-row-menu"
import { useCurrentRole } from "@/lib/role-store"

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
}

// Reference "now" for date-range filtering (data is concentrated mid-2026).
const NOW = new Date("2026-06-17T12:00:00")

type Tab = "my" | "all" | "drafts" | "archived"

const statusOptions = ["All", "Draft", "Pending Approval", "Approved", "Rejected", "Cancelled", "Archived"]
const typeOptions = ["All", "Buy Product", "Buy Service", "Add New Supplier", "Contract Request", "Other"]
const dateRangeOptions = ["Any time", "Today", "Last 7 days", "Last 30 days", "This month", "This quarter", "This year"]
const amountOptions = ["Any", "No cost", "Under 1,000", "1,000 – 10,000", "10,000 – 100,000", "Over 100,000"]
const sortOptions = ["Newest", "Oldest", "Highest Amount", "Lowest Amount", "Recently Updated", "Needed Date Soon"]

function parseDate(s: string) {
  return new Date(s.replace(" ", "T"))
}

function formatNeededBy(s?: string) {
  if (!s) return "—"
  const d = new Date(s)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function relativeUpdated(s: string) {
  const d = parseDate(s)
  const mins = Math.round((NOW.getTime() - d.getTime()) / 60000)
  if (mins < 0) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function inDateRange(dateStr: string, range: string) {
  if (range === "Any time") return true
  const d = parseDate(dateStr)
  const dayMs = 86400000
  const diffDays = (NOW.getTime() - d.getTime()) / dayMs
  switch (range) {
    case "Today":
      return d.toDateString() === NOW.toDateString()
    case "Last 7 days":
      return diffDays >= 0 && diffDays <= 7
    case "Last 30 days":
      return diffDays >= 0 && diffDays <= 30
    case "This month":
      return d.getFullYear() === NOW.getFullYear() && d.getMonth() === NOW.getMonth()
    case "This quarter":
      return d.getFullYear() === NOW.getFullYear() && Math.floor(d.getMonth() / 3) === Math.floor(NOW.getMonth() / 3)
    case "This year":
      return d.getFullYear() === NOW.getFullYear()
    default:
      return true
  }
}

function inAmountRange(amount: number, range: string) {
  switch (range) {
    case "No cost":
      return amount === 0
    case "Under 1,000":
      return amount > 0 && amount < 1000
    case "1,000 – 10,000":
      return amount >= 1000 && amount < 10000
    case "10,000 – 100,000":
      return amount >= 10000 && amount < 100000
    case "Over 100,000":
      return amount >= 100000
    default:
      return true
  }
}

function AmountDisplay({ amount, currency }: { amount: number; currency: string }) {
  const tier = priceTier(amount)
  if (tier === "none") {
    return <span className="shrink-0 text-sm tabular-nums text-muted-foreground">—</span>
  }
  const isCritical = tier === "critical"
  const isLarge = tier === "high" || isCritical
  const amountStr = formatAmount(amount)
  const display = currency === "EUR" ? `€${amountStr}` : `${amountStr} ${currency}`
  return (
    <span className={cn(
      "shrink-0 rounded-lg border border-border bg-background px-2.5 py-1 tabular-nums shadow-sm",
      isCritical ? "text-[15px] font-bold text-foreground" : isLarge ? "text-[14px] font-semibold text-foreground" : "text-[13px] font-medium text-foreground"
    )}>
      {display}
    </span>
  )
}

function BudgetBar({ amount, budgetTotal, currency }: { amount: number; budgetTotal: number; currency: string }) {
  const pct = Math.min((amount / budgetTotal) * 100, 100)
  const remaining = Math.max(budgetTotal - amount, 0)
  const remainingStr = currency === "EUR" ? `€${formatCompact(remaining)}` : `${formatCompact(remaining)} ${currency}`
  const totalStr = currency === "EUR" ? `€${formatCompact(budgetTotal)}` : `${formatCompact(budgetTotal)} ${currency}`
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-muted-foreground/40 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex shrink-0 items-baseline gap-1 whitespace-nowrap">
        <span className="text-[11px] font-semibold text-foreground">{remainingStr}</span>
        <span className="text-[10px] text-muted-foreground">/ {totalStr}</span>
      </div>
    </div>
  )
}

function Dropdown({
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
    <label className="relative flex flex-col gap-1">
      <span className="px-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-card py-2 pl-3 pr-8 text-sm font-medium text-foreground outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
      {label}
      <button type="button" onClick={onClear} aria-label={`Clear ${label}`} className="rounded-full hover:text-foreground">
        <X className="size-3" />
      </button>
    </span>
  )
}

function quotesLabel(n: number) {
  if (n === 1) return "1 pasiūlymas"
  if (n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 10 || n % 100 >= 20)) return `${n} pasiūlymai`
  return `${n} pasiūlymų`
}

function RequestRow({ request, canSeeApproval }: { request: ProcurementRequest; canSeeApproval: boolean }) {
  const Icon = kindIcon[request.kind]
  const status = statusMeta[request.status]
  const isCritical = priceTier(request.amount) === "critical"
  return (
    <div className={cn(
      "rounded-xl",
      isCritical && "border-l-[3px] border-l-[#029F74] bg-[#EAF7F2] pl-[1px]",
    )}>
      <Link
        href={`/requests/${request.id}`}
        aria-label={`Open request ${request.ref}: ${request.title}`}
        className={cn(
          "group flex flex-col rounded-r-xl px-3 py-[1.125rem] transition-colors table-row-hover",
          isCritical ? "rounded-l-none" : "rounded-xl",
        )}
      >
        {/* Top row: icon + content + amount + status */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground",
            isCritical ? "bg-[#029F74]/[0.10] text-[#1F5A43]" : "bg-muted/60",
          )}>
            <Icon className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                {request.ref}
              </span>
              <p className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium leading-snug text-foreground">
                {request.title}
              </p>
              {isCritical && (
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: "#1F5A43", background: "#EAF7F2" }}>
                  High Value
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold text-secondary-foreground">
                  {initials(request.requester)}
                </span>
                {request.requester}
              </span>
              <span className="hidden sm:inline">{request.department}</span>
              <span className="hidden md:inline">{request.date}</span>
              <span className="hidden md:inline">{request.kind}</span>
              {request.quotes > 0 && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Users className="size-3" />
                  {quotesLabel(request.quotes)}
                </span>
              )}
            </div>
            {canSeeApproval && request.status === "Pending Approval" && (
              <div className="mt-1.5">
                <Link
                  href="/approvals"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  View Approval Details
                  <ChevronRight className="size-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <AmountDisplay amount={request.amount} currency={request.currency} />
            <span className={cn(
              "w-20 rounded-full px-2.5 py-0.5 text-center text-[11px] font-medium",
              status.badge,
            )}>
              {status.label}
            </span>
          </div>

          <RequestRowMenu request={request} />
        </div>

        {request.budgetTotal && (
          <div className="mt-3 pl-[3.25rem]">
            <BudgetBar amount={request.amount} budgetTotal={request.budgetTotal} currency={request.currency} />
          </div>
        )}
      </Link>
    </div>
  )
}

export function RequestsExplorer() {
  const role = useCurrentRole()
  const isAdmin = role === "Super Admin"
  const canSeeApproval = role === "Super Admin" || role === "Approver"

  const [tab, setTab] = useState<Tab>("my")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All")
  const [type, setType] = useState("All")
  const [category, setCategory] = useState("All")
  const [requester, setRequester] = useState("Anyone")
  const [department, setDepartment] = useState("All")
  const [dateRange, setDateRange] = useState("Any time")
  const [amount, setAmount] = useState("Any")
  const [sort, setSort] = useState("Newest")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const categoryOptions = useMemo(
    () => ["All", ...Array.from(new Set(requests.map((r) => r.category))).sort()],
    [],
  )
  const requesterOptions = useMemo(
    () => ["Anyone", ...Array.from(new Set(requests.map((r) => r.requester))).sort()],
    [],
  )
  const departmentOptions = useMemo(
    () => ["All", ...Array.from(new Set(requests.map((r) => r.department))).sort()],
    [],
  )

  // Tab scope.
  const scoped = useMemo(() => {
    switch (tab) {
      case "my":
        return myRequests()
      case "drafts":
        return draftRequests()
      case "archived":
        return archivedRequests()
      default:
        return requests
    }
  }, [tab])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "my", label: "My Requests", count: myRequests().length },
    { key: "all", label: "All Requests", count: requests.length },
    { key: "drafts", label: "Drafts", count: draftRequests().length },
    { key: "archived", label: "Archived", count: archivedRequests().length },
  ]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = scoped.filter((r) => {
      const matchesQuery =
        q === "" ||
        [r.ref, r.title, r.requester, r.category, r.department, r.supplier ?? "", r.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      const matchesStatus = status === "All" || r.status === status
      const matchesType = type === "All" || r.kind === type
      const matchesCategory = category === "All" || r.category === category
      const matchesRequester = requester === "Anyone" || r.requester === requester
      const matchesDept = department === "All" || r.department === department
      const matchesDate = inDateRange(r.date, dateRange)
      const matchesAmount = inAmountRange(r.amount, amount)
      return (
        matchesQuery &&
        matchesStatus &&
        matchesType &&
        matchesCategory &&
        matchesRequester &&
        matchesDept &&
        matchesDate &&
        matchesAmount
      )
    })

    return [...list].sort((a, b) => {
      switch (sort) {
        case "Oldest":
          return a.date.localeCompare(b.date)
        case "Highest Amount":
          return b.amount - a.amount
        case "Lowest Amount":
          return a.amount - b.amount
        case "Recently Updated":
          return b.updated.localeCompare(a.updated)
        case "Needed Date Soon":
          return (a.neededBy ?? "9999").localeCompare(b.neededBy ?? "9999")
        default:
          return b.date.localeCompare(a.date)
      }
    })
  }, [scoped, query, status, type, category, requester, department, dateRange, amount, sort])

  const activeChips = [
    status !== "All" && { label: `Status: ${status}`, clear: () => setStatus("All") },
    type !== "All" && { label: `Type: ${type}`, clear: () => setType("All") },
    category !== "All" && { label: `Category: ${category}`, clear: () => setCategory("All") },
    requester !== "Anyone" && { label: `Requester: ${requester}`, clear: () => setRequester("Anyone") },
    department !== "All" && { label: `Dept: ${department}`, clear: () => setDepartment("All") },
    dateRange !== "Any time" && { label: dateRange, clear: () => setDateRange("Any time") },
    amount !== "Any" && { label: `Amount: ${amount}`, clear: () => setAmount("Any") },
    query.trim() !== "" && { label: `Search: ${query}`, clear: () => setQuery("") },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  function clearFilters() {
    setQuery("")
    setStatus("All")
    setType("All")
    setCategory("All")
    setRequester("Anyone")
    setDepartment("All")
    setDateRange("Any time")
    setAmount("Any")
    setPage(1)
  }

  // Pagination.
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)
  const hasFiltersActive = activeChips.length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Role-based access message */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {isAdmin ? <NetworkIcon className="size-4" /> : <ShieldCheck className="size-4" />}
        {isAdmin ? "Showing all company requests" : "Showing requests available to you"}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border">
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key)
                setPage(1)
              }}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  active ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search + filters */}
      <Card className="flex flex-col gap-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by request ID, title, requester, category, supplier..."
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Dropdown label="Status" value={status} options={statusOptions} onChange={setStatus} />
          <Dropdown label="Type" value={type} options={typeOptions} onChange={setType} />
          <Dropdown label="Category" value={category} options={categoryOptions} onChange={setCategory} />
          <Dropdown label="Requester" value={requester} options={requesterOptions} onChange={setRequester} />
          <Dropdown label="Department" value={department} options={departmentOptions} onChange={setDepartment} />
          <Dropdown label="Date Range" value={dateRange} options={dateRangeOptions} onChange={setDateRange} />
          <Dropdown label="Amount" value={amount} options={amountOptions} onChange={setAmount} />
          <Dropdown label="Sort By" value={sort} options={sortOptions} onChange={setSort} />
        </div>

        {hasFiltersActive && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {activeChips.map((chip) => (
              <FilterChip key={chip.label} label={chip.label} onClear={chip.clear} />
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* List */}
      <div className="flex flex-col divide-y divide-border/60">
        {pageItems.length === 0 ? (
          hasFiltersActive ? (
            <Card className="flex flex-col items-center gap-2 p-10 text-center">
              <SlidersHorizontal className="size-6 text-muted-foreground" />
              <p className="font-medium text-foreground">No requests match your filters.</p>
              <p className="text-sm text-muted-foreground">Try changing or clearing your filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Clear Filters
              </button>
            </Card>
          ) : (
            <Card className="flex flex-col items-center gap-2 p-10 text-center">
              <Inbox className="size-6 text-muted-foreground" />
              <p className="font-medium text-foreground">No requests yet.</p>
              <p className="text-sm text-muted-foreground">
                Create your first purchase request to start the procurement process.
              </p>
            </Card>
          )
        ) : (
          pageItems.map((request) => (
            <RequestRow key={request.id} request={request} canSeeApproval={canSeeApproval} />
          ))
        )}
      </div>

      {/* Results summary + pagination */}
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-sm text-muted-foreground">
            Showing {start + 1}–{Math.min(start + pageSize, total)} of {total} request{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="appearance-none rounded-lg border border-border bg-card py-1.5 pl-2.5 pr-7 text-xs font-medium text-foreground outline-none focus:border-primary"
              >
                {[25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            </div>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
