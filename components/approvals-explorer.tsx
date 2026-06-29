"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  Briefcase,
  UserPlus,
  ShieldCheck,
  ArrowUpRight,
  X,
  AlertCircle,
  RotateCcw,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { initials, type RequestKind } from "@/lib/dashboard-data"
import {
  getApprovalTasks,
  getApprovalSummary,
  getTaskFacets,
  tabMatchesTask,
  matchesDueFilter,
  matchesAmountFilter,
  matchesSearch,
  sortTasks,
  formatTaskAmount,
  formatCompactEur,
  formatWaiting,
  dueStatusMeta,
  taskStatusMeta,
  priorityMeta,
  APPROVAL_TABS,
  DUE_FILTERS,
  AMOUNT_FILTERS,
  SORT_KEYS,
  type ApprovalTab,
  type DueFilter,
  type AmountFilter,
  type SortKey,
  type ResolvedApprovalTask,
} from "@/lib/approvals-data"
import { useApprovalPrefs } from "@/lib/approvals-prefs"

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
}

const PAGE_SIZE = 8

// --- Summary cards ----------------------------------------------------------

function StatBar({ stats }: { stats: { label: string; value: string; accent?: boolean }[] }) {
  return (
    <div className="flex items-stretch divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
      {stats.map((s, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-0.5 px-5 py-3.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {s.label}
          </span>
          <span className="text-[1.6rem] font-bold leading-none tracking-tight tabular-nums text-foreground">
            {s.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// --- Filter select ----------------------------------------------------------

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (v: T) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-medium text-foreground outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

// --- Row --------------------------------------------------------------------

function TaskRow({ task, cols }: { task: ResolvedApprovalTask; cols: ReturnType<typeof useApprovalPrefs>["columns"] }) {
  const r = task.request
  const Icon = kindIcon[r.kind]
  const due = dueStatusMeta[task.dueStatus]
  const isActive = task.taskStatus === "Awaiting Action" || task.taskStatus === "Changes Requested"
  const reviewHref = `/requests/${r.id}?review=1`
  const isCritical = r.amount >= 500_000

  return (
    <div className={cn(
      "rounded-xl",
      isCritical && "border-l-[3px] border-l-[#029F74] bg-[#EAF7F2] pl-[1px]",
    )}>
      <Link
        href={reviewHref}
        className={cn(
          "grid items-center gap-0 px-3 py-[1.125rem] transition-colors table-row-hover",
          isCritical ? "rounded-r-xl rounded-l-none" : "rounded-xl",
        )}
        style={{ gridTemplateColumns: "minmax(0,2fr) minmax(150px,1fr) minmax(170px,1fr) auto" }}
      >
        {/* Col 1 — Icon + identity */}
        <div className="flex min-w-0 items-center gap-3 pr-6">
          <div className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground",
            isCritical ? "bg-foreground/[0.07] text-foreground" : "bg-muted/60",
          )}>
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                {r.ref}
              </span>
              {task.priority === "Urgent" && (
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", priorityMeta["Urgent"].badge)}>
                  Urgent
                </span>
              )}
              <p className="min-w-0 truncate text-[0.9375rem] font-medium leading-snug text-foreground">
                {r.title}
              </p>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold text-secondary-foreground">
                  {initials(r.requester)}
                </span>
                {r.requester}
              </span>
              <span className="hidden sm:inline">{r.kind} · {r.category}</span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3" />
                {task.stepRole} · Step {task.stepNumber} of {task.totalSteps}
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatWaiting(task.activatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Col 2 — Due date */}
        <div className="flex flex-col justify-center gap-0.5 border-l border-border pl-6">
          {isActive ? (
            <span className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
              due.badge,
            )}>
              <span className={cn("size-1.5 rounded-full", due.dot)} />
              {due.label}{task.deadline ? ` · ${task.deadline.slice(5)}` : ""}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {task.decidedAt ? `Decided ${task.decidedAt.slice(0, 10)}` : "—"}
            </span>
          )}
        </div>

        {/* Col 3 — High Value badge + Amount */}
        <div className="flex items-center justify-between gap-3 border-l border-border pl-6">
          {task.highValue ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground/20 bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-semibold text-foreground">
              <AlertTriangle className="size-3" />
              High Value
            </span>
          ) : (
            <span />
          )}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Amount</span>
            <span className={cn(
              "tabular-nums text-foreground",
              isCritical ? "text-[15px] font-bold" : "text-[14px] font-semibold",
            )}>
              {formatTaskAmount(r.amount, r.currency)}
            </span>
          </div>
        </div>

        {/* Col 4 — Review / View button */}
        <div className="flex items-center pl-4">
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors whitespace-nowrap",
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-foreground hover:bg-secondary/80",
          )}>
            {isActive ? "Review" : "View"}
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Link>
    </div>
  )
}

// --- Skeletons --------------------------------------------------------------

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl px-3 py-[1.125rem]">
      <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

// --- Main -------------------------------------------------------------------

export function ApprovalsExplorer() {
  const { columns, refreshToken } = useApprovalPrefs()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tasks, setTasks] = useState<ResolvedApprovalTask[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  const [tab, setTab] = useState<ApprovalTab>("Awaiting My Action")
  const [query, setQuery] = useState("")
  const [due, setDue] = useState<DueFilter>("All")
  const [category, setCategory] = useState("All")
  const [requester, setRequester] = useState("All")
  const [step, setStep] = useState("All")
  const [amount, setAmount] = useState<AmountFilter>("Any")
  const [priority, setPriority] = useState("All")
  const [sort, setSort] = useState<SortKey>("Most Urgent")
  const [page, setPage] = useState(1)

  // Simulate loading the approver's queue from the server.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    const t = setTimeout(() => {
      if (cancelled) return
      try {
        setTasks(getApprovalTasks())
        setLoading(false)
      } catch {
        setError(true)
        setLoading(false)
      }
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [refreshToken, reloadKey])

  const facets = useMemo(() => getTaskFacets(tasks), [tasks])
  const summary = useMemo(() => getApprovalSummary(tasks), [tasks])

  const counts = useMemo(() => {
    const c = {} as Record<ApprovalTab, number>
    for (const t of APPROVAL_TABS) c[t] = tasks.filter((task) => tabMatchesTask(t, task)).length
    return c
  }, [tasks])

  const filtered = useMemo(() => {
    const list = tasks.filter(
      (t) =>
        tabMatchesTask(tab, t) &&
        matchesSearch(query, t) &&
        matchesDueFilter(due, t) &&
        matchesAmountFilter(amount, t.request.amount) &&
        (category === "All" || t.request.category === category) &&
        (requester === "All" || t.request.requester === requester) &&
        (step === "All" || t.stepRole === step) &&
        (priority === "All" || t.priority === priority),
    )
    return sortTasks(list, sort)
  }, [tasks, tab, query, due, amount, category, requester, step, priority, sort])

  // Reset to first page whenever the result set changes.
  useEffect(() => {
    setPage(1)
  }, [tab, query, due, amount, category, requester, step, priority, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeChips: { label: string; clear: () => void }[] = []
  if (due !== "All") activeChips.push({ label: `Due: ${due}`, clear: () => setDue("All") })
  if (category !== "All") activeChips.push({ label: `Category: ${category}`, clear: () => setCategory("All") })
  if (requester !== "All") activeChips.push({ label: `Requester: ${requester}`, clear: () => setRequester("All") })
  if (step !== "All") activeChips.push({ label: `Step: ${step}`, clear: () => setStep("All") })
  if (amount !== "Any") activeChips.push({ label: `Amount: ${amount}`, clear: () => setAmount("Any") })
  if (priority !== "All") activeChips.push({ label: `Priority: ${priority}`, clear: () => setPriority("All") })
  if (sort !== "Most Urgent") activeChips.push({ label: `Sort: ${sort}`, clear: () => setSort("Most Urgent") })

  const hasActiveFilters = activeChips.length > 0 || query.trim() !== ""

  function clearFilters() {
    setQuery("")
    setDue("All")
    setCategory("All")
    setRequester("All")
    setStep("All")
    setAmount("Any")
    setPriority("All")
    setSort("Most Urgent")
  }

  // --- Error state ---
  if (error) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
          <AlertCircle className="size-6" />
        </span>
        <p className="font-semibold text-foreground">We couldn&apos;t load your approval tasks</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while fetching your queue. Your decisions were not affected.
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <RotateCcw className="size-4" />
          Try Again
        </button>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
        <StatBar stats={[
          { label: "Awaiting My Action", value: `${summary.awaiting}`, accent: summary.awaiting > 0 },
          { label: "Value at Stake", value: formatCompactEur(summary.valueAtStake) },
          { label: "Overdue", value: `${summary.overdue}`, accent: summary.overdue > 0 },
          { label: "Due Soon", value: `${summary.dueSoon}` },
          { label: "Completed by Me", value: `${summary.completedByMe}` },
        ]} />

      {/* Tabs + search + filters */}
      <Card className="flex flex-col gap-4 p-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-px h-8 w-32 animate-pulse rounded bg-muted" />
              ))
            : APPROVAL_TABS.map((key) => {
                const isActive = tab === key
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {key}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                        isActive ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {counts[key] ?? 0}
                    </span>
                  </button>
                )
              })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Search by request ID, title, requester, supplier, or category…"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20 disabled:opacity-60"
          />
        </div>

        {/* Filters */}
        {loading ? (
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            <FilterSelect label="Due Status" value={due} options={DUE_FILTERS} onChange={setDue} />
            <FilterSelect label="Category" value={category} options={["All", ...facets.categories]} onChange={setCategory} />
            <FilterSelect label="Requester" value={requester} options={["All", ...facets.requesters]} onChange={setRequester} />
            <FilterSelect label="Approval Step" value={step} options={["All", ...facets.steps]} onChange={setStep} />
            <FilterSelect label="Amount" value={amount} options={AMOUNT_FILTERS} onChange={setAmount} />
            <FilterSelect label="Priority" value={priority} options={["All", "Urgent", "High", "Normal"]} onChange={setPriority} />
            <FilterSelect label="Sort By" value={sort} options={SORT_KEYS} onChange={setSort} />
          </div>
        )}

        {/* Active filter chips */}
        {!loading && activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                onClick={chip.clear}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
              >
                {chip.label}
                <X className="size-3" />
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-foreground hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </Card>

      {/* Result count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "approval task" : "approval tasks"}
        </p>
      )}

      {/* List */}
      <div className="flex flex-col divide-y divide-border/60">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          hasActiveFilters ? (
            <Card className="flex flex-col items-center gap-2 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Search className="size-6" />
              </span>
              <p className="font-semibold text-foreground">No approval tasks match your filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <RotateCcw className="size-4" />
                Clear Filters
              </button>
            </Card>
          ) : (
            <Card className="flex flex-col items-center gap-2 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <CheckCircle2 className="size-6" />
              </span>
              <p className="font-semibold text-foreground">You are all caught up.</p>
              <p className="text-sm text-muted-foreground">No approval tasks currently require your action.</p>
            </Card>
          )
        ) : (
          pageItems.map((task) => <TaskRow key={task.id} task={task} cols={columns} />)
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
