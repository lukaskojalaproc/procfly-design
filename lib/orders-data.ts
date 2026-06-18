// ---------------------------------------------------------------------------
// Purchase orders — issued orders to suppliers.
//
// Mirrors the competitions/requests data conventions: a flat list plus
// derived helpers, with a per-order detail that powers the detail window.
//
// A purchase order sits at the end of the procurement chain:
//   Request  →  Competition  →  Purchase Order
// so an order can link back to both a source request and a competition.
// ---------------------------------------------------------------------------

/** Full order lifecycle status. */
export type OrderStatus =
  | "Draft"
  | "Sent"
  | "Awaiting Delivery"
  | "Partially Delivered"
  | "Delivered"
  | "Closed"
  | "Cancelled"

/** Delivery progress, tracked separately from the order lifecycle. */
export type DeliveryStatus =
  | "Not Started"
  | "Awaiting Delivery"
  | "Partially Delivered"
  | "Delivered"
  | "Closed"
  | "Cancelled"

/** Where the supplier stands on confirming the order. */
export type SupplierResponse =
  | "Awaiting Confirmation"
  | "Confirmed"
  | "Acknowledged"
  | "Rejected"

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

/** A document attached to / generated for an order. */
export type OrderDocKind = "po" | "confirmation" | "delivery" | "invoice"
export interface OrderDocument {
  kind: OrderDocKind
  name: string
  available: boolean
  meta?: string
}

export interface PurchaseOrder {
  id: string
  number: string
  created: string
  status: OrderStatus
  deliveryStatus: DeliveryStatus
  supplierResponse: SupplierResponse
  currency: string
  /**
   * Originating competition / request reference, for traceability. Kept for
   * backwards-compat; prefer requestRef / competitionRef below.
   */
  sourceRef?: string
  /** Linked source request (e.g. "REQ-1042"). */
  requestRef?: string
  /** Linked sourcing competition (e.g. "CMP-2042"). */
  competitionRef?: string
  category: string
  owner: string
  supplier: OrderSupplier
  lines: OrderLine[]
  /** Payment terms, e.g. "Net 30". */
  paymentTerms: string
  /** Expected delivery date for the whole order. */
  expectedDelivery: string
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
    deliveryStatus: "Not Started",
    supplierResponse: "Awaiting Confirmation",
    currency: "EUR",
    sourceRef: "REQ-1025",
    requestRef: "REQ-1025",
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
    expectedDelivery: "2026-06-27",
    deliveryAddress: "ProcFly HQ — Receiving Dock, Vilnius",
    notes: "Deliver to 4th floor. Call reception on arrival.",
    timeline: [
      { label: "Order drafted", date: "2026-06-13 01:53", done: true },
      { label: "Sent to supplier", date: "Pending", done: false },
      { label: "Confirmed", date: "Pending", done: false },
      { label: "Delivered", date: "Pending", done: false },
    ],
  },
  {
    id: "po2",
    number: "PRC-2026-000102",
    created: "2026-06-08 01:53",
    status: "Awaiting Delivery",
    deliveryStatus: "Awaiting Delivery",
    supplierResponse: "Confirmed",
    currency: "EUR",
    sourceRef: "CMP-2017",
    requestRef: "REQ-1019",
    competitionRef: "CMP-2017",
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
    expectedDelivery: "2026-07-01",
    deliveryAddress: "ProcFly Distribution Center, Kaunas",
    notes: "Service start aligned with awarded competition CMP-2017.",
    timeline: [
      { label: "Order drafted", date: "2026-06-08 01:53", done: true },
      { label: "Sent to supplier", date: "2026-06-08 09:12", done: true },
      { label: "Confirmed", date: "2026-06-09 11:40", done: true },
      { label: "Delivered", date: "Pending", done: false },
    ],
  },
  {
    id: "po3",
    number: "PRC-2026-000103",
    created: "2026-06-02 01:53",
    status: "Delivered",
    deliveryStatus: "Delivered",
    supplierResponse: "Acknowledged",
    currency: "EUR",
    sourceRef: "CMP-2019",
    requestRef: "REQ-1005",
    competitionRef: "CMP-2019",
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
    expectedDelivery: "2026-06-10",
    deliveryAddress: "ProcFly HQ — IT Department, Vilnius",
    notes: "Assets tagged and enrolled in MDM on receipt.",
    timeline: [
      { label: "Order drafted", date: "2026-06-02 01:53", done: true },
      { label: "Sent to supplier", date: "2026-06-02 10:40", done: true },
      { label: "Confirmed", date: "2026-06-03 08:15", done: true },
      { label: "Delivered", date: "2026-06-10 14:22", done: true },
    ],
  },
  {
    id: "po4",
    number: "PRC-2026-000104",
    created: "2026-06-11 09:30",
    status: "Sent",
    deliveryStatus: "Awaiting Delivery",
    supplierResponse: "Awaiting Confirmation",
    currency: "USD",
    sourceRef: "REQ-1031",
    requestRef: "REQ-1031",
    category: "Software",
    owner: "Aistė Navickas",
    supplier: {
      name: "CloudWorks Inc.",
      contact: "Jordan Miller",
      email: "billing@cloudworks.com",
      phone: "+1 415 555 0190",
      address: "500 Howard St, San Francisco, CA 94105, USA",
    },
    lines: [
      { name: "Analytics platform — Enterprise", description: "Annual subscription, 250 seats", qty: 1, unit: "license", unitPrice: 48000 },
    ],
    paymentTerms: "Net 30",
    expectedDelivery: "2026-06-20",
    deliveryAddress: "Digital delivery — license keys via email",
    notes: "Provision SSO before go-live.",
    timeline: [
      { label: "Order drafted", date: "2026-06-11 09:30", done: true },
      { label: "Sent to supplier", date: "2026-06-11 10:05", done: true },
      { label: "Confirmed", date: "Pending", done: false },
      { label: "Delivered", date: "Pending", done: false },
    ],
  },
  {
    id: "po5",
    number: "PRC-2026-000105",
    created: "2026-06-05 14:10",
    status: "Partially Delivered",
    deliveryStatus: "Partially Delivered",
    supplierResponse: "Confirmed",
    currency: "EUR",
    sourceRef: "CMP-2021",
    requestRef: "REQ-1011",
    competitionRef: "CMP-2021",
    category: "Facilities",
    owner: "Greta Jonaitis",
    supplier: {
      name: "StoreMax Systems",
      contact: "Inga Berg",
      email: "orders@storemax.lv",
      phone: "+371 6 720 0140",
      address: "Brīvības iela 112, Riga, LV-1010, Latvia",
    },
    lines: [
      { name: "Heavy-duty pallet racking", description: "Bay system, galvanised", qty: 20, unit: "bays", unitPrice: 1640 },
      { name: "Installation & anchoring", description: "On-site assembly", qty: 1, unit: "service", unitPrice: 4200 },
    ],
    paymentTerms: "Net 45",
    expectedDelivery: "2026-06-22",
    deliveryAddress: "ProcFly Distribution Center, Kaunas",
    notes: "First batch of 12 bays delivered; remaining 8 bays scheduled for next week.",
    timeline: [
      { label: "Order drafted", date: "2026-06-05 14:10", done: true },
      { label: "Sent to supplier", date: "2026-06-05 15:00", done: true },
      { label: "Confirmed", date: "2026-06-06 09:25", done: true },
      { label: "Partially delivered", date: "2026-06-18 11:00", done: true },
      { label: "Delivered", date: "Pending", done: false },
    ],
  },
  {
    id: "po6",
    number: "PRC-2026-000106",
    created: "2026-05-28 08:00",
    status: "Closed",
    deliveryStatus: "Closed",
    supplierResponse: "Acknowledged",
    currency: "EUR",
    sourceRef: "CMP-2014",
    requestRef: "REQ-0992",
    competitionRef: "CMP-2014",
    category: "Fleet",
    owner: "Greta Jonaitis",
    supplier: {
      name: "Baltic Auto Group",
      contact: "Andrius Nielsen",
      email: "fleet@balticauto.lt",
      phone: "+370 5 240 7788",
      address: "Ukmergės g. 280, Vilnius, LT-06115, Lithuania",
    },
    lines: [
      { name: "Fleet lease — 6 vehicles", description: "36-month operating lease", qty: 6, unit: "vehicles", unitPrice: 5800 },
    ],
    paymentTerms: "Net 30",
    expectedDelivery: "2026-05-30",
    deliveryAddress: "ProcFly HQ — Fleet Bay, Vilnius",
    notes: "Vehicles delivered, registered, and closed out.",
    timeline: [
      { label: "Order drafted", date: "2026-05-28 08:00", done: true },
      { label: "Sent to supplier", date: "2026-05-28 09:10", done: true },
      { label: "Confirmed", date: "2026-05-28 16:30", done: true },
      { label: "Delivered", date: "2026-05-30 12:00", done: true },
      { label: "Closed", date: "2026-06-02 10:00", done: true },
    ],
  },
  {
    id: "po7",
    number: "PRC-2026-000107",
    created: "2026-06-01 11:20",
    status: "Cancelled",
    deliveryStatus: "Cancelled",
    supplierResponse: "Rejected",
    currency: "EUR",
    sourceRef: "REQ-0985",
    requestRef: "REQ-0985",
    category: "Cloud",
    owner: "Marius Kazlauskas",
    supplier: {
      name: "DataVault Cloud",
      contact: "Laura Berg",
      email: "sales@datavault.io",
      phone: "+371 6 700 9912",
      address: "Elizabetes iela 45, Riga, LV-1010, Latvia",
    },
    lines: [
      { name: "Backup storage — 200TB", description: "Annual managed backup", qty: 1, unit: "plan", unitPrice: 22000 },
    ],
    paymentTerms: "Net 30",
    expectedDelivery: "—",
    deliveryAddress: "Digital delivery",
    notes: "Supplier rejected the order — capacity unavailable. Cancelled and re-sourcing.",
    timeline: [
      { label: "Order drafted", date: "2026-06-01 11:20", done: true },
      { label: "Sent to supplier", date: "2026-06-01 12:00", done: true },
      { label: "Rejected by supplier", date: "2026-06-02 09:00", done: true },
      { label: "Cancelled", date: "2026-06-02 09:30", done: true },
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
    deliveryStatus: "Not Started",
    supplierResponse: "Awaiting Confirmation",
    currency: c.currency,
    sourceRef: c.ref,
    requestRef: c.sourceRequestRef,
    competitionRef: c.ref,
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
    expectedDelivery: "To be confirmed with supplier",
    deliveryAddress: "ProcFly HQ — Receiving Dock, Vilnius",
    notes: `Generated automatically from awarded competition ${c.ref}. Review line items and delivery details before sending to the supplier.`,
    timeline: [
      { label: "Converted from competition", date: created, done: true },
      { label: "Order drafted", date: created, done: true },
      { label: "Sent to supplier", date: "Pending", done: false },
      { label: "Confirmed", date: "Pending", done: false },
      { label: "Delivered", date: "Pending", done: false },
    ],
  }
}

// --- Convert an approved request directly into a purchase order -------------
//
// Used when a request does not need a competitive sourcing event (e.g. a
// small, low-value, or single-source buy). The approved request amount
// becomes the order subtotal and the requester becomes the order owner.

import type { ProcurementRequest } from "./dashboard-data"

/** Stable PO id derived from a request (kept distinct from competition POs). */
export function convertedOrderIdFromRequest(requestId: string) {
  return `req-${requestId}`
}

/**
 * Auto-fill a draft purchase order straight from an approved request,
 * bypassing a competition. Supplier is left to be selected since no bid
 * has been awarded yet.
 */
export function requestToPurchaseOrder(r: ProcurementRequest): PurchaseOrder {
  const seq = (hash(r.id) % 900) + 100
  const created = new Date().toISOString().slice(0, 16).replace("T", " ")
  const supplierName = "To be selected"

  return {
    id: convertedOrderIdFromRequest(r.id),
    number: `PRC-2026-000${seq}`,
    created,
    status: "Draft",
    deliveryStatus: "Not Started",
    supplierResponse: "Awaiting Confirmation",
    currency: r.currency,
    sourceRef: r.ref,
    requestRef: r.ref,
    category: r.category,
    owner: r.requester,
    supplier: {
      name: supplierName,
      contact: "Pending selection",
      email: "",
      phone: "",
      address: "Add supplier details before sending",
    },
    lines: [
      {
        name: r.title,
        description: `Direct purchase from approved request ${r.ref}`,
        qty: 1,
        unit: "lot",
        unitPrice: r.amount,
      },
    ],
    paymentTerms: "Net 30",
    expectedDelivery: "To be confirmed with supplier",
    deliveryAddress: "ProcFly HQ — Receiving Dock, Vilnius",
    notes: `Generated automatically from approved request ${r.ref} (direct purchase, no competition). Select a supplier and review line items before sending.`,
    timeline: [
      { label: "Converted from request", date: created, done: true },
      { label: "Order drafted", date: created, done: true },
      { label: "Supplier selected", date: "Pending", done: false },
      { label: "Sent to supplier", date: "Pending", done: false },
      { label: "Delivered", date: "Pending", done: false },
    ],
  }
}

// --- Creation ---------------------------------------------------------------

/** Suggest the next sequential PO number (e.g. "PRC-2026-000142"). */
export function nextOrderNumber(): string {
  const max = purchaseOrders.reduce((m, o) => {
    const n = Number.parseInt(o.number.split("-").pop() ?? "0", 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 100)
  return `PRC-2026-${String(max + 1).padStart(6, "0")}`
}

/** Distinct supplier names already on file, for quick selection. */
export function knownSuppliers(): string[] {
  return Array.from(new Set(purchaseOrders.map((o) => o.supplier.name)))
    .filter((n) => n && n !== "To be selected")
    .sort()
}

export interface NewOrderInput {
  number: string
  supplierName: string
  owner: string
  requestRef?: string
  competitionRef?: string
  expectedDelivery: string
  deliveryAddress: string
  currency: string
  status: OrderStatus
  lines: OrderLine[]
  documents?: string[]
}

/**
 * Build a purchase order from the create-PO form and prepend it to the live
 * list so it shows up immediately on the orders page and detail route.
 */
export function createPurchaseOrder(input: NewOrderInput): PurchaseOrder {
  const created = new Date().toISOString().slice(0, 16).replace("T", " ")
  const id = `new-${Date.now().toString(36)}`
  const docNote = input.documents?.length ? `Attached documents: ${input.documents.join(", ")}.` : undefined

  const po: PurchaseOrder = {
    id,
    number: input.number,
    created,
    status: input.status,
    deliveryStatus: input.status === "Draft" ? "Not Started" : "Awaiting Delivery",
    supplierResponse: "Awaiting Confirmation",
    currency: input.currency,
    sourceRef: input.requestRef ?? input.competitionRef,
    requestRef: input.requestRef,
    competitionRef: input.competitionRef,
    category: "General",
    owner: input.owner,
    supplier: {
      name: input.supplierName || "To be selected",
      contact: "Pending selection",
      email: "",
      phone: "",
      address: input.deliveryAddress,
    },
    lines: input.lines,
    paymentTerms: "Net 30",
    expectedDelivery: input.expectedDelivery || "To be confirmed with supplier",
    deliveryAddress: input.deliveryAddress,
    notes: docNote,
    timeline: [
      { label: "Order drafted", date: created, done: true },
      { label: "Sent to supplier", date: input.status === "Draft" ? "Pending" : created, done: input.status !== "Draft" },
      { label: "Confirmed", date: "Pending", done: false },
      { label: "Delivered", date: "Pending", done: false },
    ],
  }

  purchaseOrders.unshift(po)
  return po
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

/** Look up a purchase order by its human number (e.g. "PRC-2026-000102"). */
export function getOrderByNumber(number: string) {
  return purchaseOrders.find((o) => o.number === number)
}

/**
 * Documents associated with an order. Availability is derived from how far
 * the order has progressed through its lifecycle.
 */
export function orderDocuments(po: PurchaseOrder): OrderDocument[] {
  const sent = po.status !== "Draft"
  const confirmed = po.supplierResponse === "Confirmed" || po.supplierResponse === "Acknowledged"
  const delivered =
    po.deliveryStatus === "Partially Delivered" ||
    po.deliveryStatus === "Delivered" ||
    po.deliveryStatus === "Closed"
  const invoiced = po.status === "Delivered" || po.status === "Closed"
  return [
    { kind: "po", name: "Purchase order (PDF)", available: true, meta: po.number },
    {
      kind: "confirmation",
      name: "Supplier confirmation",
      available: confirmed,
      meta: confirmed ? "Received" : "Awaiting supplier",
    },
    {
      kind: "delivery",
      name: "Delivery documents",
      available: delivered,
      meta: delivered ? "Goods receipt note" : "Not yet delivered",
    },
    {
      kind: "invoice",
      name: "Invoice",
      available: invoiced,
      meta: invoiced ? "Matched to PO" : "Pending delivery",
    },
  ]
}

export interface OrderActivityEntry {
  title: string
  detail: string
  date: string
  done: boolean
}

/**
 * A buyer-facing activity history derived from the order timeline plus its
 * supplier-response and delivery state.
 */
export function orderActivity(po: PurchaseOrder): OrderActivityEntry[] {
  return po.timeline.map((e) => ({
    title: e.label,
    detail: e.done ? "Completed" : "Pending",
    date: e.date,
    done: e.done,
  }))
}

const COMMITTING: OrderStatus[] = ["Sent", "Awaiting Delivery", "Partially Delivered", "Delivered", "Closed"]

export const orderStats = {
  total: purchaseOrders.length,
  draft: purchaseOrders.filter((o) => o.status === "Draft").length,
  sent: purchaseOrders.filter((o) => o.status === "Sent").length,
  awaitingDelivery: purchaseOrders.filter(
    (o) => o.status === "Awaiting Delivery" || o.status === "Partially Delivered",
  ).length,
  delivered: purchaseOrders.filter((o) => o.status === "Delivered" || o.status === "Closed").length,
  committed: purchaseOrders
    .filter((o) => COMMITTING.includes(o.status))
    .reduce((sum, o) => sum + orderTotal(o), 0),
}
