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
  MapPin,
  AlertCircle,
  Pencil,
  Workflow,
  ChevronDown,
  Save,
  Info,
  CalendarClock,
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
  { id: "type", label: "Request Type", icon: Package },
  { id: "details", label: "Details", icon: FileText },
  { id: "documents", label: "Documents", icon: UploadCloud },
  { id: "review", label: "Review", icon: ClipboardCheck },
] as const

const departments = ["IT", "Operations", "Marketing", "Finance", "Facilities", "Legal"]
const costCenters = ["CC-100 · Headquarters", "CC-200 · Sales", "CC-300 · R&D", "CC-400 · Logistics"]
const suppliers = ["ProcFly Logistics", "Office Supplies Baltics", "TechWare Solutions", "Nordic Consulting"]
const priorities = ["Low", "Medium", "High", "Critical"]
const regions = ["EMEA", "North America", "APAC", "LATAM", "Baltics"]

// Buy Product specific option sets
const businessPriorities = ["Low", "Medium", "High", "Urgent"]
const procurementCategories = [
  "Hardware",
  "IT Equipment",
  "Furniture",
  "Office Supplies",
  "Manufacturing Equipment",
  "Other",
]
const purchaseTypes = ["New Purchase", "Replacement", "Expansion", "Spare Part"]
const unitsOfMeasure = ["Unit", "Pack", "Box", "Set", "Meter", "Kilogram", "Liter", "Other"]
const deliveryLocationTypes = ["Office", "Warehouse", "Project Site", "Custom Address"]
const predefinedLocations: Record<string, string[]> = {
  Office: ["HQ · Vilnius", "Office · Kaunas", "Office · Riga", "Office · Tallinn"],
  Warehouse: ["Central Warehouse · Vilnius", "Distribution Hub · Kaunas"],
  "Project Site": ["Site A · Klaipėda Port", "Site B · Panevėžys Plant"],
}
const preferredSupplierStates = [
  "Preferred supplier selected",
  "Supplier not known yet",
  "New supplier required",
]

// Buy Service specific option sets
const serviceProcurementCategories = [
  "Consulting",
  "Marketing",
  "Legal",
  "Accounting",
  "Recruitment",
  "Training",
  "Logistics",
  "Facility Management",
  "Engineering",
  "Other Services",
]
const serviceTypes = ["One-Time Service", "Recurring Service", "Project-Based Service", "Retainer Service"]
const deliveryModels = ["Onsite", "Remote", "Hybrid"]
const serviceUnits = ["Hour", "Day", "Week", "Month", "Project", "Deliverable", "Session", "Other"]
const billingPeriods = ["One-time", "Per hour", "Per day", "Per week", "Per month", "Per quarter", "Per year"]
const billingFrequencies = ["Monthly", "Quarterly", "Semi-Annual", "Annual"]
const renewalNoticePeriods = ["30 days", "60 days", "90 days", "Custom"]
const contractRequiredOptions = ["Yes", "No", "Not Sure"]
const supplierStatusOptions = [
  "Supplier selected",
  "Supplier not selected",
  "Supplier not known",
  "Competitive sourcing required",
]

// Buy Software specific option sets
const softwareProcurementCategories = [
  "SaaS",
  "Productivity",
  "CRM",
  "ERP",
  "Finance",
  "HR",
  "Security",
  "Analytics",
  "Development Tools",
  "Other Software",
]
const softwareTypes = ["SaaS", "On-Premise", "Hybrid"]
const softwareAcquisitionTypes = ["New Software", "Replacement Software"]
const licensePlans = ["Per User / Seat", "Flat Fee", "Usage Based", "Tiered", "Enterprise", "Free / Open Source"]
const softwareBillingCycles = ["Monthly", "Quarterly", "Annual", "Multi-Year", "One-Time"]
const subscriptionPeriods = ["1 month", "3 months", "6 months", "12 months", "24 months", "36 months", "Perpetual"]
const cancellationNoticePeriods = ["30 days", "60 days", "90 days", "None", "Custom"]
const personalDataCategoryOptions = [
  "Contact details",
  "Identification data",
  "Financial data",
  "Employment data",
  "Location data",
  "Behavioural / usage data",
  "Special category (sensitive) data",
]
const dataSubjectTypeOptions = ["Employees", "Customers", "Suppliers", "Job applicants", "Website visitors", "Minors"]
const dataHostingRegions = ["EU / EEA", "United Kingdom", "United States", "Global / Multi-region", "Other"]

// Buy Software documents are rule-generated.
const baseSoftwareDocs: DocSlot[] = [
  { id: "quote", label: "Supplier quote", hint: "Pricing quote from the software vendor", required: true },
  { id: "license", label: "License agreement", hint: "Software license or subscription agreement", required: true },
  { id: "terms", label: "Terms & conditions", hint: "Vendor terms of service", required: false },
]
const conditionalSoftwareDocs: { doc: DocSlot; when: (ctx: SoftwareDocContext) => boolean }[] = [
  { doc: { id: "dpa", label: "Data Processing Agreement (DPA)", hint: "Required when personal data is processed", required: true }, when: (c) => c.dpaRequired },
  { doc: { id: "privacy", label: "Privacy documentation", hint: "Privacy policy / impact assessment", required: true }, when: (c) => c.privacyReview },
  { doc: { id: "security", label: "Security documentation", hint: "Security overview / questionnaire", required: true }, when: (c) => c.securityReview },
  { doc: { id: "soc2", label: "SOC 2 report", hint: "SOC 2 Type II report", required: false }, when: (c) => c.soc2 },
  { doc: { id: "iso", label: "ISO 27001 certificate", hint: "ISO 27001 certification", required: false }, when: (c) => c.iso },
  { doc: { id: "contract", label: "Contract draft", hint: "Draft contract for high-value or new supplier", required: true }, when: (c) => c.contract },
]

interface SoftwareDocContext {
  dpaRequired: boolean
  privacyReview: boolean
  securityReview: boolean
  soc2: boolean
  iso: boolean
  contract: boolean
}

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"

interface LineItem {
  id: number
  name: string
  description: string
  qty: string
  uom: string
  price: string
  // Service line items: how the rate is billed (Per hour, Per month, ...)
  // Software line items: the billing cycle (Monthly, Annual, ...)
  billingPeriod: string
  // Software line items: subscription period and one-time fee
  subscriptionPeriod: string
  oneTimeFee: string
  // Optional product details to help Procurement compare offers
  brand: string
  model: string
  equivalentAllowed: boolean
  warranty: string
  detailsOpen: boolean
}

function emptyLine(id: number): LineItem {
  return {
    id,
    name: "",
    description: "",
    qty: "",
    uom: "Unit",
    price: "",
    billingPeriod: "One-time",
    subscriptionPeriod: "12 months",
    oneTimeFee: "",
    brand: "",
    model: "",
    equivalentAllowed: true,
    warranty: "",
    detailsOpen: false,
  }
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

// Buy Product documents are generated from rules: the first two are always
// mandatory; the rest are surfaced conditionally based on the request (value,
// purchase type, supplier readiness).
const baseProductDocs: DocSlot[] = [
  { id: "quote", label: "Supplier quote / proforma", hint: "Itemized quote from the preferred supplier", required: true },
  { id: "spec", label: "Product specification", hint: "Datasheet or technical specification of the product", required: true },
]
const conditionalProductDocs: { doc: DocSlot; when: string }[] = [
  { doc: { id: "budget", label: "Budget approval", hint: "Proof the spend is budgeted", required: true }, when: "Estimated total is high value" },
  { doc: { id: "quotes2", label: "Additional quotes", hint: "Competing quotes for comparison", required: true }, when: "High-value purchase requires 3 quotes" },
  { doc: { id: "drawing", label: "Technical drawing", hint: "Engineering drawing or layout", required: false }, when: "Manufacturing equipment" },
  { doc: { id: "warranty", label: "Warranty information", hint: "Warranty terms for the product", required: false }, when: "Warranty requested on a line item" },
]

// Buy Service documents are also rule-generated. A supplier proposal and scope
// of work are always asked for; the rest depend on contract, value, SoW, and
// supplier status.
const baseServiceDocs: DocSlot[] = [
  { id: "proposal", label: "Supplier proposal", hint: "Proposal or quote from the supplier", required: true },
  { id: "scope", label: "Scope of work", hint: "What the service covers and the expected outcomes", required: true },
]
const conditionalServiceDocs: { doc: DocSlot; when: (ctx: ServiceDocContext) => boolean }[] = [
  { doc: { id: "budget", label: "Budget approval", hint: "Proof the spend is budgeted", required: true }, when: (c) => c.highValue },
  { doc: { id: "contract", label: "Contract draft", hint: "Draft service contract", required: true }, when: (c) => c.contractRequired },
  { doc: { id: "agreement", label: "Service agreement", hint: "Signed or draft service agreement", required: true }, when: (c) => c.contractRequired },
  { doc: { id: "sow", label: "Statement of work", hint: "Detailed statement of work", required: true }, when: (c) => c.sowRequired },
  { doc: { id: "compliance", label: "Compliance documents", hint: "Required for legal / regulated services", required: false }, when: (c) => c.legalOrNewSupplier },
]

interface ServiceDocContext {
  highValue: boolean
  contractRequired: boolean
  sowRequired: boolean
  legalOrNewSupplier: boolean
}

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
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      ) : (
        hint && <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

function ChipMultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40",
            )}
          >
            {opt}
          </button>
        )
      })}
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

  // General — Buy Product
  const [requestTitle, setRequestTitle] = useState("")
  const [procurementCategory, setProcurementCategory] = useState("")
  const [businessPriority, setBusinessPriority] = useState("Medium")

  // Specific — product
  const [supplier, setSupplier] = useState("")
  const [supplierState, setSupplierState] = useState("Preferred supplier selected")
  const [neededBy, setNeededBy] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryLocationType, setDeliveryLocationType] = useState("Office")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [purchaseType, setPurchaseType] = useState("New Purchase")

  // Draft / unsaved-changes handling
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)

  // Specific — service
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [contractRequired, setContractRequired] = useState("Not Sure")
  const [serviceType, setServiceType] = useState("One-Time Service")
  const [deliveryModel, setDeliveryModel] = useState("Remote")
  const [sowRequired, setSowRequired] = useState("No")
  // Recurring service details
  const [billingFrequency, setBillingFrequency] = useState("Monthly")
  const [contractDuration, setContractDuration] = useState("")
  const [autoRenewal, setAutoRenewal] = useState("No")
  const [renewalNotice, setRenewalNotice] = useState("30 days")

  // Custom — product
  const [productName, setProductName] = useState("")
  const [priority, setPriority] = useState("Medium")

  // Custom — service
  const [requestName, setRequestName] = useState("")
  const [region, setRegion] = useState("")
  const [businessOwner, setBusinessOwner] = useState("")

  // Specific — software (SaaS / license)
  const [softwareName, setSoftwareName] = useState("")
  const [softwareType, setSoftwareType] = useState("SaaS")
  const [itOwner, setItOwner] = useState("")
  const [softwarePurpose, setSoftwarePurpose] = useState("")
  const [softwareAcquisition, setSoftwareAcquisition] = useState("New Software")
  const [existingSoftwareName, setExistingSoftwareName] = useState("")
  const [replacementReason, setReplacementReason] = useState("")
  const [numberOfUsers, setNumberOfUsers] = useState("")
  const [subscriptionStart, setSubscriptionStart] = useState("")
  const [subscriptionEnd, setSubscriptionEnd] = useState("")
  const [softwareContractDuration, setSoftwareContractDuration] = useState("")
  // Software — license & renewal
  const [licenseType, setLicenseType] = useState("Per User / Seat")
  const [billingCycle, setBillingCycle] = useState("Annual")
  const [softwareAutoRenewal, setSoftwareAutoRenewal] = useState("No")
  const [renewalDate, setRenewalDate] = useState("")
  const [cancellationNotice, setCancellationNotice] = useState("30 days")
  const [cancellationDeadline, setCancellationDeadline] = useState("")
  // Software — data protection & compliance (EU / GDPR)
  const [personalDataProcessed, setPersonalDataProcessed] = useState("No")
  const [personalDataCategories, setPersonalDataCategories] = useState<string[]>([])
  const [dataSubjectTypes, setDataSubjectTypes] = useState<string[]>([])
  const [sensitiveDataProcessed, setSensitiveDataProcessed] = useState("No")
  const [hostingRegion, setHostingRegion] = useState("EU / EEA")
  const [dpaAvailable, setDpaAvailable] = useState("Unknown")
  const [privacyReviewRequired, setPrivacyReviewRequired] = useState("No")
  const [securityReviewManual, setSecurityReviewManual] = useState("No")
  // Software — security & IT
  const [ssoRequired, setSsoRequired] = useState("No")
  const [scimRequired, setScimRequired] = useState("No")
  const [integrationsRequired, setIntegrationsRequired] = useState("No")
  const [adminAccessRequired, setAdminAccessRequired] = useState("No")
  const [soc2Available, setSoc2Available] = useState("Unknown")
  const [iso27001Available, setIso27001Available] = useState("Unknown")
  const [dataExportAvailable, setDataExportAvailable] = useState("Unknown")
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
  const [lines, setLines] = useState<LineItem[]>([emptyLine(1)])

  // Documents — maps document slot id to an uploaded file name
  const [docs, setDocs] = useState<Record<string, string>>({})
  const [extraDocs, setExtraDocs] = useState<string[]>([])

  const selectedCategory = categories.find((c) => c.id === category)
  const isService = category === "service"
  const isSupplier = category === "supplier"
  const isSoftware = category === "software"
  const isProduct = category === "product"

  const filledLines = lines.filter((l) => l.name.trim() !== "")
  const lineItemsTotal = filledLines.reduce(
    (sum, l) => sum + (Number(l.qty) || 0) * (Number(l.price) || 0),
    0,
  )
  // Software line total includes recurring (seats × price per seat) plus any
  // one-time fee per line.
  const softwareLineItemsTotal = filledLines.reduce(
    (sum, l) => sum + (Number(l.qty) || 0) * (Number(l.price) || 0) + (Number(l.oneTimeFee) || 0),
    0,
  )
  // For Buy Product / Service / Software the estimated total is always derived
  // from line items (no manual amount). Other categories keep the fallback.
  const reviewTotal = isSoftware
    ? softwareLineItemsTotal
    : isProduct || isService
      ? lineItemsTotal
      : Number(amount) || lineItemsTotal
  const fmt = (n: number) => n.toLocaleString("en-US")
  // Total seats across all software line items (replaces a separate seat field).
  const totalSeats = filledLines.reduce((sum, l) => sum + (Number(l.qty) || 0), 0)
  const seatBasedLicensing = licenseType === "Per User / Seat"

  // High-value threshold drives extra document + quote requirements.
  const HIGH_VALUE = 25000
  const isHighValueProduct = isProduct && reviewTotal >= HIGH_VALUE
  const anyWarrantyRequested = lines.some((l) => l.warranty.trim() !== "")

  // ---- Buy Service derivations ----
  const isRecurring = serviceType === "Recurring Service" || serviceType === "Retainer Service"
  const datesInvalid = !!startDate && !!endDate && new Date(endDate) < new Date(startDate)
  // Service duration in whole months (approx) for recurring services.
  const serviceDurationMonths =
    startDate && endDate && !datesInvalid
      ? Math.max(
          1,
          Math.round(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30),
          ),
        )
      : 0
  const isHighValueService = isService && reviewTotal >= HIGH_VALUE
  // Procurement rules can auto-require a contract.
  const contractAutoTriggered =
    isService &&
    (isHighValueService ||
      serviceDurationMonths >= 12 ||
      supplierState === "New supplier required" ||
      ["Consulting", "Legal"].includes(procurementCategory))
  const contractEffective = contractRequired === "Yes" || (contractRequired !== "No" && contractAutoTriggered)
  const sowEffective = sowRequired === "Yes" || contractEffective

  const serviceDocs: DocSlot[] = isService
    ? [
        ...baseServiceDocs,
        ...conditionalServiceDocs
          .filter(({ when }) =>
            when({
              highValue: isHighValueService,
              contractRequired: contractEffective,
              sowRequired: sowEffective,
              legalOrNewSupplier:
                procurementCategory === "Legal" || supplierState === "New supplier required",
            }),
          )
          .map(({ doc }) => doc),
      ]
    : []

  // ---- Buy Software derivations ----
  const isHighValueSoftware = isSoftware && reviewTotal >= HIGH_VALUE
  const processesPersonalData = personalDataProcessed === "Yes"
  // DPA is determined by rules: required whenever personal data is processed.
  const dpaRequiredEffective = processesPersonalData
  // Security review is auto-required for higher-risk requests.
  const securityReviewEffective =
    securityReviewManual === "Yes" ||
    isHighValueSoftware ||
    adminAccessRequired === "Yes" ||
    integrationsRequired === "Yes" ||
    procurementCategory === "Security" ||
    (processesPersonalData && sensitiveDataProcessed === "Yes")
  // Privacy review auto-required when sensitive personal data is processed.
  const privacyReviewEffective =
    privacyReviewRequired === "Yes" ||
    (processesPersonalData && (sensitiveDataProcessed === "Yes" || hostingRegion === "United States" || hostingRegion === "Other"))
  const isReplacement = softwareAcquisition === "Replacement Software"
  const softwareNewSupplier = supplierState === "New supplier required"
  const softwareContractNeeded = isHighValueSoftware || softwareNewSupplier
  const subscriptionDatesInvalid =
    !!subscriptionStart && !!subscriptionEnd && new Date(subscriptionEnd) < new Date(subscriptionStart)

  const softwareDocs: DocSlot[] = isSoftware
    ? [
        ...baseSoftwareDocs,
        ...conditionalSoftwareDocs
          .filter(({ when }) =>
            when({
              dpaRequired: dpaRequiredEffective,
              privacyReview: privacyReviewEffective,
              securityReview: securityReviewEffective,
              soc2: soc2Available === "Yes",
              iso: iso27001Available === "Yes",
              contract: softwareContractNeeded,
            }),
          )
          .map(({ doc }) => doc),
      ]
    : []

  // Generate the Buy Product document list from rules instead of a fixed list.
  const productDocs: DocSlot[] = isProduct
    ? [
        ...baseProductDocs,
        ...conditionalProductDocs
          .filter(({ doc }) => {
            if (doc.id === "budget") return isHighValueProduct
            if (doc.id === "quotes2") return isHighValueProduct
            if (doc.id === "drawing") return procurementCategory === "Manufacturing Equipment"
            if (doc.id === "warranty") return anyWarrantyRequested
            return false
          })
          .map(({ doc }) => doc),
      ]
    : []

  const docSlots = isProduct
    ? productDocs
    : isService
      ? serviceDocs
      : isSoftware
        ? softwareDocs
        : isSupplier
          ? supplierDocs
          : purchaseDocs
  const requiredDocsMissing = docSlots.some((d) => d.required && !docs[d.id])
  const uploadedDocCount = Object.keys(docs).length + extraDocs.length

  // Buy Product validation — drives the disabled state of "Next" and the
  // validation summary on the review step.
  const productErrors: string[] = []
  if (isProduct) {
    if (!requestTitle.trim()) productErrors.push("Request Title is required")
    if (!description.trim()) productErrors.push("Description / Business Justification is required")
    if (!department) productErrors.push("Department is required")
    if (!costCenter) productErrors.push("Cost Center is required")
    if (!procurementCategory) productErrors.push("Procurement Category is required")
    if (!neededBy) productErrors.push("Needed By date is required")
    if (filledLines.length === 0) productErrors.push("At least one line item is required")
    if (filledLines.some((l) => !(Number(l.qty) > 0))) productErrors.push("Each line item needs a quantity greater than zero")
    if (filledLines.some((l) => !(Number(l.price) > 0))) productErrors.push("Each line item needs a unit price greater than zero")
    if (
      description.trim() &&
      requestTitle.trim() &&
      description.trim().toLowerCase() === requestTitle.trim().toLowerCase()
    )
      productErrors.push("Description must explain the justification, not repeat the title")
  }

  // Buy Service validation
  const serviceErrors: string[] = []
  if (isService) {
    if (!requestTitle.trim()) serviceErrors.push("Request Title is required")
    if (!description.trim()) serviceErrors.push("Description / Business Justification is required")
    if (!department) serviceErrors.push("Department is required")
    if (!costCenter) serviceErrors.push("Cost Center is required")
    if (!procurementCategory) serviceErrors.push("Procurement Category is required")
    if (!businessOwner.trim()) serviceErrors.push("Business Owner is required")
    if (!startDate) serviceErrors.push("Service Start Date is required")
    if (!endDate) serviceErrors.push("Service End Date is required")
    if (datesInvalid) serviceErrors.push("Service End Date cannot be before the Start Date")
    if (filledLines.length === 0) serviceErrors.push("At least one line item is required")
    if (filledLines.some((l) => !(Number(l.qty) > 0))) serviceErrors.push("Each line item needs a quantity greater than zero")
    if (filledLines.some((l) => !(Number(l.price) > 0))) serviceErrors.push("Each line item needs a rate greater than zero")
    if (
      description.trim() &&
      requestTitle.trim() &&
      description.trim().toLowerCase() === requestTitle.trim().toLowerCase()
    )
      serviceErrors.push("Description must explain the justification, not repeat the title")
  }

  // Buy Software validation
  const softwareErrors: string[] = []
  if (isSoftware) {
    if (!requestTitle.trim()) softwareErrors.push("Request Title is required")
    if (!description.trim()) softwareErrors.push("Description / Business Justification is required")
    if (!department) softwareErrors.push("Department is required")
    if (!costCenter) softwareErrors.push("Cost Center is required")
    if (!procurementCategory) softwareErrors.push("Procurement Category is required")
    if (!softwareName.trim()) softwareErrors.push("Software Name is required")
    if (!businessOwner.trim()) softwareErrors.push("Business Owner is required")
    if (isReplacement && !existingSoftwareName.trim())
      softwareErrors.push("Existing Software Name is required for a replacement")
    if (isReplacement && !replacementReason.trim())
      softwareErrors.push("Replacement Reason is required for a replacement")
    if (filledLines.length === 0) softwareErrors.push("At least one line item is required")
    if (filledLines.some((l) => !(Number(l.price) > 0)))
      softwareErrors.push("Each line item needs a price greater than zero")
    // Seat-based licensing requires seats per line and an overall seat count.
    if (seatBasedLicensing) {
      if (filledLines.some((l) => !(Number(l.qty) > 0)))
        softwareErrors.push("Seat-based licensing requires a number of seats greater than zero on each line")
      if (totalSeats <= 0) softwareErrors.push("Number of Users / Seats is required for seat-based licensing")
    }
    // Illogical combination guard.
    if (!processesPersonalData && dpaAvailable === "Yes" && privacyReviewRequired === "Yes")
      softwareErrors.push("Privacy review can't be required when no personal data is processed")
    // Auto-renew without renewal information.
    if (softwareAutoRenewal === "Yes" && !renewalDate && !cancellationDeadline)
      softwareErrors.push("Auto Renewal requires a renewal date or cancellation deadline")
    if (subscriptionDatesInvalid) softwareErrors.push("Subscription End Date cannot be before the Start Date")
    if (
      description.trim() &&
      requestTitle.trim() &&
      description.trim().toLowerCase() === requestTitle.trim().toLowerCase()
    )
      softwareErrors.push("Description must explain the justification, not repeat the title")
  }

  function reset() {
    setStep(0)
    setCategory(null)
    setDepartment("")
    setCostCenter("")
    setDescription("")
    setAmount("")
    setCurrency("EUR")
    setRequestTitle("")
    setProcurementCategory("")
    setBusinessPriority("Medium")
    setSupplier("")
    setSupplierState("Preferred supplier selected")
    setNeededBy("")
    setDeliveryAddress("")
    setDeliveryLocationType("Office")
    setDeliveryLocation("")
    setPurchaseType("New Purchase")
    setShowCloseConfirm(false)
    setDraftSavedAt(null)
    setStartDate("")
    setEndDate("")
    setContractRequired("Not Sure")
    setServiceType("One-Time Service")
    setDeliveryModel("Remote")
    setSowRequired("No")
    setBillingFrequency("Monthly")
    setContractDuration("")
    setAutoRenewal("No")
    setRenewalNotice("30 days")
    setProductName("")
    setPriority("Medium")
    setRequestName("")
    setRegion("")
    setBusinessOwner("")
    setSoftwareName("")
    setSoftwareType("SaaS")
    setItOwner("")
    setSoftwarePurpose("")
    setSoftwareAcquisition("New Software")
    setExistingSoftwareName("")
    setReplacementReason("")
    setNumberOfUsers("")
    setSubscriptionStart("")
    setSubscriptionEnd("")
    setSoftwareContractDuration("")
    setLicenseType("Per User / Seat")
    setBillingCycle("Annual")
    setSoftwareAutoRenewal("No")
    setRenewalDate("")
    setCancellationNotice("30 days")
    setCancellationDeadline("")
    setPersonalDataProcessed("No")
    setPersonalDataCategories([])
    setDataSubjectTypes([])
    setSensitiveDataProcessed("No")
    setHostingRegion("EU / EEA")
    setDpaAvailable("Unknown")
    setPrivacyReviewRequired("No")
    setSecurityReviewManual("No")
    setSsoRequired("No")
    setScimRequired("No")
    setIntegrationsRequired("No")
    setAdminAccessRequired("No")
    setSoc2Available("Unknown")
    setIso27001Available("Unknown")
    setDataExportAvailable("Unknown")
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
    setLines([emptyLine(1)])
    setDocs({})
    setExtraDocs([])
  }

  // Has the user entered anything worth warning about on close?
  const hasUnsavedChanges =
    category !== null &&
    (requestTitle.trim() !== "" ||
      description.trim() !== "" ||
      department !== "" ||
      filledLines.length > 0)

  function handleOpenChange(next: boolean) {
    // Intercept closing with unsaved changes to offer Save as Draft.
    if (!next && open && hasUnsavedChanges) {
      setShowCloseConfirm(true)
      return
    }
    setOpen(next)
    if (!next) setTimeout(reset, 200)
  }

  function saveDraft() {
    setDraftSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
  }

  function saveDraftAndClose() {
    saveDraft()
    setShowCloseConfirm(false)
    setOpen(false)
    setTimeout(reset, 200)
  }

  function discardAndClose() {
    setShowCloseConfirm(false)
    setOpen(false)
    setTimeout(reset, 200)
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

  function updateLine(id: number, key: keyof LineItem, value: string | boolean) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)))
  }
  function addLine() {
    setLines((prev) => [...prev, emptyLine(Date.now())])
  }
  function removeLine(id: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev))
  }

  const canContinue =
    (step === 0 && category !== null) ||
    (step === 1 &&
      (isProduct
        ? productErrors.length === 0
        : isService
          ? serviceErrors.length === 0
          : isSoftware
            ? softwareErrors.length === 0
            : department.trim() !== "" &&
              (isSupplier ? supplierName.trim() !== "" : description.trim() !== ""))) ||
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
              {step === 1 &&
                (isProduct
                  ? "Buy Product request"
                  : isService
                    ? "Buy Service request"
                    : isSoftware
                      ? "Buy Software request"
                      : "Create a purchase request")}
              {step === 2 && "Upload supporting documents"}
              {step === 3 && "Review Request"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {step === 0 && "Choose a request type to get started. Four quick steps to send for approval."}
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

            {step === 1 && isProduct && (
              <div className="flex flex-col gap-5">
                {/* GENERAL */}
                <Section
                  icon={Layers}
                  iconClass="bg-primary/12 text-primary"
                  title="General"
                  subtitle="The core details of what you want to buy and why."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Request Title" required>
                        <input
                          value={requestTitle}
                          onChange={(e) => setRequestTitle(e.target.value)}
                          placeholder="e.g. Replacement laptops for design team"
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Description / Business Justification"
                        required
                        hint="Explain why the purchase is needed, the business impact, and the reason — don't just repeat the title."
                      >
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Why is this purchase needed? What is the business impact?"
                          rows={3}
                          className={fieldClass}
                        />
                      </Field>
                    </div>
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
                    <Field label="Cost Center" required>
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
                    <Field label="Request Type" hint="Request type cannot be changed here.">
                      <input
                        readOnly
                        value="Buy Product"
                        className={cn(fieldClass, "bg-muted/50 text-muted-foreground")}
                      />
                    </Field>
                    <Field label="Procurement Category" required hint="What is being purchased.">
                      <select
                        value={procurementCategory}
                        onChange={(e) => setProcurementCategory(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Choose category...</option>
                        {procurementCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Business Priority" required>
                      <select
                        value={businessPriority}
                        onChange={(e) => setBusinessPriority(e.target.value)}
                        className={fieldClass}
                      >
                        {businessPriorities.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
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
                  </div>
                </Section>

                {/* PRODUCT DETAILS */}
                <Section
                  icon={Package}
                  iconClass="bg-chart-2/15 text-chart-2"
                  title="Product Details"
                  subtitle="Sourcing, timing, and delivery information."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Preferred Supplier"
                      hint="Optional — leave blank if you don't know the supplier yet."
                    >
                      <select
                        value={supplierState === "Preferred supplier selected" ? supplier : ""}
                        onChange={(e) => {
                          setSupplier(e.target.value)
                          setSupplierState(e.target.value ? "Preferred supplier selected" : "Supplier not known yet")
                        }}
                        disabled={supplierState === "New supplier required"}
                        className={cn(fieldClass, supplierState === "New supplier required" && "opacity-50")}
                      >
                        <option value="">Not selected</option>
                        {suppliers.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Supplier status">
                      <select
                        value={supplierState}
                        onChange={(e) => {
                          setSupplierState(e.target.value)
                          if (e.target.value !== "Preferred supplier selected") setSupplier("")
                        }}
                        className={fieldClass}
                      >
                        {preferredSupplierStates.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Needed By" required hint="Used for delivery and approval planning.">
                      <input
                        type="date"
                        value={neededBy}
                        onChange={(e) => setNeededBy(e.target.value)}
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Purchase Type">
                      <select
                        value={purchaseType}
                        onChange={(e) => setPurchaseType(e.target.value)}
                        className={fieldClass}
                      >
                        {purchaseTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Delivery Location">
                      <select
                        value={deliveryLocationType}
                        onChange={(e) => {
                          setDeliveryLocationType(e.target.value)
                          setDeliveryLocation("")
                          setDeliveryAddress("")
                        }}
                        className={fieldClass}
                      >
                        {deliveryLocationTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {deliveryLocationType === "Custom Address" ? (
                      <Field label="Custom address">
                        <input
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Street, city, postal code"
                          className={fieldClass}
                        />
                      </Field>
                    ) : (
                      <Field label="Select location">
                        <select
                          value={deliveryLocation}
                          onChange={(e) => setDeliveryLocation(e.target.value)}
                          className={fieldClass}
                        >
                          <option value="">Choose {deliveryLocationType.toLowerCase()}...</option>
                          {(predefinedLocations[deliveryLocationType] ?? []).map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>
                </Section>

                {/* LINE ITEMS */}
                <Section
                  icon={ListChecks}
                  iconClass="bg-primary/12 text-primary"
                  title="Line Items"
                  subtitle="Add a line for each product. The estimated total is calculated automatically."
                >
                  <div className="flex flex-col gap-4">
                    {lines.map((line, idx) => {
                      const qty = Number(line.qty) || 0
                      const price = Number(line.price) || 0
                      const lineTotal = qty * price
                      return (
                        <div
                          key={line.id}
                          className="rounded-xl border border-border bg-background p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Item {idx + 1}
                            </span>
                            <button
                              onClick={() => removeLine(line.id)}
                              disabled={lines.length === 1}
                              aria-label="Remove line item"
                              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                              <Field label="Item Name" required>
                                <input
                                  value={line.name}
                                  onChange={(e) => updateLine(line.id, "name", e.target.value)}
                                  placeholder="e.g. Dell Latitude 7440"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-3">
                              <Field label="Item Description">
                                <input
                                  value={line.description}
                                  onChange={(e) => updateLine(line.id, "description", e.target.value)}
                                  placeholder="Configuration, spec, notes"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="Quantity" required>
                                <input
                                  value={line.qty}
                                  onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                                  inputMode="numeric"
                                  placeholder="1"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-2">
                              <Field label="Unit of Measure">
                                <select
                                  value={line.uom}
                                  onChange={(e) => updateLine(line.id, "uom", e.target.value)}
                                  className={fieldClass}
                                >
                                  {unitsOfMeasure.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="Unit Price" required>
                                <input
                                  value={line.price}
                                  onChange={(e) => updateLine(line.id, "price", e.target.value)}
                                  inputMode="numeric"
                                  placeholder="0.00"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-2">
                              <Field label="Line Total" hint="Calculated automatically">
                                <input
                                  readOnly
                                  value={lineTotal ? `${fmt(lineTotal)} ${currency}` : "—"}
                                  className={cn(fieldClass, "bg-muted/50 font-semibold text-foreground")}
                                />
                              </Field>
                            </div>
                          </div>

                          <button
                            onClick={() => updateLine(line.id, "detailsOpen", !line.detailsOpen)}
                            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                          >
                            <ChevronDown
                              className={cn(
                                "size-3.5 transition-transform",
                                line.detailsOpen && "rotate-180",
                              )}
                            />
                            {line.detailsOpen ? "Hide product details" : "Add product details (optional)"}
                          </button>

                          {line.detailsOpen && (
                            <div className="mt-3 grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
                              <Field label="Preferred Brand">
                                <input
                                  value={line.brand}
                                  onChange={(e) => updateLine(line.id, "brand", e.target.value)}
                                  placeholder="e.g. Dell"
                                  className={fieldClass}
                                />
                              </Field>
                              <Field label="Preferred Model">
                                <input
                                  value={line.model}
                                  onChange={(e) => updateLine(line.id, "model", e.target.value)}
                                  placeholder="e.g. Latitude 7440"
                                  className={fieldClass}
                                />
                              </Field>
                              <Field label="Warranty Requirement">
                                <input
                                  value={line.warranty}
                                  onChange={(e) => updateLine(line.id, "warranty", e.target.value)}
                                  placeholder="e.g. 3 years on-site"
                                  className={fieldClass}
                                />
                              </Field>
                              <label className="flex items-end gap-2 pb-2.5 text-sm text-foreground">
                                <input
                                  type="checkbox"
                                  checked={line.equivalentAllowed}
                                  onChange={(e) => updateLine(line.id, "equivalentAllowed", e.target.checked)}
                                  className="size-4 rounded border-border text-primary focus:ring-primary"
                                />
                                Equivalent products allowed
                              </label>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <button
                      onClick={addLine}
                      className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      <Plus className="size-4" />
                      Add Line Item
                    </button>

                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                      <span className="text-sm font-medium text-muted-foreground">Estimated Total</span>
                      <span className="text-lg font-bold text-foreground">
                        {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : `0 ${currency}`}
                      </span>
                    </div>
                  </div>
                </Section>

                {productErrors.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        Resolve the following before continuing
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-destructive/90">
                        {productErrors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && isService && (
              <div className="flex flex-col gap-5">
                {/* GENERAL */}
                <Section
                  icon={Layers}
                  iconClass="bg-primary/12 text-primary"
                  title="General"
                  subtitle="The core details of the service and why it is needed."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Request Title" required>
                        <input
                          value={requestTitle}
                          onChange={(e) => setRequestTitle(e.target.value)}
                          placeholder="e.g. Marketing Agency Retainer – Q3"
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Description / Business Justification"
                        required
                        hint="Explain why the service is needed, the problem it solves, and the expected outcome — don't repeat the title."
                      >
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Why is this service needed? What outcome is expected?"
                          rows={3}
                          className={fieldClass}
                        />
                      </Field>
                    </div>
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
                    <Field label="Cost Center" required>
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
                    <Field label="Request Type" hint="Request type cannot be changed here.">
                      <input
                        readOnly
                        value="Buy Service"
                        className={cn(fieldClass, "bg-muted/50 text-muted-foreground")}
                      />
                    </Field>
                    <Field label="Procurement Category" required hint="Drives approval routing and reporting.">
                      <select
                        value={procurementCategory}
                        onChange={(e) => setProcurementCategory(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Choose category...</option>
                        {serviceProcurementCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Business Priority" required>
                      <select
                        value={businessPriority}
                        onChange={(e) => setBusinessPriority(e.target.value)}
                        className={fieldClass}
                      >
                        {businessPriorities.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
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
                  </div>
                </Section>

                {/* SERVICE DETAILS */}
                <Section
                  icon={Briefcase}
                  iconClass="bg-chart-2/15 text-chart-2"
                  title="Service Details"
                  subtitle="Sourcing, timing, ownership, and delivery of the service."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Preferred Supplier" hint="Optional — leave blank if not known yet.">
                      <select
                        value={supplierState === "Supplier selected" ? supplier : ""}
                        onChange={(e) => {
                          setSupplier(e.target.value)
                          setSupplierState(e.target.value ? "Supplier selected" : "Supplier not selected")
                        }}
                        disabled={supplierState === "Competitive sourcing required" || supplierState === "Supplier not known"}
                        className={cn(
                          fieldClass,
                          (supplierState === "Competitive sourcing required" || supplierState === "Supplier not known") &&
                            "opacity-50",
                        )}
                      >
                        <option value="">Not selected</option>
                        {suppliers.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Supplier status">
                      <select
                        value={supplierState}
                        onChange={(e) => {
                          setSupplierState(e.target.value)
                          if (e.target.value !== "Supplier selected") setSupplier("")
                        }}
                        className={fieldClass}
                      >
                        {supplierStatusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Service Start Date" required>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label="Service End Date"
                      required
                      error={datesInvalid ? "End date cannot be before the start date." : undefined}
                    >
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={cn(fieldClass, datesInvalid && "border-destructive focus:border-destructive focus:ring-destructive")}
                      />
                    </Field>
                    {serviceDurationMonths > 0 && (
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                          <CalendarClock className="size-3.5 text-primary" />
                          Service Duration: <span className="font-semibold text-foreground">{serviceDurationMonths} month{serviceDurationMonths === 1 ? "" : "s"}</span>
                        </div>
                      </div>
                    )}
                    <Field label="Business Owner" required hint="Responsible for delivery, vendor, budget and renewals.">
                      <input
                        value={businessOwner}
                        onChange={(e) => setBusinessOwner(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Service Region" hint="Where the service is delivered.">
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
                    <Field label="Service Type" required>
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className={fieldClass}
                      >
                        {serviceTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Delivery Model">
                      <select
                        value={deliveryModel}
                        onChange={(e) => setDeliveryModel(e.target.value)}
                        className={fieldClass}
                      >
                        {deliveryModels.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label="Contract Required"
                      hint={
                        contractAutoTriggered && contractRequired !== "No"
                          ? "Procurement rules suggest a contract for this request."
                          : undefined
                      }
                    >
                      <select
                        value={contractRequired}
                        onChange={(e) => setContractRequired(e.target.value)}
                        className={fieldClass}
                      >
                        {contractRequiredOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Statement of Work Required">
                      <select
                        value={sowRequired}
                        onChange={(e) => setSowRequired(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </Field>
                  </div>

                  {(contractEffective || sowEffective) && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3">
                      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        Based on this request, the Documents step will require{" "}
                        {[contractEffective && "a contract draft & service agreement", sowEffective && "a statement of work"]
                          .filter(Boolean)
                          .join(" and ")}
                        .
                      </p>
                    </div>
                  )}
                </Section>

                {/* RECURRING DETAILS */}
                {isRecurring && (
                  <Section
                    icon={CalendarClock}
                    iconClass="bg-primary/12 text-primary"
                    title="Recurring Service Details"
                    subtitle="Billing and renewal terms for the recurring engagement."
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Billing Frequency">
                        <select
                          value={billingFrequency}
                          onChange={(e) => setBillingFrequency(e.target.value)}
                          className={fieldClass}
                        >
                          {billingFrequencies.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Contract Duration" hint="e.g. 12 months">
                        <input
                          value={contractDuration}
                          onChange={(e) => setContractDuration(e.target.value)}
                          placeholder="e.g. 12 months"
                          className={fieldClass}
                        />
                      </Field>
                      <Field label="Auto Renewal">
                        <select
                          value={autoRenewal}
                          onChange={(e) => setAutoRenewal(e.target.value)}
                          className={fieldClass}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </Field>
                      {autoRenewal === "Yes" && (
                        <Field label="Renewal Notice Period">
                          <select
                            value={renewalNotice}
                            onChange={(e) => setRenewalNotice(e.target.value)}
                            className={fieldClass}
                          >
                            {renewalNoticePeriods.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </Field>
                      )}
                    </div>
                  </Section>
                )}

                {/* LINE ITEMS */}
                <Section
                  icon={ListChecks}
                  iconClass="bg-primary/12 text-primary"
                  title="Line Items"
                  subtitle="Add a line for each service or deliverable. The estimated total is calculated automatically."
                >
                  <div className="flex flex-col gap-4">
                    {lines.map((line, idx) => {
                      const qty = Number(line.qty) || 0
                      const rate = Number(line.price) || 0
                      const lineTotal = qty * rate
                      return (
                        <div key={line.id} className="rounded-xl border border-border bg-background p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Item {idx + 1}
                            </span>
                            <button
                              onClick={() => removeLine(line.id)}
                              disabled={lines.length === 1}
                              aria-label="Remove line item"
                              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                              <Field label="Service / Deliverable" required>
                                <input
                                  value={line.name}
                                  onChange={(e) => updateLine(line.id, "name", e.target.value)}
                                  placeholder="e.g. Strategy Workshop"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-3">
                              <Field label="Description">
                                <input
                                  value={line.description}
                                  onChange={(e) => updateLine(line.id, "description", e.target.value)}
                                  placeholder="Scope or notes"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="Quantity" required>
                                <input
                                  value={line.qty}
                                  onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                                  inputMode="numeric"
                                  placeholder="1"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="Unit">
                                <select
                                  value={line.uom}
                                  onChange={(e) => updateLine(line.id, "uom", e.target.value)}
                                  className={fieldClass}
                                >
                                  {serviceUnits.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="Rate" required>
                                <input
                                  value={line.price}
                                  onChange={(e) => updateLine(line.id, "price", e.target.value)}
                                  inputMode="numeric"
                                  placeholder="0.00"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="Billing Period">
                                <select
                                  value={line.billingPeriod}
                                  onChange={(e) => updateLine(line.id, "billingPeriod", e.target.value)}
                                  className={fieldClass}
                                >
                                  {billingPeriods.map((b) => (
                                    <option key={b} value={b}>
                                      {b}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                            </div>
                            <div className="sm:col-span-2">
                              <Field label="Line Total" hint="Calculated automatically">
                                <input
                                  readOnly
                                  value={lineTotal ? `${fmt(lineTotal)} ${currency}` : "—"}
                                  className={cn(fieldClass, "bg-muted/50 font-semibold text-foreground")}
                                />
                              </Field>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    <button
                      onClick={addLine}
                      className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      <Plus className="size-4" />
                      Add Line Item
                    </button>

                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                      <span className="text-sm font-medium text-muted-foreground">Estimated Total</span>
                      <span className="text-lg font-bold text-foreground">
                        {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : `0 ${currency}`}
                      </span>
                    </div>
                  </div>
                </Section>

                {serviceErrors.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        Resolve the following before continuing
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-destructive/90">
                        {serviceErrors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && isSoftware && (
              <div className="flex flex-col gap-5">
                {/* GENERAL */}
                <Section
                  icon={Layers}
                  iconClass="bg-primary/12 text-primary"
                  title="General"
                  subtitle="The core details of the software request and why it is needed."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Request Title" required>
                        <input
                          value={requestTitle}
                          onChange={(e) => setRequestTitle(e.target.value)}
                          placeholder="e.g. CRM platform – Sales team"
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Description / Business Justification"
                        required
                        hint="Explain why the software is needed and the expected outcome — don't repeat the title."
                      >
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Why is this software needed? What problem does it solve?"
                          rows={3}
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                    <Field label="Department" required>
                      <select value={department} onChange={(e) => setDepartment(e.target.value)} className={fieldClass}>
                        <option value="">Choose department...</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Cost Center" required>
                      <select value={costCenter} onChange={(e) => setCostCenter(e.target.value)} className={fieldClass}>
                        <option value="">Choose cost center...</option>
                        {costCenters.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Request Type" hint="Request type cannot be changed here.">
                      <input
                        readOnly
                        value="Buy Software"
                        className={cn(fieldClass, "bg-muted/50 text-muted-foreground")}
                      />
                    </Field>
                    <Field label="Procurement Category" required hint="Drives approval routing and reporting.">
                      <select
                        value={procurementCategory}
                        onChange={(e) => setProcurementCategory(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Choose category...</option>
                        {softwareProcurementCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Business Priority" required>
                      <select
                        value={businessPriority}
                        onChange={(e) => setBusinessPriority(e.target.value)}
                        className={fieldClass}
                      >
                        {businessPriorities.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Currency">
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={fieldClass}>
                        {["EUR", "USD", "GBP", "PLN"].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </Section>

                {/* SOFTWARE DETAILS */}
                <Section
                  icon={Monitor}
                  iconClass="bg-chart-2/15 text-chart-2"
                  title="Software Details"
                  subtitle="What the software is, who owns it, and how it is acquired."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Software Name" required>
                      <input
                        value={softwareName}
                        onChange={(e) => setSoftwareName(e.target.value)}
                        placeholder="e.g. Salesforce Sales Cloud"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Software Type">
                      <select value={softwareType} onChange={(e) => setSoftwareType(e.target.value)} className={fieldClass}>
                        {softwareTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Software Purpose" hint="What the tool will be used for.">
                        <input
                          value={softwarePurpose}
                          onChange={(e) => setSoftwarePurpose(e.target.value)}
                          placeholder="e.g. Manage the sales pipeline and customer records"
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                    <Field label="Business Owner" required hint="Owns the tool, budget and renewals.">
                      <input
                        value={businessOwner}
                        onChange={(e) => setBusinessOwner(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="IT Owner" hint="Technical owner / admin.">
                      <input
                        value={itOwner}
                        onChange={(e) => setItOwner(e.target.value)}
                        placeholder="e.g. IT Service Desk"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Preferred Supplier" hint="Optional — leave blank if not known yet.">
                      <select
                        value={supplierState === "Supplier selected" ? supplier : ""}
                        onChange={(e) => {
                          setSupplier(e.target.value)
                          setSupplierState(e.target.value ? "Supplier selected" : "Supplier not selected")
                        }}
                        className={fieldClass}
                      >
                        <option value="">Not selected</option>
                        {suppliers.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Supplier status">
                      <select
                        value={supplierState}
                        onChange={(e) => {
                          setSupplierState(e.target.value)
                          if (e.target.value !== "Supplier selected") setSupplier("")
                        }}
                        className={fieldClass}
                      >
                        {supplierStatusOptions.concat("New supplier required").filter((v, i, a) => a.indexOf(v) === i).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Subscription Start Date">
                      <input
                        type="date"
                        value={subscriptionStart}
                        onChange={(e) => setSubscriptionStart(e.target.value)}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      label="Subscription End Date"
                      error={subscriptionDatesInvalid ? "End date cannot be before the start date." : undefined}
                    >
                      <input
                        type="date"
                        value={subscriptionEnd}
                        min={subscriptionStart || undefined}
                        onChange={(e) => setSubscriptionEnd(e.target.value)}
                        className={cn(
                          fieldClass,
                          subscriptionDatesInvalid && "border-destructive focus:border-destructive focus:ring-destructive",
                        )}
                      />
                    </Field>
                    <Field label="Contract Duration" hint="e.g. 12 months">
                      <input
                        value={softwareContractDuration}
                        onChange={(e) => setSoftwareContractDuration(e.target.value)}
                        placeholder="e.g. 12 months"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Number of Users / Seats" hint="Calculated from line items.">
                      <input
                        readOnly
                        value={totalSeats > 0 ? String(totalSeats) : "—"}
                        className={cn(fieldClass, "bg-muted/50 text-muted-foreground")}
                      />
                    </Field>
                    <Field label="New Software / Replacement">
                      <select
                        value={softwareAcquisition}
                        onChange={(e) => setSoftwareAcquisition(e.target.value)}
                        className={fieldClass}
                      >
                        {softwareAcquisitionTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {isReplacement && (
                      <>
                        <Field label="Existing Software Name" required>
                          <input
                            value={existingSoftwareName}
                            onChange={(e) => setExistingSoftwareName(e.target.value)}
                            placeholder="Software being replaced"
                            className={fieldClass}
                          />
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Replacement Reason" required>
                            <Textarea
                              value={replacementReason}
                              onChange={(e) => setReplacementReason(e.target.value)}
                              placeholder="Why is the existing software being replaced?"
                              rows={2}
                              className={fieldClass}
                            />
                          </Field>
                        </div>
                      </>
                    )}
                  </div>
                </Section>

                {/* LICENSE & RENEWAL */}
                <Section
                  icon={CalendarClock}
                  iconClass="bg-primary/12 text-primary"
                  title="License & Renewal"
                  subtitle="Licensing model and renewal / cancellation terms."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="License Type">
                      <select value={licenseType} onChange={(e) => setLicenseType(e.target.value)} className={fieldClass}>
                        {licensePlans.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Billing Cycle">
                      <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className={fieldClass}>
                        {softwareBillingCycles.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Auto Renewal">
                      <select
                        value={softwareAutoRenewal}
                        onChange={(e) => setSoftwareAutoRenewal(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </Field>
                    <Field
                      label="Renewal Date"
                      error={
                        softwareAutoRenewal === "Yes" && !renewalDate && !cancellationDeadline
                          ? "Provide a renewal date or cancellation deadline."
                          : undefined
                      }
                    >
                      <input
                        type="date"
                        value={renewalDate}
                        onChange={(e) => setRenewalDate(e.target.value)}
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Cancellation Notice Period">
                      <select
                        value={cancellationNotice}
                        onChange={(e) => setCancellationNotice(e.target.value)}
                        className={fieldClass}
                      >
                        {cancellationNoticePeriods.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Cancellation Deadline" hint="Last day to cancel before renewal.">
                      <input
                        type="date"
                        value={cancellationDeadline}
                        onChange={(e) => setCancellationDeadline(e.target.value)}
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                </Section>

                {/* DATA PROTECTION & COMPLIANCE */}
                <Section
                  icon={ShieldCheck}
                  iconClass="bg-destructive/12 text-destructive"
                  title="Data Protection & Compliance"
                  subtitle="GDPR review. Privacy fields appear only when personal data is processed."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Personal Data Processed" hint="Does the tool process personal data?">
                      <select
                        value={personalDataProcessed}
                        onChange={(e) => {
                          setPersonalDataProcessed(e.target.value)
                          if (e.target.value === "No") {
                            setPersonalDataCategories([])
                            setDataSubjectTypes([])
                            setSensitiveDataProcessed("No")
                            setPrivacyReviewRequired("No")
                            setDpaAvailable("Unknown")
                          }
                        }}
                        className={fieldClass}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </Field>
                    <Field label="Data Hosting Region">
                      <select value={hostingRegion} onChange={(e) => setHostingRegion(e.target.value)} className={fieldClass}>
                        {dataHostingRegions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {processesPersonalData && (
                      <>
                        <div className="sm:col-span-2">
                          <Field label="Personal Data Categories">
                            <ChipMultiSelect
                              options={personalDataCategoryOptions}
                              selected={personalDataCategories}
                              onToggle={(v) =>
                                setPersonalDataCategories((prev) =>
                                  prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                                )
                              }
                            />
                          </Field>
                        </div>
                        <div className="sm:col-span-2">
                          <Field label="Data Subject Types">
                            <ChipMultiSelect
                              options={dataSubjectTypeOptions}
                              selected={dataSubjectTypes}
                              onToggle={(v) =>
                                setDataSubjectTypes((prev) =>
                                  prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                                )
                              }
                            />
                          </Field>
                        </div>
                        <Field label="Sensitive Data Processed" hint="Special category data under GDPR.">
                          <select
                            value={sensitiveDataProcessed}
                            onChange={(e) => setSensitiveDataProcessed(e.target.value)}
                            className={fieldClass}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </Field>
                        <Field label="DPA Required" hint="Determined automatically by GDPR rules.">
                          <input
                            readOnly
                            value={dpaRequiredEffective ? "Yes (auto)" : "No"}
                            className={cn(fieldClass, "bg-muted/50 text-muted-foreground")}
                          />
                        </Field>
                        <Field label="DPA Available">
                          <select value={dpaAvailable} onChange={(e) => setDpaAvailable(e.target.value)} className={fieldClass}>
                            <option value="Unknown">Unknown</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </Field>
                        <Field label="Privacy Review Required">
                          <select
                            value={privacyReviewEffective ? "Yes" : privacyReviewRequired}
                            onChange={(e) => setPrivacyReviewRequired(e.target.value)}
                            disabled={privacyReviewEffective}
                            className={cn(fieldClass, privacyReviewEffective && "bg-muted/50 text-muted-foreground")}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </Field>
                      </>
                    )}

                    <Field label="Security Review Required" hint={securityReviewEffective ? "Auto-required for this request." : undefined}>
                      <select
                        value={securityReviewEffective ? "Yes" : securityReviewManual}
                        onChange={(e) => setSecurityReviewManual(e.target.value)}
                        disabled={securityReviewEffective}
                        className={cn(fieldClass, securityReviewEffective && "bg-muted/50 text-muted-foreground")}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </Field>
                  </div>
                </Section>

                {/* SECURITY & IT */}
                <Section
                  icon={Settings2}
                  iconClass="bg-chart-3/12 text-chart-3"
                  title="Security & IT"
                  subtitle="Integration, access, and certification requirements."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { label: "SSO Required", value: ssoRequired, set: setSsoRequired },
                      { label: "SCIM Required", value: scimRequired, set: setScimRequired },
                      { label: "Integrations Required", value: integrationsRequired, set: setIntegrationsRequired },
                      { label: "Admin Access Required", value: adminAccessRequired, set: setAdminAccessRequired },
                    ].map((f) => (
                      <Field key={f.label} label={f.label}>
                        <select value={f.value} onChange={(e) => f.set(e.target.value)} className={fieldClass}>
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </Field>
                    ))}
                    {[
                      { label: "SOC 2 Available", value: soc2Available, set: setSoc2Available },
                      { label: "ISO 27001 Available", value: iso27001Available, set: setIso27001Available },
                      { label: "Data Export Available", value: dataExportAvailable, set: setDataExportAvailable },
                    ].map((f) => (
                      <Field key={f.label} label={f.label}>
                        <select value={f.value} onChange={(e) => f.set(e.target.value)} className={fieldClass}>
                          <option value="Unknown">Unknown</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </Field>
                    ))}
                  </div>
                </Section>

                {/* LINE ITEMS */}
                <Section
                  icon={ListChecks}
                  iconClass="bg-primary/12 text-primary"
                  title="Line Items"
                  subtitle="Add a line per license / plan. The estimated total is calculated automatically."
                >
                  <div className="flex flex-col gap-4">
                    {lines.map((line, idx) => {
                      const seats = Number(line.qty) || 0
                      const perSeat = Number(line.price) || 0
                      const oneTime = Number(line.oneTimeFee) || 0
                      const recurring = seats * perSeat
                      const lineTotal = recurring + oneTime
                      return (
                        <div key={line.id} className="rounded-xl border border-border bg-background p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Item {idx + 1}
                            </span>
                            <button
                              onClick={() => removeLine(line.id)}
                              disabled={lines.length === 1}
                              aria-label="Remove line item"
                              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                              <Field label="License / Plan" required>
                                <input
                                  value={line.name}
                                  onChange={(e) => updateLine(line.id, "name", e.target.value)}
                                  placeholder="e.g. Enterprise plan"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="Seats" required={seatBasedLicensing}>
                                <input
                                  value={line.qty}
                                  onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                                  inputMode="numeric"
                                  placeholder="25"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="Price / Seat" required>
                                <input
                                  value={line.price}
                                  onChange={(e) => updateLine(line.id, "price", e.target.value)}
                                  inputMode="numeric"
                                  placeholder="0.00"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-1">
                              <Field label="One-Time Fee">
                                <input
                                  value={line.oneTimeFee}
                                  onChange={(e) => updateLine(line.id, "oneTimeFee", e.target.value)}
                                  inputMode="numeric"
                                  placeholder="0.00"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                            <div className="sm:col-span-2">
                              <Field label="Billing Cycle">
                                <select
                                  value={line.billingPeriod}
                                  onChange={(e) => updateLine(line.id, "billingPeriod", e.target.value)}
                                  className={fieldClass}
                                >
                                  {softwareBillingCycles.map((b) => (
                                    <option key={b} value={b}>
                                      {b}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                            </div>
                            <div className="sm:col-span-2">
                              <Field label="Subscription Period">
                                <select
                                  value={line.subscriptionPeriod}
                                  onChange={(e) => updateLine(line.id, "subscriptionPeriod", e.target.value)}
                                  className={fieldClass}
                                >
                                  {subscriptionPeriods.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                            </div>
                            <div className="sm:col-span-2">
                              <Field label="Line Total" hint="Recurring + one-time">
                                <input
                                  readOnly
                                  value={lineTotal ? `${fmt(lineTotal)} ${currency}` : "—"}
                                  className={cn(fieldClass, "bg-muted/50 font-semibold text-foreground")}
                                />
                              </Field>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    <button
                      onClick={addLine}
                      className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      <Plus className="size-4" />
                      Add Line Item
                    </button>

                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                      <span className="text-sm font-medium text-muted-foreground">Estimated Total</span>
                      <span className="text-lg font-bold text-foreground">
                        {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : `0 ${currency}`}
                      </span>
                    </div>
                  </div>
                </Section>

                {/* ADDITIONAL INFORMATION */}
                <Section
                  icon={Settings2}
                  iconClass="bg-chart-3/12 text-chart-3"
                  title="Additional Information"
                  subtitle="Optional notes or workspace-specific details."
                >
                  <p className="text-xs text-muted-foreground">
                    Workspace-specific fields can be configured by an administrator. None are required for this request.
                  </p>
                </Section>

                {softwareErrors.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        Resolve the following before continuing
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-destructive/90">
                        {softwareErrors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && !isProduct && !isService && !isSoftware && (
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
                      : isProduct || isService || isSoftware
                        ? "Requirements are generated automatically from this request."
                        : "Attach quotes and approvals to support this request."
                  }
                >
                  {(isProduct || isService || isSoftware) && (
                    <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3">
                      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        {isSoftware
                          ? "Document requirements below are generated from data protection, security, certification, and contract rules. They update as your request changes."
                          : isService
                            ? "Document requirements below are generated from the contract requirement, statement of work, service value, and supplier status. They update as your request changes."
                            : "Document requirements below are generated from the request value, procurement category, and line item details. They update as your request changes."}
                      </p>
                    </div>
                  )}
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

            {step === 3 && isProduct && (
              <div className="flex flex-col gap-5">
                {/* Validation summary */}
                {productErrors.length > 0 ? (
                  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        {productErrors.length} issue{productErrors.length === 1 ? "" : "s"} must be resolved before submitting
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-destructive/90">
                        {productErrors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <Check className="size-4 shrink-0 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      All required information is complete. Ready to submit for approval.
                    </p>
                  </div>
                )}

                {/* General */}
                <ReviewBlock title="General" onEdit={() => setStep(1)}>
                  <MetaCell label="Request Type" value="Buy Product" />
                  <MetaCell label="Request Title" value={requestTitle || "Not provided"} />
                  <MetaCell label="Department" value={department || "Not provided"} />
                  <MetaCell label="Cost Center" value={costCenter || "Not provided"} />
                  <MetaCell label="Procurement Category" value={procurementCategory || "Not provided"} />
                  <MetaCell label="Business Priority" value={businessPriority} />
                  <MetaCell label="Currency" value={currency} />
                  <div className="col-span-2 sm:col-span-4">
                    <MetaCell label="Description / Business Justification" value={description || "Not provided"} />
                  </div>
                </ReviewBlock>

                {/* Product details */}
                <ReviewBlock title="Product Details" onEdit={() => setStep(1)}>
                  <MetaCell
                    label="Preferred Supplier"
                    value={supplier || (supplierState !== "Preferred supplier selected" ? supplierState : "Not selected")}
                  />
                  <MetaCell
                    label="Needed By"
                    value={neededBy ? new Date(neededBy).toLocaleDateString("en-GB") : "Not provided"}
                  />
                  <MetaCell label="Purchase Type" value={purchaseType} />
                  <MetaCell
                    label="Delivery Location"
                    value={
                      deliveryLocationType === "Custom Address"
                        ? deliveryAddress || "Custom address not set"
                        : deliveryLocation || deliveryLocationType
                    }
                  />
                </ReviewBlock>

                {/* Line items */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Line Items</h3>
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <th className="px-5 py-3 text-left font-semibold">Item</th>
                          <th className="px-5 py-3 text-center font-semibold">Qty</th>
                          <th className="px-5 py-3 text-center font-semibold">UoM</th>
                          <th className="px-5 py-3 text-right font-semibold">Unit price</th>
                          <th className="px-5 py-3 text-right font-semibold">Line total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filledLines.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">
                              No line items added.
                            </td>
                          </tr>
                        ) : (
                          filledLines.map((l) => {
                            const qty = Number(l.qty) || 0
                            const price = Number(l.price) || 0
                            return (
                              <tr key={l.id}>
                                <td className="px-5 py-3">
                                  <p className="font-medium text-foreground">{l.name}</p>
                                  {l.description && (
                                    <p className="text-xs text-muted-foreground">{l.description}</p>
                                  )}
                                </td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{qty || "—"}</td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{l.uom}</td>
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
                          <td colSpan={4} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Estimated Total
                          </td>
                          <td className="px-5 py-3 text-right text-base font-bold text-foreground">
                            {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : "No cost"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Documents */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Documents</h3>
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
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
                    {requiredDocsMissing && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
                        <AlertCircle className="size-3.5" />
                        Mandatory documents are still missing.
                      </p>
                    )}
                  </div>
                </div>

                {/* Approval route preview */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border p-5">
                    <Workflow className="size-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Generated Approval Route</h3>
                  </div>
                  <div className="flex flex-col gap-3 p-5">
                    {[
                      { role: "Requester", who: "You", note: "Submits the request" },
                      { role: "Department Manager", who: department || "Department head", note: "Reviews need & budget" },
                      ...(isHighValueProduct
                        ? [{ role: "Finance", who: "Finance team", note: "High-value approval" }]
                        : []),
                      { role: "Procurement", who: "Procurement team", note: "Sourcing & PO" },
                    ].map((s, i, arr) => (
                      <div key={s.role} className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{s.role}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.who} · {s.note}
                          </p>
                        </div>
                        {i < arr.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
                      </div>
                    ))}
                    {isHighValueProduct && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        A Finance step was added automatically because the estimated total is high value.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && isService && (
              <div className="flex flex-col gap-5">
                {/* Validation summary */}
                {serviceErrors.length > 0 ? (
                  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        {serviceErrors.length} issue{serviceErrors.length === 1 ? "" : "s"} must be resolved before submitting
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-destructive/90">
                        {serviceErrors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <Check className="size-4 shrink-0 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      All required information is complete. Ready to submit for approval.
                    </p>
                  </div>
                )}

                {/* General */}
                <ReviewBlock title="General" onEdit={() => setStep(1)}>
                  <MetaCell label="Request Type" value="Buy Service" />
                  <MetaCell label="Request Title" value={requestTitle || "Not provided"} />
                  <MetaCell label="Department" value={department || "Not provided"} />
                  <MetaCell label="Cost Center" value={costCenter || "Not provided"} />
                  <MetaCell label="Procurement Category" value={procurementCategory || "Not provided"} />
                  <MetaCell label="Business Priority" value={businessPriority} />
                  <MetaCell label="Currency" value={currency} />
                  <div className="col-span-2 sm:col-span-4">
                    <MetaCell label="Description / Business Justification" value={description || "Not provided"} />
                  </div>
                </ReviewBlock>

                {/* Service details */}
                <ReviewBlock title="Service Details" onEdit={() => setStep(1)}>
                  <MetaCell
                    label="Preferred Supplier"
                    value={supplier || (supplierState !== "Supplier selected" ? supplierState : "Not selected")}
                  />
                  <MetaCell label="Business Owner" value={businessOwner || "Not provided"} />
                  <MetaCell
                    label="Service Start"
                    value={startDate ? new Date(startDate).toLocaleDateString("en-GB") : "Not provided"}
                  />
                  <MetaCell
                    label="Service End"
                    value={endDate ? new Date(endDate).toLocaleDateString("en-GB") : "Not provided"}
                  />
                  <MetaCell label="Service Region" value={region || "Not set"} />
                  <MetaCell label="Service Type" value={serviceType} />
                  <MetaCell label="Delivery Model" value={deliveryModel} />
                  <MetaCell label="Contract Required" value={contractEffective ? "Yes" : contractRequired} />
                  {isRecurring && (
                    <>
                      <MetaCell label="Billing Frequency" value={billingFrequency} />
                      <MetaCell label="Contract Duration" value={contractDuration || "Not set"} />
                      <MetaCell label="Auto Renewal" value={autoRenewal} />
                      {autoRenewal === "Yes" && <MetaCell label="Renewal Notice" value={renewalNotice} />}
                    </>
                  )}
                </ReviewBlock>

                {/* Line items */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Line Items</h3>
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <th className="px-5 py-3 text-left font-semibold">Service / Deliverable</th>
                          <th className="px-5 py-3 text-center font-semibold">Qty</th>
                          <th className="px-5 py-3 text-center font-semibold">Unit</th>
                          <th className="px-5 py-3 text-right font-semibold">Rate</th>
                          <th className="px-5 py-3 text-center font-semibold">Billing</th>
                          <th className="px-5 py-3 text-right font-semibold">Line total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filledLines.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">
                              No line items added.
                            </td>
                          </tr>
                        ) : (
                          filledLines.map((l) => {
                            const qty = Number(l.qty) || 0
                            const rate = Number(l.price) || 0
                            return (
                              <tr key={l.id}>
                                <td className="px-5 py-3">
                                  <p className="font-medium text-foreground">{l.name}</p>
                                  {l.description && (
                                    <p className="text-xs text-muted-foreground">{l.description}</p>
                                  )}
                                </td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{qty || "—"}</td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{l.uom}</td>
                                <td className="px-5 py-3 text-right text-muted-foreground">
                                  {rate ? `${fmt(rate)} ${currency}` : "—"}
                                </td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{l.billingPeriod}</td>
                                <td className="px-5 py-3 text-right font-semibold text-foreground">
                                  {qty && rate ? `${fmt(qty * rate)} ${currency}` : "—"}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/40">
                          <td colSpan={5} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Estimated Total
                          </td>
                          <td className="px-5 py-3 text-right text-base font-bold text-foreground">
                            {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : "No cost"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Documents */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Documents</h3>
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
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
                    {requiredDocsMissing && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
                        <AlertCircle className="size-3.5" />
                        Mandatory documents are still missing.
                      </p>
                    )}
                  </div>
                </div>

                {/* Approval route preview */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border p-5">
                    <Workflow className="size-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Generated Approval Route</h3>
                  </div>
                  <div className="flex flex-col gap-3 p-5">
                    {[
                      { role: "Requester", who: "You", note: "Submits the request" },
                      { role: "Department Manager", who: department || "Department head", note: "Reviews need & budget" },
                      { role: "Business Owner", who: businessOwner || "Service owner", note: "Confirms service scope" },
                      ...(procurementCategory === "Legal"
                        ? [{ role: "Legal", who: "Legal team", note: "Legal service review" }]
                        : []),
                      ...(procurementCategory === "Marketing"
                        ? [{ role: "Marketing Director", who: "Marketing lead", note: "Marketing service review" }]
                        : []),
                      ...(isHighValueService
                        ? [{ role: "Finance", who: "Finance team", note: "High-value approval" }]
                        : []),
                      { role: "Procurement", who: "Procurement team", note: "Sourcing & contract" },
                    ].map((s, i, arr) => (
                      <div key={s.role} className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{s.role}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.who} · {s.note}
                          </p>
                        </div>
                        {i < arr.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
                      </div>
                    ))}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Approval steps are generated from procurement category, service value, and supplier status — not hard-coded.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && isSoftware && (
              <div className="flex flex-col gap-5">
                {/* Validation summary */}
                {softwareErrors.length > 0 ? (
                  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        {softwareErrors.length} issue{softwareErrors.length === 1 ? "" : "s"} must be resolved before submitting
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-destructive/90">
                        {softwareErrors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <Check className="size-4 shrink-0 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      All required information is complete. Ready to submit for approval.
                    </p>
                  </div>
                )}

                {/* Software details */}
                <ReviewBlock title="Software Details" onEdit={() => setStep(1)}>
                  <MetaCell label="Request Type" value="Buy Software" />
                  <MetaCell label="Request Title" value={requestTitle || "Not provided"} />
                  <MetaCell label="Software Name" value={softwareName || "Not provided"} />
                  <MetaCell label="Software Type" value={softwareType} />
                  <MetaCell label="Department" value={department || "Not provided"} />
                  <MetaCell label="Cost Center" value={costCenter || "Not provided"} />
                  <MetaCell label="Procurement Category" value={procurementCategory || "Not provided"} />
                  <MetaCell label="Business Priority" value={businessPriority} />
                  <MetaCell label="Business Owner" value={businessOwner || "Not provided"} />
                  <MetaCell label="IT Owner" value={itOwner || "Not provided"} />
                  <MetaCell
                    label="Preferred Supplier"
                    value={supplier || (supplierState !== "Supplier selected" ? supplierState : "Not selected")}
                  />
                  <MetaCell label="Acquisition" value={softwareAcquisition} />
                  {isReplacement && <MetaCell label="Replacing" value={existingSoftwareName || "Not provided"} />}
                  <div className="col-span-2 sm:col-span-4">
                    <MetaCell label="Description / Business Justification" value={description || "Not provided"} />
                  </div>
                </ReviewBlock>

                {/* Licensing details */}
                <ReviewBlock title="Licensing Details" onEdit={() => setStep(1)}>
                  <MetaCell label="License Type" value={licenseType} />
                  <MetaCell label="Billing Cycle" value={billingCycle} />
                  <MetaCell label="Number of Seats" value={totalSeats > 0 ? String(totalSeats) : "—"} />
                  <MetaCell label="Contract Duration" value={softwareContractDuration || "Not set"} />
                  <MetaCell
                    label="Subscription Start"
                    value={subscriptionStart ? new Date(subscriptionStart).toLocaleDateString("en-GB") : "Not set"}
                  />
                  <MetaCell
                    label="Subscription End"
                    value={subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString("en-GB") : "Not set"}
                  />
                  <MetaCell label="Auto Renewal" value={softwareAutoRenewal} />
                  <MetaCell
                    label="Renewal Date"
                    value={renewalDate ? new Date(renewalDate).toLocaleDateString("en-GB") : "Not set"}
                  />
                  <MetaCell label="Cancellation Notice" value={cancellationNotice} />
                  <MetaCell
                    label="Cancellation Deadline"
                    value={cancellationDeadline ? new Date(cancellationDeadline).toLocaleDateString("en-GB") : "Not set"}
                  />
                </ReviewBlock>

                {/* Data protection details */}
                <ReviewBlock title="Data Protection Details" onEdit={() => setStep(1)}>
                  <MetaCell label="Personal Data Processed" value={personalDataProcessed} />
                  <MetaCell label="Data Hosting Region" value={hostingRegion} />
                  {processesPersonalData && (
                    <>
                      <MetaCell label="Sensitive Data" value={sensitiveDataProcessed} />
                      <MetaCell label="DPA Required" value={dpaRequiredEffective ? "Yes" : "No"} />
                      <MetaCell label="DPA Available" value={dpaAvailable} />
                      <MetaCell label="Privacy Review" value={privacyReviewEffective ? "Yes" : "No"} />
                      <div className="col-span-2 sm:col-span-4">
                        <MetaCell
                          label="Personal Data Categories"
                          value={personalDataCategories.length ? personalDataCategories.join(", ") : "None selected"}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-4">
                        <MetaCell
                          label="Data Subject Types"
                          value={dataSubjectTypes.length ? dataSubjectTypes.join(", ") : "None selected"}
                        />
                      </div>
                    </>
                  )}
                  <MetaCell label="Security Review" value={securityReviewEffective ? "Yes" : "No"} />
                </ReviewBlock>

                {/* Security details */}
                <ReviewBlock title="Security Details" onEdit={() => setStep(1)}>
                  <MetaCell label="SSO Required" value={ssoRequired} />
                  <MetaCell label="SCIM Required" value={scimRequired} />
                  <MetaCell label="Integrations Required" value={integrationsRequired} />
                  <MetaCell label="Admin Access Required" value={adminAccessRequired} />
                  <MetaCell label="SOC 2 Available" value={soc2Available} />
                  <MetaCell label="ISO 27001 Available" value={iso27001Available} />
                  <MetaCell label="Data Export Available" value={dataExportAvailable} />
                </ReviewBlock>

                {/* Line items */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Line Items</h3>
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <th className="px-5 py-3 text-left font-semibold">License / Plan</th>
                          <th className="px-5 py-3 text-center font-semibold">Seats</th>
                          <th className="px-5 py-3 text-right font-semibold">Price / Seat</th>
                          <th className="px-5 py-3 text-right font-semibold">One-Time</th>
                          <th className="px-5 py-3 text-center font-semibold">Billing</th>
                          <th className="px-5 py-3 text-right font-semibold">Line total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filledLines.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">
                              No line items added.
                            </td>
                          </tr>
                        ) : (
                          filledLines.map((l) => {
                            const seats = Number(l.qty) || 0
                            const perSeat = Number(l.price) || 0
                            const oneTime = Number(l.oneTimeFee) || 0
                            const lineTotal = seats * perSeat + oneTime
                            return (
                              <tr key={l.id}>
                                <td className="px-5 py-3">
                                  <p className="font-medium text-foreground">{l.name}</p>
                                  <p className="text-xs text-muted-foreground">{l.subscriptionPeriod}</p>
                                </td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{seats || "—"}</td>
                                <td className="px-5 py-3 text-right text-muted-foreground">
                                  {perSeat ? `${fmt(perSeat)} ${currency}` : "—"}
                                </td>
                                <td className="px-5 py-3 text-right text-muted-foreground">
                                  {oneTime ? `${fmt(oneTime)} ${currency}` : "—"}
                                </td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{l.billingPeriod}</td>
                                <td className="px-5 py-3 text-right font-semibold text-foreground">
                                  {lineTotal ? `${fmt(lineTotal)} ${currency}` : "—"}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/40">
                          <td colSpan={5} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Estimated Total
                          </td>
                          <td className="px-5 py-3 text-right text-base font-bold text-foreground">
                            {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : "No cost"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Documents */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Documents</h3>
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
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
                    {requiredDocsMissing && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
                        <AlertCircle className="size-3.5" />
                        Mandatory documents are still missing.
                      </p>
                    )}
                  </div>
                </div>

                {/* Approval route preview */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border p-5">
                    <Workflow className="size-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Generated Approval Route</h3>
                  </div>
                  <div className="flex flex-col gap-3 p-5">
                    {[
                      { role: "Requester", who: "You", note: "Submits the request" },
                      { role: "Department Manager", who: department || "Department head", note: "Reviews need & budget" },
                      { role: "Business Owner", who: businessOwner || "Software owner", note: "Confirms business need" },
                      { role: "IT", who: itOwner || "IT team", note: "Technical & integration review" },
                      ...(processesPersonalData
                        ? [{ role: "Data Protection Officer", who: "DPO", note: "GDPR / DPA review" }]
                        : []),
                      ...(securityReviewEffective
                        ? [{ role: "Security", who: "Security team", note: "Security assessment" }]
                        : []),
                      ...(isHighValueSoftware
                        ? [{ role: "Finance", who: "Finance team", note: "High-value approval" }]
                        : []),
                      { role: "Procurement", who: "Procurement team", note: "Sourcing & contract" },
                    ].map((s, i, arr) => (
                      <div key={s.role} className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{s.role}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.who} · {s.note}
                          </p>
                        </div>
                        {i < arr.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
                      </div>
                    ))}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Approval steps are generated from procurement category, software type, data protection, security review, value, and supplier status — not hard-coded.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && !isProduct && !isService && !isSoftware && (
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

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => (step === 0 ? handleOpenChange(false) : setStep((s) => s - 1))}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft className="size-4" />
                {step === 0 ? "Cancel" : "Back"}
              </button>
              {/* Save as Draft is available on every step after type selection */}
              {step > 0 && (
                <button
                  onClick={saveDraft}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Save className="size-4" />
                  Save as Draft
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {draftSavedAt && (
                <span className="hidden items-center gap-1 text-xs font-medium text-muted-foreground sm:flex">
                  <Check className="size-3.5 text-primary" />
                  Draft saved {draftSavedAt}
                </span>
              )}
              {step !== 3 && (
                <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                  Step {step + 1} of {steps.length}
                </span>
              )}
              <button
                onClick={next}
                disabled={!canContinue}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {step === 3 ? (isProduct || isService || isSoftware ? "Submit for Approval" : "Create") : "Next"}
                {step !== 3 && <ChevronRight className="size-4" />}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsaved changes confirmation */}
      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Save your changes?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              You have unsaved changes. Save this request as a draft so you can finish it later.
            </p>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => setShowCloseConfirm(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Pencil className="size-4" />
              Continue editing
            </button>
            <button
              onClick={saveDraftAndClose}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Save className="size-4" />
              Save as draft
            </button>
            <button
              onClick={discardAndClose}
              className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
              Discard changes
            </button>
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

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-y-4 p-5 sm:grid-cols-4">{children}</div>
    </div>
  )
}
