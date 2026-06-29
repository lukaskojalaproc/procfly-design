"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Search,
  Package,
  PackageX,
  AlertTriangle,
  CircleDollarSign,
  Tags,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  X,
  LayoutGrid,
  List,
  Plus,
  MapPin,
  MoreVertical,
  Pencil,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Archive,
  FilePlus2,
  Boxes,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CreateItemDialog } from "@/components/create-item-dialog"
import { formatAmount } from "@/lib/dashboard-data"
import {
  inventoryItems,
  warehouseStats,
  computeStatus,
  isLowStock,
  totalValue,
  itemCategories,
  itemLocations,
  itemOwners,
  itemSuppliers,
  type StockStatus,
  type InventoryItem,
} from "@/lib/warehouse-data"

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
const statusStyles: Record<StockStatus, { dot: string; text: string; bg: string }> = {
  "In Stock":     { dot: "bg-[#16a34a]", text: "text-[#166534]", bg: "border border-[#bbf7d0] bg-[#f0fdf4]" },
  "Low Stock":    { dot: "bg-[#d97706]", text: "text-[#92400e]", bg: "border border-[#fde68a] bg-[#fffbeb]" },
  "Out of Stock": { dot: "bg-[#dc2626]", text: "text-[#991b1b]", bg: "border border-[#fecaca] bg-[#fef2f2]" },
  Archived:       { dot: "bg-[#9ca3af]", text: "text-[#6b7280]", bg: "border border-[#e5e7eb] bg-[#f9fafb]" },
}

function StatusPill({ status }: { status: StockStatus }) {
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

function LowStockBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#F1E4B5] bg-[#FEF3E8] px-2 py-0.5 text-[10px] font-bold text-[#B54708]">
      <AlertTriangle className="size-3" />
      Low Stock
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
// Tabs
// ---------------------------------------------------------------------------
const TABS: (StockStatus | "All")[] = ["All", "In Stock", "Low Stock", "Out of Stock", "Archived"]

const ANY = "Any"
const ALL_STATUSES = "All statuses"

// ---------------------------------------------------------------------------
// Explorer
// ---------------------------------------------------------------------------
export function WarehouseExplorer() {
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading")
  const [view, setView] = useState<"list" | "card">("list") // list is the default working view
  const [addOpen, setAddOpen] = useState(false)

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<(typeof TABS)[number]>("All")
  const [categoryFilter, setCategoryFilter] = useState(ANY)
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const [supplierFilter, setSupplierFilter] = useState(ANY)
  const [locationFilter, setLocationFilter] = useState(ANY)
  const [ownerFilter, setOwnerFilter] = useState(ANY)
  const [sort, setSort] = useState("Name (A–Z)")

  function load() {
    setLoadState("loading")
    const timer = setTimeout(() => setLoadState("ready"), 450)
    return () => clearTimeout(timer)
  }

  useEffect(() => load(), [])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: inventoryItems.length }
    for (const t of TABS) {
      if (t === "All") continue
      counts[t] = inventoryItems.filter((i) => computeStatus(i) === t).length
    }
    return counts
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    const list = inventoryItems.filter((i) => {
      const status = computeStatus(i)
      if (tab !== "All" && status !== tab) return false
      if (statusFilter !== ALL_STATUSES && status !== statusFilter) return false
      if (categoryFilter !== ANY && i.category !== categoryFilter) return false
      if (supplierFilter !== ANY && i.supplierName !== supplierFilter) return false
      if (locationFilter !== ANY && i.location.warehouse !== locationFilter) return false
      if (ownerFilter !== ANY && i.owner !== ownerFilter) return false

      if (!q) return true
      return (
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.supplierName?.toLowerCase().includes(q) ?? false) ||
        i.location.warehouse.toLowerCase().includes(q) ||
        i.location.office.toLowerCase().includes(q) ||
        i.location.bin.toLowerCase().includes(q)
      )
    })

    const sorted = [...list]
    switch (sort) {
      case "Quantity (low)":
        sorted.sort((a, b) => a.quantity - b.quantity)
        break
      case "Quantity (high)":
        sorted.sort((a, b) => b.quantity - a.quantity)
        break
      case "Total value (high)":
        sorted.sort((a, b) => totalValue(b) - totalValue(a))
        break
      case "Recently updated":
        sorted.sort((a, b) => b.updated.localeCompare(a.updated))
        break
      default: // Name (A–Z)
        sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    return sorted
  }, [query, tab, statusFilter, categoryFilter, supplierFilter, locationFilter, ownerFilter, sort])

  const activeFilterCount =
    (statusFilter !== ALL_STATUSES ? 1 : 0) +
    (categoryFilter !== ANY ? 1 : 0) +
    (supplierFilter !== ANY ? 1 : 0) +
    (locationFilter !== ANY ? 1 : 0) +
    (ownerFilter !== ANY ? 1 : 0)

  function clearFilters() {
    setStatusFilter(ALL_STATUSES)
    setCategoryFilter(ANY)
    setSupplierFilter(ANY)
    setLocationFilter(ANY)
    setOwnerFilter(ANY)
  }

  return (
    <div className="flex flex-col gap-6">
      <CreateItemDialog open={addOpen} onOpenChange={setAddOpen} />
      {/* Stat bar */}
      <StatBar stats={[
        { label: "Total Items", value: `${warehouseStats.total}`, sub: "SKUs tracked" },
        { label: "Low Stock", value: `${warehouseStats.lowStock}`, sub: "below minimum", accent: warehouseStats.lowStock > 0 },
        { label: "Out of Stock", value: `${warehouseStats.outOfStock}`, accent: warehouseStats.outOfStock > 0 },
        { label: "Inventory Value", value: formatAmount(warehouseStats.totalValue), sub: "EUR on hand" },
        { label: "Categories", value: `${warehouseStats.categories}` },
      ]} />

      {/* Tabs */}
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
            {t === "All" ? "All Items" : t}
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
          placeholder="Search by item name, code, SKU, category, supplier, or location..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <FilterSelect label="Category" value={categoryFilter} onChange={setCategoryFilter} options={[ANY, ...itemCategories]} />
        <FilterSelect
          label="Stock status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[ALL_STATUSES, "In Stock", "Low Stock", "Out of Stock", "Archived"]}
        />
        <FilterSelect label="Supplier" value={supplierFilter} onChange={setSupplierFilter} options={[ANY, ...itemSuppliers]} />
        <FilterSelect label="Location" value={locationFilter} onChange={setLocationFilter} options={[ANY, ...itemLocations]} />
        <FilterSelect label="Owner" value={ownerFilter} onChange={setOwnerFilter} options={[ANY, ...itemOwners]} />
        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={["Name (A–Z)", "Quantity (low)", "Quantity (high)", "Total value (high)", "Recently updated"]}
        />
      </div>

      {/* Toolbar: view toggle + clear filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-4" />
            List
          </button>
          <button
            onClick={() => setView("card")}
            aria-label="Card view"
            aria-pressed={view === "card"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
            Cards
          </button>
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

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border p-5">
          <Package className="size-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Inventory items</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {loadState === "ready" ? filtered.length : "—"}
          </span>
        </div>

        {loadState === "loading" ? (
          view === "list" ? <ListLoading /> : <CardLoading />
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
            onAdd={() => setAddOpen(true)}
          />
        ) : view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 text-right font-medium">Unit cost</th>
                  <th className="px-5 py-3 text-right font-medium">Total value</th>
                  <th className="px-5 py-3 font-medium">Stock status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((i) => (
                  <ItemRow key={i.id} item={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((i) => (
              <ItemCard key={i.id} item={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// List row
// ---------------------------------------------------------------------------
function ItemRow({ item: i }: { item: InventoryItem }) {
  const status = computeStatus(i)
  const low = isLowStock(i)
  return (
    <tr
      className="group cursor-pointer transition-colors hover:bg-muted/40"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return
        window.location.href = `/warehouse/${i.id}`
      }}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <ItemThumb item={i} className="size-10 shrink-0" />
          <div className="min-w-0">
            <Link
              href={`/warehouse/${i.id}`}
              className="font-medium text-foreground transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
            >
              {i.name}
            </Link>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {i.code} · {i.sku}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{i.category}</td>
      <td className="px-5 py-4 text-right">
        <span className="font-semibold tabular-nums text-foreground">{i.quantity}</span>
        <span className="text-xs text-muted-foreground"> / min {i.minQuantity}</span>
        {low && (
          <div className="mt-1">
            <LowStockBadge />
          </div>
        )}
      </td>
      <td className="px-5 py-4 text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0" />
          {i.location.warehouse}
        </span>
        <p className="mt-0.5 text-xs text-muted-foreground">Bin {i.location.bin}</p>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{i.supplierName ?? "—"}</td>
      <td className="px-5 py-4 text-right tabular-nums text-foreground">{formatAmount(i.unitCost)}</td>
      <td className="px-5 py-4 text-right font-bold tabular-nums text-foreground">{formatAmount(totalValue(i))}</td>
      <td className="px-5 py-4">
        <StatusPill status={status} />
      </td>
      <td className="px-5 py-4 text-xs text-muted-foreground">{i.updated.split(" ")[0]}</td>
      <td className="px-5 py-4 text-right">
        <ItemActions item={i} low={low} />
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Card (optional visual view)
// ---------------------------------------------------------------------------
function ItemCard({ item: i }: { item: InventoryItem }) {
  const status = computeStatus(i)
  const low = isLowStock(i)
  return (
    <Link
      href={`/warehouse/${i.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ItemThumb item={i} className="size-full rounded-none" iconSize="size-10" />
        <div className="absolute right-2 top-2">
          <StatusPill status={status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{i.code}</span>
          <span className="font-semibold tabular-nums text-foreground">{i.quantity}</span>
        </div>
        <p className="line-clamp-2 font-medium text-foreground">{i.name}</p>
        <p className="text-xs text-muted-foreground">{i.category}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold tabular-nums text-foreground">{formatAmount(totalValue(i))} EUR</span>
          {low && <LowStockBadge />}
        </div>
      </div>
    </Link>
  )
}

/** Item thumbnail with graceful fallback to a placeholder icon. */
function ItemThumb({ item, className, iconSize = "size-4" }: { item: InventoryItem; className?: string; iconSize?: string }) {
  const [errored, setErrored] = useState(false)
  if (item.image && !errored) {
    return (
      <img
        src={item.image || "/placeholder.svg"}
        alt={item.name}
        onError={() => setErrored(true)}
        className={cn("rounded-lg border border-border object-cover", className)}
      />
    )
  }
  return (
    <span className={cn("flex items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground", className)}>
      <ImageIcon className={iconSize} />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Per-item action menu
// ---------------------------------------------------------------------------
const ACTIONS: { label: string; icon: typeof Pencil }[] = [
  { label: "Open Item", icon: ChevronRight },
  { label: "Edit Item", icon: Pencil },
  { label: "Add Stock", icon: ArrowDownToLine },
  { label: "Remove Stock", icon: ArrowUpFromLine },
  { label: "Transfer Stock", icon: ArrowLeftRight },
  { label: "Archive Item", icon: Archive },
]

function ItemActions({ item, low }: { item: InventoryItem; low: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  return (
    <div className="flex items-center justify-end gap-2" ref={ref}>
      {low && (
        <Link
          href="/requests"
          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <FilePlus2 className="size-3.5" />
          Create Request
        </Link>
      )}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={`Actions for ${item.name}`}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreVertical className="size-4" />
        </button>
        {open && (
          <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg">
            {ACTIONS.map((a) => {
              if (a.label === "Open Item") {
                return (
                  <Link
                    key={a.label}
                    href={`/warehouse/${item.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-muted"
                  >
                    <a.icon className="size-4 text-muted-foreground" />
                    {a.label}
                  </Link>
                )
              }
              const danger = a.label === "Archive Item"
              return (
                <button
                  key={a.label}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                    danger ? "text-destructive" : "text-popover-foreground",
                  )}
                >
                  <a.icon className={cn("size-4", danger ? "text-destructive" : "text-muted-foreground")} />
                  {a.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
function ListLoading() {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading inventory">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="size-10 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-56 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-28 animate-pulse rounded bg-muted" />
          </div>
          <div className="hidden h-3 w-20 animate-pulse rounded bg-muted md:block" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

function CardLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading inventory">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
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
        <p className="font-medium text-foreground">Inventory items could not be loaded</p>
        <p className="text-sm text-muted-foreground">Something went wrong while fetching your inventory.</p>
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

function EmptyState({ filtered, onClear, onAdd }: { filtered: boolean; onClear: () => void; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Package className="size-6" />
      </span>
      <div>
        <p className="font-medium text-foreground">No inventory items found</p>
        <p className="text-sm text-muted-foreground">
          {filtered ? "Try a different search or filter." : "Add your first inventory item to get started."}
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
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add item
        </button>
      )}
    </div>
  )
}
