"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  Briefcase,
  Monitor,
  UserPlus,
  FileText,
  ClipboardCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Settings2,
  ListChecks,
  Trash2,
  UploadCloud,
  FileCheck2,
  ShieldCheck,
  Receipt,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CategoryId = "product" | "service" | "software" | "supplier"

const categories: {
  id: CategoryId
  title: string
  subtitle: string
  icon: typeof Package
  iconClass: string
}[] = [
  {
    id: "product",
    title: "Buy Product",
    subtitle: "Physical goods or hardware",
    icon: Package,
    iconClass: "bg-primary/12 text-primary",
  },
  {
    id: "service",
    title: "Buy Service",
    subtitle: "Consulting or service",
    icon: Briefcase,
    iconClass: "bg-chart-3/12 text-chart-3",
  },
  {
    id: "software",
    title: "Buy Software",
    subtitle: "SaaS or License",
    icon: Monitor,
    iconClass: "bg-chart-2/15 text-chart-2",
  },
  {
    id: "supplier",
    title: "Add New Supplier",
    subtitle: "Onboard a new vendor",
    icon: UserPlus,
    iconClass: "bg-destructive/12 text-destructive",
  },
]

const steps = [
  { id: "category", label: "Category", icon: Package },
  { id: "details", label: "Details", icon: FileText },
  { id: "documents", label: "Documents", icon: UploadCloud },
  { id: "review", label: "Review", icon: ClipboardCheck },
] as const

const departments = ["IT", "Operations", "Marketing", "Finance", "Facilities", "Legal"]
const costCenters = ["CC-100 · Headquarters", "CC-200 · Sales", "CC-300 · R&D", "CC-400 · Logistics"]
const suppliers = ["ProcFly Logistics", "Office Supplies Baltics", "TechWare Solutions", "Nordic Consulting"]
const priorities = ["Low", "Medium", "High", "Critical"]
const regions = ["EMEA", "North America", "APAC", "LATAM", "Baltics"]

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"

interface LineItem {
  id: number
  name: string
  qty: string
  price: string
}

interface DocSlot {
  id: string
  label: string
  hint: string
  required: boolean
}

// Document checklist per category. Most supplier data (registration no., VAT,
// bank details) is entered as fields and verified automatically, so we only
// ask to upload what can't be validated digitally.
const supplierDocs: DocSlot[] = [
  { id: "bank", label: "Bank confirmation letter", hint: "Bank-issued letter or statement confirming the IBAN holder (anti-fraud)", required: true },
  { id: "insurance", label: "Insurance certificate", hint: "Liability or professional indemnity, if applicable", required: false },
  { id: "compliance", label: "Signed Code of Conduct / NDA", hint: "Anti-bribery or confidentiality agreement", required: false },
]

const purchaseDocs: DocSlot[] = [
  { id: "quote", label: "Supplier quote / proforma", hint: "Itemized quote or proforma invoice", required: true },
  { id: "spec", label: "Specification / scope", hint: "Product spec sheet or statement of work", required: false },
  { id: "approval", label: "Pre-approval / budget proof", hint: "Email or document approving the spend", required: false },
]

const euCountries = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
]

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const Icon = step.icon
        const done = i < current
        const active = i === current
        return (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold transition-colors",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={cn(
                    "h-full rounded-full bg-primary transition-all duration-300",
                    done ? "w-full" : "w-0",
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Section({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  children,
}: {
  icon: typeof Package
  iconClass: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function NewRequestDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState<CategoryId | null>(null)

  // General
  const [department, setDepartment] = useState("")
  const [costCenter, setCostCenter] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("EUR")

  // Specific — product
  const [supplier, setSupplier] = useState("")
  const [neededBy, setNeededBy] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")

  // Specific — service
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [contractRequired, setContractRequired] = useState("No")

  // Custom — product
  const [productName, setProductName] = useState("")
  const [priority, setPriority] = useState("Medium")

  // Custom — service
  const [requestName, setRequestName] = useState("")
  const [region, setRegion] = useState("")
  const [businessOwner, setBusinessOwner] = useState("")

  // Specific — software (SaaS / license)
  const [softwareName, setSoftwareName] = useState("")
  const [licenseType, setLicenseType] = useState("SaaS subscription")
  const [numberOfUsers, setNumberOfUsers] = useState("")
  const [billingCycle, setBillingCycle] = useState("Annual")
  const [subscriptionStart, setSubscriptionStart] = useState("")
  const [renewalType, setRenewalType] = useState("Auto-renew")
  const [renewalDate, setRenewalDate] = useState("")
  // Software — compliance (EU / GDPR)
  const [dataProcessing, setDataProcessing] = useState("No personal data")
  const [hostingRegion, setHostingRegion] = useState("EU / EEA")
  const [dpaRequired, setDpaRequired] = useState("Yes")
  const [softwareOwner, setSoftwareOwner] = useState("")

  // Specific — supplier onboarding
  const [supplierName, setSupplierName] = useState("")
  const [country, setCountry] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  // Bank & payment
  const [accountHolder, setAccountHolder] = useState("")
  const [iban, setIban] = useState("")
  const [bic, setBic] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("Net 30")
  // Tax & accounting
  const [vatTreatment, setVatTreatment] = useState("Standard")
  const [supplierType, setSupplierType] = useState("Goods")
  const [taxRate, setTaxRate] = useState("21%")
  const [invoicingEmail, setInvoicingEmail] = useState("")

  // Line items
  const [lines, setLines] = useState<LineItem[]>([{ id: 1, name: "", qty: "", price: "" }])

  // Documents — maps document slot id to an uploaded file name
  const [docs, setDocs] = useState<Record<string, string>>({})
  const [extraDocs, setExtraDocs] = useState<string[]>([])

  const selectedCategory = categories.find((c) => c.id === category)
  const isService = category === "service"
  const isSupplier = category === "supplier"
  const isSoftware = category === "software"

  const docSlots = isSupplier ? supplierDocs : purchaseDocs
  const requiredDocsMissing = docSlots.some((d) => d.required && !docs[d.id])
  const uploadedDocCount = Object.keys(docs).length + extraDocs.length

  const filledLines = lines.filter((l) => l.name.trim() !== "")
  const lineItemsTotal = filledLines.reduce(
    (sum, l) => sum + (Number(l.qty) || 0) * (Number(l.price) || 0),
    0,
  )
  const reviewTotal = Number(amount) || lineItemsTotal
  const fmt = (n: number) => n.toLocaleString("en-US")

  function reset() {
    setStep(0)
    setCategory(null)
    setDepartment("")
    setCostCenter("")
    setDescription("")
    setAmount("")
    setCurrency("EUR")
    setSupplier("")
    setNeededBy("")
    setDeliveryAddress("")
    setStartDate("")
    setEndDate("")
    setContractRequired("No")
    setProductName("")
    setPriority("Medium")
    setRequestName("")
    setRegion("")
    setBusinessOwner("")
    setSoftwareName("")
    setLicenseType("SaaS subscription")
    setNumberOfUsers("")
    setBillingCycle("Annual")
    setSubscriptionStart("")
    setRenewalType("Auto-renew")
    setRenewalDate("")
    setDataProcessing("No personal data")
    setHostingRegion("EU / EEA")
    setDpaRequired("Yes")
    setSoftwareOwner("")
    setSupplierName("")
    setCountry("")
    setVatNumber("")
    setContactEmail("")
    setRegistrationNumber("")
    setAccountHolder("")
    setIban("")
    setBic("")
    setPaymentTerms("Net 30")
    setVatTreatment("Standard")
    setSupplierType("Goods")
    setTaxRate("21%")
    setInvoicingEmail("")
    setLines([{ id: 1, name: "", qty: "", price: "" }])
    setDocs({})
    setExtraDocs([])
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setTimeout(reset, 200)
  }

  function selectDoc(slotId: string, name: string) {
    setDocs((prev) => ({ ...prev, [slotId]: name }))
  }
  function clearDoc(slotId: string) {
    setDocs((prev) => {
      const copy = { ...prev }
      delete copy[slotId]
      return copy
    })
  }

  function updateLine(id: number, key: keyof LineItem, value: string) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)))
  }
  function addLine() {
    setLines((prev) => [...prev, { id: Date.now(), name: "", qty: "", price: "" }])
  }
  function removeLine(id: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev))
  }

  const canContinue =
    (step === 0 && category !== null) ||
    (step === 1 &&
      department.trim() !== "" &&
      (isSupplier ? supplierName.trim() !== "" : description.trim() !== "")) ||
    (step === 2 && !requiredDocsMissing) ||
    step === 3

  function next() {
    if (step < 3) setStep((s) => s + 1)
    else handleOpenChange(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <Plus className="size-4" />
        New Request
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="shrink-0 px-6 pb-5 pt-6">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {step === 0 && "What would you like to request?"}
              {step === 1 && "Create a purchase request"}
              {step === 2 && "Upload supporting documents"}
              {step === 3 && "Review Request"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {step === 0 && "Choose a category to get started. Three quick steps to send for approval."}
              {step === 1 && "Fill in the details below. Required fields are marked with an asterisk."}
              {step === 2 && "Attach the documents required for compliance and approval."}
              {step === 3 && "Make sure everything looks right before submitting."}
            </p>
          </DialogHeader>

          <div className="shrink-0 bg-muted/40 px-6 py-5">
            <Stepper current={step} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {step === 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categories.map((c) => {
                  const Icon = c.icon
                  const selected = category === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
                          c.iconClass,
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1 pr-5">
                        <span className="block font-semibold text-foreground">{c.title}</span>
                        <span className="block text-sm leading-snug text-muted-foreground">
                          {c.subtitle}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full transition-all duration-200",
                          selected
                            ? "scale-100 bg-primary text-primary-foreground opacity-100"
                            : "scale-75 opacity-0",
                        )}
                      >
                        <Check className="size-3.5" />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <Section
                  icon={Layers}
                  iconClass="bg-primary/12 text-primary"
                  title="General"
                  subtitle="Department, cost center, and the basics of your request."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Department" required>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Choose department...</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {!isSupplier && (
                      <Field label="Cost center" required>
                        <select
                          value={costCenter}
                          onChange={(e) => setCostCenter(e.target.value)}
                          className={fieldClass}
                        >
                          <option value="">Choose cost center...</option>
                          {costCenters.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <Field label="Category">
                      <input
                        readOnly
                        value={selectedCategory?.title ?? ""}
                        className={cn(fieldClass, "bg-muted/50 text-muted-foreground")}
                      />
                    </Field>
                    <Field label="Description" required>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a short description"
                        className={fieldClass}
                      />
                    </Field>
                    {!isSupplier && (
                      <>
                        <Field label="Total amount">
                          <div className="relative">
                            <input
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              inputMode="numeric"
                              placeholder="20.000"
                              className={cn(fieldClass, "pr-12")}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                              {currency}
                            </span>
                          </div>
                        </Field>
                        <Field label="Currency">
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className={fieldClass}
                          >
                            {["EUR", "USD", "GBP", "PLN"].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </>
                    )}
                  </div>
                </Section>

                <Section
                  icon={Package}
                  iconClass="bg-chart-2/15 text-chart-2"
                  title="Specific"
                  subtitle="Details specific to this request category."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {isSupplier ? (
                      <>
                        <Field label="Legal entity name" required>
                          <input
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            placeholder="Bashirian and Sons UAB"
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="Country">
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={fieldClass}
                          >
                            <option value="">Choose country...</option>
                            {euCountries.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Company registration no.">
                          <input
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            placeholder="e.g. 302536500"
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="VAT number" hint="Verified automatically via VIES">
                          <input
                            value={vatNumber}
                            onChange={(e) => setVatNumber(e.target.value)}
                            placeholder="LT100012345678"
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="Contact email" required>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="supplier@example.com"
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="Payment terms">
                          <select
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            className={fieldClass}
                          >
                            {["Net 14", "Net 30", "Net 45", "Net 60", "Net 90"].map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </>
                    ) : (
                      <>
                        <Field label="Supplier" required>
                          <select
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            className={fieldClass}
                          >
                            <option value="">Choose supplier...</option>
                            {suppliers.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </Field>
                        {isService ? (
                          <>
                            <Field label="Start date">
                              <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={fieldClass}
                              />
                            </Field>
                            <Field label="End date">
                              <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={fieldClass}
                              />
                            </Field>
                            <Field label="Contract required">
                              <select
                                value={contractRequired}
                                onChange={(e) => setContractRequired(e.target.value)}
                                className={fieldClass}
                              >
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </Field>
                          </>
                        ) : isSoftware ? (
                          <>
                            <Field label="Number of users / seats">
                              <input
                                value={numberOfUsers}
                                onChange={(e) => setNumberOfUsers(e.target.value)}
                                inputMode="numeric"
                                placeholder="25"
                                className={fieldClass}
                              />
                            </Field>
                            <Field label="Billing cycle">
                              <select
                                value={billingCycle}
                                onChange={(e) => setBillingCycle(e.target.value)}
                                className={fieldClass}
                              >
                                {["Monthly", "Quarterly", "Annual", "Multi-year", "One-time"].map((b) => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Subscription start">
                              <input
                                type="date"
                                value={subscriptionStart}
                                onChange={(e) => setSubscriptionStart(e.target.value)}
                                className={fieldClass}
                              />
                            </Field>
                          </>
                        ) : (
                          <>
                            <Field label="Needed by">
                              <input
                                type="date"
                                value={neededBy}
                                onChange={(e) => setNeededBy(e.target.value)}
                                className={fieldClass}
                              />
                            </Field>
                            <Field label="Delivery address">
                              <input
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="42077 Main Road, New Braunfels 66853-8101"
                                className={fieldClass}
                              />
                            </Field>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </Section>

                {isSupplier && (
                  <Section
                    icon={ShieldCheck}
                    iconClass="bg-chart-2/15 text-chart-2"
                    title="Bank details"
                    subtitle="Used for payments. Changes are verified to prevent fraud."
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Field label="Account holder">
                        <input
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          placeholder="Must match the legal entity name"
                          className={fieldClass}
                        />
                      </Field>
                      <Field label="IBAN">
                        <input
                          value={iban}
                          onChange={(e) => setIban(e.target.value.toUpperCase())}
                          placeholder="LT12 1000 0111 0100 1000"
                          className={fieldClass}
                        />
                      </Field>
                      <Field label="BIC / SWIFT">
                        <input
                          value={bic}
                          onChange={(e) => setBic(e.target.value.toUpperCase())}
                          placeholder="CBVILT2X"
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                  </Section>
                )}

                {isSoftware && (
                  <Section
                    icon={Monitor}
                    iconClass="bg-chart-2/15 text-chart-2"
                    title="License & renewal"
                    subtitle="License model and renewal terms for budgeting and contract tracking."
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Field label="License type">
                        <select
                          value={licenseType}
                          onChange={(e) => setLicenseType(e.target.value)}
                          className={fieldClass}
                        >
                          {[
                            "SaaS subscription",
                            "Perpetual license",
                            "Per-seat license",
                            "Usage-based",
                            "Open source / support",
                          ].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Renewal">
                        <select
                          value={renewalType}
                          onChange={(e) => setRenewalType(e.target.value)}
                          className={fieldClass}
                        >
                          {["Auto-renew", "Manual renewal", "No renewal (one-time)"].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field
                        label="Renewal / notice date"
                        hint="Trigger a reminder before auto-renewal"
                      >
                        <input
                          type="date"
                          value={renewalDate}
                          onChange={(e) => setRenewalDate(e.target.value)}
                          disabled={renewalType === "No renewal (one-time)"}
                          className={cn(
                            fieldClass,
                            renewalType === "No renewal (one-time)" && "opacity-50",
                          )}
                        />
                      </Field>
                    </div>
                  </Section>
                )}

                {isSoftware && (
                  <Section
                    icon={ShieldCheck}
                    iconClass="bg-destructive/12 text-destructive"
                    title="Data protection & compliance"
                    subtitle="Required for GDPR review before the tool can be approved."
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Personal data processed"
                        hint="Does the tool process personal data?"
                      >
                        <select
                          value={dataProcessing}
                          onChange={(e) => setDataProcessing(e.target.value)}
                          className={fieldClass}
                        >
                          {[
                            "No personal data",
                            "Employee data",
                            "Customer data",
                            "Special category data",
                          ].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Data hosting region" hint="Where data is stored">
                        <select
                          value={hostingRegion}
                          onChange={(e) => setHostingRegion(e.target.value)}
                          className={fieldClass}
                        >
                          {[
                            "EU / EEA",
                            "UK (adequacy)",
                            "US (DPF certified)",
                            "Other / non-EU",
                          ].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="DPA required" hint="Data Processing Agreement">
                        <select
                          value={dpaRequired}
                          onChange={(e) => setDpaRequired(e.target.value)}
                          disabled={dataProcessing === "No personal data"}
                          className={cn(
                            fieldClass,
                            dataProcessing === "No personal data" && "opacity-50",
                          )}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </Field>
                      <Field label="Internal owner" required>
                        <input
                          value={softwareOwner}
                          onChange={(e) => setSoftwareOwner(e.target.value)}
                          placeholder="Person responsible for the tool"
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                  </Section>
                )}

                {isSupplier && (
                  <Section
                    icon={Receipt}
                    iconClass="bg-chart-4/15 text-chart-4"
                    title="Tax & accounting"
                    subtitle="Helps accounting post invoices and report VAT correctly."
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="VAT treatment" hint="Determines how VAT is reported">
                        <select
                          value={vatTreatment}
                          onChange={(e) => setVatTreatment(e.target.value)}
                          className={fieldClass}
                        >
                          {[
                            "Standard",
                            "Reverse charge (intra-EU)",
                            "Exempt",
                            "Non-EU / Import",
                          ].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Supplier type" hint="Affects place-of-supply rules">
                        <select
                          value={supplierType}
                          onChange={(e) => setSupplierType(e.target.value)}
                          className={fieldClass}
                        >
                          {["Goods", "Services", "Goods & Services"].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Default tax rate">
                        <select
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          disabled={vatTreatment !== "Standard"}
                          className={cn(fieldClass, vatTreatment !== "Standard" && "opacity-50")}
                        >
                          {["21%", "9%", "5%", "0%", "No VAT"].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Invoicing email" hint="Where invoices are sent (if different)">
                        <input
                          type="email"
                          value={invoicingEmail}
                          onChange={(e) => setInvoicingEmail(e.target.value)}
                          placeholder="invoices@supplier.com"
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                  </Section>
                )}

                {!isSupplier && (
                  <Section
                    icon={Settings2}
                    iconClass="bg-chart-3/12 text-chart-3"
                    title="Custom Fields"
                    subtitle="Additional information required for this request type."
                  >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {isService ? (
                      <>
                        <Field label="Request name">
                          <input
                            value={requestName}
                            onChange={(e) => setRequestName(e.target.value)}
                            placeholder="e.g. Q3 Marketing Consulting"
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="Region" required>
                          <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className={fieldClass}
                          >
                            <option value="">Choose region...</option>
                            {regions.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Business Owner" required>
                          <input
                            value={businessOwner}
                            onChange={(e) => setBusinessOwner(e.target.value)}
                            placeholder="Full name"
                            className={fieldClass}
                          />
                        </Field>
                      </>
                    ) : isSoftware ? (
                      <>
                        <Field label="Software Name" required>
                          <input
                            value={softwareName}
                            onChange={(e) => setSoftwareName(e.target.value)}
                            placeholder="e.g. Procurement platform license"
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="Business Priority" required>
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className={fieldClass}
                          >
                            {priorities.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </>
                    ) : (
                      <>
                        <Field label="Product Name" required>
                          <input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="iPhone 15 Pro"
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="Business Priority" required>
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className={fieldClass}
                          >
                            {priorities.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </>
                    )}
                  </div>
                  </Section>
                )}

                {!isSupplier && (
                  <Section
                    icon={ListChecks}
                    iconClass="bg-primary/12 text-primary"
                    title="Line-items"
                    subtitle="Add one line for each item. Filled line items will be sent to the backend."
                  >
                  <div className="flex flex-col gap-3">
                    <div className="hidden grid-cols-[1fr_90px_120px_40px] gap-3 px-1 text-xs font-medium text-muted-foreground sm:grid">
                      <span>Item</span>
                      <span>Qty</span>
                      <span>Unit price</span>
                      <span className="sr-only">Remove</span>
                    </div>
                    {lines.map((line) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_90px_120px_40px] sm:items-center"
                      >
                        <input
                          value={line.name}
                          onChange={(e) => updateLine(line.id, "name", e.target.value)}
                          placeholder="Item description"
                          className={fieldClass}
                        />
                        <input
                          value={line.qty}
                          onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                          inputMode="numeric"
                          placeholder="1"
                          className={fieldClass}
                        />
                        <input
                          value={line.price}
                          onChange={(e) => updateLine(line.id, "price", e.target.value)}
                          inputMode="numeric"
                          placeholder="0.00"
                          className={fieldClass}
                        />
                        <button
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length === 1}
                          aria-label="Remove line"
                          className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addLine}
                      className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      <Plus className="size-4" />
                      Add Line
                    </button>
                  </div>
                  </Section>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <Section
                  icon={ShieldCheck}
                  iconClass="bg-primary/12 text-primary"
                  title={isSupplier ? "Compliance documents" : "Supporting documents"}
                  subtitle={
                    isSupplier
                      ? "Required for vendor due-diligence and onboarding."
                      : "Attach quotes and approvals to support this request."
                  }
                >
                  <div className="flex flex-col gap-3">
                    {docSlots.map((doc) => {
                      const uploaded = docs[doc.id]
                      return (
                        <div
                          key={doc.id}
                          className={cn(
                            "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                            uploaded
                              ? "border-primary/40 bg-primary/5"
                              : "border-border bg-background",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-lg",
                              uploaded ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                            )}
                          >
                            {uploaded ? <FileCheck2 className="size-5" /> : <FileText className="size-5" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                              {doc.label}
                              {doc.required ? (
                                <span className="text-destructive">*</span>
                              ) : (
                                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {uploaded ?? doc.hint}
                            </p>
                          </div>
                          {uploaded ? (
                            <button
                              onClick={() => clearDoc(doc.id)}
                              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                            >
                              <Trash2 className="size-3.5" />
                              Remove
                            </button>
                          ) : (
                            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                              <UploadCloud className="size-3.5" />
                              Upload
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) selectDoc(doc.id, file.name)
                                }}
                              />
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {extraDocs.length > 0 && (
                    <div className="mt-3 flex flex-col gap-3">
                      {extraDocs.map((name, i) => (
                        <div
                          key={`${name}-${i}`}
                          className="flex items-center gap-4 rounded-lg border border-primary/40 bg-primary/5 p-4"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                            <FileCheck2 className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">Additional document</p>
                            <p className="truncate text-xs text-muted-foreground">{name}</p>
                          </div>
                          <button
                            onClick={() => setExtraDocs((prev) => prev.filter((_, idx) => idx !== i))}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                    <Plus className="size-4" />
                    Add another document
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setExtraDocs((prev) => [...prev, file.name])
                      }}
                    />
                  </label>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">
                      {uploadedDocCount} document{uploadedDocCount === 1 ? "" : "s"} attached
                    </span>
                    {requiredDocsMissing ? (
                      <span className="font-medium text-destructive">Required documents missing</span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-medium text-primary">
                        <Check className="size-4" />
                        All required documents attached
                      </span>
                    )}
                  </div>
                </Section>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                {/* Summary card */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                    <div className="flex items-center gap-3">
                      {selectedCategory && (
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-lg",
                            selectedCategory.iconClass,
                          )}
                        >
                          <selectedCategory.icon className="size-5" />
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {selectedCategory?.title ?? "Request"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(isSupplier ? supplierName : description) || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {isSupplier ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          <UserPlus className="size-3.5" />
                          New supplier
                        </span>
                      ) : (
                        <>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Amount
                          </p>
                          <p className="text-xl font-bold text-foreground">
                            {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : "No cost"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 p-5 sm:grid-cols-4">
                    {isSupplier ? (
                      <>
                        <MetaCell label="Department" value={department || "Not provided"} />
                        <MetaCell label="Cost center" value={costCenter || "Not provided"} />
                        <MetaCell label="Contact email" value={contactEmail || "Not provided"} />
                        <MetaCell label="Payment terms" value={paymentTerms} />
                      </>
                    ) : (
                      <>
                        <MetaCell label="Department" value={department || "Not provided"} />
                        <MetaCell label="Cost center" value={costCenter || "Not provided"} />
                        <MetaCell label="Supplier" value={supplier || "Not provided"} />
                        {isService ? (
                          <MetaCell
                            label="Start date"
                            value={startDate ? new Date(startDate).toLocaleDateString("en-GB") : "Not provided"}
                          />
                        ) : isSoftware ? (
                          <MetaCell label="Users / seats" value={numberOfUsers || "Not provided"} />
                        ) : (
                          <MetaCell
                            label="Needed by"
                            value={neededBy ? new Date(neededBy).toLocaleDateString("en-GB") : "Not provided"}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Line items card */}
                {isSupplier ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="border-b border-border p-5">
                      <h3 className="font-semibold text-foreground">Supplier Onboarding Details</h3>
                    </div>

                    <ReviewGroup title="Identity & registration">
                      <MetaCell label="Legal entity" value={supplierName || "Not provided"} />
                      <MetaCell
                        label="Country"
                        value={euCountries.find((c) => c.code === country)?.name || "Not provided"}
                      />
                      <MetaCell label="Registration no." value={registrationNumber || "Not provided"} />
                      <MetaCell label="VAT number" value={vatNumber || "Not provided"} />
                    </ReviewGroup>

                    <ReviewGroup title="Banking">
                      <MetaCell label="Account holder" value={accountHolder || "Not provided"} />
                      <MetaCell label="IBAN" value={iban || "Not provided"} />
                      <MetaCell label="BIC / SWIFT" value={bic || "Not provided"} />
                      <MetaCell label="Payment terms" value={paymentTerms} />
                    </ReviewGroup>

                    <ReviewGroup title="Tax & accounting" last>
                      <MetaCell label="VAT treatment" value={vatTreatment} />
                      <MetaCell label="Supplier type" value={supplierType} />
                      <MetaCell
                        label="Tax rate"
                        value={vatTreatment === "Standard" ? taxRate : "—"}
                      />
                      <MetaCell label="Invoicing email" value={invoicingEmail || contactEmail || "Not provided"} />
                    </ReviewGroup>
                  </div>
                ) : isSoftware ? null : (
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Supplier, Budget &amp; Specifications</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <th className="px-5 py-3 text-left font-semibold">Product name</th>
                          <th className="px-5 py-3 text-center font-semibold">Quantity</th>
                          <th className="px-5 py-3 text-right font-semibold">Unit price</th>
                          <th className="px-5 py-3 text-right font-semibold">Total price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filledLines.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">
                              No line items added.
                            </td>
                          </tr>
                        ) : (
                          filledLines.map((l) => {
                            const qty = Number(l.qty) || 0
                            const price = Number(l.price) || 0
                            return (
                              <tr key={l.id}>
                                <td className="px-5 py-3 font-medium text-foreground">{l.name}</td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{qty || "—"}</td>
                                <td className="px-5 py-3 text-right text-muted-foreground">
                                  {price ? `${fmt(price)} ${currency}` : "—"}
                                </td>
                                <td className="px-5 py-3 text-right font-semibold text-foreground">
                                  {qty && price ? `${fmt(qty * price)} ${currency}` : "—"}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/40">
                          <td
                            colSpan={3}
                            className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Amount
                          </td>
                          <td className="px-5 py-3 text-right text-base font-bold text-foreground">
                            {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : "No cost"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                )}

                {/* Software license & compliance card */}
                {isSoftware && (
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="border-b border-border p-5">
                      <h3 className="font-semibold text-foreground">License &amp; Compliance</h3>
                    </div>

                    <ReviewGroup title="Subscription & cost">
                      <MetaCell label="Software" value={softwareName || "Not provided"} />
                      <MetaCell label="Users / seats" value={numberOfUsers || "Not provided"} />
                      <MetaCell
                        label="Start date"
                        value={
                          subscriptionStart
                            ? new Date(subscriptionStart).toLocaleDateString("en-GB")
                            : "Not set"
                        }
                      />
                      <MetaCell
                        label={`Contract value (${billingCycle.toLowerCase()})`}
                        value={reviewTotal ? `${fmt(reviewTotal)} ${currency}` : "No cost"}
                      />
                    </ReviewGroup>

                    <ReviewGroup title="License & renewal">
                      <MetaCell label="License type" value={licenseType} />
                      <MetaCell label="Billing cycle" value={billingCycle} />
                      <MetaCell label="Renewal" value={renewalType} />
                      <MetaCell
                        label="Renewal date"
                        value={
                          renewalType === "No renewal (one-time)"
                            ? "—"
                            : renewalDate
                              ? new Date(renewalDate).toLocaleDateString("en-GB")
                              : "Not set"
                        }
                      />
                    </ReviewGroup>

                    <ReviewGroup title="Data protection (GDPR)" last>
                      <MetaCell label="Personal data" value={dataProcessing} />
                      <MetaCell label="Hosting region" value={hostingRegion} />
                      <MetaCell
                        label="DPA required"
                        value={dataProcessing === "No personal data" ? "—" : dpaRequired}
                      />
                      <MetaCell label="Internal owner" value={softwareOwner || "Not provided"} />
                    </ReviewGroup>
                  </div>
                )}

                {/* Documents card */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Documents</h3>
                    <span className="text-xs font-medium text-muted-foreground">
                      {uploadedDocCount} attached
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-5">
                    {uploadedDocCount === 0 ? (
                      <p className="text-sm text-muted-foreground">No documents attached.</p>
                    ) : (
                      <>
                        {docSlots
                          .filter((d) => docs[d.id])
                          .map((d) => (
                            <div key={d.id} className="flex items-center gap-3 text-sm">
                              <FileCheck2 className="size-4 shrink-0 text-primary" />
                              <span className="font-medium text-foreground">{d.label}</span>
                              <span className="truncate text-muted-foreground">{docs[d.id]}</span>
                            </div>
                          ))}
                        {extraDocs.map((name, i) => (
                          <div key={`x-${i}`} className="flex items-center gap-3 text-sm">
                            <FileCheck2 className="size-4 shrink-0 text-primary" />
                            <span className="truncate text-muted-foreground">{name}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
            {step === 3 ? (
              <button
                onClick={() => handleOpenChange(false)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <FileText className="size-4" />
                Save draft
              </button>
            ) : (
              <button
                onClick={() => (step === 0 ? handleOpenChange(false) : setStep((s) => s - 1))}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft className="size-4" />
                {step === 0 ? "Cancel" : "Back"}
              </button>
            )}
            <div className="flex items-center gap-3">
              {step === 3 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </button>
              ) : (
                <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                  Step {step + 1} of {steps.length}
                </span>
              )}
              <button
                onClick={next}
                disabled={!canContinue}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {step === 3 ? "Create" : "Next"}
                {step !== 3 && <ChevronRight className="size-4" />}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function ReviewGroup({
  title,
  last,
  children,
}: {
  title: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("p-5", !last && "border-b border-border")}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-primary">{title}</p>
      <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">{children}</div>
    </div>
  )
}
