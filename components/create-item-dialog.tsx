"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  X,
  Package,
  Hash,
  Tag,
  FileText,
  Boxes,
  AlertTriangle,
  RefreshCw,
  Ruler,
  Warehouse as WarehouseIcon,
  Building2,
  Users,
  MapPin,
  Network,
  ShoppingCart,
  CircleDollarSign,
  User,
} from "lucide-react"
import {
  createItem,
  itemCategories,
  itemLocations,
  itemOwners,
  itemSuppliers,
  itemUnits,
} from "@/lib/warehouse-data"

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CURRENCIES = ["EUR", "USD", "GBP", "PLN"]

export function CreateItemDialog({ open, onOpenChange }: CreateItemDialogProps) {
  const router = useRouter()
  const owners = useMemo(() => itemOwners, [])

  const [code, setCode] = useState("")
  const [sku, setSku] = useState("")
  const [name, setName] = useState("")
  const [category, setCategory] = useState(itemCategories[0] ?? "Hardware")
  const [description, setDescription] = useState("")

  const [quantity, setQuantity] = useState("0")
  const [minQuantity, setMinQuantity] = useState("0")
  const [reorderPoint, setReorderPoint] = useState("0")
  const [unit, setUnit] = useState("pcs")

  const [warehouse, setWarehouse] = useState(itemLocations[0] ?? "Central Warehouse")
  const [office, setOffice] = useState("Vilnius HQ")
  const [department, setDepartment] = useState("IT Department")
  const [bin, setBin] = useState("")

  const [supplierName, setSupplierName] = useState("")
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("")
  const [unitCost, setUnitCost] = useState("0")
  const [currency, setCurrency] = useState("EUR")
  const [owner, setOwner] = useState(owners[0] ?? "IT Department")

  const canSubmit = name.trim().length > 0

  function handleCreate() {
    if (!canSubmit) return
    const item = createItem({
      code,
      sku,
      name,
      category,
      description,
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      reorderPoint: Number(reorderPoint) || 0,
      unit,
      location: { warehouse, office, department, bin },
      supplierName,
      purchaseOrderNumber,
      unitCost: Number(unitCost) || 0,
      currency,
      owner,
    })
    onOpenChange(false)
    router.push(`/warehouse/${item.id}`)
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
              <Package className="size-4" />
            </span>
            New inventory item
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
          <Section title="Item">
            <Field label="Item name" icon={Package} required>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. iPhone 15 — 128GB Blue" className="po-input" />
            </Field>
            <Field label="Item code" icon={Hash}>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. IPH-003" className="po-input font-mono" />
            </Field>
            <Field label="SKU" icon={Hash}>
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. APPL-IP15-128-BLU" className="po-input font-mono" />
            </Field>
            <Field label="Category" icon={Tag}>
              <input value={category} onChange={(e) => setCategory(e.target.value)} list="item-categories" className="po-input" />
              <datalist id="item-categories">
                {itemCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" icon={FileText}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the item"
                  rows={2}
                  className="po-input resize-none"
                />
              </Field>
            </div>
          </Section>

          <Section title="Stock levels">
            <Field label="Quantity on hand" icon={Boxes}>
              <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="po-input" />
            </Field>
            <Field label="Minimum quantity" icon={AlertTriangle}>
              <input type="number" min="0" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} className="po-input" />
            </Field>
            <Field label="Reorder point" icon={RefreshCw}>
              <input type="number" min="0" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} className="po-input" />
            </Field>
            <Field label="Unit" icon={Ruler}>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="po-input">
                {itemUnits.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Location">
            <Field label="Warehouse" icon={WarehouseIcon}>
              <input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} list="item-warehouses" className="po-input" />
              <datalist id="item-warehouses">
                {itemLocations.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </Field>
            <Field label="Office / site" icon={Building2}>
              <input value={office} onChange={(e) => setOffice(e.target.value)} placeholder="e.g. Vilnius HQ" className="po-input" />
            </Field>
            <Field label="Department" icon={Users}>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. IT Department" className="po-input" />
            </Field>
            <Field label="Bin / shelf" icon={MapPin}>
              <input value={bin} onChange={(e) => setBin(e.target.value)} placeholder="e.g. A-12-3" className="po-input font-mono" />
            </Field>
          </Section>

          <Section title="Supplier & cost">
            <Field label="Supplier" icon={Network}>
              <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} list="item-suppliers" placeholder="Supplier name" className="po-input" />
              <datalist id="item-suppliers">
                {itemSuppliers.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="Linked purchase order" icon={ShoppingCart}>
              <input value={purchaseOrderNumber} onChange={(e) => setPurchaseOrderNumber(e.target.value)} placeholder="e.g. PRC-2026-000101" className="po-input font-mono" />
            </Field>
            <Field label="Unit cost" icon={CircleDollarSign}>
              <input type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className="po-input" />
            </Field>
            <Field label="Currency" icon={CircleDollarSign}>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="po-input">
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Owner" icon={User}>
              <select value={owner} onChange={(e) => setOwner(e.target.value)} className="po-input">
                {owners.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </Section>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            {canSubmit ? "Ready to add to inventory." : "Enter an item name to continue."}
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
              <Package className="size-4" />
              Add item
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
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
