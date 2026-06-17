"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send, X, Mail, Paperclip, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/dashboard-data"
import { orderTotal, type PurchaseOrder } from "@/lib/orders-data"

interface SendSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  po: PurchaseOrder
}

const VAT_RATE = 0.21

export function SendSupplierDialog({ open, onOpenChange, po }: SendSupplierDialogProps) {
  const total = Math.round(orderTotal(po) * (1 + VAT_RATE))
  const defaultSubject = `Purchase Order ${po.number} — ${po.lines[0]?.name ?? "Order"}`
  const [subject, setSubject] = useState(defaultSubject)
  const [editing, setEditing] = useState(false)

  const firstName = po.supplier.contact.split(" ")[0] || po.supplier.name

  const bodyText = useMemo(
    () =>
      [
        `Dear ${firstName},`,
        ``,
        `Please find below Purchase Order ${po.number} issued by ProcFly Demo Workspace.`,
        ``,
        `Order summary:`,
        ...po.lines.map((l) => `  • ${l.name} — ${l.qty} ${l.unit} @ ${formatAmount(l.unitPrice)} ${po.currency}`),
        ``,
        `Total (incl. VAT): ${formatAmount(total)} ${po.currency}`,
        `Payment terms: ${po.paymentTerms}`,
        `Requested delivery: ${po.deliveryDate}`,
        ``,
        `The full purchase order is attached as a PDF. Please confirm acceptance at your earliest convenience.`,
        ``,
        `Kind regards,`,
        po.owner,
        `Procurement · ProcFly`,
      ].join("\n"),
    [firstName, po, total],
  )

  function handleSend() {
    const mailto = `mailto:${encodeURIComponent(po.supplier.email)}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyText)}`
    window.location.href = mailto
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0" showCloseButton={false}>
        <DialogHeader className="flex-row items-center justify-between border-b border-border p-5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-4" />
            </span>
            Send to supplier
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        {/* Email preview */}
        <div className="max-h-[64vh] overflow-y-auto bg-muted/30 p-5">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Envelope meta */}
            <div className="space-y-2 border-b border-border p-4 text-sm">
              <MetaRow label="To">
                <span className="font-medium text-foreground">{po.supplier.name}</span>
                <span className="text-muted-foreground"> · {po.supplier.email}</span>
              </MetaRow>
              <MetaRow label="From">
                <span className="text-foreground">procurement@procfly.com</span>
              </MetaRow>
              <MetaRow label="Subject">
                {editing ? (
                  <input
                    autoFocus
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onBlur={() => setEditing(false)}
                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="group inline-flex items-center gap-1.5 text-left font-medium text-foreground"
                  >
                    {subject}
                    <Pencil className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )}
              </MetaRow>
            </div>

            {/* Body */}
            <div className="space-y-4 p-6">
              <p className="text-sm text-foreground">
                Dear <span className="font-medium">{firstName}</span>,
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Please find below Purchase Order{" "}
                <span className="font-mono font-medium text-foreground">{po.number}</span> issued by ProcFly Demo
                Workspace.
              </p>

              {/* Order card inside the email */}
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="flex items-center justify-between bg-primary px-4 py-3">
                  <span className="text-sm font-semibold text-primary-foreground">{po.number}</span>
                  <span className="text-sm font-bold text-primary-foreground">
                    {formatAmount(total)} {po.currency}
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {po.lines.map((l) => (
                    <li key={l.name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-foreground">{l.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {l.qty} {l.unit}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-px bg-border text-xs">
                  <CardFact label="Payment terms" value={po.paymentTerms} />
                  <CardFact label="Delivery" value={po.deliveryDate} />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2.5">
                <Paperclip className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{po.number}.pdf</span>
                <span className="text-xs text-muted-foreground">· attached</span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Please confirm acceptance at your earliest convenience.
              </p>
              <div className="text-sm text-foreground">
                <p>Kind regards,</p>
                <p className="font-medium">{po.owner}</p>
                <p className="text-xs text-muted-foreground">Procurement · ProcFly</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Opens in your email app, prefilled and ready to send.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Send className="size-4" />
              Open in email
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words">{children}</span>
    </div>
  )
}

function CardFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-medium text-foreground")}>{value}</p>
    </div>
  )
}
