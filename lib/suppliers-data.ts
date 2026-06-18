import { purchaseOrders, orderTotal, type PurchaseOrder } from "./orders-data"
import { competitions, type Competition } from "./competitions-data"
import { contracts, type Contract } from "./contracts-data"
import { getRequestByRef } from "./dashboard-data"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SupplierStatus = "Pending" | "Active" | "Preferred" | "Blocked" | "Archived"

export type SupplierType =
  | "Product Supplier"
  | "Service Supplier"
  | "Software Supplier"
  | "Distributor"
  | "Manufacturer"
  | "Consultant"

export type RiskStatus = "Low Risk" | "Medium Risk" | "High Risk"

export interface SupplierContact {
  name: string
  email: string
  phone: string
  role: string
}

export interface SupplierBanking {
  iban: string
  bank: string
  swift: string
  currency: string
  paymentTerms: string
}

export interface SupplierTax {
  vatNumber: string
  registrationNumber: string
  vatTreatment: string
  vatVerificationStatus: string
}

export type SupplierDocStatus = "Uploaded" | "Missing" | "Pending Review" | "Expired"

export interface SupplierDocument {
  label: string
  fileName: string
  status: SupplierDocStatus
  uploadedOn?: string
}

export type SupplierActivityKind = "created" | "approved" | "updated" | "blocked" | "note"

export interface SupplierActivity {
  kind: SupplierActivityKind
  title: string
  detail: string
  when: string
}

export interface Supplier {
  id: string
  /** Display name — must match supplier names used across orders/competitions/contracts for linking. */
  name: string
  legalName: string
  status: SupplierStatus
  type: SupplierType
  category: string
  country: string
  risk: RiskStatus
  owner: string
  website: string
  /** True if explicitly marked as a preferred partner. */
  preferred: boolean
  contact: SupplierContact
  banking: SupplierBanking
  tax: SupplierTax
  /** Most recent activity dates used for the "Last Activity" column. */
  lastPurchase?: string
  lastContract?: string
  lastInvoice?: string
  onboardedOn: string
  documents: SupplierDocument[]
  activity: SupplierActivity[]
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function docs(over: Partial<Record<string, SupplierDocStatus>> = {}): SupplierDocument[] {
  return [
    { label: "Registration certificate", fileName: "registration.pdf", status: over.reg ?? "Uploaded", uploadedOn: "2025-02-11" },
    { label: "VAT certificate", fileName: "vat-certificate.pdf", status: over.vat ?? "Uploaded", uploadedOn: "2025-02-11" },
    { label: "NDA", fileName: "nda-signed.pdf", status: over.nda ?? "Uploaded", uploadedOn: "2025-03-02" },
    { label: "DPA", fileName: "dpa-signed.pdf", status: over.dpa ?? "Pending Review" },
    { label: "Master agreement", fileName: "msa.pdf", status: over.msa ?? "Uploaded", uploadedOn: "2025-03-20" },
  ]
}

export const suppliers: Supplier[] = [
  {
    id: "sup-ideal",
    name: "Ideal Baltics",
    legalName: "Ideal Baltics UAB",
    status: "Preferred",
    type: "Product Supplier",
    category: "IT Hardware",
    country: "Lithuania",
    risk: "Low Risk",
    owner: "Tomas Vasiliauskas",
    website: "idealbaltics.lt",
    preferred: true,
    contact: { name: "Rūta Kazlauskienė", email: "ruta@idealbaltics.lt", phone: "+370 612 11111", role: "Account Manager" },
    banking: { iban: "LT12 1000 0111 0100 1000", bank: "SEB Bankas", swift: "CBVILT2X", currency: "EUR", paymentTerms: "Net 30" },
    tax: { vatNumber: "LT100001112113", registrationNumber: "302111222", vatTreatment: "Standard VAT", vatVerificationStatus: "Verified" },
    lastPurchase: "2026-06-08",
    lastContract: "2026-01-15",
    lastInvoice: "2026-06-10",
    onboardedOn: "2024-09-12",
    documents: docs(),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Tomas Vasiliauskas from request REQ-1005.", when: "2024-09-12" },
      { kind: "approved", title: "Supplier approved", detail: "Compliance check passed, onboarded as active.", when: "2024-09-20" },
      { kind: "updated", title: "Marked preferred", detail: "Promoted to preferred partner after strong delivery record.", when: "2025-05-04" },
    ],
  },
  {
    id: "sup-cloudworks",
    name: "CloudWorks Inc.",
    legalName: "CloudWorks Incorporated",
    status: "Active",
    type: "Software Supplier",
    category: "Software & SaaS",
    country: "Ireland",
    risk: "Low Risk",
    owner: "Marius Kazlauskas",
    website: "cloudworks.io",
    preferred: false,
    contact: { name: "Sean O'Brien", email: "sean@cloudworks.io", phone: "+353 1 555 2020", role: "Enterprise Sales" },
    banking: { iban: "IE29 AIBK 9311 5212 3456 78", bank: "AIB", swift: "AIBKIE2D", currency: "EUR", paymentTerms: "Net 45" },
    tax: { vatNumber: "IE6388047V", registrationNumber: "IE552233", vatTreatment: "Reverse charge (EU)", vatVerificationStatus: "Verified" },
    lastPurchase: "2026-05-22",
    lastContract: "2026-04-01",
    lastInvoice: "2026-06-01",
    onboardedOn: "2024-11-03",
    documents: docs({ dpa: "Uploaded" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Marius Kazlauskas.", when: "2024-11-03" },
      { kind: "approved", title: "Supplier approved", detail: "Security review completed.", when: "2024-11-12" },
      { kind: "updated", title: "Banking details updated", detail: "Payment terms changed to Net 45.", when: "2025-09-18" },
    ],
  },
  {
    id: "sup-storemax",
    name: "StoreMax Systems",
    legalName: "StoreMax Systems GmbH",
    status: "Active",
    type: "Manufacturer",
    category: "Warehouse & Storage",
    country: "Germany",
    risk: "Medium Risk",
    owner: "Greta Jonaitis",
    website: "storemax.de",
    preferred: false,
    contact: { name: "Klaus Bauer", email: "k.bauer@storemax.de", phone: "+49 30 9000 100", role: "Sales Director" },
    banking: { iban: "DE89 3704 0044 0532 0130 00", bank: "Commerzbank", swift: "COBADEFF", currency: "EUR", paymentTerms: "Net 30" },
    tax: { vatNumber: "DE811234567", registrationNumber: "HRB 99221", vatTreatment: "Reverse charge (EU)", vatVerificationStatus: "Verified" },
    lastPurchase: "2026-06-01",
    lastContract: "2025-11-20",
    lastInvoice: "2026-06-05",
    onboardedOn: "2024-07-19",
    documents: docs({ dpa: "Missing" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Greta Jonaitis.", when: "2024-07-19" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2024-08-01" },
    ],
  },
  {
    id: "sup-baltic-auto",
    name: "Baltic Auto Group",
    legalName: "Baltic Auto Group UAB",
    status: "Active",
    type: "Distributor",
    category: "Fleet & Vehicles",
    country: "Lithuania",
    risk: "Medium Risk",
    owner: "Greta Jonaitis",
    website: "balticauto.lt",
    preferred: false,
    contact: { name: "Andrius Petraitis", email: "andrius@balticauto.lt", phone: "+370 615 22222", role: "Fleet Manager" },
    banking: { iban: "LT60 7300 0100 0000 1234", bank: "Swedbank", swift: "HABALT22", currency: "EUR", paymentTerms: "Net 30" },
    tax: { vatNumber: "LT100223344556", registrationNumber: "303445566", vatTreatment: "Standard VAT", vatVerificationStatus: "Verified" },
    lastPurchase: "2026-05-29",
    lastContract: "2026-02-10",
    lastInvoice: "2026-05-30",
    onboardedOn: "2024-05-22",
    documents: docs(),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Greta Jonaitis from competition CMP-1990.", when: "2024-05-22" },
      { kind: "approved", title: "Supplier approved", detail: "Fleet framework agreement signed.", when: "2024-06-05" },
    ],
  },
  {
    id: "sup-nordic-hardware",
    name: "Nordic Hardware Group",
    legalName: "Nordic Hardware Group AB",
    status: "Active",
    type: "Product Supplier",
    category: "IT Hardware",
    country: "Sweden",
    risk: "Low Risk",
    owner: "Marius Kazlauskas",
    website: "nordichardware.se",
    preferred: false,
    contact: { name: "Erik Lindqvist", email: "erik@nordichardware.se", phone: "+46 8 555 7070", role: "Key Account" },
    banking: { iban: "SE35 5000 0000 0549 1000 0003", bank: "Handelsbanken", swift: "HANDSESS", currency: "SEK", paymentTerms: "Net 30" },
    tax: { vatNumber: "SE556677889901", registrationNumber: "556677-8899", vatTreatment: "Reverse charge (EU)", vatVerificationStatus: "Verified" },
    lastPurchase: "2026-05-18",
    lastContract: "2025-12-01",
    lastInvoice: "2026-05-20",
    onboardedOn: "2024-10-08",
    documents: docs(),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Marius Kazlauskas.", when: "2024-10-08" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2024-10-18" },
    ],
  },
  {
    id: "sup-office-supplies",
    name: "Office Supplies Baltics",
    legalName: "Office Supplies Baltics UAB",
    status: "Active",
    type: "Distributor",
    category: "Office & Facilities",
    country: "Latvia",
    risk: "Low Risk",
    owner: "Tomas Vasiliauskas",
    website: "officesupplies.lv",
    preferred: false,
    contact: { name: "Laura Ozola", email: "laura@officesupplies.lv", phone: "+371 6 700 8080", role: "Account Manager" },
    banking: { iban: "LV80 BANK 0000 4351 9500 1", bank: "Citadele", swift: "PARXLV22", currency: "EUR", paymentTerms: "Net 14" },
    tax: { vatNumber: "LV40003012345", registrationNumber: "40003012345", vatTreatment: "Reverse charge (EU)", vatVerificationStatus: "Verified" },
    lastPurchase: "2026-06-12",
    lastInvoice: "2026-06-13",
    onboardedOn: "2023-12-01",
    documents: docs({ msa: "Missing" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Tomas Vasiliauskas.", when: "2023-12-01" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2023-12-10" },
    ],
  },
  {
    id: "sup-datavault",
    name: "DataVault Cloud",
    legalName: "DataVault Cloud OÜ",
    status: "Active",
    type: "Software Supplier",
    category: "Software & SaaS",
    country: "Estonia",
    risk: "Medium Risk",
    owner: "Marius Kazlauskas",
    website: "datavault.ee",
    preferred: false,
    contact: { name: "Maarja Tamm", email: "maarja@datavault.ee", phone: "+372 600 4040", role: "Customer Success" },
    banking: { iban: "EE38 2200 2210 2014 5685", bank: "Swedbank", swift: "HABAEE2X", currency: "EUR", paymentTerms: "Net 30" },
    tax: { vatNumber: "EE101234567", registrationNumber: "12345678", vatTreatment: "Reverse charge (EU)", vatVerificationStatus: "Pending" },
    lastPurchase: "2026-04-30",
    lastContract: "2026-03-15",
    lastInvoice: "2026-05-02",
    onboardedOn: "2025-01-20",
    documents: docs({ vat: "Pending Review", dpa: "Uploaded" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Marius Kazlauskas.", when: "2025-01-20" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2025-02-01" },
    ],
  },
  {
    id: "sup-flexstaff",
    name: "FlexStaff Baltics",
    legalName: "FlexStaff Baltics UAB",
    status: "Active",
    type: "Service Supplier",
    category: "Staffing & HR",
    country: "Lithuania",
    risk: "Medium Risk",
    owner: "Aistė Navickas",
    website: "flexstaff.lt",
    preferred: false,
    contact: { name: "Gabija Stankevičiūtė", email: "gabija@flexstaff.lt", phone: "+370 620 33333", role: "Partnerships Lead" },
    banking: { iban: "LT24 7044 0600 0788 7777", bank: "SEB Bankas", swift: "CBVILT2X", currency: "EUR", paymentTerms: "Net 30" },
    tax: { vatNumber: "LT100556677889", registrationNumber: "304556677", vatTreatment: "Standard VAT", vatVerificationStatus: "Verified" },
    lastContract: "2026-05-10",
    lastInvoice: "2026-06-09",
    onboardedOn: "2025-03-14",
    documents: docs({ dpa: "Uploaded" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Aistė Navickas.", when: "2025-03-14" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2025-03-25" },
    ],
  },
  {
    id: "sup-pureclean",
    name: "PureClean Services",
    legalName: "PureClean Services UAB",
    status: "Preferred",
    type: "Service Supplier",
    category: "Facilities & Cleaning",
    country: "Lithuania",
    risk: "Low Risk",
    owner: "Tomas Vasiliauskas",
    website: "pureclean.lt",
    preferred: true,
    contact: { name: "Jonas Vaitkus", email: "jonas@pureclean.lt", phone: "+370 614 44444", role: "Operations Manager" },
    banking: { iban: "LT12 7300 0100 0099 8877", bank: "Swedbank", swift: "HABALT22", currency: "EUR", paymentTerms: "Net 30" },
    tax: { vatNumber: "LT100778899001", registrationNumber: "305778899", vatTreatment: "Standard VAT", vatVerificationStatus: "Verified" },
    lastContract: "2026-04-22",
    lastInvoice: "2026-06-11",
    onboardedOn: "2024-02-28",
    documents: docs(),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Tomas Vasiliauskas.", when: "2024-02-28" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2024-03-08" },
      { kind: "updated", title: "Marked preferred", detail: "Promoted to preferred partner.", when: "2025-07-01" },
    ],
  },
  {
    id: "sup-relatesoft",
    name: "RelateSoft",
    legalName: "RelateSoft Sp. z o.o.",
    status: "Active",
    type: "Software Supplier",
    category: "Software & SaaS",
    country: "Poland",
    risk: "Low Risk",
    owner: "Marius Kazlauskas",
    website: "relatesoft.com",
    preferred: false,
    contact: { name: "Piotr Nowak", email: "piotr@relatesoft.com", phone: "+48 22 555 6060", role: "Account Executive" },
    banking: { iban: "PL61 1090 1014 0000 0712 1981 2874", bank: "Santander", swift: "WBKPPLPP", currency: "PLN", paymentTerms: "Net 30" },
    tax: { vatNumber: "PL5252445566", registrationNumber: "0000445566", vatTreatment: "Reverse charge (EU)", vatVerificationStatus: "Verified" },
    lastContract: "2026-03-01",
    lastInvoice: "2026-05-28",
    onboardedOn: "2025-02-09",
    documents: docs({ dpa: "Uploaded" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Marius Kazlauskas.", when: "2025-02-09" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2025-02-18" },
    ],
  },
  {
    id: "sup-nordic-insights",
    name: "Nordic Insights",
    legalName: "Nordic Insights AS",
    status: "Pending",
    type: "Consultant",
    category: "Consulting & Research",
    country: "Norway",
    risk: "Medium Risk",
    owner: "Aistė Navickas",
    website: "nordicinsights.no",
    preferred: false,
    contact: { name: "Ingrid Solberg", email: "ingrid@nordicinsights.no", phone: "+47 22 55 8080", role: "Research Director" },
    banking: { iban: "NO93 8601 1117 947", bank: "DNB", swift: "DNBANOKK", currency: "NOK", paymentTerms: "Net 30" },
    tax: { vatNumber: "NO998877665", registrationNumber: "998877665", vatTreatment: "Outside EU", vatVerificationStatus: "Pending" },
    onboardedOn: "2026-06-02",
    documents: docs({ reg: "Uploaded", vat: "Pending Review", nda: "Missing", dpa: "Missing", msa: "Missing" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Aistė Navickas from competition CMP-2031.", when: "2026-06-02" },
      { kind: "note", title: "Onboarding in progress", detail: "Awaiting NDA and VAT verification.", when: "2026-06-10" },
    ],
  },
  {
    id: "sup-techpoint",
    name: "TechPoint",
    legalName: "TechPoint UAB",
    status: "Pending",
    type: "Product Supplier",
    category: "IT Hardware",
    country: "Lithuania",
    risk: "Medium Risk",
    owner: "Tomas Vasiliauskas",
    website: "techpoint.lt",
    preferred: false,
    contact: { name: "Darius Mockus", email: "darius@techpoint.lt", phone: "+370 618 55555", role: "Sales" },
    banking: { iban: "LT55 7044 0600 0111 2222", bank: "SEB Bankas", swift: "CBVILT2X", currency: "EUR", paymentTerms: "Net 14" },
    tax: { vatNumber: "LT100990011223", registrationNumber: "306990011", vatTreatment: "Standard VAT", vatVerificationStatus: "Pending" },
    onboardedOn: "2026-05-28",
    documents: docs({ reg: "Uploaded", vat: "Uploaded", nda: "Pending Review", dpa: "Missing", msa: "Missing" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Tomas Vasiliauskas from competition CMP-2017.", when: "2026-05-28" },
    ],
  },
  {
    id: "sup-gravisshop",
    name: "GravisShop",
    legalName: "GravisShop UAB",
    status: "Blocked",
    type: "Distributor",
    category: "Office & Facilities",
    country: "Lithuania",
    risk: "High Risk",
    owner: "Greta Jonaitis",
    website: "gravisshop.lt",
    preferred: false,
    contact: { name: "Vytautas Žukauskas", email: "info@gravisshop.lt", phone: "+370 616 66666", role: "Owner" },
    banking: { iban: "LT99 7300 0100 0044 5566", bank: "Swedbank", swift: "HABALT22", currency: "EUR", paymentTerms: "Prepaid" },
    tax: { vatNumber: "LT100112233445", registrationNumber: "307112233", vatTreatment: "Standard VAT", vatVerificationStatus: "Failed" },
    lastPurchase: "2025-10-14",
    lastInvoice: "2025-11-02",
    onboardedOn: "2025-04-11",
    documents: docs({ vat: "Expired", nda: "Missing", dpa: "Missing", msa: "Missing" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Greta Jonaitis.", when: "2025-04-11" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2025-04-20" },
      { kind: "blocked", title: "Supplier blocked", detail: "Repeated late deliveries and failed VAT verification.", when: "2025-12-05" },
    ],
  },
  {
    id: "sup-fieldwork",
    name: "FieldWork Co.",
    legalName: "FieldWork Company UAB",
    status: "Archived",
    type: "Consultant",
    category: "Consulting & Research",
    country: "Lithuania",
    risk: "Low Risk",
    owner: "Aistė Navickas",
    website: "fieldwork.lt",
    preferred: false,
    contact: { name: "Eglė Butkutė", email: "egle@fieldwork.lt", phone: "+370 619 77777", role: "Director" },
    banking: { iban: "LT77 7044 0600 0333 4444", bank: "SEB Bankas", swift: "CBVILT2X", currency: "EUR", paymentTerms: "Net 30" },
    tax: { vatNumber: "LT100334455667", registrationNumber: "308334455", vatTreatment: "Standard VAT", vatVerificationStatus: "Verified" },
    lastContract: "2024-08-01",
    lastInvoice: "2024-09-15",
    onboardedOn: "2023-06-15",
    documents: docs({ msa: "Missing" }),
    activity: [
      { kind: "created", title: "Supplier created", detail: "Added by Aistė Navickas.", when: "2023-06-15" },
      { kind: "approved", title: "Supplier approved", detail: "Onboarded as active supplier.", when: "2023-06-25" },
      { kind: "updated", title: "Supplier archived", detail: "No activity in 12 months — archived.", when: "2025-10-01" },
    ],
  },
]

// ---------------------------------------------------------------------------
// Lookups & linked records
// ---------------------------------------------------------------------------

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id)
}

export function getSupplierByName(name: string): Supplier | undefined {
  return suppliers.find((s) => s.name === name)
}

/** Purchase orders issued to this supplier. */
export function supplierOrders(s: Supplier): PurchaseOrder[] {
  return purchaseOrders.filter((o) => o.supplier.name === s.name)
}

/** Competitions this supplier participated in (placed a bid). */
export function supplierCompetitions(s: Supplier): Competition[] {
  return competitions.filter((c) => c.bids.some((b) => b.supplier === s.name) || c.awardedTo === s.name)
}

/** Competitions this supplier won. */
export function supplierWins(s: Supplier): Competition[] {
  return competitions.filter((c) => c.awardedTo === s.name)
}

/** Contracts held with this supplier. */
export function supplierContracts(s: Supplier): Contract[] {
  return contracts.filter((c) => c.supplier.name === s.name)
}

/** Distinct request references tied to this supplier through orders and competitions. */
export function supplierRequestRefs(s: Supplier): string[] {
  const refs = new Set<string>()
  for (const o of supplierOrders(s)) if (o.requestRef) refs.add(o.requestRef)
  for (const c of supplierCompetitions(s)) if (c.sourceRequestRef) refs.add(c.sourceRequestRef)
  return Array.from(refs)
}

/** Resolve a request reference to its detail route, or null if not found. */
export function requestHrefForRef(ref: string): string | null {
  const r = getRequestByRef(ref)
  return r ? `/requests/${r.id}` : null
}

// ---------------------------------------------------------------------------
// Performance metrics
// ---------------------------------------------------------------------------

export interface SupplierPerformance {
  totalSpend: number
  orderCount: number
  competitionCount: number
  winRate: number
  currency: string
}

export function supplierPerformance(s: Supplier): SupplierPerformance {
  const orders = supplierOrders(s)
  const totalSpend = orders.reduce((sum, o) => sum + orderTotal(o), 0)
  const comps = supplierCompetitions(s)
  const wins = supplierWins(s)
  const winRate = comps.length > 0 ? wins.length / comps.length : 0
  return {
    totalSpend,
    orderCount: orders.length,
    competitionCount: comps.length,
    winRate,
    currency: s.banking.currency === "EUR" ? "EUR" : "EUR", // spend tracked in EUR
  }
}

/** Total spend in EUR for the supplier (used by the list column / KPIs). */
export function supplierTotalSpend(s: Supplier): number {
  return supplierOrders(s).reduce((sum, o) => sum + orderTotal(o), 0)
}

/** Most recent activity label for the "Last Activity" column. */
export function supplierLastActivity(s: Supplier): { label: string; date: string } | null {
  const candidates: { label: string; date: string }[] = []
  if (s.lastPurchase) candidates.push({ label: "Last purchase", date: s.lastPurchase })
  if (s.lastContract) candidates.push({ label: "Last contract", date: s.lastContract })
  if (s.lastInvoice) candidates.push({ label: "Last invoice", date: s.lastInvoice })
  if (candidates.length === 0) return null
  candidates.sort((a, b) => (a.date < b.date ? 1 : -1))
  return candidates[0]
}

// ---------------------------------------------------------------------------
// KPI stats
// ---------------------------------------------------------------------------

export const supplierStats = {
  active: suppliers.filter((s) => s.status === "Active").length,
  pending: suppliers.filter((s) => s.status === "Pending").length,
  preferred: suppliers.filter((s) => s.status === "Preferred").length,
  blocked: suppliers.filter((s) => s.status === "Blocked").length,
  archived: suppliers.filter((s) => s.status === "Archived").length,
  total: suppliers.length,
}

export const supplierCategories = Array.from(new Set(suppliers.map((s) => s.category))).sort()
export const supplierCountries = Array.from(new Set(suppliers.map((s) => s.country))).sort()
export const supplierOwners = Array.from(new Set(suppliers.map((s) => s.owner))).sort()
export const supplierTypes: SupplierType[] = [
  "Product Supplier",
  "Service Supplier",
  "Software Supplier",
  "Distributor",
  "Manufacturer",
  "Consultant",
]
