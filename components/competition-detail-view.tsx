"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Trophy,
  Zap,
  Send,
  TrendingDown,
  Clock,
  Gavel,
  Users,
  CheckCircle2,
  Tag,
  CalendarDays,
  ChevronLeft,
  Sparkles,
  Plus,
  Mail,
  CircleDollarSign,
  ArrowDownRight,
  Crown,
  Star,
  ShieldCheck,
  XCircle,
  Hourglass,
  BarChart3,
  Rocket,
  FileEdit,
  ListChecks,
  ClipboardList,
  ArrowRight,
  Scale,
  Percent,
  Timer,
  Medal,
  TrendingUp,
  Truck,
  FileCheck,
  Gauge,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Download,
  Paperclip,
  RotateCcw,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  bestBid,
  bidAttachments,
  savingsAmount,
  savingsPct,
  type BidAttachment,
  type Competition,
  type CompetitionStatus,
  type SupplierBid,
} from "@/lib/competitions-data"
import { formatAmount, initials } from "@/lib/dashboard-data"
import { useCountdown } from "@/components/use-countdown"

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
            className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", s.dot)}
          />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", s.dot)} />
      </span>
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Derived supplier roster — combine bidders (submitted) with invited seats.
// ---------------------------------------------------------------------------
type SupplierRow =
  | { name: string; state: "submitted"; bid: SupplierBid; rank: number }
  | { name: string; state: "invited"; bid: null; rank: null }

function buildRoster(c: Competition): SupplierRow[] {
  const sorted = [...c.bids].sort((a, b) => a.amount - b.amount)
  const submitted: SupplierRow[] = sorted.map((bid, i) => ({
    name: bid.supplier,
    state: "submitted",
    bid,
    rank: i + 1,
  }))
  const remaining = Math.max(0, c.invitedSuppliers - submitted.length)
  const pending: SupplierRow[] = Array.from({ length: remaining }, (_, i) => ({
    name: `Invited supplier ${submitted.length + i + 1}`,
    state: "invited",
    bid: null,
    rank: null,
  }))
  return [...submitted, ...pending]
}

// ---------------------------------------------------------------------------
// Deterministic evaluation scoring.
//
// We derive non-price criteria (quality & delivery) from a stable hash of the
// supplier name so the UI is rich and consistent across renders without
// needing extra data in the model. Price score is the real, computed value.
// ---------------------------------------------------------------------------
// Default weighting (percent points, sum to 100).
const DEFAULT_WEIGHTS = { price: 50, quality: 30, delivery: 20 }

interface Weights {
  price: number
  quality: number
  delivery: number
}

// Manual non-price scores, keyed by supplier name.
type ManualScores = Record<string, { quality: number; delivery: number }>

function hashScore(seed: string, min: number, max: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000
  return min + (h % (max - min + 1))
}

// Stable starting quality/delivery scores so manual editing has a baseline.
function defaultManualScores(c: Competition): ManualScores {
  const out: ManualScores = {}
  for (const bid of c.bids) {
    out[bid.supplier] = {
      quality: hashScore(bid.supplier + "q", 72, 98),
      delivery: hashScore(bid.supplier + "d", 70, 99),
    }
  }
  return out
}

interface ScoredBid {
  bid: SupplierBid
  priceScore: number
  qualityScore: number
  deliveryScore: number
  total: number
}

function scoreBids(c: Competition, weights: Weights, manual: ManualScores): ScoredBid[] {
  const bids = c.bids
  if (bids.length === 0) return []
  const amounts = bids.map((b) => b.amount)
  const min = Math.min(...amounts)
  const max = Math.max(...amounts)
  const range = Math.max(1, max - min)
  const wSum = Math.max(1, weights.price + weights.quality + weights.delivery)

  const scored = bids.map((bid) => {
    // Cheapest bid scores 100, most expensive scales down to 70.
    const priceScore = Math.round(100 - ((bid.amount - min) / range) * 30)
    const m = manual[bid.supplier] ?? { quality: 80, delivery: 80 }
    const qualityScore = m.quality
    const deliveryScore = m.delivery
    const total =
      (priceScore * weights.price +
        qualityScore * weights.quality +
        deliveryScore * weights.delivery) /
      wSum
    return { bid, priceScore, qualityScore, deliveryScore, total: Math.round(total) }
  })
  return scored.sort((a, b) => b.total - a.total)
}

// ---------------------------------------------------------------------------
// Countdown digit
// ---------------------------------------------------------------------------
function CountdownDigit({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[3rem] rounded-lg bg-background px-2.5 py-2 text-center text-3xl font-bold tabular-nums text-foreground shadow-sm">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {unit}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tabs config
// ---------------------------------------------------------------------------
const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "suppliers", label: "Suppliers", icon: Users },
  { key: "proposals", label: "Proposals", icon: Gavel },
  { key: "evaluation", label: "Evaluation", icon: Star },
  { key: "award", label: "Award", icon: Trophy },
] as const

type TabKey = (typeof TABS)[number]["key"]

// ===========================================================================
// Main detail view
// ===========================================================================
export function CompetitionDetailView({ competition }: { competition: Competition }) {
  const countdown = useCountdown(competition.deadlineInHours)
  const best = bestBid(competition)
  const saving = savingsAmount(competition)
  const pct = savingsPct(competition)
  const roster = buildRoster(competition)
  const submittedCount = competition.bids.length
  const progress =
    competition.invitedSuppliers > 0
      ? Math.round((submittedCount / competition.invitedSuppliers) * 100)
      : 0

  const isDraft = competition.status === "Draft"
  const isReady = competition.status === "Ready"
  const isActive = competition.status === "Active"
  const isAwarded = competition.status === "Awarded"
  const isClosed = competition.status === "Closed"
  const isFinished = isAwarded || isClosed
  const canStart = isDraft || isReady
  const hasBids = competition.bids.length > 0
  const proposals = competition.bids.length

  // Tabs depend on lifecycle stage. Draft/Ready have no proposals to show,
  // finished/active competitions surface the full evaluation flow.
  const visibleTabs = TABS.filter((t) => {
    if (t.key === "overview" || t.key === "suppliers") return true
    if (t.key === "proposals" || t.key === "evaluation") return hasBids
    if (t.key === "award") return isActive || isFinished
    return true
  })

  const [tab, setTab] = useState<TabKey>("overview")
  // Guard against an active tab disappearing for a given status.
  const activeTab = visibleTabs.some((t) => t.key === tab) ? tab : "overview"

  const primaryAction = isFinished
    ? null
    : isDraft
      ? { label: "Continue setup", icon: Rocket }
      : isReady
        ? { label: "Launch competition", icon: Rocket }
        : isActive
          ? { label: "Award winner", icon: Trophy }
          : null

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/competitions"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to competitions
      </Link>

      {/* ============ Hero header ============ */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{competition.ref}</span>
                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Tag className="size-3" />
                  {competition.category}
                </span>
                <StatusPill status={competition.status} live={isActive} />
              </div>
              <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {competition.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{competition.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                    {initials(competition.owner)}
                  </span>
                  {competition.owner}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  Created {competition.created}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" />
                  {competition.invitedSuppliers} invited
                </span>
              </div>
            </div>

            {primaryAction && (
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
                <primaryAction.icon className="size-4" />
                {primaryAction.label}
              </button>
            )}
          </div>

          {/* Key metric strip */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border lg:grid-cols-4">
            <MetricCell
              icon={CircleDollarSign}
              label="Baseline budget"
              value={`${formatAmount(competition.baseline)} ${competition.currency}`}
            />
            <MetricCell
              icon={ArrowDownRight}
              label={isAwarded ? "Awarded at" : "Best bid"}
              value={best ? `${formatAmount(best.amount)} ${competition.currency}` : "—"}
              accent={best ? "text-primary" : undefined}
            />
            <MetricCell
              icon={TrendingDown}
              label="Potential saving"
              value={best ? `${formatAmount(saving)} ${competition.currency}` : "—"}
              sub={best ? `${Math.round(pct * 100)}% vs baseline` : undefined}
              accent={best ? "text-primary" : undefined}
            />
            <MetricCell
              icon={Send}
              label="Proposals"
              value={`${submittedCount}/${competition.invitedSuppliers}`}
              sub={`${progress}% responded`}
            />
          </div>
        </div>
      </div>

      {/* ============ Lifecycle stepper ============ */}
      <LifecycleStepper status={competition.status} />

      {/* ============ Tabs ============ */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
        {visibleTabs.map((t) => {
          const active = activeTab === t.key
          const count =
            t.key === "suppliers"
              ? competition.invitedSuppliers
              : t.key === "proposals"
                ? proposals
                : null
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
              {count != null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* ============ Tab panels ============ */}
      {activeTab === "overview" && (
        <OverviewTab
          competition={competition}
          countdown={countdown}
          best={best}
          saving={saving}
          pct={pct}
          roster={roster}
          onGoToTab={setTab}
        />
      )}
      {activeTab === "suppliers" && <SuppliersTab competition={competition} roster={roster} />}
      {activeTab === "proposals" && <ProposalsTab competition={competition} best={best} />}
      {activeTab === "evaluation" && <EvaluationTab competition={competition} best={best} />}
      {activeTab === "award" && (
        <AwardTab competition={competition} best={best} saving={saving} pct={pct} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lifecycle stepper — shows where this competition sits in its journey.
// ---------------------------------------------------------------------------
const LIFECYCLE: { key: CompetitionStatus; label: string; icon: typeof Trophy }[] = [
  { key: "Draft", label: "Draft", icon: FileEdit },
  { key: "Ready", label: "Ready", icon: Send },
  { key: "Active", label: "Live bidding", icon: Zap },
  { key: "Awarded", label: "Awarded", icon: Trophy },
]

function LifecycleStepper({ status }: { status: CompetitionStatus }) {
  // Closed competitions never reached an award — show them as an off-track end.
  const isClosed = status === "Closed"
  // Awarded is terminal: every step (including the final award) is complete.
  const isAwarded = status === "Awarded"
  const currentIndex = isClosed
    ? 2
    : LIFECYCLE.findIndex((s) => s.key === status)

  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-4 shadow-sm">
      {LIFECYCLE.map((step, i) => {
        const done = i < currentIndex || (isAwarded && i === currentIndex)
        const current = i === currentIndex && !isClosed && !isAwarded
        const reached = i <= currentIndex
        return (
          <div key={step.key} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-chart-3 bg-chart-3 text-background"
                      : "border-border bg-muted text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="size-4" /> : <step.icon className="size-4" />}
              </span>
              <div className="hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-semibold leading-none",
                    reached ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {done ? "Done" : current ? "In progress" : "Upcoming"}
                </p>
              </div>
            </div>
            {i < LIFECYCLE.length - 1 && (
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  i < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
      {isClosed && (
        <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
          <XCircle className="size-3.5" />
          Closed
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Metric cell
// ---------------------------------------------------------------------------
function MetricCell({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Trophy
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className={cn("text-xl font-bold leading-none tracking-tight tabular-nums text-foreground", accent)}>
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

// ===========================================================================
// Overview tab
// ===========================================================================
function OverviewTab({
  competition,
  countdown,
  best,
  saving,
  pct,
  roster,
  onGoToTab,
}: {
  competition: Competition
  countdown: ReturnType<typeof useCountdown>
  best: SupplierBid | null
  saving: number
  pct: number
  roster: SupplierRow[]
  onGoToTab: (key: TabKey) => void
}) {
  const topThree = roster.filter((r) => r.state === "submitted").slice(0, 3) as Extract<
    SupplierRow,
    { state: "submitted" }
  >[]

  const isDraft = competition.status === "Draft"
  const isReady = competition.status === "Ready"
  const hasBids = competition.bids.length > 0

  // Draft & Ready: this is a setup/launch experience, not a results one.
  if (isDraft || isReady) {
    return <SetupOverview competition={competition} isReady={isReady} onGoToTab={onGoToTab} />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left column */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        {/* Countdown / status banner */}
        {countdown ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-5 rounded-2xl border p-5",
              countdown.urgent ? "border-chart-2/40 bg-chart-2/10" : "border-border bg-muted/40",
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className={cn("size-5", countdown.urgent ? "text-chart-2" : "text-muted-foreground")} />
              <span className="text-sm font-semibold text-foreground">Time remaining</span>
            </div>
            <div className="flex items-end gap-2">
              <CountdownDigit value={countdown.h} unit="hrs" />
              <span className="pb-5 text-2xl font-bold text-muted-foreground">:</span>
              <CountdownDigit value={countdown.m} unit="min" />
              <span className="pb-5 text-2xl font-bold text-muted-foreground">:</span>
              <CountdownDigit value={countdown.s} unit="sec" />
            </div>
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                countdown.urgent ? "bg-chart-2/15 text-chart-2" : "bg-muted text-muted-foreground",
              )}
            >
              {countdown.urgent ? <Zap className="size-3.5" /> : <Hourglass className="size-3.5" />}
              {countdown.urgent ? "Closing soon" : "Bidding open"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-5">
            <Hourglass className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {competition.status === "Awarded"
                  ? "Competition closed and awarded"
                  : competition.status === "Closed"
                    ? "Competition closed"
                    : competition.status === "Ready"
                      ? "Ready to launch"
                      : "Draft — not yet launched"}
              </p>
              <p className="text-xs text-muted-foreground">
                {competition.status === "Awarded" && competition.awardedOn
                  ? `Awarded to ${competition.awardedTo} on ${competition.awardedOn}`
                  : "No active bidding window."}
              </p>
            </div>
          </div>
        )}

        {/* Savings visualization */}
        {best && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-primary" />
                Savings vs. baseline
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <TrendingDown className="size-3.5" />
                {Math.round(pct * 100)}% lower
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {formatAmount(best.amount)}
              </span>
              <span className="text-base font-medium text-muted-foreground line-through">
                {formatAmount(competition.baseline)} {competition.currency}
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="flex h-full items-center justify-end rounded-full bg-primary pr-2 transition-all"
                style={{ width: `${Math.max(8, Math.round(pct * 100))}%` }}
              >
                <span className="text-[10px] font-bold text-primary-foreground">
                  −{formatAmount(saving)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Awarding the leading bid now would save{" "}
              <span className="font-semibold text-foreground">
                {formatAmount(saving)} {competition.currency}
              </span>{" "}
              against the original budget.
            </p>
          </div>
        )}

        {/* Podium / leaderboard preview */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Gavel className="size-4 text-primary" />
            Leading proposals
          </h3>
          {topThree.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No proposals yet"
              body="Once invited suppliers submit, the leaderboard appears here."
            />
          ) : (
            <ol className="mt-4 flex flex-col gap-2">
              {topThree.map((r, i) => (
                <RankRow key={r.name} row={r} index={i} competition={competition} />
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Right column — at a glance */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">At a glance</h3>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <GlanceRow label="Status" value={competition.status} />
            <GlanceRow label="Owner" value={competition.owner} />
            <GlanceRow label="Category" value={competition.category} />
            <GlanceRow
              label="Baseline"
              value={`${formatAmount(competition.baseline)} ${competition.currency}`}
            />
            <GlanceRow label="Invited" value={`${competition.invitedSuppliers} suppliers`} />
            <GlanceRow label="Proposals" value={`${competition.bids.length} received`} />
            {competition.awardedTo && <GlanceRow label="Awarded to" value={competition.awardedTo} />}
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Response rate</h3>
          <div className="mt-4 flex items-center justify-center">
            <ResponseGauge
              submitted={competition.bids.length}
              total={competition.invitedSuppliers}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================================
// Setup overview — shown for Draft & Ready competitions (pre-launch).
// ===========================================================================
function SetupOverview({
  competition,
  isReady,
  onGoToTab,
}: {
  competition: Competition
  isReady: boolean
  onGoToTab: (key: TabKey) => void
}) {
  const hasSuppliers = competition.invitedSuppliers > 0
  const checklist = [
    {
      label: "Define scope & budget",
      done: true,
      detail: `Baseline budget set to ${formatAmount(competition.baseline)} ${competition.currency}.`,
    },
    {
      label: "Invite suppliers",
      done: hasSuppliers,
      detail: hasSuppliers
        ? `${competition.invitedSuppliers} suppliers invited.`
        : "No suppliers invited yet.",
      action: () => onGoToTab("suppliers"),
    },
    {
      label: "Launch competition",
      done: false,
      detail: isReady
        ? "Everything is ready — launch to open bidding."
        : "Complete setup before launching.",
    },
  ]
  const completed = checklist.filter((c) => c.done).length

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        {/* Stage banner */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-4 rounded-2xl border p-6",
            isReady ? "border-chart-3/40 bg-chart-3/10" : "border-border bg-muted/40",
          )}
        >
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              isReady ? "bg-chart-3/20 text-chart-3" : "bg-muted text-muted-foreground",
            )}
          >
            {isReady ? <Send className="size-6" /> : <FileEdit className="size-6" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              {isReady ? "Ready to launch" : "Draft in progress"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isReady
                ? "Suppliers are lined up. Launching opens the bidding window and notifies everyone."
                : "Finish setting up this competition before inviting suppliers to bid."}
            </p>
          </div>
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90",
              isReady
                ? "bg-primary text-primary-foreground"
                : "bg-foreground text-background",
            )}
          >
            <Rocket className="size-4" />
            {isReady ? "Launch competition" : "Continue setup"}
          </button>
        </div>

        {/* Setup checklist */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ListChecks className="size-4 text-primary" />
              Setup checklist
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              {completed}/{checklist.length} complete
            </span>
          </div>
          <ol className="mt-4 flex flex-col gap-3">
            {checklist.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    item.done
                      ? "bg-chart-2 text-background"
                      : "border-2 border-dashed border-muted-foreground/40 text-muted-foreground",
                  )}
                >
                  {item.done ? <CheckCircle2 className="size-4" /> : <ClipboardList className="size-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                {item.action && !item.done && (
                  <button
                    onClick={item.action}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Manage
                    <ArrowRight className="size-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Empty proposals notice */}
        <div className="rounded-2xl border border-dashed border-border bg-card p-6">
          <EmptyState
            icon={Gavel}
            title="No proposals yet"
            body={
              isReady
                ? "Launch the competition to start collecting supplier bids."
                : "Proposals will appear here once the competition is launched."
            }
          />
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">At a glance</h3>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <GlanceRow label="Status" value={competition.status} />
            <GlanceRow label="Owner" value={competition.owner} />
            <GlanceRow label="Category" value={competition.category} />
            <GlanceRow
              label="Baseline"
              value={`${formatAmount(competition.baseline)} ${competition.currency}`}
            />
            <GlanceRow label="Invited" value={`${competition.invitedSuppliers} suppliers`} />
            <GlanceRow label="Created" value={competition.created} />
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-primary/5 p-6">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-primary" />
            Savings potential
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Based on the baseline budget, a competitive process typically returns
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-primary">
            {formatAmount(Math.round(competition.baseline * 0.15))} {competition.currency}
          </p>
          <p className="text-xs text-muted-foreground">~15% estimated saving once live</p>
        </div>
      </div>
    </div>
  )
}

function GlanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

function ResponseGauge({ submitted, total }: { submitted: number; total: number }) {
  const pct = total > 0 ? submitted / total : 0
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  return (
    <div className="relative size-36">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" className="stroke-muted" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="stroke-primary transition-all"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {Math.round(pct * 100)}%
        </span>
        <span className="text-xs text-muted-foreground">
          {submitted}/{total} bid
        </span>
      </div>
    </div>
  )
}

// ===========================================================================
// Suppliers tab
// ===========================================================================
function SuppliersTab({
  competition,
  roster,
}: {
  competition: Competition
  roster: SupplierRow[]
}) {
  const submitted = roster.filter((r) => r.state === "submitted").length
  const pending = roster.length - submitted
  const responseRate =
    competition.invitedSuppliers > 0
      ? Math.round((competition.bids.length / competition.invitedSuppliers) * 100)
      : 0
  const best = bestBid(competition)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ScoreCard icon={CheckCircle2} label="Submitted" value={`${submitted}`} sub="proposals in" />
        <ScoreCard icon={Hourglass} label="Pending" value={`${pending}`} sub="awaiting response" />
        <ScoreCard icon={Percent} label="Response rate" value={`${responseRate}%`} sub="of invited" />
        <ScoreCard
          icon={CircleDollarSign}
          label="Lowest bid"
          value={best ? `${formatAmount(best.amount)}` : "—"}
          sub={best ? competition.currency : "no bids yet"}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
              <Users className="size-4 text-primary" />
              Supplier roster
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {competition.bids.length} of {competition.invitedSuppliers} invited suppliers submitted.
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="size-4" />
            Invite supplier
          </button>
        </div>

        {roster.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No suppliers invited"
            body="Invite suppliers to start collecting competitive proposals."
          />
        ) : (
          <ul className="divide-y divide-border">
            {roster.map((r) => {
              const won =
                r.state === "submitted" &&
                competition.status === "Awarded" &&
                competition.awardedTo === r.name
              const leading = r.state === "submitted" && r.rank === 1
              return (
                <li key={r.name} className="flex items-center gap-4 p-4">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      won
                        ? "bg-chart-2 text-background"
                        : leading
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {r.state === "submitted" ? initials(r.name) : <Mail className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {r.state === "submitted" ? r.name : "Awaiting response"}
                      </p>
                      {leading && !won && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          <Crown className="size-3" />
                          Leading
                        </span>
                      )}
                      {won && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-chart-2/15 px-1.5 py-0.5 text-[10px] font-semibold text-chart-2">
                          <Trophy className="size-3" />
                          Awarded
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.state === "submitted"
                        ? `Rank #${r.rank} · submitted ${r.bid.submittedAgo}`
                        : "Invitation sent"}
                    </p>
                  </div>
                  {r.state === "submitted" ? (
                    <div className="flex items-center gap-3">
                      <TrendChip trend={r.bid.trend} />
                      <span className="text-sm font-bold tabular-nums text-foreground">
                        {formatAmount(r.bid.amount)} {competition.currency}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-chart-3/10 px-2 py-1 text-xs font-medium text-chart-3">
                      <Hourglass className="size-3.5" />
                      Pending
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

// Small trend indicator for a bid's movement.
function TrendChip({ trend }: { trend: SupplierBid["trend"] }) {
  if (trend === "new") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-chart-3/10 px-2 py-1 text-xs font-medium text-chart-3">
        <Sparkles className="size-3.5" />
        New
      </span>
    )
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-chart-2/15 px-2 py-1 text-xs font-medium text-chart-2">
        <TrendingDown className="size-3.5" />
        Lower
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
      <TrendingUp className="size-3.5" />
      Higher
    </span>
  )
}

// ===========================================================================
// Proposals tab
// ===========================================================================
function ProposalsTab({
  competition,
  best,
}: {
  competition: Competition
  best: SupplierBid | null
}) {
  const sorted = [...competition.bids].sort((a, b) => a.amount - b.amount)

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <EmptyState
          icon={Gavel}
          title="No proposals submitted"
          body="Suppliers' competitive bids will be ranked here as they arrive."
        />
      </div>
    )
  }

  const cheapest = sorted[0].amount
  const priciest = sorted[sorted.length - 1].amount
  const avg = Math.round(sorted.reduce((s, b) => s + b.amount, 0) / sorted.length)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ScoreCard
          icon={Medal}
          label="Best bid"
          value={`${formatAmount(cheapest)}`}
          sub={competition.currency}
        />
        <ScoreCard
          icon={Gauge}
          label="Average bid"
          value={`${formatAmount(avg)}`}
          sub={competition.currency}
        />
        <ScoreCard
          icon={Scale}
          label="Spread"
          value={`${formatAmount(priciest - cheapest)}`}
          sub="lowest to highest"
        />
        <ScoreCard
          icon={Percent}
          label="Best vs. baseline"
          value={`${Math.round(((competition.baseline - cheapest) / Math.max(1, competition.baseline)) * 100)}%`}
          sub="saving"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Rank</th>
              <th className="px-5 py-3 font-medium">Supplier</th>
              <th className="px-5 py-3 text-right font-medium">Bid</th>
              <th className="px-5 py-3 text-right font-medium">Saving</th>
              <th className="px-5 py-3 text-right font-medium">vs. baseline</th>
              <th className="px-5 py-3 text-center font-medium">Trend</th>
              <th className="px-5 py-3 text-right font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((bid, i) => {
              const leading = i === 0
              const diff = competition.baseline - bid.amount
              const diffPct = competition.baseline > 0 ? diff / competition.baseline : 0
              const won = competition.status === "Awarded" && competition.awardedTo === bid.supplier
              return (
                <tr key={bid.supplier} className={cn(leading && "bg-primary/5")}>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                        leading ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{bid.supplier}</span>
                      {won ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-chart-2/15 px-1.5 py-0.5 text-[10px] font-semibold text-chart-2">
                          <Trophy className="size-3" />
                          Awarded
                        </span>
                      ) : (
                        leading && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            <Crown className="size-3" />
                            Leading
                          </span>
                        )
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-bold tabular-nums text-foreground">
                    {formatAmount(bid.amount)} {competition.currency}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                    {diff >= 0 ? `${formatAmount(diff)} ${competition.currency}` : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold",
                        diff >= 0 ? "text-primary" : "text-destructive",
                      )}
                    >
                      <TrendingDown className="size-3.5" />
                      {Math.round(diffPct * 100)}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <TrendChip trend={bid.trend} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-muted-foreground">{bid.submittedAgo}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Submitted documents */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border p-5">
          <Paperclip className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">Submitted documents</h3>
        </div>
        <ul className="divide-y divide-border">
          {sorted.map((bid) => {
            const files = bidAttachments(competition, bid)
            return (
              <li key={bid.supplier} className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                    {initials(bid.supplier)}
                  </span>
                  <span className="text-sm font-medium text-foreground">{bid.supplier}</span>
                  <span className="text-xs text-muted-foreground">· {files.length} files</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {files.map((file) => (
                    <AttachmentChip key={file.name} file={file} />
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// File-type icon + colour for an attachment chip.
function attachmentMeta(kind: BidAttachment["kind"]) {
  switch (kind) {
    case "pdf":
      return { Icon: FileText, tone: "text-destructive" }
    case "xlsx":
      return { Icon: FileSpreadsheet, tone: "text-primary" }
    case "docx":
      return { Icon: FileText, tone: "text-chart-3" }
    case "zip":
      return { Icon: FileArchive, tone: "text-chart-2" }
  }
}

// A single downloadable attachment chip.
function AttachmentChip({ file }: { file: BidAttachment }) {
  const { Icon, tone } = attachmentMeta(file.kind)
  return (
    <button
      type="button"
      className="group inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
    >
      <Icon className={cn("size-4 shrink-0", tone)} />
      <span className="flex flex-col leading-tight">
        <span className="text-xs font-medium text-foreground">{file.name}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {file.kind} · {file.size}
        </span>
      </span>
      <Download className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </button>
  )
}

// ===========================================================================
// Evaluation tab
// ===========================================================================
function EvaluationTab({
  competition,
  best,
}: {
  competition: Competition
  best: SupplierBid | null
}) {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS)
  const [manual, setManual] = useState<ManualScores>(() => defaultManualScores(competition))
  const locked = competition.status === "Awarded" || competition.status === "Closed"

  const scored = scoreBids(competition, weights, manual)
  const weightSum = weights.price + weights.quality + weights.delivery

  function setWeight(key: keyof Weights, value: number) {
    setWeights((w) => ({ ...w, [key]: value }))
  }

  function setManualScore(supplier: string, key: "quality" | "delivery", value: number) {
    const clamped = Math.max(0, Math.min(100, value))
    setManual((m) => ({
      ...m,
      [supplier]: { ...(m[supplier] ?? { quality: 80, delivery: 80 }), [key]: clamped },
    }))
  }

  function reset() {
    setWeights(DEFAULT_WEIGHTS)
    setManual(defaultManualScores(competition))
  }

  if (scored.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <EmptyState
          icon={Star}
          title="Nothing to evaluate yet"
          body="Weighted scores and price comparison appear once proposals are in."
        />
      </div>
    )
  }

  const winner = scored[0]

  return (
    <div className="flex flex-col gap-6">
      {/* Recommended winner banner */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Medal className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Highest weighted score
          </p>
          <p className="truncate text-lg font-bold text-foreground">{winner.bid.supplier}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums text-primary">{winner.total}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">out of 100</p>
        </div>
      </div>

      {/* Scoring weights — adjustable */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Scale className="size-4 text-primary" />
            Scoring weights
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                weightSum === 100
                  ? "bg-chart-2/15 text-chart-2"
                  : "bg-chart-3/15 text-chart-3",
              )}
            >
              Total {weightSum}%
            </span>
            <button
              type="button"
              onClick={reset}
              disabled={locked}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>
        {weightSum !== 100 && (
          <p className="mt-2 text-xs text-chart-3">
            Weights are normalised to 100% when scoring. Adjust the sliders so they sum to 100% for direct control.
          </p>
        )}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <WeightSlider
            label="Price"
            icon={CircleDollarSign}
            color="accent-primary"
            value={weights.price}
            onChange={(v) => setWeight("price", v)}
            disabled={locked}
          />
          <WeightSlider
            label="Quality"
            icon={Star}
            color="accent-chart-3"
            value={weights.quality}
            onChange={(v) => setWeight("quality", v)}
            disabled={locked}
          />
          <WeightSlider
            label="Delivery"
            icon={Truck}
            color="accent-chart-2"
            value={weights.delivery}
            onChange={(v) => setWeight("delivery", v)}
            disabled={locked}
          />
        </div>
        {!locked && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            Adjust weights and edit each supplier&apos;s quality &amp; delivery scores below — the ranking updates instantly.
          </p>
        )}
      </div>

      {/* Scoring matrix */}
      <div className="flex flex-col gap-4">
        {scored.map((s, i) => {
          const leading = i === 0
          return (
            <div
              key={s.bid.supplier}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-sm",
                leading ? "border-primary/40" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      leading ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{s.bid.supplier}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatAmount(s.bid.amount)} {competition.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums text-foreground">{s.total}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">score</p>
                  </div>
                  {leading && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                      <Crown className="size-3" />
                      Best
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ScoreBar label="Price" score={s.priceScore} color="bg-primary" hint="auto · from bid" />
                <EditableScore
                  label="Quality"
                  score={s.qualityScore}
                  color="bg-chart-3"
                  disabled={locked}
                  onChange={(v) => setManualScore(s.bid.supplier, "quality", v)}
                />
                <EditableScore
                  label="Delivery"
                  score={s.deliveryScore}
                  color="bg-chart-2"
                  disabled={locked}
                  onChange={(v) => setManualScore(s.bid.supplier, "delivery", v)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeightSlider({
  label,
  icon: Icon,
  color,
  value,
  onChange,
  disabled,
}: {
  label: string
  icon: typeof Trophy
  color: string
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <Icon className="size-4 text-muted-foreground" />
          {label}
        </span>
        <span className="font-bold tabular-nums text-foreground">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50", color)}
        aria-label={`${label} weight`}
      />
    </div>
  )
}

// Editable non-price score with a +/- stepper and progress bar.
function EditableScore({
  label,
  score,
  color,
  disabled,
  onChange,
}: {
  label: string
  score: number
  color: string
  disabled?: boolean
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        {disabled ? (
          <span className="font-semibold tabular-nums text-foreground">{score}</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChange(score - 1)}
              className="flex size-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted"
              aria-label={`Decrease ${label}`}
            >
              <Minus className="size-3" />
            </button>
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-12 rounded border border-border bg-background px-1 py-0.5 text-center text-xs font-semibold tabular-nums text-foreground focus:border-primary focus:outline-none"
              aria-label={`${label} score`}
            />
            <button
              type="button"
              onClick={() => onChange(score + 1)}
              className="flex size-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted"
              aria-label={`Increase ${label}`}
            >
              <Plus className="size-3" />
            </button>
          </div>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function ScoreBar({
  label,
  score,
  color,
  hint,
}: {
  label: string
  score: number
  color: string
  hint?: string
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {label}
          {hint && <span className="ml-1 text-[10px] text-muted-foreground/70">{hint}</span>}
        </span>
        <span className="font-semibold tabular-nums text-foreground">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function ScoreCard({
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <p className="mt-2 text-xl font-bold tabular-nums text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ===========================================================================
// Award tab
// ===========================================================================
function AwardTab({
  competition,
  best,
  saving,
  pct,
}: {
  competition: Competition
  best: SupplierBid | null
  saving: number
  pct: number
}) {
  const isAwarded = competition.status === "Awarded"
  const isClosed = competition.status === "Closed"
  const sorted = [...competition.bids].sort((a, b) => a.amount - b.amount)
  const runnerUp = sorted.length > 1 ? sorted[1] : null

  if (isAwarded) {
    return (
      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-2xl border border-chart-2/40 bg-chart-2/5 shadow-sm">
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
              <Trophy className="size-8" />
            </span>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Awarded to</p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">{competition.awardedTo}</h3>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-xl border border-border bg-card px-6 py-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Final price</p>
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {best ? `${formatAmount(best.amount)} ${competition.currency}` : "—"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Saved</p>
                <p className="text-lg font-bold tabular-nums text-primary">
                  {formatAmount(saving)} {competition.currency}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">vs. baseline</p>
                <p className="text-lg font-bold tabular-nums text-primary">{Math.round(pct * 100)}%</p>
              </div>
            </div>
            {competition.awardedOn && (
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                Awarded on {competition.awardedOn}
              </p>
            )}
          </div>
        </div>

        {/* Decision rationale: winner vs runner-up */}
        {runnerUp && best && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Scale className="size-4 text-primary" />
              Award rationale
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {competition.awardedTo} beat the runner-up by{" "}
              <span className="font-semibold text-foreground">
                {formatAmount(runnerUp.amount - best.amount)} {competition.currency}
              </span>
              .
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-chart-2/40 bg-chart-2/5 p-4">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-chart-2">
                  <Trophy className="size-3.5" />
                  Winner
                </span>
                <p className="mt-1 font-semibold text-foreground">{best.supplier}</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatAmount(best.amount)} {competition.currency}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Medal className="size-3.5" />
                  Runner-up
                </span>
                <p className="mt-1 font-semibold text-foreground">{runnerUp.supplier}</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatAmount(runnerUp.amount)} {competition.currency}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next steps */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <FileCheck className="size-4 text-primary" />
            Next steps
          </h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            <NextStep done label="Winner notified" detail="Award decision sent to all bidders." />
            <NextStep
              done
              label="Purchase order issued"
              detail={`PO raised for ${competition.awardedTo}.`}
            />
            <NextStep
              label="Contract signature"
              detail="Awaiting countersignature from the supplier."
            />
          </ul>
        </div>
      </div>
    )
  }

  if (isClosed) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <EmptyState
          icon={XCircle}
          title="Closed without award"
          body="This competition was closed before a supplier was awarded."
        />
      </div>
    )
  }

  // Active / ready / draft — show award candidate
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <ShieldCheck className="size-4 text-primary" />
        Recommended award
      </h3>
      {best ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Crown className="size-6" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{best.supplier}</p>
                <p className="text-sm text-muted-foreground">
                  Leading bid · saves {formatAmount(saving)} {competition.currency} ({Math.round(pct * 100)}%)
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {formatAmount(best.amount)} {competition.currency}
            </p>
          </div>
          <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto">
            <Trophy className="size-4" />
            Award to {best.supplier}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Awarding closes the competition and notifies all invited suppliers.
          </p>
        </>
      ) : (
        <EmptyState
          icon={Trophy}
          title="No bids to award yet"
          body="Once suppliers submit, the recommended award will appear here."
        />
      )}
    </div>
  )
}

// Single next-step row for an awarded competition.
function NextStep({ label, detail, done }: { label: string; detail: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          done
            ? "bg-chart-2 text-background"
            : "border-2 border-dashed border-muted-foreground/40 text-muted-foreground",
        )}
      >
        {done ? <CheckCircle2 className="size-4" /> : <Hourglass className="size-3.5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Shared rank row (overview podium)
// ---------------------------------------------------------------------------
function RankRow({
  row,
  index,
  competition,
}: {
  row: Extract<SupplierRow, { state: "submitted" }>
  index: number
  competition: Competition
}) {
  const leading = index === 0
  const won = competition.status === "Awarded" && competition.awardedTo === row.name
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3",
        won
          ? "border-chart-2/50 bg-chart-2/10"
          : leading
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          won
            ? "bg-chart-2 text-background"
            : leading
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
        )}
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{row.name}</p>
        <p className="text-xs text-muted-foreground">Submitted {row.bid.submittedAgo}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold tabular-nums text-foreground">
          {formatAmount(row.bid.amount)} {competition.currency}
        </p>
        {leading && !won && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
            Leading
          </span>
        )}
        {won && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-chart-2">
            <Trophy className="size-3" />
            Awarded
          </span>
        )}
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Trophy
  title: string
  body: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
