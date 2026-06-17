// ---------------------------------------------------------------------------
// Purchase orders — issued orders to suppliers.
//
// Mirrors the competitions/requests data conventions: a flat list plus
// derived helpers, with a per-order detail that powers the detail window.
// ---------------------------------------------------------------------------

export type OrderStatus = "Draft" | "Sent" | "Completed" | "Cancelled"

export interface OrderLine {
  name: string
  description?: string
  qty: number
  unit: string
  unitPrice: number
}

export interface OrderEvent {
  label: string
  date: string
  done: boolean
}

export interface OrderSupplier {
  name: string
  contact: string
  email: string
  phone: string
  address: string
}

export interface PurchaseOrder {
  id: string
  number: string
  created: string
  status: OrderStatus
  currency: string
  /** Originating competition / request reference, for traceability. */
  sourceRef?: string
  category: string
  owner: string
  supplier: OrderSupplier
  lines: OrderLine[]
  /** Payment terms, e.g. "Net 30". */
  paymentTerms: string
  /** Expected or actual delivery date. */
  deliveryDate: string
  deliveryAddress: string
  notes?: string
  timeline: OrderEvent[]
}

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po1",
    number: "PRC-2026-000101",
    created: "2026-06-13 01:53",
    status: "Draft",
    currency: "EUR",
    sourceRef: "REQ-1025",
    category: "Office",
    owner: "Tomas Vasiliauskas",
    supplier: {
      name: "Office Supplies Baltics",
      contact: "Rasa Petraitytė",
      email: "orders@officebaltics.lt",
      phone: "+370 5 210 4488",
      address: "Gedimino pr. 24, Vilnius, LT-01103, Lithuania",
    },
    lines: [
      { name: "Standing desk — electric", description: "Sit/stand, 160×80cm, oak top", qty: 8, unit: "pcs", unitPrice: 145 },
      { name: "Desk cable tray", description: "Under-desk steel cable management", qty: 8, unit: "pcs", unitPrice: 17.5 },
    ],
    paymentTerms: "Net 30",
    deliveryDate: "2026-06-27",
    deliveryAddress: "ProcFly HQ — Receiving Dock, Vilnius",
    notes: "Deliver to 4th floor. Call reception on arrival.",
    timeline: [
      { label: "Order drafted", date: "2026-06-13 01:53", done: true },
      { label: "Sent to supplier", date: "Pending", done: false },
      { label: "Acknowledged", date: "Pending", done: false },
      { label: "Delivered", date: "Pending", done: false },
    ],
  },
  {
    id: "po2",
    number: "PRC-2026-000102",
    created: "2026-06-08 01:53",
    status: "Sent",
    currency: "EUR",
    sourceRef: "CMP-2017",
    category: "Logistics",
    owner: "Greta Jonaitis",
    supplier: {
      name: "Ideal Baltics",
      contact: "Mantas Adomaitis",
      email: "procurement@idealbaltics.com",
      phone: "+370 37 330 110",
      address: "Savanorių pr. 187, Kaunas, LT-44150, Lithuania",
    },
    lines: [
      { name: "Annual logistics retainer", description: "Regional distribution — 12 month term", qty: 1, unit: "contract", unitPrice: 14400 },
    ],
    paymentTerms: "Net 45",
    deliveryDate: "2026-07-01",
    deliveryAddress: "ProcFly Distribution Center, Kaunas",
    notes: "Service start aligned with awarded competition CMP-2017.",
    timeline: [
      { label: "Order drafted", date: "2026-06-08 01:53", done: true },
      { label: "Sent to supplier", date: "2026-06-08 09:12", done: true },
      { label: "Acknowledged", date: "Pending", done: false },
      { label: "Delivered", date: "Pending", done: false },
    ],
  },
  {
    id: "po3",
    number: "PRC-2026-000103",
    created: "2026-06-02 01:53",
    status: "Completed",
    currency: "EUR",
    sourceRef: "CMP-2019",
    category: "Hardware",
    owner: "Marius Kazlauskas",
    supplier: {
      name: "Nordic Hardware Group",
      contact: "Erik Lindqvist",
      email: "sales@nordichw.se",
      phone: "+46 8 559 010 0",
      address: "Sveavägen 44, 111 34 Stockholm, Sweden",
    },
    lines: [
      { name: "MacBook Pro 14” M-series", description: "16GB / 512GB, space black", qty: 4, unit: "pcs", unitPrice: 1130 },
    ],
    paymentTerms: "Net 30",
    deliveryDate: "2026-06-10",
    deliveryAddress: "ProcFly HQ — IT Department, Vilnius",
    notes: "Assets tagged and enrolled in MDM on receipt.",
    timeline: [
      { label: "Order drafted", date: "2026-06-02 01:53", done: true },
      { label: "Sent to supplier", date: "2026-06-02 10:40", done: true },
      { label: "Acknowledged", date: "2026-06-03 08:15", done: true },
      { label: "Delivered", date: "2026-06-10 14:22", done: true },
    ],
  },
]

// --- Convert an awarded competition into a purchase order -------------------
//
// Deterministic so a converted PO always rebuilds identically from static
// competition data (no persistence needed). Supplier contact details are
// derived from the winning supplier's name.

import { bestBid, type Competition } from "./competitions-data"

function hash(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000
  return h
}

/** Build plausible, stable contact details for a supplier name. */
function deriveSupplier(name: string, category: string): OrderSupplier {
  const h = hash(name)
  const firstNames = ["Mantas", "Rasa", "Erik", "Greta", "Tomas", "Laura", "Andrius", "Inga"]
  const lastNames = ["Adomaitis", "Petraitytė", "Lindqvist", "Jonaitytė", "Kazlauskas", "Berg", "Nielsen", "Vasiliauskas"]
  const cities = [
    { city: "Vilnius", street: "Gedimino pr.", zip: "LT-01103", country: "Lithuania", code: "+370 5" },
    { city: "Kaunas", street: "Savanorių pr.", zip: "LT-44150", country: "Lithuania", code: "+370 37" },
    { city: "Stockholm", street: "Sveavägen", zip: "111 34", country: "Sweden", code: "+46 8" },
    { city: "Riga", street: "Brīvības iela", zip: "LV-1010", country: "Latvia", code: "+371 6" },
  ]
  const c = cities[h % cities.length]
  const contact = `${firstNames[h % firstNames.length]} ${lastNames[(h >> 2) % lastNames.length]}`
  const domain = name.toLowerCase().replace(/[^a-z0-9]+/g, "")
  return {
    name,
    contact,
    email: `procurement@${domain || "supplier"}.com`,
    phone: `${c.code} ${200 + (h % 700)} ${1000 + (h % 9000)}`,
    address: `${c.street} ${10 + (h % 180)}, ${c.city}, ${c.zip}, ${c.country}`,
  }
}

/** Stable PO id/number for a converted competition. */
export function convertedOrderId(competitionId: string) {
  return `from-${competitionId}`
}

/**
 * Auto-fill a draft purchase order from an awarded (or live) competition.
 * The winning bid becomes the order subtotal and the order references the
 * originating competition for traceability.
 */
export function competitionToPurchaseOrder(c: Competition): PurchaseOrder {
  const winner = c.awardedTo
    ? c.bids.find((b) => b.supplier === c.awardedTo) ?? bestBid(c)
    : bestBid(c)
  const supplierName = winner?.supplier ?? "Awarded supplier"
  const amount = winner?.amount ?? c.baseline
  const seq = (hash(c.id) % 900) + 100
  const created = c.awardedOn ?? new Date().toISOString().slice(0, 16).replace("T", " ")

  return {
    id: convertedOrderId(c.id),
    number: `PRC-2026-000${seq}`,
    created,
    status: "Draft",
    currency: c.currency,
    sourceRef: c.ref,
    category: c.category,
    owner: c.owner,
    supplier: deriveSupplier(supplierName, c.category),
    lines: [
      {
        name: c.title,
        description: `Awarded scope sourced via competition ${c.ref}`,
        qty: 1,
        unit: "lot",
        unitPrice: amount,
      },
    ],
    paymentTerms: "Net 30",
    deliveryDate: "To be confirmed with supplier",
    deliveryAddress: "ProcFly HQ — Receiving Dock, Vilnius",
    notes: `Generated automatically from awarded competition ${c.ref}. Review line items and delivery details before sending to the supplier.`,
    timeline: [
      { label: "Converted from competition", date: created, done: true },
      { label: "Order drafted", date: created, done: true },
      { label: "Sent to supplier", date: "Pending", done: false },
      { label: "Acknowledged", date: "Pending", done: false },
      { label: "Delivered", date: "Pending", done: false },
    ],
  }
}

// --- Derived helpers --------------------------------------------------------

export function orderLineTotal(line: OrderLine) {
  return line.qty * line.unitPrice
}

export function orderTotal(po: PurchaseOrder) {
  return po.lines.reduce((sum, l) => sum + orderLineTotal(l), 0)
}

export function getOrderById(id: string) {
  return purchaseOrders.find((o) => o.id === id)
}

export const orderStats = {
  total: purchaseOrders.length,
  draft: purchaseOrders.filter((o) => o.status === "Draft").length,
  sent: purchaseOrders.filter((o) => o.status === "Sent").length,
  completed: purchaseOrders.filter((o) => o.status === "Completed").length,
  committed: purchaseOrders.reduce((sum, o) => sum + orderTotal(o), 0),
}
