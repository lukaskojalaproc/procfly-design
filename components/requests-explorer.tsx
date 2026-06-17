"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal, Network as NetworkIcon, ShieldCheck } from "lucide-react"
import { Package, Briefcase, UserPlus, Clock, MoreVertical, Users, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PriceTag } from "@/components/price-tag"
import {
  requests,
  maxAmount,
  initials,
  type ProcurementRequest,
  type RequestKind,
  type RequestStatus,
} from "@/lib/dashboard-data"

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
}

const statusStyles: Record<RequestStatus, string> = {
  Pending: "bg-chart-2/15 text-chart-2",
  Approved: "bg-primary/12 text-primary",
  Rejected: "bg-destructive/12 text-destructive",
}

const accentByStatus: Record<RequestStatus, string> = {
  Pending: "bg-chart-2",
  Approved: "bg-primary",
  Rejected: "bg-destructive",
}

const statusOptions: (RequestStatus | "All")[] = ["All", "Pending", "Approved", "Rejected"]
const typeOptions: (RequestKind | "All")[] = ["All", "Buy Product", "Buy Service", "Add New Supplier"]
type SortKey = "Newest" | "Highest amount" | "Lowest amount"
const sortOptions: SortKey[] = ["Newest", "Highest amount", "Lowest amount"]

function FullRequestRow({ request }: { request: ProcurementRequest }) {
  const Icon = kindIcon[request.kind]
  return (
    <Link href={`/requests/${request.id}`} className="block">
      <Card className="group flex flex-row items-center gap-4 p-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
      <span className={cn("h-12 w-1 shrink-0 rounded-full", accentByStatus[request.status])} />
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
              statusStyles[request.status],
            )}
          >
            {request.status}
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
            <Clock className="size-3.5" />
            Updated {request.updated}
          </span>
          {request.quotes > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              <Users className="size-3" />
              {request.quotes} quotes
            </span>
          )}
        </div>
      </div>

      <div className="hidden flex-col items-end sm:flex">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Total
        </span>
        <PriceTag amount={request.amount} currency={request.currency} max={maxAmount} />
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
        aria-label="More options"
      >
        <MoreVertical className="size-4" />
      </button>
      </Card>
    </Link>
  )
}

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-border bg-card py-2 pl-3 pr-9 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 rotate-90 text-muted-foreground" />
    </div>
  )
}

export function RequestsExplorer() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("All")
  const [type, setType] = useState<string>("All")
  const [sort, setSort] = useState<string>("Newest")
  const [needsApproval, setNeedsApproval] = useState(false)

  let filtered = requests.filter((r) => {
    const matchesQuery =
      query.trim() === "" ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.category.toLowerCase().includes(query.toLowerCase()) ||
      r.ref.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === "All" || r.status === status
    const matchesType = type === "All" || r.kind === type
    const matchesApproval = !needsApproval || r.status === "Pending"
    return matchesQuery && matchesStatus && matchesType && matchesApproval
  })

  filtered = [...filtered].sort((a, b) => {
    if (sort === "Highest amount") return b.amount - a.amount
    if (sort === "Lowest amount") return a.amount - b.amount
    return b.date.localeCompare(a.date)
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <NetworkIcon className="size-4" />
        Showing all company requests
      </div>

      <Card className="flex flex-col gap-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, status..."
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown value={status} options={statusOptions} onChange={setStatus} />
          <Dropdown value={type} options={typeOptions} onChange={setType} />
          <Dropdown value={sort} options={sortOptions} onChange={setSort} />
          <button
            onClick={() => setNeedsApproval((v) => !v)}
            className={cn(
              "ml-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              needsApproval
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            <ShieldCheck className="size-4" />
            Needs my approval
          </button>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {requests.length} requests
      </p>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-10 text-center">
            <SlidersHorizontal className="size-6 text-muted-foreground" />
            <p className="font-medium text-foreground">No requests match your filters</p>
            <p className="text-sm text-muted-foreground">Try adjusting the search or filters above.</p>
          </Card>
        ) : (
          filtered.map((request) => <FullRequestRow key={request.id} request={request} />)
        )}
      </div>
    </div>
  )
}
