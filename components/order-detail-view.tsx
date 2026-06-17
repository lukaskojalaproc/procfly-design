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
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatAmount, initials } from "@/lib/dashboard-data"
import {
  orderLineTotal,
  orderTotal,
  type OrderStatus,
  type PurchaseOrder,
} from "@/lib/orders-data"
import { OrderPdfDialog } from "@/components/order-pdf-dialog"
import { SendSupplierDialog } from "@/components/send-supplier-dialog"

const VAT_RATE = 0.21

const statusStyles: Record<OrderStatus, { text: string; bg: string; ring: string; dot: string }> = {
  Draft: { text: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", dot: "bg-muted-foreground" },
  Sent: { text: "text-chart-3", bg: "bg-chart-3/10", ring: "ring-chart-3/30", dot: "bg-chart-3" },
  Completed: { text: "text-primary", bg: "bg-primary/10", ring: "ring-primary/30", dot: "bg-primary" },
  Cancelled: { text: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30", dot: "bg-destructive" },
}

export function OrderDetailView({ po }: { po: PurchaseOrder }) {
  const subtotal = orderTotal(po)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat
  const s = statusStyles[po.status]
  const [pdfOpen, setPdfOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)

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
              <div className="flex items-center gap-2">
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
                Issued to <span className="font-medium text-foreground">{po.supplier.name}</span>
                {po.sourceRef && (
                  <>
                    {" · from "}
                    <span className="font-mono text-foreground">{po.sourceRef}</span>
                  </>
                )}
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
          <Fact icon={Truck} label="Delivery date" value={po.deliveryDate} />
          <Fact icon={CreditCard} label="Payment terms" value={po.paymentTerms} />
          <Fact icon={ShoppingCart} label="Order total" value={`${formatAmount(Math.round(total))} ${po.currency}`} accent />
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Package className="size-4 text-primary" />
          Order status
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
              <ListIcon />
              <h3 className="font-semibold text-foreground">Line items</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {po.lines.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Item</th>
                    <th className="px-5 py-3 text-right font-medium">Qty</th>
                    <th className="px-5 py-3 text-right font-medium">Unit price</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
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
              </dl>
            </div>
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

        {/* Sidebar: supplier, delivery, owner */}
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
              <ContactRow icon={Mail} value={po.supplier.email} />
              <ContactRow icon={Phone} value={po.supplier.phone} />
              <ContactRow icon={MapPin} value={po.supplier.address} />
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Truck className="size-4 text-primary" />
              Delivery
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Expected date</dt>
                <dd className="mt-0.5 font-medium text-foreground">{po.deliveryDate}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Ship to</dt>
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

function ContactRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-start gap-2 text-muted-foreground">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function ListIcon() {
  return <ShoppingCart className="size-4 text-primary" />
}
