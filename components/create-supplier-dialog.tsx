"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  X,
  Network,
  Building2,
  Hash,
  User,
  Globe,
  MapPin,
  Tag,
  ShieldAlert,
  CircleDot,
  Star,
  Mail,
  Phone,
  Landmark,
  Receipt,
} from "lucide-react"
import {
  createSupplier,
  supplierCategories,
  supplierCountries,
  supplierOwners,
  supplierTypes,
  type SupplierStatus,
  type SupplierType,
  type RiskStatus,
} from "@/lib/suppliers-data"

interface CreateSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUSES: SupplierStatus[] = ["Pending", "Active", "Preferred", "Blocked", "Archived"]
const RISKS: RiskStatus[] = ["Low Risk", "Medium Risk", "High Risk"]
const CURRENCIES = ["EUR", "USD", "GBP", "PLN"]
const PAYMENT_TERMS = ["Net 14", "Net 30", "Net 45", "Net 60", "On receipt"]

export function CreateSupplierDialog({ open, onOpenChange }: CreateSupplierDialogProps) {
  const router = useRouter()
  const owners = useMemo(() => supplierOwners, [])

  const [name, setName] = useState("")
  const [legalName, setLegalName] = useState("")
  const [status, setStatus] = useState<SupplierStatus>("Pending")
  const [type, setType] = useState<SupplierType>("Product Supplier")
  const [category, setCategory] = useState(supplierCategories[0] ?? "")
  const [country, setCountry] = useState(supplierCountries[0] ?? "Lithuania")
  const [risk, setRisk] = useState<RiskStatus>("Low Risk")
  const [owner, setOwner] = useState(owners[0] ?? "")
  const [website, setWebsite] = useState("")
  const [preferred, setPreferred] = useState(false)

  const [contactName, setContactName] = useState("")
  const [contactRole, setContactRole] = useState("Account Manager")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const [iban, setIban] = useState("")
  const [bank, setBank] = useState("")
  const [swift, setSwift] = useState("")
  const [bankCurrency, setBankCurrency] = useState("EUR")
  const [paymentTerms, setPaymentTerms] = useState("Net 30")

  const [vatNumber, setVatNumber] = useState("")
  const [regNumber, setRegNumber] = useState("")

  const canSubmit = name.trim().length > 0

  function handleCreate() {
    if (!canSubmit) return
    const supplier = createSupplier({
      name,
      legalName,
      status,
      type,
      category,
      country,
      risk,
      owner,
      website,
      preferred,
      contact: { name: contactName, email: contactEmail, phone: contactPhone, role: contactRole },
      banking: { iban, bank, swift, currency: bankCurrency, paymentTerms },
      tax: {
        vatNumber,
        registrationNumber: regNumber,
        vatTreatment: "Standard VAT",
        vatVerificationStatus: vatNumber ? "Pending" : "Not provided",
      },
    })
    onOpenChange(false)
    router.push(`/suppliers/${supplier.id}`)
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
              <Network className="size-4" />
            </span>
            New supplier
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
          <Section title="Company">
            <Field label="Supplier name" icon={Building2} required>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ideal Baltics" className="po-input" />
            </Field>
            <Field label="Legal name" icon={Building2}>
              <input value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="e.g. Ideal Baltics UAB" className="po-input" />
            </Field>
            <Field label="Status" icon={CircleDot}>
              <select value={status} onChange={(e) => setStatus(e.target.value as SupplierStatus)} className="po-input">
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Supplier type" icon={Tag}>
              <select value={type} onChange={(e) => setType(e.target.value as SupplierType)} className="po-input">
                {supplierTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Category" icon={Tag}>
              <input value={category} onChange={(e) => setCategory(e.target.value)} list="supplier-categories" className="po-input" />
              <datalist id="supplier-categories">
                {supplierCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Country" icon={MapPin}>
              <input value={country} onChange={(e) => setCountry(e.target.value)} list="supplier-countries" className="po-input" />
              <datalist id="supplier-countries">
                {supplierCountries.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Risk status" icon={ShieldAlert}>
              <select value={risk} onChange={(e) => setRisk(e.target.value as RiskStatus)} className="po-input">
                {RISKS.map((r) => (
                  <option key={r}>{r}</option>
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
            <Field label="Website" icon={Globe}>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="example.com" className="po-input" />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground">
              <input type="checkbox" checked={preferred} onChange={(e) => setPreferred(e.target.checked)} className="size-4 accent-primary" />
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 text-primary" />
                Mark as preferred partner
              </span>
            </label>
          </Section>

          <Section title="Primary contact">
            <Field label="Contact name" icon={User}>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name" className="po-input" />
            </Field>
            <Field label="Role" icon={User}>
              <input value={contactRole} onChange={(e) => setContactRole(e.target.value)} placeholder="e.g. Account Manager" className="po-input" />
            </Field>
            <Field label="Email" icon={Mail}>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="name@supplier.com" className="po-input" />
            </Field>
            <Field label="Phone" icon={Phone}>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+370 ..." className="po-input" />
            </Field>
          </Section>

          <Section title="Banking">
            <Field label="IBAN" icon={Landmark}>
              <input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="LT.." className="po-input font-mono" />
            </Field>
            <Field label="Bank" icon={Landmark}>
              <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Bank name" className="po-input" />
            </Field>
            <Field label="SWIFT / BIC" icon={Hash}>
              <input value={swift} onChange={(e) => setSwift(e.target.value)} placeholder="XXXXLT2X" className="po-input font-mono" />
            </Field>
            <Field label="Currency" icon={CircleDot}>
              <select value={bankCurrency} onChange={(e) => setBankCurrency(e.target.value)} className="po-input">
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Payment terms" icon={Receipt}>
              <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="po-input">
                {PAYMENT_TERMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Tax">
            <Field label="VAT number" icon={Receipt}>
              <input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="LT.." className="po-input font-mono" />
            </Field>
            <Field label="Registration number" icon={Hash}>
              <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder="3021.." className="po-input font-mono" />
            </Field>
          </Section>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            {canSubmit ? "Ready to create." : "Enter a supplier name to continue."}
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
              <Network className="size-4" />
              Create supplier
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
