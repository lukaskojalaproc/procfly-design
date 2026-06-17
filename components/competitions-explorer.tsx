"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Trophy,
  Zap,
  Send,
  ShieldCheck,
  Network,
  Search,
  RefreshCw,
  Clock,
  TrendingDown,
  ArrowDownRight,
  Sparkles,
  Users,
  Flame,
  CircleDollarSign,
  Gavel,
  ChevronRight,
  FileText,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  competitions,
  competitionStats,
  totalSavings,
  liveValue,
  avgSavingsPct,
  liveBids,
  bestBid,
  savingsAmount,
  savingsPct,
  type Competition,
  type CompetitionStatus,
} from "@/lib/competitions-data"
import { formatAmount, initials } from "@/lib/dashboard-data"

// ---------------------------------------------------------------------------
// Live countdown — resolves a real deadline once at mount, then ticks every
// second so the spotlight always feels alive.
// ---------------------------------------------------------------------------
function useCountdown(hoursFromNow: number | null) {
  const deadline = useRef<number | null>(
    hoursFromNow == null ? null : Date.now() + hoursFromNow * 3_600_000,
  )
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (deadline.current == null) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (deadline.current == null) return null
  const diff = Math.max(0, deadline.current - now)
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)
  return { h, m, s, expired: diff === 0, urgent: diff < 12 * 3_600_000 }
}

function fmtEur(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M`
  if (n >= 1000) return `€${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`
  return `€${n}`
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
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              s.dot,
            )}
          />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", s.dot)} />
      </span>
      {status}
    </span>
  )
}

// ===========================================================================
// Hero command center
// ===========================================================================
function HeroMetric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Trophy
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-2 bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-2xl font-bold leading-none tracking-tight tabular-nums text-foreground">
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative flex flex-col gap-8 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              <Sparkles className="size-3.5" />
              Sourcing intelligence
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {fmtEur(totalSavings)} saved through competition
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {competitionStats.active} live competitions are putting{" "}
              <span className="font-semibold text-foreground">{fmtEur(liveValue)}</span> of spend up
              for bid right now — driving an average{" "}
              <span className="font-semibold text-primary">
                {Math.round(avgSavingsPct * 100)}% saving
              </span>{" "}
              versus baseline budgets.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl bg-primary/10 px-4 py-2.5 text-sm ring-1 ring-inset ring-primary/20 lg:self-auto">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="font-semibold text-foreground">{liveBids} bids</span>
            <span className="text-muted-foreground">in flight</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border lg:grid-cols-4">
          <HeroMetric
            icon={CircleDollarSign}
            label="Total saved"
            value={fmtEur(totalSavings)}
            sub="across awarded events"
          />
          <HeroMetric
            icon={TrendingDown}
            label="Avg. saving"
            value={`${Math.round(avgSavingsPct * 100)}%`}
            sub="vs. baseline budget"
          />
          <HeroMetric
            icon={Flame}
            label="Live value"
            value={fmtEur(liveValue)}
            sub={`${competitionStats.active} active competitions`}
          />
          <HeroMetric
            icon={Trophy}
            label="Awarded"
            value={`${competitionStats.awarded}`}
            sub={`of ${competitionStats.total} total`}
          />
        </div>
      </div>
    </div>
  )
}

// ===========================================================================
// Featured live spotlight
// ===========================================================================
function CountdownDigit({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[2.5rem] rounded-lg bg-foreground/5 px-2 py-1.5 text-center text-2xl font-bold tabular-nums text-foreground">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {unit}
      </span>
    </div>
  )
}

function Spotlight({ competition }: { competition: Competition }) {
  const countdown = useCountdown(competition.deadlineInHours)
  const best = bestBid(competition)
  const saving = savingsAmount(competition)
  const pct = savingsPct(competition)
  const sorted = [...competition.bids].sort((a, b) => a.amount - b.amount)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid lg:grid-cols-5">
        {/* Left — event + countdown + savings */}
        <div className="flex flex-col gap-5 border-b border-border p-6 lg:col-span-3 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              <Flame className="size-3.5" />
              Featured live competition
            </span>
            <StatusPill status={competition.status} live />
          </div>

          <div>
            <p className="font-mono text-xs text-muted-foreground">{competition.ref}</p>
            <h3 className="mt-1 text-balance text-xl font-bold tracking-tight text-foreground">
              {competition.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{competition.description}</p>
          </div>

          {/* Countdown */}
          {countdown && (
            <div
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4",
                countdown.urgent
                  ? "border-chart-2/40 bg-chart-2/10"
                  : "border-border bg-muted/50",
              )}
            >
              <Clock
                className={cn(
                  "size-5 shrink-0",
                  countdown.urgent ? "text-chart-2" : "text-muted-foreground",
                )}
              />
              <div className="flex items-end gap-2">
                <CountdownDigit value={countdown.h} unit="hrs" />
                <span className="pb-4 text-xl font-bold text-muted-foreground">:</span>
                <CountdownDigit value={countdown.m} unit="min" />
                <span className="pb-4 text-xl font-bold text-muted-foreground">:</span>
                <CountdownDigit value={countdown.s} unit="sec" />
              </div>
              <span
                className={cn(
                  "ml-auto text-xs font-medium",
                  countdown.urgent ? "text-chart-2" : "text-muted-foreground",
                )}
              >
                {countdown.urgent ? "Closing soon" : "Bidding open"}
              </span>
            </div>
          )}

          {/* Savings */}
          <div className="rounded-xl bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Best bid vs. baseline</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                <ArrowDownRight className="size-4" />
                {Math.round(pct * 100)}% lower
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {best ? formatAmount(best.amount) : "—"}
              </span>
              <span className="text-sm font-medium text-muted-foreground line-through">
                {formatAmount(competition.baseline)} {competition.currency}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round(pct * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Potential saving of{" "}
              <span className="font-semibold text-foreground">{formatAmount(saving)} {competition.currency}</span>{" "}
              if awarded now.
            </p>
          </div>
        </div>

        {/* Right — live leaderboard */}
        <div className="flex flex-col gap-3 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Gavel className="size-4 text-primary" />
              Live bid leaderboard
            </h4>
            <span className="text-xs text-muted-foreground">
              {competition.bids.length}/{competition.invitedSuppliers} bid
            </span>
          </div>

          <ol className="flex flex-col gap-2">
            {sorted.map((bid, i) => {
              const leading = i === 0
              return (
                <li
                  key={bid.supplier}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                    leading ? "border-primary/40 bg-primary/5" : "border-border bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      leading
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {bid.supplier}
                    </p>
                    <p className="text-xs text-muted-foreground">{bid.submittedAgo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-foreground">
                      {formatAmount(bid.amount)}
                    </p>
                    {leading && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Leading
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>

          <button className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90">
            View competition
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ===========================================================================
// Competition card (pipeline)
// ===========================================================================
function CompetitionCard({ competition }: { competition: Competition }) {
  const best = bestBid(competition)
  const pct = savingsPct(competition)
  const isActive = competition.status === "Active"
  const isAwarded = competition.status === "Awarded"
  const progress =
    competition.invitedSuppliers > 0
      ? Math.round((competition.bids.length / competition.invitedSuppliers) * 100)
      : 0

  const accent =
    competition.status === "Active"
      ? "border-l-primary"
      : competition.status === "Awarded"
        ? "border-l-chart-2"
        : competition.status === "Closed"
          ? "border-l-destructive"
          : competition.status === "Ready"
            ? "border-l-chart-3"
            : "border-l-border"

  return (
    <div
      className={cn(
        "group flex flex-col gap-4 rounded-xl border border-l-4 border-border bg-card p-5 shadow-sm transition-all hover:shadow-md",
        accent,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">{competition.ref}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {competition.category}
            </span>
          </div>
          <h4 className="mt-1 line-clamp-1 font-semibold text-foreground">{competition.title}</h4>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {competition.description}
          </p>
        </div>
        <StatusPill status={competition.status} live={isActive} />
      </div>

      {/* Savings / baseline */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {isAwarded ? "Awarded at" : best ? "Best bid" : "Baseline budget"}
          </p>
          <p className="text-lg font-bold tabular-nums text-foreground">
            {best ? formatAmount(best.amount) : formatAmount(competition.baseline)}
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              {competition.currency}
            </span>
          </p>
        </div>
        {pct > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            <TrendingDown className="size-3.5" />
            {Math.round(pct * 100)}% saved
          </span>
        )}
      </div>

      {/* Submission progress */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Send className="size-3" />
            {competition.bids.length} / {competition.invitedSuppliers} submissions
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isAwarded ? "bg-chart-2" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
            {initials(competition.owner)}
          </span>
          {competition.owner}
        </span>
        {isAwarded ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-chart-2">
            <Trophy className="size-3.5" />
            {competition.awardedTo}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {competition.invitedSuppliers} suppliers
          </span>
        )}
      </div>
    </div>
  )
}

// ===========================================================================
// Section wrapper
// ===========================================================================
function Section({
  icon: Icon,
  title,
  count,
  iconClass,
  children,
}: {
  icon: typeof Trophy
  title: string
  count: number
  iconClass: string
  children: React.ReactNode
}) {
  if (count === 0) return null
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className={cn("flex size-7 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="size-4" />
        </span>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  )
}

// ===========================================================================
// Stat cards
// ===========================================================================
const statItems = [
  { label: "Active", value: competitionStats.active, icon: Zap, cls: "bg-primary/10 text-primary" },
  { label: "Ready to start", value: competitionStats.ready, icon: Send, cls: "bg-chart-3/10 text-chart-3" },
  { label: "Awarded", value: competitionStats.awarded, icon: ShieldCheck, cls: "bg-chart-2/15 text-chart-2" },
  { label: "Total", value: competitionStats.total, icon: Network, cls: "bg-muted text-muted-foreground" },
]

function StatRow() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {statItems.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", s.cls)}>
            <s.icon className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold leading-tight tabular-nums text-foreground">
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ===========================================================================
// Main explorer
// ===========================================================================
export function CompetitionsExplorer() {
  const [query, setQuery] = useState("")

  const featured = competitions.find((c) => c.featured)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return competitions
    return competitions.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.ref.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q),
    )
  }, [query])

  const active = filtered.filter((c) => c.status === "Active" && !c.featured)
  const ready = filtered.filter((c) => c.status === "Ready")
  const drafts = filtered.filter((c) => c.status === "Draft")
  const finished = filtered.filter((c) => c.status === "Awarded" || c.status === "Closed")

  return (
    <div className="flex flex-col gap-6">
      <Hero />

      {featured && !query && <Spotlight competition={featured} />}

      <StatRow />

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search competitions, suppliers, categories..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Search className="size-6 text-muted-foreground" />
          <p className="font-semibold text-foreground">No competitions found</p>
          <p className="text-sm text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <>
          <Section
            icon={Zap}
            title="Active competitions"
            count={active.length}
            iconClass="bg-primary/10 text-primary"
          >
            {active.map((c) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </Section>

          <Section
            icon={Send}
            title="Ready to start"
            count={ready.length}
            iconClass="bg-chart-3/10 text-chart-3"
          >
            {ready.map((c) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </Section>

          <Section
            icon={FileText}
            title="Drafts"
            count={drafts.length}
            iconClass="bg-muted text-muted-foreground"
          >
            {drafts.map((c) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </Section>

          <Section
            icon={CheckCircle2}
            title="Finished competitions"
            count={finished.length}
            iconClass="bg-chart-2/15 text-chart-2"
          >
            {finished.map((c) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </Section>
        </>
      )}
    </div>
  )
}
