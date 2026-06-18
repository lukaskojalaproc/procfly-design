"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  X,
  FileSignature,
  Hash,
  FileText,
  Building2,
  User,
  Tag,
  Coins,
  CircleDot,
  CalendarClock,
  RefreshCw,
  Receipt,
  Mail,
  Phone,
  MapPin,
  Paperclip,
} from "lucide-react"
import { formatAmount, requests } from "@/lib/dashboard-data"
import { competitions } from "@/lib/competitions-data"
import { purchaseOrders } from "@/lib/orders-data"
import { suppliers } from "@/lib/suppliers-data"
import {
  createContract,
  nextContractNumber,
  contractTypes,
  type ContractStatus,
  type RenewalType,
  type BillingFrequency,
  type ContractDocument,
} from "@/lib/contracts-data"

interface CreateContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUSES: ContractStatus[] = ["Draft", "Pending Approval", "Active", "Expiring Soon", "Expired", "Terminated"]
const RENEWALS: RenewalType[] = ["Manual Renew", "Auto Renew"]
const BILLING: BillingFrequency[] = ["Monthly", "Quarterly", "Annually", "One-time"]
const CURRENCIES = ["EUR", "USD", "GBP", "PLN"]
const PAYMENT_TERMS = ["Net 14", "Net 30", "Net 45", "Net 60", "On receipt"]

export function CreateContractDialog({ open, onOpenChange }: CreateContractDialogProps) {
  const router = useRouter()
  const owners = useMemo(() => Array.from(new Set(requests.map((r) => r.requester))).sort(), [])
  const supplierNames = useMemo(() => suppliers.map((s) => s.name).sort(), [])

  const [number, setNumber] = useState(nextContractNumber)
  const [name, setName] = useState("")
  const [status, setStatus] = useState<ContractStatus>("Draft")
  const [category, setCategory] = useState("Software")
  const [contractType, setContractType] = useState(contractTypes[0])
  const [owner, setOwner] = useState(owners[0] ?? "")

  const [supplierName, setSupplierName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  const [currency, setCurrency] = useState("EUR")
  const [value, setValue] = useState(0)
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>("Annually")
  const [paymentTerms, setPaymentTerms] = useState("Net 30")
  const [renewalType, setRenewalType] = useState<RenewalType>("Manual Renew")
  const [noticePeriodDays, setNoticePeriodDays] = useState(90)

  const [signatureDate, setSignatureDate] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [renewalDate, setRenewalDate] = useState("")

  const [requestRef, setRequestRef] = useState("")
  const [competitionRef, setCompetitionRef] = useState("")
  const [poRef, setPoRef] = useState("")

  const [documents, setDocuments] = useState<string[]>([])

  const canSubmit = name.trim().length > 0 && supplierName.trim().length > 0

  function onSupplierPick(value: string) {
    setSupplierName(value)
    const match = suppliers.find((s) => s.name === value)
    if (match) {
      setContact(match.contact.name)
      setEmail(match.contact.email)
      setPhone(match.contact.phone)
      setAddress(match.banking.bank ? `${match.country}` : match.country)
      setPaymentTerms(match.banking.paymentTerms)
      setCurrency(match.banking.currency)
    }
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
    const docs: ContractDocument[] = documents.map((d) => ({ kind: "signed", name: d, available: true }))
    const contract = createContract({
      number,
      name: name.trim(),
      status,
      category,
      contractType,
      owner,
      supplier: { name: supplierName.trim(), contact, email, phone, address },
      currency,
      value,
      signatureDate,
      startDate,
      endDate,
      renewalDate,
      noticePeriodDays,
      renewalType,
      billingFrequency,
      paymentTerms,
      requestRef: requestRef || undefined,
      competitionRef: competitionRef || undefined,
      poRef: poRef || undefined,
      documents: docs,
    })
    onOpenChange(false)
    router.push(`/contracts/${contract.id}`)
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
              <FileSignature className="size-4" />
            </span>
            New contract
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
          <Section title="Contract">
            <Field label="Contract number" icon={Hash}>
              <input value={number} onChange={(e) => setNumber(e.target.value)} className="po-input font-mono" />
            </Field>
            <Field label="Status" icon={CircleDot}>
              <select value={status} onChange={(e) => setStatus(e.target.value as ContractStatus)} className="po-input">
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Contract name" icon={FileText} required>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Enterprise ERP platform license — 3 year term" className="po-input" />
              </Field>
            </div>
            <Field label="Category" icon={Tag}>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Software" className="po-input" />
            </Field>
            <Field label="Contract type" icon={Tag}>
              <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="po-input">
                {contractTypes.map((t) => (
                  <option key={t}>{t}</option>
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

          <Section title="Supplier">
            <Field label="Supplier" icon={Building2} required>
              <input value={supplierName} onChange={(e) => onSupplierPick(e.target.value)} list="contract-suppliers" placeholder="Supplier name" className="po-input" />
              <datalist id="contract-suppliers">
                {supplierNames.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="Contact" icon={User}>
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact name" className="po-input" />
            </Field>
            <Field label="Email" icon={Mail}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contracts@supplier.com" className="po-input" />
            </Field>
            <Field label="Phone" icon={Phone}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+370 ..." className="po-input" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" icon={MapPin}>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Supplier address" className="po-input" />
              </Field>
            </div>
          </Section>

          <Section title="Commercial terms">
            <Field label="Contract value" icon={Coins} required>
              <input type="number" min={0} step="0.01" value={value} onChange={(e) => setValue(Number(e.target.value))} className="po-input text-right" />
            </Field>
            <Field label="Currency" icon={Coins}>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="po-input">
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Billing frequency" icon={Receipt}>
              <select value={billingFrequency} onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)} className="po-input">
                {BILLING.map((b) => (
                  <option key={b}>{b}</option>
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
            <Field label="Renewal type" icon={RefreshCw}>
              <select value={renewalType} onChange={(e) => setRenewalType(e.target.value as RenewalType)} className="po-input">
                {RENEWALS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Notice period (days)" icon={CalendarClock}>
              <input type="number" min={0} value={noticePeriodDays} onChange={(e) => setNoticePeriodDays(Number(e.target.value))} className="po-input" />
            </Field>
          </Section>

          <Section title="Dates">
            <Field label="Signature date" icon={CalendarClock}>
              <input type="date" value={signatureDate} onChange={(e) => setSignatureDate(e.target.value)} className="po-input" />
            </Field>
            <Field label="Start date" icon={CalendarClock}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="po-input" />
            </Field>
            <Field label="End date" icon={CalendarClock}>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="po-input" />
            </Field>
            <Field label="Renewal date" icon={CalendarClock}>
              <input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} className="po-input" />
            </Field>
          </Section>

          <Section title="Linked records">
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
              <select value={competitionRef} onChange={(e) => setCompetitionRef(e.target.value)} className="po-input">
                <option value="">None</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.ref}>
                    {c.ref} — {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Linked purchase order" icon={FileText}>
              <select value={poRef} onChange={(e) => setPoRef(e.target.value)} className="po-input">
                <option value="">None</option>
                {purchaseOrders.map((p) => (
                  <option key={p.id} value={p.number}>
                    {p.number} — {p.supplier.name}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Documents</h3>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-4 text-sm text-muted-foreground transition-colors hover:bg-muted/60">
              <Paperclip className="size-4" />
              Attach documents (signed contract, annexes, NDA)
              <input type="file" multiple className="hidden" onChange={(e) => onAddDocuments(e.target.files)} />
            </label>
            {documents.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {documents.map((doc, i) => (
                  <li key={`${doc}-${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-foreground">{doc}</span>
                    </span>
                    <button onClick={() => removeDocument(i)} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted" aria-label="Remove document">
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            {value > 0 && <span className="font-medium text-foreground">{formatAmount(value)} {currency} · </span>}
            {canSubmit ? "Ready to create." : "Add a contract name and supplier."}
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
              <FileSignature className="size-4" />
              Create contract
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
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
