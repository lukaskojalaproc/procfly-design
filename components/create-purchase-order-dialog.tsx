"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  X,
  ShoppingCart,
  Plus,
  Trash2,
  FileText,
  Paperclip,
  Hash,
  Building2,
  User,
  CalendarClock,
  MapPin,
  Coins,
  CircleDot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount, requests } from "@/lib/dashboard-data"
import { competitions } from "@/lib/competitions-data"
import {
  createPurchaseOrder,
  nextOrderNumber,
  knownSuppliers,
  orderLineTotal,
  type OrderLine,
  type OrderStatus,
} from "@/lib/orders-data"

interface CreatePurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUSES: OrderStatus[] = [
  "Draft",
  "Sent",
  "Awaiting Delivery",
  "Partially Delivered",
  "Delivered",
  "Closed",
  "Cancelled",
]
const CURRENCIES = ["EUR", "USD", "GBP", "PLN"]
const UNITS = ["pcs", "lot", "units", "licenses", "hours", "months", "kg", "set"]

const emptyLine: OrderLine = { name: "", qty: 1, unit: "pcs", unitPrice: 0 }

export function CreatePurchaseOrderDialog({ open, onOpenChange }: CreatePurchaseOrderDialogProps) {
  const router = useRouter()
  const owners = useMemo(() => Array.from(new Set(requests.map((r) => r.requester))).sort(), [])
  const suppliers = useMemo(() => knownSuppliers(), [])

  const [number, setNumber] = useState(nextOrderNumber)
  const [supplier, setSupplier] = useState("")
  const [owner, setOwner] = useState(owners[0] ?? "")
  const [requestRef, setRequestRef] = useState("")
  const [competitionRef, setCompetitionRef] = useState("")
  const [expectedDelivery, setExpectedDelivery] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("ProcFly HQ — Receiving Dock, Vilnius")
  const [currency, setCurrency] = useState("EUR")
  const [status, setStatus] = useState<OrderStatus>("Draft")
  const [lines, setLines] = useState<OrderLine[]>([{ ...emptyLine }])
  const [documents, setDocuments] = useState<string[]>([])

  const total = lines.reduce((sum, l) => sum + orderLineTotal(l), 0)
  const canSubmit = supplier.trim().length > 0 && lines.some((l) => l.name.trim().length > 0)

  function updateLine(index: number, patch: Partial<OrderLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }
  function addLine() {
    setLines((prev) => [...prev, { ...emptyLine }])
  }
  function removeLine(index: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  function onAddDocuments(files: FileList | null) {
    if (!files?.length) return
    setDocuments((prev) => [...prev, ...Array.from(files).map((f) => f.name)])
  }
  function removeDocument(index: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  function handleCreate() {
    if (!canSubmit) return
    const po = createPurchaseOrder({
      number,
      supplierName: supplier.trim(),
      owner,
      requestRef: requestRef || undefined,
      competitionRef: competitionRef || undefined,
      expectedDelivery,
      deliveryAddress,
      currency,
      status,
      lines: lines.filter((l) => l.name.trim().length > 0),
      documents,
    })
    onOpenChange(false)
    router.push(`/orders/${po.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between border-b border-border p-5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="size-4" />
            </span>
            Create purchase order
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        <div className="max-h-[78vh] overflow-y-auto p-6">
          {/* Details grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="PO number" icon={Hash}>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="po-input font-mono"
              />
            </Field>
            <Field label="Status" icon={CircleDot}>
              <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="po-input">
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Supplier" icon={Building2} required>
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Supplier name"
                list="known-suppliers"
                className="po-input"
              />
              <datalist id="known-suppliers">
                {suppliers.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="Owner" icon={User}>
              <select value={owner} onChange={(e) => setOwner(e.target.value)} className="po-input">
                {owners.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>

            <Field label="Linked request" icon={FileText}>
              <select value={requestRef} onChange={(e) => setRequestRef(e.target.value)} className="po-input">
                <option value="">None</option>
                {requests.map((r) => (
                  <option key={r.id} value={r.ref}>
                    {r.ref} — {r.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Linked competition" icon={FileText}>
              <select
                value={competitionRef}
                onChange={(e) => setCompetitionRef(e.target.value)}
                className="po-input"
              >
                <option value="">None</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.ref}>
                    {c.ref} — {c.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Expected delivery date" icon={CalendarClock}>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="po-input"
              />
            </Field>
            <Field label="Currency" icon={Coins}>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="po-input">
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Delivery address" icon={MapPin}>
                <input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Where should this order be delivered?"
                  className="po-input"
                />
              </Field>
            </div>
          </div>

          {/* Line items */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Line items</h3>
              <button
                onClick={addLine}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="size-3.5" />
                Add line
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <div className="hidden grid-cols-[1fr_70px_90px_110px_110px_36px] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span>Unit</span>
                <span className="text-right">Unit price</span>
                <span className="text-right">Total</span>
                <span className="sr-only">Remove</span>
              </div>
              <ul className="divide-y divide-border">
                {lines.map((line, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-[1fr_70px_90px_110px_110px_36px] sm:items-center"
                  >
                    <input
                      value={line.name}
                      onChange={(e) => updateLine(i, { name: e.target.value })}
                      placeholder="Item name"
                      className="po-input col-span-2 sm:col-span-1"
                    />
                    <input
                      type="number"
                      min={0}
                      value={line.qty}
                      onChange={(e) => updateLine(i, { qty: Number(e.target.value) })}
                      className="po-input text-right"
                    />
                    <select
                      value={line.unit}
                      onChange={(e) => updateLine(i, { unit: e.target.value })}
                      className="po-input"
                    >
                      {UNITS.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                      className="po-input text-right"
                    />
                    <span className="text-right text-sm font-medium tabular-nums text-foreground">
                      {formatAmount(orderLineTotal(line))}
                    </span>
                    <button
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                      className="justify-self-end rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Remove line"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Total amount</span>
                <span className="text-base font-bold tabular-nums text-foreground">
                  {formatAmount(total)} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">Documents</h3>
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-4 text-sm text-muted-foreground transition-colors hover:bg-muted/60">
              <Paperclip className="size-4" />
              Attach documents (quotes, specs, contracts)
              <input type="file" multiple className="hidden" onChange={(e) => onAddDocuments(e.target.files)} />
            </label>
            {documents.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {documents.map((doc, i) => (
                  <li
                    key={`${doc}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-foreground">{doc}</span>
                    </span>
                    <button
                      onClick={() => removeDocument(i)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
                      aria-label="Remove document"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            {canSubmit ? "Ready to create." : "Add a supplier and at least one line item."}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="size-4" />
              Create purchase order
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string
  icon: typeof Hash
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  )
}
