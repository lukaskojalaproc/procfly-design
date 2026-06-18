// ---------------------------------------------------------------------------
// Contracts — signed agreements with suppliers.
//
// Mirrors the orders/competitions data conventions: a flat list plus derived
// helpers, with a per-contract detail that powers the detail window.
//
// A contract sits at the very end of the procurement chain and can link back
// to its originating records:
//   Request  →  Competition  →  Purchase Order  →  Contract
// ---------------------------------------------------------------------------

import { getRequestByRef } from "@/lib/dashboard-data"
import { getCompetitionByRef } from "@/lib/competitions-data"
import { getOrderByNumber } from "@/lib/orders-data"

/** Full contract lifecycle status. */
export type ContractStatus =
  | "Draft"
  | "Pending Approval"
  | "Active"
  | "Expiring Soon"
  | "Expired"
  | "Terminated"

/** How a contract renews at the end of its term. */
export type RenewalType = "Auto Renew" | "Manual Renew"

/** Cadence the supplier invoices on. */
export type BillingFrequency = "Monthly" | "Quarterly" | "Annually" | "One-time"

/** A document attached to a contract. */
export type ContractDocKind = "signed" | "amendment" | "annex" | "nda" | "dpa"
export interface ContractDocument {
  kind: ContractDocKind
  name: string
  available: boolean
  meta?: string
}

export interface ContractSupplier {
  name: string
  contact: string
  email: string
  phone: string
  address: string
}

export interface Contract {
  id: string
  number: string
  name: string
  status: ContractStatus
  category: string
  contractType: string
  owner: string
  supplier: ContractSupplier
  currency: string
  value: number

  // Dates (ISO-ish "YYYY-MM-DD" strings)
  signatureDate: string
  startDate: string
  endDate: string
  renewalDate: string
  /** Notice period required before the end/renewal date, in days. */
  noticePeriodDays: number

  // Renewal / commercial terms
  renewalType: RenewalType
  billingFrequency: BillingFrequency
  paymentTerms: string

  // Linked procurement-chain records
  requestRef?: string
  competitionRef?: string
  poRef?: string

  documents: ContractDocument[]
  notes?: string
}

// "Today" anchor for all expiry math — keeps the demo deterministic and in
// step with the seed data (mid-June 2026).
const NOW = new Date("2026-06-18T00:00:00")

export const contracts: Contract[] = [
  {
    id: "ctr1",
    number: "CTR-2026-000101",
    name: "Enterprise ERP platform license — 3 year term",
    status: "Active",
    category: "Software",
    contractType: "SaaS Subscription",
    owner: "Aistė Navickas",
    supplier: {
      name: "CloudWorks Inc.",
      contact: "Jonas Petrauskas",
      email: "contracts@cloudworks.com",
      phone: "+370 600 11223",
      address: "Konstitucijos pr. 7, Vilnius",
    },
    currency: "EUR",
    value: 812000,
    signatureDate: "2026-01-15",
    startDate: "2026-02-01",
    endDate: "2029-01-31",
    renewalDate: "2029-02-01",
    noticePeriodDays: 90,
    renewalType: "Manual Renew",
    billingFrequency: "Annually",
    paymentTerms: "Net 30",
    requestRef: "REQ-1031",
    poRef: "PRC-2026-000104",
    documents: [
      { kind: "signed", name: "Signed contract (PDF)", available: true, meta: "Executed 2026-01-15" },
      { kind: "dpa", name: "Data processing agreement", available: true, meta: "GDPR Annex" },
      { kind: "annex", name: "Service level annex", available: true, meta: "99.9% uptime" },
    ],
    notes: "Three-year enterprise ERP rollout across all entities.",
  },
  {
    id: "ctr2",
    number: "CTR-2026-000102",
    name: "Regional logistics retainer",
    status: "Expiring Soon",
    category: "Logistics",
    contractType: "Master Service Agreement",
    owner: "Greta Jonaitis",
    supplier: {
      name: "Ideal Baltics",
      contact: "Rūta Kazlauskienė",
      email: "ops@idealbaltics.lt",
      phone: "+370 612 88990",
      address: "Savanorių pr. 178, Kaunas",
    },
    currency: "EUR",
    value: 14400,
    signatureDate: "2025-07-01",
    startDate: "2025-07-01",
    endDate: "2026-07-01",
    renewalDate: "2026-07-01",
    noticePeriodDays: 30,
    renewalType: "Auto Renew",
    billingFrequency: "Monthly",
    paymentTerms: "Net 30",
    requestRef: "REQ-1019",
    competitionRef: "CMP-2017",
    poRef: "PRC-2026-000102",
    documents: [
      { kind: "signed", name: "Signed contract (PDF)", available: true, meta: "Executed 2025-07-01" },
      { kind: "amendment", name: "Rate amendment #1", available: true, meta: "2026-01 pricing" },
    ],
    notes: "Auto-renews unless cancelled 30 days before term end.",
  },
  {
    id: "ctr3",
    number: "CTR-2026-000103",
    name: "Warehouse racking framework",
    status: "Active",
    category: "Facilities",
    contractType: "Framework Agreement",
    owner: "Greta Jonaitis",
    supplier: {
      name: "StoreMax Systems",
      contact: "Tomas Vaitkus",
      email: "sales@storemax.eu",
      phone: "+370 656 22110",
      address: "Pramonės g. 12, Klaipėda",
    },
    currency: "EUR",
    value: 39800,
    signatureDate: "2025-11-10",
    startDate: "2025-12-01",
    endDate: "2027-11-30",
    renewalDate: "2027-12-01",
    noticePeriodDays: 60,
    renewalType: "Manual Renew",
    billingFrequency: "Quarterly",
    paymentTerms: "Net 45",
    requestRef: "REQ-1011",
    competitionRef: "CMP-2021",
    poRef: "PRC-2026-000105",
    documents: [
      { kind: "signed", name: "Signed contract (PDF)", available: true, meta: "Executed 2025-11-10" },
      { kind: "annex", name: "Installation annex", available: true },
    ],
  },
  {
    id: "ctr4",
    number: "CTR-2026-000104",
    name: "Company fleet lease",
    status: "Active",
    category: "Fleet",
    contractType: "Lease Agreement",
    owner: "Greta Jonaitis",
    supplier: {
      name: "Baltic Auto Group",
      contact: "Eglė Stankevičiūtė",
      email: "fleet@balticauto.lt",
      phone: "+370 698 33445",
      address: "Ukmergės g. 280, Vilnius",
    },
    currency: "EUR",
    value: 96000,
    signatureDate: "2025-05-20",
    startDate: "2025-06-01",
    endDate: "2028-05-31",
    renewalDate: "2028-06-01",
    noticePeriodDays: 90,
    renewalType: "Manual Renew",
    billingFrequency: "Monthly",
    paymentTerms: "Net 30",
    requestRef: "REQ-0992",
    competitionRef: "CMP-2014",
    poRef: "PRC-2026-000106",
    documents: [
      { kind: "signed", name: "Signed contract (PDF)", available: true, meta: "Executed 2025-05-20" },
      { kind: "dpa", name: "Telematics data agreement", available: true },
    ],
  },
  {
    id: "ctr5",
    number: "CTR-2026-000105",
    name: "Cloud infrastructure commitment",
    status: "Expiring Soon",
    category: "Cloud",
    contractType: "SaaS Subscription",
    owner: "Marius Kazlauskas",
    supplier: {
      name: "DataVault Cloud",
      contact: "Andrius Šimkus",
      email: "billing@datavault.io",
      phone: "+370 677 55667",
      address: "Žirmūnų g. 68, Vilnius",
    },
    currency: "EUR",
    value: 54000,
    signatureDate: "2025-06-25",
    startDate: "2025-07-01",
    endDate: "2026-06-30",
    renewalDate: "2026-07-01",
    noticePeriodDays: 30,
    renewalType: "Auto Renew",
    billingFrequency: "Monthly",
    paymentTerms: "Net 15",
    requestRef: "REQ-0985",
    poRef: "PRC-2026-000107",
    documents: [
      { kind: "signed", name: "Signed contract (PDF)", available: true, meta: "Executed 2025-06-25" },
      { kind: "dpa", name: "Data processing agreement", available: true, meta: "GDPR Annex" },
    ],
    notes: "Auto-renews 2026-07-01 — review before notice deadline.",
  },
  {
    id: "ctr6",
    number: "CTR-2026-000106",
    name: "Office supplies framework",
    status: "Draft",
    category: "Office",
    contractType: "Framework Agreement",
    owner: "Tomas Vasiliauskas",
    supplier: {
      name: "Office Supplies Baltics",
      contact: "Rasa Petraitytė",
      email: "orders@officebaltics.lt",
      phone: "+370 645 99001",
      address: "Laisvės al. 50, Kaunas",
    },
    currency: "EUR",
    value: 18000,
    signatureDate: "—",
    startDate: "2026-07-01",
    endDate: "2027-06-30",
    renewalDate: "2027-07-01",
    noticePeriodDays: 30,
    renewalType: "Manual Renew",
    billingFrequency: "Monthly",
    paymentTerms: "Net 30",
    requestRef: "REQ-1025",
    poRef: "PRC-2026-000101",
    documents: [{ kind: "signed", name: "Draft contract (PDF)", available: true, meta: "Pending signature" }],
    notes: "Awaiting legal review before signature.",
  },
  {
    id: "ctr7",
    number: "CTR-2026-000107",
    name: "Hardware procurement agreement",
    status: "Pending Approval",
    category: "Hardware",
    contractType: "Purchase Agreement",
    owner: "Marius Kazlauskas",
    supplier: {
      name: "Nordic Hardware Group",
      contact: "Lukas Berg",
      email: "sales@nordichw.com",
      phone: "+46 8 123 456",
      address: "Sveavägen 12, Stockholm",
    },
    currency: "EUR",
    value: 27500,
    signatureDate: "—",
    startDate: "2026-07-15",
    endDate: "2027-07-14",
    renewalDate: "2027-07-15",
    noticePeriodDays: 30,
    renewalType: "Manual Renew",
    billingFrequency: "One-time",
    paymentTerms: "Net 30",
    requestRef: "REQ-1005",
    competitionRef: "CMP-2019",
    poRef: "PRC-2026-000103",
    documents: [{ kind: "signed", name: "Draft contract (PDF)", available: true, meta: "In approval" }],
    notes: "Submitted for finance approval.",
  },
  {
    id: "ctr8",
    number: "CTR-2026-000108",
    name: "Facilities cleaning services",
    status: "Active",
    category: "Facilities",
    contractType: "Master Service Agreement",
    owner: "Tomas Vasiliauskas",
    supplier: {
      name: "PureClean Services",
      contact: "Ingrida Mockutė",
      email: "info@pureclean.lt",
      phone: "+370 611 44556",
      address: "Gedimino pr. 1, Vilnius",
    },
    currency: "EUR",
    value: 36000,
    signatureDate: "2026-03-01",
    startDate: "2026-03-15",
    endDate: "2027-03-14",
    renewalDate: "2027-03-15",
    noticePeriodDays: 60,
    renewalType: "Auto Renew",
    billingFrequency: "Monthly",
    paymentTerms: "Net 30",
    documents: [
      { kind: "signed", name: "Signed contract (PDF)", available: true, meta: "Executed 2026-03-01" },
      { kind: "nda", name: "Mutual NDA", available: true },
    ],
  },
  {
    id: "ctr9",
    number: "CTR-2026-000109",
    name: "Legacy CRM subscription",
    status: "Expired",
    category: "Software",
    contractType: "SaaS Subscription",
    owner: "Aistė Navickas",
    supplier: {
      name: "RelateSoft",
      contact: "Mark Davies",
      email: "renewals@relatesoft.com",
      phone: "+44 20 7946 0000",
      address: "10 King St, London",
    },
    currency: "EUR",
    value: 22000,
    signatureDate: "2024-05-01",
    startDate: "2024-06-01",
    endDate: "2026-05-31",
    renewalDate: "—",
    noticePeriodDays: 60,
    renewalType: "Manual Renew",
    billingFrequency: "Annually",
    paymentTerms: "Net 30",
    documents: [{ kind: "signed", name: "Signed contract (PDF)", available: true, meta: "Executed 2024-05-01" }],
    notes: "Not renewed — replaced by new ERP platform.",
  },
  {
    id: "ctr10",
    number: "CTR-2026-000110",
    name: "Temporary staffing agreement",
    status: "Terminated",
    category: "Services",
    contractType: "Master Service Agreement",
    owner: "Greta Jonaitis",
    supplier: {
      name: "FlexStaff Baltics",
      contact: "Dovilė Urbonaitė",
      email: "contracts@flexstaff.lt",
      phone: "+370 633 77889",
      address: "Taikos pr. 90, Klaipėda",
    },
    currency: "EUR",
    value: 41000,
    signatureDate: "2025-09-01",
    startDate: "2025-09-15",
    endDate: "2026-09-14",
    renewalDate: "—",
    noticePeriodDays: 30,
    renewalType: "Manual Renew",
    billingFrequency: "Monthly",
    paymentTerms: "Net 30",
    documents: [{ kind: "signed", name: "Signed contract (PDF)", available: true }],
    notes: "Terminated early by mutual agreement on 2026-04-30.",
  },
]

// --- Date helpers -----------------------------------------------------------

function parseDate(s: string): Date | null {
  const d = new Date(`${s}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Whole days from "today" until the contract end date (negative = past). */
export function daysUntilEnd(c: Contract): number | null {
  const end = parseDate(c.endDate)
  if (!end) return null
  return Math.round((end.getTime() - NOW.getTime()) / 864e5)
}

/** Notice deadline = endDate minus the notice period. */
export function noticeDeadline(c: Contract): string | null {
  const end = parseDate(c.endDate)
  if (!end) return null
  const d = new Date(end.getTime() - c.noticePeriodDays * 864e5)
  return d.toISOString().slice(0, 10)
}

/** Days until the cancellation / notice deadline (negative = passed). */
export function daysUntilNotice(c: Contract): number | null {
  const deadline = noticeDeadline(c)
  if (!deadline) return null
  const d = parseDate(deadline)
  if (!d) return null
  return Math.round((d.getTime() - NOW.getTime()) / 864e5)
}

/**
 * Expiry bucket for contracts approaching their end date. Returns 7 / 14 / 30
 * (the tightest applicable window) or null when not expiring soon.
 */
export function expiryBucket(c: Contract): 7 | 14 | 30 | null {
  if (c.status === "Expired" || c.status === "Terminated" || c.status === "Draft") return null
  const days = daysUntilEnd(c)
  if (days === null || days < 0) return null
  if (days <= 7) return 7
  if (days <= 14) return 14
  if (days <= 30) return 30
  return null
}

export function isAutoRenew(c: Contract): boolean {
  return c.renewalType === "Auto Renew"
}

// --- Creation ---------------------------------------------------------------

/** Suggest the next sequential contract number (e.g. "CTR-2026-000111"). */
export function nextContractNumber(): string {
  const max = contracts.reduce((m, c) => {
    const n = Number.parseInt(c.number.split("-").pop() ?? "0", 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 100)
  return `CTR-2026-${String(max + 1).padStart(6, "0")}`
}

export const contractTypes = [
  "SaaS Subscription",
  "Master Service Agreement",
  "Framework Agreement",
  "Purchase Agreement",
  "Lease Agreement",
  "Maintenance Agreement",
  "Consulting Agreement",
]

export interface NewContractInput {
  number: string
  name: string
  status: ContractStatus
  category: string
  contractType: string
  owner: string
  supplier: ContractSupplier
  currency: string
  value: number
  signatureDate: string
  startDate: string
  endDate: string
  renewalDate: string
  noticePeriodDays: number
  renewalType: RenewalType
  billingFrequency: BillingFrequency
  paymentTerms: string
  requestRef?: string
  competitionRef?: string
  poRef?: string
  documents: ContractDocument[]
  notes?: string
}

/**
 * Build a contract from the create-contract form and prepend it to the live
 * list so it appears immediately on the contracts page and detail route.
 */
export function createContract(input: NewContractInput): Contract {
  const slug = input.number.toLowerCase().replace(/[^a-z0-9]+/g, "")
  const contract: Contract = {
    id: `ctr-new-${Date.now().toString(36)}-${slug}`,
    number: input.number,
    name: input.name.trim(),
    status: input.status,
    category: input.category,
    contractType: input.contractType,
    owner: input.owner,
    supplier: input.supplier,
    currency: input.currency,
    value: input.value,
    signatureDate: input.signatureDate,
    startDate: input.startDate,
    endDate: input.endDate,
    renewalDate: input.renewalDate || input.endDate,
    noticePeriodDays: input.noticePeriodDays,
    renewalType: input.renewalType,
    billingFrequency: input.billingFrequency,
    paymentTerms: input.paymentTerms,
    requestRef: input.requestRef,
    competitionRef: input.competitionRef,
    poRef: input.poRef,
    documents: input.documents,
    notes: input.notes,
  }
  contracts.unshift(contract)
  return contract
}

// --- Lookups ----------------------------------------------------------------

export function getContractById(id: string) {
  return contracts.find((c) => c.id === id)
}

/** Resolve the linked request's detail route, or null. */
export function contractRequestHref(c: Contract): string | null {
  if (!c.requestRef) return null
  const r = getRequestByRef(c.requestRef)
  return r ? `/requests/${r.id}` : null
}

/** Resolve the linked competition's detail route, or null. */
export function contractCompetitionHref(c: Contract): string | null {
  if (!c.competitionRef) return null
  const comp = getCompetitionByRef(c.competitionRef)
  return comp ? `/competitions/${comp.id}` : null
}

/** Resolve the linked purchase order's detail route, or null. */
export function contractOrderHref(c: Contract): string | null {
  if (!c.poRef) return null
  const po = getOrderByNumber(c.poRef)
  return po ? `/orders/${po.id}` : null
}

// --- Activity ---------------------------------------------------------------

export interface ContractActivityEntry {
  title: string
  detail: string
  date: string
  done: boolean
}

/**
 * Buyer-facing activity history derived from the contract's lifecycle and
 * key dates.
 */
export function contractActivity(c: Contract): ContractActivityEntry[] {
  const entries: ContractActivityEntry[] = []
  const signed = c.signatureDate !== "—"

  entries.push({
    title: "Contract created",
    detail: c.requestRef ? `Drafted from request ${c.requestRef}.` : "Drafted by procurement.",
    date: signed ? c.signatureDate : "Pending",
    done: true,
  })

  if (c.status === "Pending Approval") {
    entries.push({ title: "Submitted for approval", detail: "Awaiting finance sign-off.", date: "In progress", done: false })
  }

  entries.push({
    title: "Signed",
    detail: signed ? `Executed by both parties.` : "Awaiting signature.",
    date: signed ? c.signatureDate : "Pending",
    done: signed,
  })

  entries.push({
    title: "Term started",
    detail: `Coverage begins.`,
    date: c.startDate,
    done: (daysUntilEnd(c) ?? -1) > -3650 && c.status !== "Draft" && c.status !== "Pending Approval",
  })

  if (c.status === "Terminated") {
    entries.push({ title: "Terminated", detail: c.notes ?? "Contract ended early.", date: c.endDate, done: true })
  } else if (c.status === "Expired") {
    entries.push({ title: "Expired", detail: "Term ended; not renewed.", date: c.endDate, done: true })
  } else {
    entries.push({
      title: isAutoRenew(c) ? "Auto-renews" : "Renewal due",
      detail: isAutoRenew(c)
        ? `Renews automatically on ${c.renewalDate} unless cancelled.`
        : `Manual renewal decision by ${c.renewalDate}.`,
      date: c.renewalDate,
      done: false,
    })
  }

  return entries
}

// --- Notifications ----------------------------------------------------------

export interface ContractNotification {
  level: "info" | "warning" | "critical"
  label: string
}

/**
 * Renewal / notice notifications a buyer should act on, derived from how close
 * the contract is to its end and notice deadlines.
 */
export function contractNotifications(c: Contract): ContractNotification[] {
  const out: ContractNotification[] = []
  if (c.status === "Expired" || c.status === "Terminated" || c.status === "Draft") return out

  const days = daysUntilEnd(c)
  const noticeDays = daysUntilNotice(c)

  if (days !== null && days >= 0) {
    if (days <= 30) out.push({ level: "critical", label: "Expires in 30 days" })
    else if (days <= 60) out.push({ level: "warning", label: "Expires in 60 days" })
    else if (days <= 90) out.push({ level: "info", label: "Expires in 90 days" })
  }

  if (noticeDays !== null && noticeDays <= 0 && days !== null && days >= 0) {
    out.push({ level: "critical", label: "Notice period started" })
  }

  return out
}

// --- Stats ------------------------------------------------------------------

export const contractStats = {
  total: contracts.length,
  active: contracts.filter((c) => c.status === "Active" || c.status === "Expiring Soon").length,
  expiring30: contracts.filter((c) => expiryBucket(c) !== null).length,
  expired: contracts.filter((c) => c.status === "Expired").length,
  autoRenew: contracts.filter((c) => isAutoRenew(c) && c.status !== "Expired" && c.status !== "Terminated").length,
  totalValue: contracts
    .filter((c) => c.status !== "Expired" && c.status !== "Terminated")
    .reduce((sum, c) => sum + c.value, 0),
}
