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
  { id: "r1", title: "asd", date: "2026-06-16 08:58", kind: "Buy Product", amount: 2033, currency: "EUR", status: "Pending" },
  { id: "r2", title: "Aprasymas", date: "2026-06-16 08:40", kind: "Buy Service", amount: 123, currency: "EUR", status: "Pending" },
  { id: "r3", title: "Aprasymas", date: "2026-06-16 08:38", kind: "Buy Service", amount: 123, currency: "EUR", status: "Pending" },
  { id: "r4", title: "Vaidas", date: "2026-06-15 20:09", kind: "Buy Service", amount: 1000000, currency: "EUR", status: "Pending" },
  { id: "r5", title: "adassd", date: "2026-06-15 18:45", kind: "Buy Product", amount: 30, currency: "EUR", status: "Approved" },
  { id: "r6", title: "procurement sistema", date: "2026-06-15 12:17", kind: "Add New Supplier", amount: 0, currency: "EUR", status: "Approved" },
  { id: "r7", title: "Onboard Office Supplies Baltics for recurring office orders", date: "2026-06-11 01:52", kind: "Add New Supplier", amount: 0, currency: "EUR", status: "Pending" },
  { id: "r8", title: "Customer research interviews for Q3 campaign", date: "2026-06-10 01:52", kind: "Buy Service", amount: 8500, currency: "EUR", status: "Approved" },
]

export const stats = {
  total: 13,
  pending: 5,
  approved: 7,
  rejected: 1,
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
