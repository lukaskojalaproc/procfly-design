import { getSupplierByName } from "./suppliers-data"
import { getOrderByNumber } from "./orders-data"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Archived"

export type MovementKind =
  | "Stock Added"
  | "Stock Removed"
  | "Transferred"
  | "Adjusted"
  | "Reserved"
  | "Assigned"

export type ItemActivityKind = "created" | "added" | "removed" | "updated" | "transferred"

export interface StockLocation {
  /** Top-level warehouse or site, e.g. "Central Warehouse". */
  warehouse: string
  /** Office / building, e.g. "Vilnius HQ". */
  office: string
  /** Owning department, e.g. "IT Department". */
  department: string
  /** Shelf / bin code, e.g. "A-12-3". */
  bin: string
}

export interface StockMovement {
  kind: MovementKind
  /** Signed quantity delta (negative for removals). */
  delta: number
  /** Resulting on-hand quantity after the movement. */
  balance: number
  /** Who / what performed it. */
  by: string
  /** Optional note or reference (e.g. PO number, destination). */
  note?: string
  when: string
}

export interface ItemActivity {
  kind: ItemActivityKind
  title: string
  detail: string
  when: string
}

export interface ItemDocument {
  label: string
  fileName: string
  uploadedOn?: string
}

export interface InventoryItem {
  id: string
  /** Internal item code, e.g. "IPH-003". */
  code: string
  /** Stock-keeping unit. */
  sku: string
  name: string
  category: string
  description: string
  image?: string

  status: StockStatus

  // Stock levels
  quantity: number
  minQuantity: number
  reorderPoint: number
  unit: string

  location: StockLocation

  // Supplier link (by display name — resolved to a Supplier record)
  supplierName?: string
  /** Linked purchase order number, e.g. "PRC-2026-000101". */
  purchaseOrderNumber?: string
  lastPurchaseDate?: string

  // Financials
  unitCost: number
  currency: string

  owner: string
  updated: string

  movements: StockMovement[]
  activity: ItemActivity[]
  documents: ItemDocument[]
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
export const inventoryItems: InventoryItem[] = [
  {
    id: "iph-003",
    code: "IPH-003",
    sku: "APPL-IP15-128-BLU",
    name: "iPhone 15 — 128GB Blue",
    category: "Hardware",
    description:
      "Company-issued iPhone 15 (128GB, Blue) for field and management staff. Includes USB-C cable; cases issued separately.",
    image: "/warehouse/iphone-15.png",
    status: "In Stock",
    quantity: 12,
    minQuantity: 5,
    reorderPoint: 8,
    unit: "pcs",
    location: { warehouse: "Central Warehouse", office: "Vilnius HQ", department: "IT Department", bin: "A-12-3" },
    supplierName: "Ideal Baltics",
    purchaseOrderNumber: "PRC-2026-000101",
    lastPurchaseDate: "2026-05-28",
    unitCost: 799,
    currency: "EUR",
    owner: "IT Department",
    updated: "2026-06-14 09:20",
    movements: [
      { kind: "Stock Added", delta: 15, balance: 15, by: "Tomas Vasiliauskas", note: "PO PRC-2026-000101 received", when: "2026-05-28 11:00" },
      { kind: "Assigned", delta: -2, balance: 13, by: "IT Department", note: "Onboarding — Sales team", when: "2026-06-02 14:30" },
      { kind: "Stock Removed", delta: -1, balance: 12, by: "IT Department", note: "Damaged unit written off", when: "2026-06-14 09:20" },
    ],
    activity: [
      { kind: "created", title: "Item created", detail: "Added to Central Warehouse by Tomas Vasiliauskas.", when: "2026-05-28 10:45" },
      { kind: "added", title: "Stock added (+15)", detail: "Goods received against PO PRC-2026-000101.", when: "2026-05-28 11:00" },
      { kind: "removed", title: "Stock removed (-3)", detail: "2 assigned to staff, 1 written off.", when: "2026-06-14 09:20" },
    ],
    documents: [
      { label: "Datasheet", fileName: "iphone-15-spec.pdf", uploadedOn: "2026-05-28" },
      { label: "Warranty", fileName: "apple-warranty.pdf", uploadedOn: "2026-05-28" },
    ],
  },
  {
    id: "mak-001",
    code: "MAK-001",
    sku: "MAK-DDF485-18V",
    name: "Makita Cordless Drill DDF485",
    category: "Tools & Equipment",
    description: "18V LXT brushless cordless drill driver. Issued to facilities and field installation crews.",
    image: "/warehouse/cordless-drill.png",
    status: "In Stock",
    quantity: 32,
    minQuantity: 10,
    reorderPoint: 15,
    unit: "pcs",
    location: { warehouse: "Central Warehouse", office: "Kaunas Depot", department: "Facilities", bin: "C-04-1" },
    supplierName: "Nordic Hardware Group",
    purchaseOrderNumber: "PRC-2026-000105",
    lastPurchaseDate: "2026-04-15",
    unitCost: 189,
    currency: "EUR",
    owner: "Facilities",
    updated: "2026-06-10 16:05",
    movements: [
      { kind: "Stock Added", delta: 40, balance: 40, by: "Erik Lindqvist", note: "PO PRC-2026-000105 received", when: "2026-04-15 09:30" },
      { kind: "Transferred", delta: -8, balance: 32, by: "Facilities", note: "Transferred to Kaunas Depot", when: "2026-06-10 16:05" },
    ],
    activity: [
      { kind: "created", title: "Item created", detail: "Added to Central Warehouse.", when: "2026-04-15 09:15" },
      { kind: "added", title: "Stock added (+40)", detail: "Goods received against PO PRC-2026-000105.", when: "2026-04-15 09:30" },
      { kind: "transferred", title: "Stock transferred (-8)", detail: "Moved to Kaunas Depot for field crews.", when: "2026-06-10 16:05" },
    ],
    documents: [{ label: "Manual", fileName: "makita-ddf485-manual.pdf", uploadedOn: "2026-04-15" }],
  },
  {
    id: "lap-014",
    code: "LAP-014",
    sku: "DELL-LAT-7440-I7",
    name: "Dell Latitude 7440 Laptop",
    category: "Hardware",
    description: "14-inch business laptop, Intel i7 / 16GB / 512GB SSD. Standard issue for engineering and management.",
    image: "/warehouse/laptop.png",
    status: "Low Stock",
    quantity: 4,
    minQuantity: 6,
    reorderPoint: 8,
    unit: "pcs",
    location: { warehouse: "Central Warehouse", office: "Vilnius HQ", department: "IT Department", bin: "A-03-2" },
    supplierName: "Ideal Baltics",
    purchaseOrderNumber: "PRC-2026-000102",
    lastPurchaseDate: "2026-03-20",
    unitCost: 1450,
    currency: "EUR",
    owner: "IT Department",
    updated: "2026-06-16 11:40",
    movements: [
      { kind: "Stock Added", delta: 18, balance: 18, by: "Tomas Vasiliauskas", note: "PO PRC-2026-000102 received", when: "2026-03-20 10:00" },
      { kind: "Assigned", delta: -14, balance: 4, by: "IT Department", note: "Distributed to new hires", when: "2026-06-16 11:40" },
    ],
    activity: [
      { kind: "created", title: "Item created", detail: "Added to inventory.", when: "2026-03-20 09:50" },
      { kind: "added", title: "Stock added (+18)", detail: "Goods received against PO PRC-2026-000102.", when: "2026-03-20 10:00" },
      { kind: "removed", title: "Stock assigned (-14)", detail: "Distributed to engineering new hires.", when: "2026-06-16 11:40" },
    ],
    documents: [{ label: "Datasheet", fileName: "dell-latitude-7440.pdf", uploadedOn: "2026-03-20" }],
  },
  {
    id: "mon-022",
    code: "MON-022",
    sku: "DELL-U2723QE-27",
    name: "Dell UltraSharp 27\" Monitor",
    category: "Hardware",
    description: "27-inch 4K USB-C monitor for workstations and hot-desks.",
    image: "/warehouse/monitor.png",
    status: "In Stock",
    quantity: 28,
    minQuantity: 8,
    reorderPoint: 12,
    unit: "pcs",
    location: { warehouse: "Central Warehouse", office: "Vilnius HQ", department: "IT Department", bin: "A-05-4" },
    supplierName: "Ideal Baltics",
    purchaseOrderNumber: "PRC-2026-000103",
    lastPurchaseDate: "2026-05-02",
    unitCost: 540,
    currency: "EUR",
    owner: "IT Department",
    updated: "2026-06-08 13:10",
    movements: [
      { kind: "Stock Added", delta: 30, balance: 30, by: "Tomas Vasiliauskas", note: "PO PRC-2026-000103 received", when: "2026-05-02 10:20" },
      { kind: "Assigned", delta: -2, balance: 28, by: "IT Department", note: "Hot-desk refresh", when: "2026-06-08 13:10" },
    ],
    activity: [
      { kind: "created", title: "Item created", detail: "Added to inventory.", when: "2026-05-02 10:05" },
      { kind: "added", title: "Stock added (+30)", detail: "Goods received against PO PRC-2026-000103.", when: "2026-05-02 10:20" },
    ],
    documents: [],
  },
  {
    id: "chr-009",
    code: "CHR-009",
    sku: "STMX-ERG-PRO-BLK",
    name: "Ergonomic Office Chair (Black)",
    category: "Office Supplies",
    description: "Adjustable ergonomic office chair with lumbar support. Standard issue for office workstations.",
    image: "/warehouse/office-chair.png",
    status: "Low Stock",
    quantity: 3,
    minQuantity: 5,
    reorderPoint: 6,
    unit: "pcs",
    location: { warehouse: "Central Warehouse", office: "Vilnius HQ", department: "Facilities", bin: "B-08-1" },
    supplierName: "StoreMax Systems",
    purchaseOrderNumber: "PRC-2026-000106",
    lastPurchaseDate: "2026-02-12",
    unitCost: 320,
    currency: "EUR",
    owner: "Facilities",
    updated: "2026-06-15 15:30",
    movements: [
      { kind: "Stock Added", delta: 20, balance: 20, by: "Klaus Bauer", note: "PO PRC-2026-000106 received", when: "2026-02-12 11:00" },
      { kind: "Assigned", delta: -17, balance: 3, by: "Facilities", note: "Office fit-out", when: "2026-06-15 15:30" },
    ],
    activity: [
      { kind: "created", title: "Item created", detail: "Added to inventory.", when: "2026-02-12 10:45" },
      { kind: "added", title: "Stock added (+20)", detail: "Goods received against PO PRC-2026-000106.", when: "2026-02-12 11:00" },
      { kind: "removed", title: "Stock assigned (-17)", detail: "Allocated during office fit-out.", when: "2026-06-15 15:30" },
    ],
    documents: [],
  },
  {
    id: "tnr-031",
    code: "TNR-031",
    sku: "HP-26A-TONER-BLK",
    name: "HP 26A Black Toner Cartridge",
    category: "Office Supplies",
    description: "Genuine HP 26A black toner cartridge for LaserJet Pro printers.",
    status: "Out of Stock",
    quantity: 0,
    minQuantity: 4,
    reorderPoint: 6,
    unit: "pcs",
    location: { warehouse: "Central Warehouse", office: "Vilnius HQ", department: "Operations", bin: "D-01-2" },
    supplierName: "Office Supplies Baltics",
    purchaseOrderNumber: "PRC-2026-000107",
    lastPurchaseDate: "2026-01-30",
    unitCost: 95,
    currency: "EUR",
    owner: "Operations",
    updated: "2026-06-12 10:00",
    movements: [
      { kind: "Stock Added", delta: 12, balance: 12, by: "Laura Ozola", note: "PO PRC-2026-000107 received", when: "2026-01-30 09:00" },
      { kind: "Stock Removed", delta: -12, balance: 0, by: "Operations", note: "Consumed by print room", when: "2026-06-12 10:00" },
    ],
    activity: [
      { kind: "created", title: "Item created", detail: "Added to inventory.", when: "2026-01-30 08:50" },
      { kind: "added", title: "Stock added (+12)", detail: "Goods received against PO PRC-2026-000107.", when: "2026-01-30 09:00" },
      { kind: "removed", title: "Stock depleted (-12)", detail: "Fully consumed — needs reorder.", when: "2026-06-12 10:00" },
    ],
    documents: [],
  },
  {
    id: "kbd-040",
    code: "KBD-040",
    sku: "LOG-MX-KEYS-S",
    name: "Logitech MX Keys S Keyboard",
    category: "Hardware",
    description: "Wireless productivity keyboard for office workstations.",
    status: "In Stock",
    quantity: 45,
    minQuantity: 10,
    reorderPoint: 15,
    unit: "pcs",
    location: { warehouse: "Central Warehouse", office: "Vilnius HQ", department: "IT Department", bin: "A-06-1" },
    supplierName: "Office Supplies Baltics",
    lastPurchaseDate: "2026-04-22",
    unitCost: 110,
    currency: "EUR",
    owner: "IT Department",
    updated: "2026-05-30 12:00",
    movements: [
      { kind: "Stock Added", delta: 50, balance: 50, by: "Laura Ozola", note: "Bulk purchase", when: "2026-04-22 09:40" },
      { kind: "Assigned", delta: -5, balance: 45, by: "IT Department", note: "Workstation refresh", when: "2026-05-30 12:00" },
    ],
    activity: [
      { kind: "created", title: "Item created", detail: "Added to inventory.", when: "2026-04-22 09:30" },
      { kind: "added", title: "Stock added (+50)", detail: "Bulk purchase received.", when: "2026-04-22 09:40" },
    ],
    documents: [],
  },
  {
    id: "saf-050",
    code: "SAF-050",
    sku: "3M-SAFETY-HELMET",
    name: "Safety Helmet (White)",
    category: "Tools & Equipment",
    description: "Industrial safety helmet for field installation crews. Archived after policy change to integrated headgear.",
    status: "Archived",
    quantity: 18,
    minQuantity: 0,
    reorderPoint: 0,
    unit: "pcs",
    location: { warehouse: "Overflow Storage", office: "Kaunas Depot", department: "Facilities", bin: "E-02-3" },
    supplierName: "Nordic Hardware Group",
    lastPurchaseDate: "2025-09-10",
    unitCost: 35,
    currency: "EUR",
    owner: "Facilities",
    updated: "2026-03-01 08:00",
    movements: [
      { kind: "Stock Added", delta: 18, balance: 18, by: "Erik Lindqvist", note: "Initial stock", when: "2025-09-10 10:00" },
      { kind: "Adjusted", delta: 0, balance: 18, by: "Facilities", note: "Archived — superseded by new PPE", when: "2026-03-01 08:00" },
    ],
    activity: [
      { kind: "created", title: "Item created", detail: "Added to inventory.", when: "2025-09-10 09:50" },
      { kind: "updated", title: "Item archived", detail: "Superseded by integrated headgear policy.", when: "2026-03-01 08:00" },
    ],
    documents: [],
  },
]

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

/** Compute the live stock status from quantities (Archived takes priority). */
export function computeStatus(item: InventoryItem): StockStatus {
  if (item.status === "Archived") return "Archived"
  if (item.quantity <= 0) return "Out of Stock"
  if (item.quantity < item.minQuantity) return "Low Stock"
  return "In Stock"
}

/** Whether the item is below its minimum and should be reordered. */
export function isLowStock(item: InventoryItem): boolean {
  return item.status !== "Archived" && item.quantity > 0 && item.quantity < item.minQuantity
}

export function totalValue(item: InventoryItem): number {
  return item.quantity * item.unitCost
}

export function getItemById(id: string): InventoryItem | undefined {
  return inventoryItems.find((i) => i.id === id)
}

/** Resolve the supplier record (if any) for cross-linking. */
export function itemSupplier(item: InventoryItem) {
  return item.supplierName ? getSupplierByName(item.supplierName) : undefined
}

/** Resolve the linked purchase order (if any) for cross-linking. */
export function itemOrder(item: InventoryItem) {
  return item.purchaseOrderNumber ? getOrderByNumber(item.purchaseOrderNumber) : undefined
}

// --- Filter option sources --------------------------------------------------
export const itemCategories = Array.from(new Set(inventoryItems.map((i) => i.category))).sort()
export const itemLocations = Array.from(new Set(inventoryItems.map((i) => i.location.warehouse))).sort()
export const itemOwners = Array.from(new Set(inventoryItems.map((i) => i.owner))).sort()
export const itemSuppliers = Array.from(
  new Set(inventoryItems.map((i) => i.supplierName).filter((s): s is string => Boolean(s))),
).sort()

// --- KPI stats --------------------------------------------------------------
export const warehouseStats = {
  total: inventoryItems.length,
  lowStock: inventoryItems.filter((i) => computeStatus(i) === "Low Stock").length,
  outOfStock: inventoryItems.filter((i) => computeStatus(i) === "Out of Stock").length,
  totalValue: inventoryItems.reduce((sum, i) => (i.status === "Archived" ? sum : sum + totalValue(i)), 0),
  categories: itemCategories.length,
}
