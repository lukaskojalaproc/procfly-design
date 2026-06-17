export type RequestStatus = "Pending" | "Approved" | "Rejected"
export type RequestKind = "Buy Product" | "Buy Service" | "Add New Supplier"

export interface ProcurementRequest {
  id: string
  title: string
  date: string
  kind: RequestKind
  amount: number
  currency: string
  status: RequestStatus
}

export const requests: ProcurementRequest[] = [
  // critical tier (>= 100k)
  { id: "r4", title: "Enterprise ERP platform license — 3 year term", date: "2026-06-15 20:09", kind: "Buy Service", amount: 1000000, currency: "EUR", status: "Pending" },
  { id: "r9", title: "Fleet of 12 delivery vehicles", date: "2026-06-15 16:30", kind: "Buy Product", amount: 384000, currency: "EUR", status: "Approved" },
  { id: "r10", title: "Annual cloud infrastructure commitment", date: "2026-06-14 11:05", kind: "Buy Service", amount: 128400, currency: "EUR", status: "Rejected" },
  // high tier (10k - 100k)
  { id: "r11", title: "Warehouse racking and shelving system", date: "2026-06-14 09:20", kind: "Buy Product", amount: 47250, currency: "EUR", status: "Pending" },
  { id: "r12", title: "Marketing agency retainer — Q3", date: "2026-06-13 14:42", kind: "Buy Service", amount: 18900, currency: "EUR", status: "Approved" },
  // mid tier (1k - 10k)
  { id: "r8", title: "Customer research interviews for Q3 campaign", date: "2026-06-10 01:52", kind: "Buy Service", amount: 8500, currency: "EUR", status: "Approved" },
  { id: "r1", title: "Standing desks for new hires (x8)", date: "2026-06-16 08:58", kind: "Buy Product", amount: 2033, currency: "EUR", status: "Pending" },
  { id: "r13", title: "Legal review of supplier contracts", date: "2026-06-12 10:15", kind: "Buy Service", amount: 1450, currency: "EUR", status: "Rejected" },
  // low tier (< 1k)
  { id: "r2", title: "Translation services — product sheet", date: "2026-06-16 08:40", kind: "Buy Service", amount: 123, currency: "EUR", status: "Pending" },
  { id: "r3", title: "Translation services — landing page", date: "2026-06-16 08:38", kind: "Buy Service", amount: 123, currency: "EUR", status: "Pending" },
  { id: "r5", title: "USB-C docking station", date: "2026-06-15 18:45", kind: "Buy Product", amount: 30, currency: "EUR", status: "Approved" },
  // no cost (supplier onboarding)
  { id: "r6", title: "Onboard ProcFly Logistics as preferred carrier", date: "2026-06-15 12:17", kind: "Add New Supplier", amount: 0, currency: "EUR", status: "Approved" },
  { id: "r7", title: "Onboard Office Supplies Baltics for recurring office orders", date: "2026-06-11 01:52", kind: "Add New Supplier", amount: 0, currency: "EUR", status: "Pending" },
]

export const stats = {
  total: requests.length,
  pending: requests.filter((r) => r.status === "Pending").length,
  approved: requests.filter((r) => r.status === "Approved").length,
  rejected: requests.filter((r) => r.status === "Rejected").length,
}

export interface ActivityItem {
  id: string
  label: string
  date: string
}

export const recentActivity: ActivityItem[] = [
  { id: "a1", label: "Request updated", date: "2026-06-16 08:58" },
  { id: "a2", label: "Request updated", date: "2026-06-16 08:40" },
  { id: "a3", label: "Request updated", date: "2026-06-16 08:38" },
  { id: "a4", label: "Request updated", date: "2026-06-15 20:09" },
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
