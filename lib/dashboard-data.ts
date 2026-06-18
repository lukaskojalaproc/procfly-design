export type RequestStatus = "Pending" | "Approved" | "Rejected"
export type RequestKind = "Buy Product" | "Buy Service" | "Add New Supplier"

export type Department = "IT" | "Operations" | "Marketing" | "Finance" | "Facilities" | "Legal"

export interface ProcurementRequest {
  id: string
  ref: string
  title: string
  date: string
  updated: string
  kind: RequestKind
  category: string
  amount: number
  currency: string
  status: RequestStatus
  requester: string
  department: Department
  quotes: number
}

export const requests: ProcurementRequest[] = [
  // critical tier (>= 100k)
  { id: "r4", ref: "REQ-1042", title: "Enterprise ERP platform license — 3 year term", date: "2026-06-15 20:09", updated: "2026-06-15 20:09", kind: "Buy Service", category: "Software", amount: 1000000, currency: "EUR", status: "Pending", requester: "Vaidas Petrauskas", department: "IT", quotes: 4 },
  { id: "r9", ref: "REQ-1039", title: "Fleet of 12 delivery vehicles", date: "2026-06-15 16:30", updated: "2026-06-15 17:02", kind: "Buy Product", category: "Logistics", amount: 384000, currency: "EUR", status: "Approved", requester: "Greta Jonaitis", department: "Operations", quotes: 3 },
  { id: "r10", ref: "REQ-1036", title: "Annual cloud infrastructure commitment", date: "2026-06-14 11:05", updated: "2026-06-14 15:20", kind: "Buy Service", category: "Cloud", amount: 128400, currency: "EUR", status: "Rejected", requester: "Marius Kazlauskas", department: "IT", quotes: 2 },
  // high tier (10k - 100k)
  { id: "r11", ref: "REQ-1034", title: "Warehouse racking and shelving system", date: "2026-06-14 09:20", updated: "2026-06-14 09:20", kind: "Buy Product", category: "Facilities", amount: 47250, currency: "EUR", status: "Pending", requester: "Greta Jonaitis", department: "Facilities", quotes: 3 },
  { id: "r12", ref: "REQ-1031", title: "Marketing agency retainer — Q3", date: "2026-06-13 14:42", updated: "2026-06-13 16:10", kind: "Buy Service", category: "Marketing", amount: 18900, currency: "EUR", status: "Approved", requester: "Aistė Navickas", department: "Marketing", quotes: 2 },
  // mid tier (1k - 10k)
  { id: "r8", ref: "REQ-1028", title: "Customer research interviews for Q3 campaign", date: "2026-06-10 01:52", updated: "2026-06-15 13:18", kind: "Buy Service", category: "Consulting", amount: 8500, currency: "EUR", status: "Approved", requester: "Aistė Navickas", department: "Marketing", quotes: 2 },
  { id: "r1", ref: "REQ-1025", title: "Standing desks for new hires (x8)", date: "2026-06-16 08:58", updated: "2026-06-16 08:58", kind: "Buy Product", category: "Office", amount: 2033, currency: "EUR", status: "Pending", requester: "Tomas Vasiliauskas", department: "Facilities", quotes: 3 },
  { id: "r13", ref: "REQ-1022", title: "Legal review of supplier contracts", date: "2026-06-12 10:15", updated: "2026-06-12 14:00", kind: "Buy Service", category: "Legal", amount: 1450, currency: "EUR", status: "Rejected", requester: "Rūta Stankevičius", department: "Legal", quotes: 1 },
  // low tier (< 1k)
  { id: "r2", ref: "REQ-1019", title: "Translation services — product sheet", date: "2026-06-16 08:40", updated: "2026-06-16 08:40", kind: "Buy Service", category: "Marketing", amount: 123, currency: "EUR", status: "Pending", requester: "Aistė Navickas", department: "Marketing", quotes: 1 },
  { id: "r3", ref: "REQ-1018", title: "Translation services — landing page", date: "2026-06-16 08:38", updated: "2026-06-16 08:38", kind: "Buy Service", category: "Marketing", amount: 123, currency: "EUR", status: "Pending", requester: "Aistė Navickas", department: "Marketing", quotes: 1 },
  { id: "r5", ref: "REQ-1015", title: "USB-C docking station", date: "2026-06-15 18:45", updated: "2026-06-15 18:48", kind: "Buy Product", category: "Hardware", amount: 30, currency: "EUR", status: "Approved", requester: "Tomas Vasiliauskas", department: "IT", quotes: 2 },
  // no cost (supplier onboarding)
  { id: "r6", ref: "REQ-1012", title: "Onboard ProcFly Logistics as preferred carrier", date: "2026-06-15 12:17", updated: "2026-06-15 12:17", kind: "Add New Supplier", category: "Supplier Onboarding", amount: 0, currency: "EUR", status: "Approved", requester: "Marius Kazlauskas", department: "Operations", quotes: 0 },
  { id: "r7", ref: "REQ-1008", title: "Onboard Office Supplies Baltics for recurring office orders", date: "2026-06-11 01:52", updated: "2026-06-11 01:52", kind: "Add New Supplier", category: "Supplier Onboarding", amount: 0, currency: "EUR", status: "Pending", requester: "Tomas Vasiliauskas", department: "Operations", quotes: 0 },
]

export const stats = {
  total: requests.length,
  pending: requests.filter((r) => r.status === "Pending").length,
  approved: requests.filter((r) => r.status === "Approved").length,
  rejected: requests.filter((r) => r.status === "Rejected").length,
}

// ---------------------------------------------------------------------------
// Current user / role.
//
// In this demo there is no auth, so the acting user is defined here. A
// "Super Admin" can see every request in the workspace ("All Requests"), while
// any user can always see the requests they personally created ("My Requests").
// When a real backend is added, this is the single place to swap for the
// authenticated session.
// ---------------------------------------------------------------------------

export type UserRole = "Super Admin" | "Requester" | "Approver"

export const currentUser: { name: string; role: UserRole } = {
  name: "Vaidas Petrauskas",
  role: "Super Admin",
}

/** Requests created by the current user. */
export function myRequests(): ProcurementRequest[] {
  return requests.filter((r) => r.requester === currentUser.name)
}

// ---------------------------------------------------------------------------
// Analytics — period filter, time series, KPIs, and category breakdown.
//
// The mock data is concentrated in June 2026, so rather than filter it (which
// would leave most buckets empty) we synthesize period-appropriate, believable
// series. This keeps the dashboard responsive to the period selector while the
// numbers stay internally consistent. When a real backend is added, these
// helpers are the single place to swap for live aggregations.
// ---------------------------------------------------------------------------

export type Period = "month" | "quarter" | "year"

export const periodLabels: Record<Period, string> = {
  month: "This month",
  quarter: "This quarter",
  year: "This year",
}

export const periodCompare: Record<Period, string> = {
  month: "vs last month",
  quarter: "vs last quarter",
  year: "vs last year",
}

export interface SpendPoint {
  label: string
  spend: number
  budget: number
}

const spendSeries: Record<Period, SpendPoint[]> = {
  month: [
    { label: "Wk 1", spend: 142000, budget: 160000 },
    { label: "Wk 2", spend: 318000, budget: 300000 },
    { label: "Wk 3", spend: 264000, budget: 280000 },
    { label: "Wk 4", spend: 397000, budget: 360000 },
  ],
  quarter: [
    { label: "Apr", spend: 712000, budget: 760000 },
    { label: "May", spend: 845000, budget: 800000 },
    { label: "Jun", spend: 1121000, budget: 980000 },
  ],
  year: [
    { label: "Jan", spend: 540000, budget: 620000 },
    { label: "Feb", spend: 612000, budget: 620000 },
    { label: "Mar", spend: 705000, budget: 680000 },
    { label: "Apr", spend: 712000, budget: 760000 },
    { label: "May", spend: 845000, budget: 800000 },
    { label: "Jun", spend: 1121000, budget: 980000 },
    { label: "Jul", spend: 968000, budget: 900000 },
    { label: "Aug", spend: 734000, budget: 820000 },
    { label: "Sep", spend: 889000, budget: 860000 },
    { label: "Oct", spend: 942000, budget: 900000 },
    { label: "Nov", spend: 1078000, budget: 1000000 },
    { label: "Dec", spend: 1204000, budget: 1100000 },
  ],
}

export function getSpendSeries(period: Period): SpendPoint[] {
  return spendSeries[period]
}

export interface CategorySpend {
  category: string
  spend: number
}

// Spend grouped by category, derived from the actual requests (top 6).
export function getSpendByCategory(): CategorySpend[] {
  const map = new Map<string, number>()
  for (const r of requests) {
    if (r.amount <= 0) continue
    map.set(r.category, (map.get(r.category) ?? 0) + r.amount)
  }
  return [...map.entries()]
    .map(([category, spend]) => ({ category, spend }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 6)
}

export interface Kpi {
  key: "spend" | "savings" | "approval" | "pending" | "competitions"
  label: string
  value: string
  sub: string
  delta: number
  trend: "up" | "down"
  /** Whether an upward movement is a positive outcome (drives color). */
  goodWhen: "up" | "down"
}

const kpiByPeriod: Record<Period, Kpi[]> = {
  month: [
    { key: "spend", label: "Total Spend", value: "1.1M", sub: "EUR committed", delta: 12.4, trend: "up", goodWhen: "down" },
    { key: "savings", label: "Savings Achieved", value: "84K", sub: "EUR vs baseline", delta: 8.1, trend: "up", goodWhen: "up" },
    { key: "approval", label: "Avg Approval Time", value: "2.4d", sub: "request to decision", delta: 14.0, trend: "down", goodWhen: "down" },
    { key: "pending", label: "Pending Approvals", value: stats.pending.toString(), sub: "awaiting decision", delta: 2, trend: "up", goodWhen: "down" },
    { key: "competitions", label: "Open Competitions", value: "3", sub: "live sourcing events", delta: 1, trend: "up", goodWhen: "up" },
  ],
  quarter: [
    { key: "spend", label: "Total Spend", value: "2.7M", sub: "EUR committed", delta: 9.2, trend: "up", goodWhen: "down" },
    { key: "savings", label: "Savings Achieved", value: "231K", sub: "EUR vs baseline", delta: 11.5, trend: "up", goodWhen: "up" },
    { key: "approval", label: "Avg Approval Time", value: "2.7d", sub: "request to decision", delta: 6.0, trend: "down", goodWhen: "down" },
    { key: "pending", label: "Pending Approvals", value: stats.pending.toString(), sub: "awaiting decision", delta: 1, trend: "down", goodWhen: "down" },
    { key: "competitions", label: "Open Competitions", value: "5", sub: "live sourcing events", delta: 2, trend: "up", goodWhen: "up" },
  ],
  year: [
    { key: "spend", label: "Total Spend", value: "10.7M", sub: "EUR committed", delta: 5.8, trend: "up", goodWhen: "down" },
    { key: "savings", label: "Savings Achieved", value: "912K", sub: "EUR vs baseline", delta: 17.3, trend: "up", goodWhen: "up" },
    { key: "approval", label: "Avg Approval Time", value: "3.1d", sub: "request to decision", delta: 9.5, trend: "down", goodWhen: "down" },
    { key: "pending", label: "Pending Approvals", value: stats.pending.toString(), sub: "awaiting decision", delta: 4, trend: "down", goodWhen: "down" },
    { key: "competitions", label: "Open Competitions", value: "12", sub: "live sourcing events", delta: 3, trend: "up", goodWhen: "up" },
  ],
}

export function getKpis(period: Period): Kpi[] {
  return kpiByPeriod[period]
}

// ---------------------------------------------------------------------------
// Needs Attention — actionable items surfaced from requests plus synthetic
// contract/supplier signals. Each carries an explicit action.
// ---------------------------------------------------------------------------

export interface AttentionItem {
  id: string
  type: "approval" | "contract" | "rejected" | "supplier"
  title: string
  meta: string
  action: string
  href: string
  severity: "high" | "medium"
}

export const needsAttention: AttentionItem[] = [
  {
    id: "att-1",
    type: "approval",
    title: "Enterprise ERP platform license",
    meta: "1.0M EUR · pending at Manager step · 2 days",
    action: "Review",
    href: "/requests/r4",
    severity: "high",
  },
  {
    id: "att-2",
    type: "contract",
    title: "Cloud hosting agreement — AWS",
    meta: "Expires in 14 days · auto-renews",
    action: "Renew",
    href: "/contracts",
    severity: "high",
  },
  {
    id: "att-3",
    type: "rejected",
    title: "Annual cloud infrastructure commitment",
    meta: "Rejected · needs revised quotes",
    action: "Fix",
    href: "/requests/r10",
    severity: "medium",
  },
  {
    id: "att-4",
    type: "supplier",
    title: "Office Supplies Baltics onboarding",
    meta: "Missing bank confirmation document",
    action: "Complete",
    href: "/requests/r7",
    severity: "medium",
  },
]

// ---------------------------------------------------------------------------
// Activity feed — who did what, to which request, with a link.
// ---------------------------------------------------------------------------

export type FeedKind = "approved" | "submitted" | "rejected" | "comment" | "updated"

export interface FeedItem {
  id: string
  actor: string
  action: string
  target: string
  href: string
  date: string
  kind: FeedKind
}

export const activityFeed: FeedItem[] = [
  { id: "f1", actor: "Tomas Vasiliauskas", action: "submitted", target: "REQ-1025 · Standing desks for new hires", href: "/requests/r1", date: "2026-06-16 08:58", kind: "submitted" },
  { id: "f2", actor: "Dragan Stojchevski", action: "approved", target: "REQ-1039 · Fleet of 12 delivery vehicles", href: "/requests/r9", date: "2026-06-15 17:02", kind: "approved" },
  { id: "f3", actor: "Marius Kazlauskas", action: "commented on", target: "REQ-1042 · Enterprise ERP platform license", href: "/requests/r4", date: "2026-06-15 15:40", kind: "comment" },
  { id: "f4", actor: "Dragan Stojchevski", action: "rejected", target: "REQ-1036 · Annual cloud infrastructure", href: "/requests/r10", date: "2026-06-14 15:20", kind: "rejected" },
  { id: "f5", actor: "Aistė Navickas", action: "submitted", target: "REQ-1031 · Marketing agency retainer — Q3", href: "/requests/r12", date: "2026-06-13 14:42", kind: "submitted" },
]

// Total committed spend across requests that carry a cost
export const totalCommitted = requests.reduce((sum, r) => sum + r.amount, 0)

// Largest amount, used to scale the relative-magnitude bar on each row
export const maxAmount = Math.max(...requests.map((r) => r.amount))

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const fullFormatter = new Intl.NumberFormat("en-US")

export function formatAmount(amount: number) {
  return fullFormatter.format(amount)
}

export function formatCompact(amount: number) {
  return compactFormatter.format(amount)
}

/**
 * Maps an amount to a visual "tier" so the UI can give larger requests more
 * weight. This is the core of the pricing-hierarchy redesign.
 */
export type PriceTier = "none" | "low" | "mid" | "high" | "critical"

export function priceTier(amount: number): PriceTier {
  if (amount <= 0) return "none"
  if (amount < 1000) return "low"
  if (amount < 10000) return "mid"
  if (amount < 100000) return "high"
  return "critical"
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

// ---------------------------------------------------------------------------
// Request detail data — line items, custom fields, and the approval flow.
// ---------------------------------------------------------------------------

export interface LineItem {
  name: string
  qty: number
  unitPrice: number
}

export interface CustomField {
  label: string
  value: string
}

export type ApprovalState = "approved" | "pending" | "rejected"

export interface ApprovalStep {
  name: string
  role: string
  state: ApprovalState
  comment?: string
  date: string
}

export interface SoftwareDetail {
  licenseType: string
  users: string
  billingCycle: string
  renewalType: string
  renewalDate: string
  dataProcessing: string
  hostingRegion: string
  dpaRequired: string
  owner: string
}

export interface SupplierDetail {
  legalName: string
  country: string
  registrationNumber: string
  vatNumber: string
  contactEmail: string
  iban: string
  paymentTerms: string
  vatTreatment: string
  supplierType: string
  invoicingEmail: string
}

export interface RequestDocument {
  label: string
  fileName: string
  required: boolean
}

export interface RequestDetail {
  supplier: string
  neededBy: string | null
  description: string
  lineItems: LineItem[]
  customFields: CustomField[]
  approvals: ApprovalStep[]
  software?: SoftwareDetail
  supplierOnboarding?: SupplierDetail
  documents: RequestDocument[]
}

const defaultFlow = (created: string, requester: string): ApprovalStep[] => [
  { name: requester, role: "Step 1 · Creator", state: "approved", comment: "Request created", date: created },
  { name: "Dragan Stojchevski", role: "Step 2 · Manager", state: "pending", date: created },
  { name: "Dragan Stojchevski", role: "Step 3 · Category Manager", state: "pending", date: created },
  { name: "Dragan Stojchevski", role: "Step 4 · Finance", state: "pending", date: created },
  { name: "Dragan Stojchevski", role: "Step 5 · Procurement", state: "pending", date: created },
]

// Per-request detail, keyed by request id. Falls back to a generated detail
// for any request that does not have an explicit entry.
const requestDetails: Record<string, RequestDetail> = {}

export function getRequestDetail(request: ProcurementRequest): RequestDetail {
  const explicit = requestDetails[request.id]
  if (explicit) return explicit

  const isSoftware = ["Software", "Cloud", "IT & Software"].includes(request.category)

  // Software / subscription requests don't carry physical line items — surface
  // license, renewal, and GDPR detail instead.
  if (isSoftware) {
    return {
      supplier: "To be selected",
      neededBy: null,
      description: request.title,
      lineItems: [],
      customFields: [
        { label: "Category", value: request.category },
        { label: "Request type", value: request.kind },
      ],
      software: {
        licenseType: "SaaS subscription",
        users: "Not provided",
        billingCycle: "Annual",
        renewalType: "Auto-renew",
        renewalDate: "Not set",
        dataProcessing: "Not provided",
        hostingRegion: "EU / EEA",
        dpaRequired: "Not provided",
        owner: "Not provided",
      },
      documents: [
        { label: "Supplier quote / proforma", fileName: "Awaiting upload", required: true },
        { label: "Specification / scope", fileName: "Awaiting upload", required: false },
        { label: "Data Processing Agreement (DPA)", fileName: "Awaiting upload", required: false },
      ],
      approvals: defaultFlow(request.date, request.requester),
    }
  }

  const isSupplierOnboarding =
    request.kind === "Add New Supplier" || request.category === "Supplier Onboarding"

  // Supplier onboarding requests surface company, banking, and tax/accounting
  // detail required for compliant vendor setup — not physical line items.
  if (isSupplierOnboarding) {
    return {
      supplier: request.title,
      neededBy: null,
      description: request.title,
      lineItems: [],
      customFields: [
        { label: "Category", value: request.category },
        { label: "Request type", value: request.kind },
      ],
      supplierOnboarding: {
        legalName: "Not provided",
        country: "Not provided",
        registrationNumber: "Not provided",
        vatNumber: "Not provided",
        contactEmail: "Not provided",
        iban: "Not provided",
        paymentTerms: "Net 30",
        vatTreatment: "Standard",
        supplierType: "Goods",
        invoicingEmail: "Not provided",
      },
      documents: [
        { label: "Bank confirmation letter", fileName: "Awaiting upload", required: true },
        { label: "Insurance certificate", fileName: "Awaiting upload", required: false },
        { label: "Signed Code of Conduct / NDA", fileName: "Awaiting upload", required: false },
      ],
      approvals: defaultFlow(request.date, request.requester),
    }
  }

  // Generate a sensible default for requests without bespoke detail.
  const fallbackItems: LineItem[] =
    request.amount > 0 ? [{ name: request.title, qty: 1, unitPrice: request.amount }] : []
  return {
    supplier: request.kind === "Add New Supplier" ? "Pending onboarding" : "To be selected",
    neededBy: null,
    description: request.title,
    lineItems: fallbackItems,
    customFields: [
      { label: "category", value: request.category },
      { label: "request type", value: request.kind },
    ],
    documents: [
      { label: "Supplier quote / proforma", fileName: "Awaiting upload", required: true },
      { label: "Specification / scope", fileName: "Awaiting upload", required: false },
      { label: "Pre-approval / budget proof", fileName: "Awaiting upload", required: false },
    ],
    approvals: defaultFlow(request.date, request.requester),
  }
}

export function getRequestById(id: string) {
  return requests.find((r) => r.id === id)
}

export function getRequestByRef(ref: string) {
  return requests.find((r) => r.ref === ref)
}
