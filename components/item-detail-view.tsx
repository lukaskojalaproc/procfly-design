"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package,
  Boxes,
  MapPin,
  Building2,
  CircleDollarSign,
  Printer,
  Download,
  FileEdit,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Archive,
  FilePlus2,
  AlertTriangle,
  Tags,
  Hash,
  Warehouse as WarehouseIcon,
  Layers,
  Network,
  ShoppingCart,
  CalendarDays,
  ArrowRight,
  History,
  Files,
  FileText,
  ImageIcon,
  ChevronsDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/dashboard-data"
import {
  computeStatus,
  isLowStock,
  totalValue,
  itemSupplier,
  itemOrder,
  type InventoryItem,
  type StockStatus,
  type MovementKind,
  type ItemActivityKind,
} from "@/lib/warehouse-data"

const statusStyles: Record<StockStatus, { text: string; bg: string; ring: string; dot: string }> = {
  "In Stock": { text: "text-chart-2", bg: "bg-chart-2/15", ring: "ring-chart-2/30", dot: "bg-chart-2" },
  "Low Stock": { text: "text-chart-4", bg: "bg-chart-4/15", ring: "ring-chart-4/30", dot: "bg-chart-4" },
  "Out of Stock": { text: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30", dot: "bg-destructive" },
  Archived: { text: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", dot: "bg-muted-foreground" },
}

const movementStyles: Record<MovementKind, { icon: typeof ArrowDownToLine; cls: string }> = {
  "Stock Added": { icon: ArrowDownToLine, cls: "bg-chart-2/15 text-chart-2" },
  "Stock Removed": { icon: ArrowUpFromLine, cls: "bg-destructive/10 text-destructive" },
  Transferred: { icon: ArrowLeftRight, cls: "bg-chart-3/10 text-chart-3" },
  Adjusted: { icon: ChevronsDown, cls: "bg-muted text-muted-foreground" },
  Reserved: { icon: Layers, cls: "bg-chart-4/15 text-chart-4" },
  Assigned: { icon: ArrowUpFromLine, cls: "bg-primary/10 text-primary" },
}

const activityIcons: Record<ItemActivityKind, typeof Package> = {
  created: Package,
  added: ArrowDownToLine,
  removed: ArrowUpFromLine,
  updated: FileEdit,
  transferred: ArrowLeftRight,
}

export function ItemDetailView({ item: i }: { item: InventoryItem }) {
  const status = computeStatus(i)
  const st = statusStyles[status]
  const low = isLowStock(i)
  const supplier = itemSupplier(i)
  const order = itemOrder(i)
  const value = totalValue(i)
  const pct = i.minQuantity > 0 ? Math.min(100, Math.round((i.quantity / Math.max(i.minQuantity, i.reorderPoint)) * 100)) : 100

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <ItemImage item={i} className="size-16 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                    st.bg,
                    st.text,
                    st.ring,
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", st.dot)} />
                  {status}
                </span>
                {low && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-chart-4/15 px-2 py-0.5 text-[10px] font-bold text-chart-4">
                    <AlertTriangle className="size-3" />
                    Below minimum
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-lg font-bold text-foreground">{i.name}</h2>
              <p className="mt-0.5 font-mono text-sm text-muted-foreground">
                {i.code} · {i.sku}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {low && (
              <Link
                href="/requests"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <FilePlus2 className="size-4" />
                Create Request
              </Link>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Printer className="size-4" />
              Print
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              <FileEdit className="size-4" />
              Edit Item
            </button>
          </div>
        </div>

        {/* Key facts */}
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
          <Fact icon={Boxes} label="On hand" value={`${i.quantity} ${i.unit}`} accent={low} />
          <Fact icon={Tags} label="Category" value={i.category} />
          <Fact icon={MapPin} label="Location" value={i.location.warehouse} />
          <Fact icon={CircleDollarSign} label="Total value" value={`${formatAmount(value)} ${i.currency}`} accent />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <QuickAction icon={ArrowDownToLine} label="Add Stock" />
        <QuickAction icon={ArrowUpFromLine} label="Remove Stock" />
        <QuickAction icon={ArrowLeftRight} label="Transfer Stock" />
        <QuickAction icon={Archive} label="Archive Item" danger />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Overview */}
          <Section icon={Package} title="Overview">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Term label="Item code" value={i.code} mono icon={Hash} />
              <Term label="SKU" value={i.sku} mono />
              <Term label="Item name" value={i.name} />
              <Term label="Category" value={i.category} />
              <Term label="Status" value={status} />
              <Term label="Owner" value={i.owner} />
            </dl>
            <div className="mt-4 border-t border-border pt-4">
              <dt className="text-xs text-muted-foreground">Description</dt>
              <dd className="mt-1 text-sm leading-relaxed text-foreground">{i.description}</dd>
            </div>
          </Section>

          {/* Stock */}
          <Section icon={Boxes} title="Stock">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Current quantity" value={`${i.quantity}`} sub={i.unit} accent={low} />
              <Stat label="Minimum quantity" value={`${i.minQuantity}`} sub={i.unit} />
              <Stat label="Reorder point" value={`${i.reorderPoint}`} sub={i.unit} />
            </div>
            {/* Stock level bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Stock level</span>
                <span className="tabular-nums">
                  {i.quantity} / min {i.minQuantity}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", low || i.quantity === 0 ? "bg-chart-4" : "bg-chart-2")}
                  style={{ width: `${i.quantity === 0 ? 4 : pct}%` }}
                />
              </div>
              {low && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-chart-4">
                  <AlertTriangle className="size-3.5" />
                  Below minimum stock level — reorder recommended.
                </p>
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
              <Term label="Warehouse" value={i.location.warehouse} icon={WarehouseIcon} />
              <Term label="Office" value={i.location.office} icon={Building2} />
              <Term label="Department" value={i.location.department} />
              <Term label="Shelf / Bin" value={i.location.bin} mono icon={MapPin} />
            </div>
          </Section>

          {/* Stock movement history */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border p-5">
              <History className="size-4 text-primary" />
              <h3 className="font-semibold text-foreground">Stock movement history</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {i.movements.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Movement</th>
                    <th className="px-5 py-3 text-right font-medium">Change</th>
                    <th className="px-5 py-3 text-right font-medium">Balance</th>
                    <th className="px-5 py-3 font-medium">By</th>
                    <th className="px-5 py-3 font-medium">Note</th>
                    <th className="px-5 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {i.movements.map((m, idx) => {
                    const ms = movementStyles[m.kind]
                    return (
                      <tr key={idx}>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-2 font-medium text-foreground">
                            <span className={cn("flex size-7 items-center justify-center rounded-lg", ms.cls)}>
                              <ms.icon className="size-3.5" />
                            </span>
                            {m.kind}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "px-5 py-3.5 text-right font-semibold tabular-nums",
                            m.delta > 0 ? "text-chart-2" : m.delta < 0 ? "text-destructive" : "text-muted-foreground",
                          )}
                        >
                          {m.delta > 0 ? `+${m.delta}` : m.delta}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-foreground">{m.balance}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{m.by}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{m.note ?? "—"}</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{m.when}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documents */}
          {i.documents.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-1.5 border-b border-border p-5">
                <Files className="size-4 text-primary" />
                <h3 className="font-semibold text-foreground">Documents</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {i.documents.length}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {i.documents.map((doc) => (
                  <li key={doc.label} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.fileName}
                        {doc.uploadedOn ? ` · ${doc.uploadedOn}` : ""}
                      </p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                      <Download className="size-3.5" />
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Financial */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CircleDollarSign className="size-4 text-primary" />
              Financial
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <SideRow label="Unit cost" value={`${formatAmount(i.unitCost)} ${i.currency}`} />
              <SideRow label="On-hand quantity" value={`${i.quantity} ${i.unit}`} />
              <div className="border-t border-border pt-3">
                <SideRow label="Total value" value={`${formatAmount(value)} ${i.currency}`} bold />
              </div>
              <SideRow label="Currency" value={i.currency} />
            </dl>
          </div>

          {/* Supplier */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Network className="size-4 text-primary" />
              Supplier
            </h3>
            {i.supplierName ? (
              <div className="mt-4 flex flex-col gap-3">
                {supplier ? (
                  <Link
                    href={`/suppliers/${supplier.id}`}
                    className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted"
                  >
                    <Building2 className="size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{i.supplierName}</p>
                      <p className="text-xs text-muted-foreground">View supplier</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                    <Building2 className="size-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{i.supplierName}</p>
                  </div>
                )}

                {order ? (
                  <Link
                    href={`/orders/${order.id}`}
                    className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted"
                  >
                    <ShoppingCart className="size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs font-semibold text-foreground">{i.purchaseOrderNumber}</p>
                      <p className="text-xs text-muted-foreground">Purchase order</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                ) : i.purchaseOrderNumber ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                    <ShoppingCart className="size-4 shrink-0 text-muted-foreground" />
                    <p className="font-mono text-xs font-semibold text-foreground">{i.purchaseOrderNumber}</p>
                  </div>
                ) : null}

                {i.lastPurchaseDate && (
                  <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
                    <CalendarDays className="size-4 shrink-0" />
                    Last purchased {i.lastPurchaseDate}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
                No supplier linked.
              </p>
            )}
          </div>

          {/* Activity */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <History className="size-4 text-primary" />
              Activity
            </h3>
            <ol className="mt-5 flex flex-col">
              {i.activity.map((entry, idx) => {
                const last = idx === i.activity.length - 1
                const Icon = activityIcons[entry.kind]
                const danger = entry.kind === "removed"
                return (
                  <li key={`${entry.title}-${idx}`} className="relative flex gap-3 pb-5 last:pb-0">
                    {!last && <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border" aria-hidden />}
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">{entry.detail}</p>
                      <p className="text-xs text-muted-foreground">{entry.when}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ItemImage({ item, className }: { item: InventoryItem; className?: string }) {
  const [errored, setErrored] = useState(false)
  if (item.image && !errored) {
    return (
      <img
        src={item.image || "/placeholder.svg"}
        alt={item.name}
        onError={() => setErrored(true)}
        className={cn("rounded-xl border border-border object-cover", className)}
      />
    )
  }
  return (
    <span className={cn("flex items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground", className)}>
      <ImageIcon className="size-6" />
    </span>
  )
}

function Section({ icon: Icon, title, children }: { icon: typeof Package; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Fact({ icon: Icon, label, value, accent }: { icon: typeof Package; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className={cn("truncate text-base font-bold", accent ? "text-primary" : "text-foreground")}>{value}</span>
    </div>
  )
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className={cn("text-2xl font-bold tabular-nums", accent ? "text-chart-4" : "text-foreground")}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

function Term({ label, value, mono, icon: Icon }: { label: string; value: string; mono?: boolean; icon?: typeof Hash }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 flex items-center gap-1.5 font-medium text-foreground", mono && "font-mono text-[13px]")}>
        {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
        <span className="truncate">{value}</span>
      </dd>
    </div>
  )
}

function SideRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums text-foreground", bold ? "text-base font-bold" : "font-medium")}>{value}</dd>
    </div>
  )
}

function QuickAction({ icon: Icon, label, danger }: { icon: typeof Package; label: string; danger?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        danger
          ? "border-destructive/30 text-destructive hover:bg-destructive/10"
          : "border-border text-foreground hover:bg-muted",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
