"use client"

import {
  ShoppingCart,
  Building2,
  Truck,
  CalendarDays,
  CreditCard,
  StickyNote,
  CheckCircle2,
  Hourglass,
  Mail,
  Phone,
  MapPin,
  User,
  Send,
  Printer,
  Download,
  FileEdit,
  Package,
  FileText,
  Trophy,
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  Receipt,
  History,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatAmount, initials, getRequestByRef } from "@/lib/dashboard-data"
import { getCompetitionByRef } from "@/lib/competitions-data"
import {
  orderLineTotal,
  orderTotal,
  orderDocuments,
  orderActivity,
  type OrderStatus,
  type DeliveryStatus,
  type SupplierResponse,
  type OrderDocKind,
  type PurchaseOrder,
} from "@/lib/orders-data"
import { OrderPdfDialog } from "@/components/order-pdf-dialog"
import { SendSupplierDialog } from "@/components/send-supplier-dialog"

const VAT_RATE = 0.21

const statusStyles: Record<OrderStatus, { text: string; bg: string; ring: string; dot: string }> = {
  Draft: { text: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", dot: "bg-muted-foreground" },
  Sent: { text: "text-chart-3", bg: "bg-chart-3/10", ring: "ring-chart-3/30", dot: "bg-chart-3" },
  "Awaiting Delivery": { text: "text-chart-4", bg: "bg-chart-4/10", ring: "ring-chart-4/30", dot: "bg-chart-4" },
  "Partially Delivered": { text: "text-chart-5", bg: "bg-chart-5/10", ring: "ring-chart-5/30", dot: "bg-chart-5" },
  Delivered: { text: "text-chart-2", bg: "bg-chart-2/15", ring: "ring-chart-2/30", dot: "bg-chart-2" },
  Closed: { text: "text-primary", bg: "bg-primary/10", ring: "ring-primary/30", dot: "bg-primary" },
  Cancelled: { text: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30", dot: "bg-destructive" },
}

const deliveryStyles: Record<DeliveryStatus, { text: string; bg: string }> = {
  "Not Started": { text: "text-muted-foreground", bg: "bg-muted" },
  "Awaiting Delivery": { text: "text-chart-4", bg: "bg-chart-4/10" },
  "Partially Delivered": { text: "text-chart-5", bg: "bg-chart-5/10" },
  Delivered: { text: "text-chart-2", bg: "bg-chart-2/15" },
  Closed: { text: "text-primary", bg: "bg-primary/10" },
  Cancelled: { text: "text-destructive", bg: "bg-destructive/10" },
}

const responseStyles: Record<SupplierResponse, { text: string; bg: string }> = {
  "Awaiting Confirmation": { text: "text-chart-4", bg: "bg-chart-4/10" },
  Confirmed: { text: "text-chart-2", bg: "bg-chart-2/15" },
  Acknowledged: { text: "text-primary", bg: "bg-primary/10" },
  Rejected: { text: "text-destructive", bg: "bg-destructive/10" },
}

const docIcons: Record<OrderDocKind, typeof FileText> = {
  po: FileText,
  confirmation: FileCheck2,
  delivery: Truck,
  invoice: Receipt,
}

export function OrderDetailView({ po }: { po: PurchaseOrder }) {
  const subtotal = orderTotal(po)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat
  const s = statusStyles[po.status]
  const [pdfOpen, setPdfOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)

  const linkedRequest = po.requestRef ? getRequestByRef(po.requestRef) : undefined
  const linkedCompetition = po.competitionRef ? getCompetitionByRef(po.competitionRef) : undefined
  const documents = orderDocuments(po)
  const activity = orderActivity(po)

  return (
    <div className="flex flex-col gap-6">
      {/* Hero summary */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingCart className="size-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-lg font-bold text-foreground">{po.number}</h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                    s.bg,
                    s.text,
                    s.ring,
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", s.dot)} />
                  {po.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Issued to <span className="font-medium text-foreground">{po.supplier.name}</span> · owned by{" "}
                <span className="font-medium text-foreground">{po.owner}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Printer className="size-4" />
              Print
            </button>
            <button
              onClick={() => setPdfOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Download className="size-4" />
              Export PDF
            </button>
            {po.status === "Draft" ? (
              <button
                onClick={() => setSendOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Send className="size-4" />
                Send to supplier
              </button>
            ) : (
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <FileEdit className="size-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Key facts */}
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
          <Fact icon={CalendarDays} label="Created" value={po.created} />
          <Fact icon={Truck} label="Expected delivery" value={po.expectedDelivery} />
          <Fact icon={CreditCard} label="Payment terms" value={po.paymentTerms} />
          <Fact
            icon={ShoppingCart}
            label="Order total"
            value={`${formatAmount(Math.round(total))} ${po.currency}`}
            accent
          />
        </div>
      </div>

      {/* Procurement chain links */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <ArrowRight className="size-4 text-primary" />
          Procurement chain
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Request → Competition → Purchase Order</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ChainLink
            icon={FileText}
            label="Linked request"
            value={po.requestRef ?? "Not linked"}
            href={linkedRequest ? `/requests/${linkedRequest.id}` : null}
          />
          <ChainLink
            icon={Trophy}
            label="Linked competition"
            value={po.competitionRef ?? "Direct purchase — no competition"}
            href={linkedCompetition ? `/competitions/${linkedCompetition.id}` : null}
          />
        </div>
      </div>

      {/* Status overview: order / delivery / supplier response */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard icon={Package} label="Order status" value={po.status} className={cn(statusStyles[po.status].bg, statusStyles[po.status].text)} />
        <StatusCard
          icon={Truck}
          label="Delivery status"
          value={po.deliveryStatus}
          className={cn(deliveryStyles[po.deliveryStatus].bg, deliveryStyles[po.deliveryStatus].text)}
        />
        <StatusCard
          icon={ClipboardCheck}
          label="Supplier response"
          value={po.supplierResponse}
          className={cn(responseStyles[po.supplierResponse].bg, responseStyles[po.supplierResponse].text)}
        />
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Package className="size-4 text-primary" />
          Order progress
        </h3>
        <ol className="mt-5 flex flex-col gap-0 sm:flex-row sm:items-start">
          {po.timeline.map((event, i) => {
            const isLast = i === po.timeline.length - 1
            return (
              <li key={event.label} className="flex flex-1 gap-3 sm:flex-col sm:gap-2">
                <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-0">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      event.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {event.done ? <CheckCircle2 className="size-4" /> : <Hourglass className="size-3.5" />}
                  </span>
                  {!isLast && (
                    <span
                      className={cn(
                        "my-1 h-8 w-0.5 rounded-full sm:my-0 sm:h-0.5 sm:flex-1",
                        po.timeline[i + 1]?.done || event.done ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </div>
                <div className="pb-4 sm:pb-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      event.done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {event.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Two-column: line items + sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line items + totals */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border p-5">
              <ClipboardList className="size-4 text-primary" />
              <h3 className="font-semibold text-foreground">Line items</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {po.lines.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Product / Service</th>
                    <th className="px-5 py-3 text-right font-medium">Qty</th>
                    <th className="px-5 py-3 text-right font-medium">Unit price</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {po.lines.map((line) => (
                    <tr key={line.name}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{line.name}</p>
                        {line.description && (
                          <p className="text-xs text-muted-foreground">{line.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                        {line.qty} {line.unit}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                        {formatAmount(line.unitPrice)} {po.currency}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums text-foreground">
                        {formatAmount(orderLineTotal(line))} {po.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end border-t border-border bg-muted/30 p-5">
              <dl className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {formatAmount(subtotal)} {po.currency}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">VAT ({Math.round(VAT_RATE * 100)}%)</dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {formatAmount(Math.round(vat))} {po.currency}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <dt className="font-semibold text-foreground">Total</dt>
                  <dd className="text-lg font-bold tabular-nums text-foreground">
                    {formatAmount(Math.round(total))} {po.currency}
                  </dd>
                </div>
                <p className="pt-1 text-right text-xs text-muted-foreground">
                  Amounts in {po.currency}
                </p>
              </dl>
            </div>
          </div>

          {/* Documents */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border p-5">
              <FileText className="size-4 text-primary" />
              <h3 className="font-semibold text-foreground">Documents</h3>
            </div>
            <ul className="divide-y divide-border">
              {documents.map((doc) => {
                const Icon = docIcons[doc.kind]
                return (
                  <li key={doc.kind} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        doc.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                      {doc.meta && <p className="truncate text-xs text-muted-foreground">{doc.meta}</p>}
                    </div>
                    {doc.available ? (
                      <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                        <Download className="size-3.5" />
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unavailable</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {po.notes && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <StickyNote className="size-4 text-primary" />
                Notes
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{po.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar: supplier, delivery, owner, activity */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Building2 className="size-4 text-primary" />
              Supplier
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {initials(po.supplier.name)}
              </span>
              <div>
                <p className="font-semibold text-foreground">{po.supplier.name}</p>
                <p className="text-xs text-muted-foreground">{po.category}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <ContactRow icon={User} value={po.supplier.contact} />
              {po.supplier.email && <ContactRow icon={Mail} value={po.supplier.email} />}
              {po.supplier.phone && <ContactRow icon={Phone} value={po.supplier.phone} />}
              <ContactRow icon={MapPin} value={po.supplier.address} />
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Truck className="size-4 text-primary" />
              Delivery
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                      deliveryStyles[po.deliveryStatus].bg,
                      deliveryStyles[po.deliveryStatus].text,
                    )}
                  >
                    {po.deliveryStatus}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Expected delivery date</dt>
                <dd className="mt-0.5 font-medium text-foreground">{po.expectedDelivery}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Delivery address</dt>
                <dd className="mt-0.5 font-medium text-foreground">{po.deliveryAddress}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <User className="size-4 text-primary" />
              Order owner
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {initials(po.owner)}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{po.owner}</p>
                <p className="text-xs text-muted-foreground">Procurement</p>
              </div>
            </div>
          </div>

          {/* Activity history */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <History className="size-4 text-primary" />
              Activity history
            </h3>
            <ol className="mt-5 flex flex-col">
              {activity.map((entry, i) => {
                const last = i === activity.length - 1
                return (
                  <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                    {!last && (
                      <span
                        className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border"
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        entry.done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {entry.done ? <CheckCircle2 className="size-4" /> : <Hourglass className="size-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>

      <OrderPdfDialog open={pdfOpen} onOpenChange={setPdfOpen} po={po} />
      <SendSupplierDialog open={sendOpen} onOpenChange={setSendOpen} po={po} />
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof ShoppingCart
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span
        className={cn(
          "text-base font-bold tabular-nums",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}

function StatusCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Package
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span
        className={cn(
          "mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold",
          className,
        )}
      >
        {value}
      </span>
    </div>
  )
}

function ChainLink({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof FileText
  label: string
  value: string
  href: string | null
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          href ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "truncate font-mono text-sm font-semibold",
            href ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {value}
        </p>
      </div>
      {href && <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}
    </>
  )

  if (!href) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">{inner}</div>
    )
  }
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted"
    >
      {inner}
    </Link>
  )
}

function ContactRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-start gap-2 text-muted-foreground">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="text-foreground">{value}</span>
    </div>
  )
}
