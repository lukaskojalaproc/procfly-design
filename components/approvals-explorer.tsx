"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Check,
  X,
  Package,
  Briefcase,
  UserPlus,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PriceTag } from "@/components/price-tag"
import {
  requests,
  maxAmount,
  initials,
  type ProcurementRequest,
  type RequestKind,
} from "@/lib/dashboard-data"

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
}

// Local decision state layered on top of the seed data so the reviewer can
// action items without a backend. Keyed by request id.
type Decision = "Pending" | "Approved" | "Rejected"

type FilterTab = "Pending" | "Approved" | "Rejected" | "All"

const tabs: { key: FilterTab; label: string; icon: typeof Clock }[] = [
  { key: "Pending", label: "Pending", icon: Clock },
  { key: "Approved", label: "Approved", icon: CheckCircle2 },
  { key: "Rejected", label: "Rejected", icon: XCircle },
  { key: "All", label: "All", icon: Layers },
]

const decisionStyles: Record<Decision, string> = {
  Pending: "bg-chart-2/15 text-chart-2",
  Approved: "bg-primary/12 text-primary",
  Rejected: "bg-destructive/12 text-destructive",
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-2 bg-hero p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-hero-muted">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-xl font-semibold tracking-tight">{value}</span>
    </div>
  )
}

const accentByDecision: Record<Decision, string> = {
  Pending: "bg-chart-2",
  Approved: "bg-primary",
  Rejected: "bg-destructive",
}

// The reviewer is the current user — they sit at the "Manager" approval step.
const APPROVER_ROLE = "Manager"

function ApprovalRow({
  request,
  decision,
  actedByYou,
  onApprove,
  onReject,
}: {
  request: ProcurementRequest
  decision: Decision
  actedByYou: boolean
  onApprove: () => void
  onReject: () => void
}) {
  const Icon = kindIcon[request.kind]
  const actionable = decision === "Pending"

  return (
    <Card className="flex flex-col gap-4 p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center">
      <span className={cn("hidden h-12 w-1 shrink-0 rounded-full sm:block", accentByDecision[decision])} />

      <Link
        href={`/requests/${request.id}`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
              {request.ref}
            </span>
            <p className="truncate font-semibold text-foreground">{request.title}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                decisionStyles[decision],
              )}
            >
              {decision}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {initials(request.requester)}
              </span>
              {request.requester}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-1 rounded-full bg-border" />
              {request.kind} · {request.category}
            </span>
            <span className="hidden items-center gap-1 md:inline-flex">
              <span className="size-1 rounded-full bg-border" />
              <ShieldCheck className="size-3.5" />
              Step · {APPROVER_ROLE}
            </span>
          </div>
        </div>
      </Link>

      <div className="hidden flex-col items-end lg:flex">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Total
        </span>
        <PriceTag amount={request.amount} currency={request.currency} max={maxAmount} />
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border pt-3 sm:border-0 sm:pt-0">
        {actionable ? (
          <>
            <button
              onClick={onReject}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive sm:flex-none"
            >
              <X className="size-4" />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex-none"
            >
              <Check className="size-4" />
              Approve
            </button>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {decision === "Approved" ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <XCircle className="size-4 text-destructive" />
            )}
            {decision} {actedByYou ? "by you" : ""}
          </span>
        )}
      </div>
    </Card>
  )
}

export function ApprovalsExplorer() {
  // The reviewer's queue spans every request: Pending items are actionable,
  // while Approved / Rejected ones form the decision history shown under their
  // respective tabs. Seed each row's decision from the request's own status.
  const queue = requests

  const [decisions, setDecisions] = useState<Record<string, Decision>>(() =>
    Object.fromEntries(queue.map((r) => [r.id, r.status as Decision])),
  )
  // Ids the reviewer actioned during this session (vs. seeded history).
  const [actedByYou, setActedByYou] = useState<Record<string, boolean>>({})
  const [tab, setTab] = useState<FilterTab>("Pending")
  const [query, setQuery] = useState("")

  const pendingCount = queue.filter((r) => decisions[r.id] === "Pending").length

  const counts = {
    Pending: pendingCount,
    Approved: queue.filter((r) => decisions[r.id] === "Approved").length,
    Rejected: queue.filter((r) => decisions[r.id] === "Rejected").length,
    All: queue.length,
  }

  // Hero metrics — value at stake and reviewer throughput.
  const pendingRequests = queue.filter((r) => decisions[r.id] === "Pending")
  const pendingValue = pendingRequests.reduce((sum, r) => sum + r.amount, 0)
  const highestPending = pendingRequests.reduce((max, r) => Math.max(max, r.amount), 0)
  const uniqueRequesters = new Set(pendingRequests.map((r) => r.requester)).size
  const actionedCount = Object.keys(actedByYou).length
  const fmtEur = (n: number) => {
    if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M`
    if (n >= 1000) return `€${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`
    return `€${n}`
  }

  const filtered = queue.filter((r) => {
    const decision = decisions[r.id]
    const matchesTab = tab === "All" || decision === tab
    const matchesQuery =
      query.trim() === "" ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.ref.toLowerCase().includes(query.toLowerCase()) ||
      r.requester.toLowerCase().includes(query.toLowerCase())
    return matchesTab && matchesQuery
  })

  const setDecision = (id: string, value: Decision) => {
    setDecisions((prev) => ({ ...prev, [id]: value }))
    setActedByYou((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Command-center hero */}
      <div className="relative overflow-hidden rounded-2xl bg-hero text-hero-foreground shadow-sm">
        {/* subtle radial highlight — brand green tie-in */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-8 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-hero-accent px-3 py-1 text-xs font-medium text-hero-foreground/90 ring-1 ring-inset ring-hero-border/60">
                <Clock className="size-3.5" />
                Awaiting your action
              </span>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-6xl font-bold leading-none tracking-tight md:text-7xl">
                  {pendingCount}
                </span>
                <span className="mb-1 text-lg font-medium text-hero-muted">
                  {pendingCount === 1 ? "approval" : "approvals"} pending
                </span>
              </div>
              <p className="mt-2 max-w-sm text-sm text-hero-muted">
                {pendingValue > 0
                  ? `${fmtEur(pendingValue)} in spend is waiting on your decision across ${uniqueRequesters} ${uniqueRequesters === 1 ? "requester" : "requesters"}.`
                  : "You're all caught up — new approval requests will appear here."}
              </p>
            </div>

            {actionedCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-hero-accent px-4 py-2.5 text-sm ring-1 ring-inset ring-hero-border/50">
                <CheckCircle2 className="size-4 text-primary" />
                <span className="font-semibold">{actionedCount}</span>
                <span className="text-hero-muted">actioned today</span>
              </div>
            )}
          </div>

          {/* Metric tiles */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-hero-border/50 lg:grid-cols-4">
            <HeroStat
              icon={Wallet}
              label="Value at stake"
              value={pendingValue > 0 ? fmtEur(pendingValue) : "—"}
            />
            <HeroStat
              icon={TrendingUp}
              label="Largest request"
              value={highestPending > 0 ? fmtEur(highestPending) : "—"}
            />
            <HeroStat icon={Users} label="Requesters waiting" value={`${uniqueRequesters}`} />
            <HeroStat icon={Check} label="Cleared by you" value={`${actionedCount}`} />
          </div>
        </div>
      </div>

      <Card className="flex flex-col gap-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search approvals..."
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                tab === key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              {label}
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 text-xs font-semibold",
                  tab === key ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {queue.length} requests
      </p>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </span>
            <p className="font-semibold text-foreground">
              {tab === "Pending" ? "No approvals to review" : `No ${tab.toLowerCase()} requests`}
            </p>
            <p className="text-sm text-muted-foreground">
              {tab === "Pending"
                ? "You're all caught up — new approval requests will appear here."
                : query.trim() !== ""
                  ? "No requests match your search."
                  : `Requests you ${tab === "Approved" ? "approve" : "reject"} will appear here.`}
            </p>
          </Card>
        ) : (
          filtered.map((request) => (
            <ApprovalRow
              key={request.id}
              request={request}
              decision={decisions[request.id]}
              actedByYou={!!actedByYou[request.id]}
              onApprove={() => setDecision(request.id, "Approved")}
              onReject={() => setDecision(request.id, "Rejected")}
            />
          ))
        )}
      </div>
    </div>
  )
}
