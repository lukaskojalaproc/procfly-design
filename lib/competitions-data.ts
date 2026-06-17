// ---------------------------------------------------------------------------
// Competitions (supplier sourcing events / RFQs) data model.
//
// A competition invites suppliers to bid on an approved request. The UI turns
// this into a live "sourcing arena": countdowns, bid leaderboards, and the
// savings achieved versus the original baseline budget.
// ---------------------------------------------------------------------------

export type CompetitionStatus = "Draft" | "Ready" | "Active" | "Awarded" | "Closed"

export interface SupplierBid {
  supplier: string
  /** Bid amount in the competition currency. */
  amount: number
  /** How long ago the bid landed, e.g. "2m ago" — purely for the live feel. */
  submittedAgo: string
  /** Movement since the supplier's previous bid. */
  trend: "down" | "up" | "new"
}

export interface Competition {
  id: string
  ref: string
  title: string
  description: string
  category: string
  status: CompetitionStatus
  created: string
  /**
   * Hours from "now" until the bidding deadline. Resolved to a real timestamp
   * on the client at mount so countdowns are always live and ticking. `null`
   * for drafts / finished events.
   */
  deadlineInHours: number | null
  /** Original budget / first quote — the savings baseline. */
  baseline: number
  currency: string
  invitedSuppliers: number
  bids: SupplierBid[]
  owner: string
  /** The winning supplier for awarded competitions. */
  awardedTo?: string
  awardedOn?: string
  /** Drives the hero spotlight. Exactly one competition should set this. */
  featured?: boolean
}

export const competitions: Competition[] = [
  // ---- Featured live event ----------------------------------------------
  {
    id: "c1",
    ref: "CMP-2042",
    title: "Enterprise ERP platform license — 3 year term",
    description: "Multi-vendor competition for a 3-year enterprise ERP rollout across all entities.",
    category: "Software",
    status: "Active",
    created: "2026-06-15 20:09",
    deadlineInHours: 9.5,
    baseline: 1_000_000,
    currency: "EUR",
    invitedSuppliers: 6,
    owner: "Vaidas Petrauskas",
    featured: true,
    bids: [
      { supplier: "SAP Baltics", amount: 812_000, submittedAgo: "3m ago", trend: "down" },
      { supplier: "Oracle NetSuite", amount: 845_500, submittedAgo: "12m ago", trend: "down" },
      { supplier: "Microsoft Dynamics", amount: 879_000, submittedAgo: "31m ago", trend: "down" },
      { supplier: "Odoo Enterprise", amount: 921_400, submittedAgo: "1h ago", trend: "new" },
    ],
  },

  // ---- Active ------------------------------------------------------------
  {
    id: "c2",
    ref: "CMP-2031",
    title: "Customer research interviews for Q3 campaign",
    description: "Sourcing a research agency to run 24 customer interviews and synthesis.",
    category: "Consulting",
    status: "Active",
    created: "2026-06-15 19:57",
    deadlineInHours: 41,
    baseline: 8_500,
    currency: "EUR",
    invitedSuppliers: 4,
    owner: "Aistė Navickas",
    bids: [
      { supplier: "Nordic Insights", amount: 6_900, submittedAgo: "22m ago", trend: "down" },
      { supplier: "BlueLab Research", amount: 7_250, submittedAgo: "2h ago", trend: "down" },
      { supplier: "FieldWork Co.", amount: 7_800, submittedAgo: "5h ago", trend: "new" },
    ],
  },
  {
    id: "c3",
    ref: "CMP-2028",
    title: "Warehouse racking and shelving system",
    description: "Heavy-duty racking for the new Vilnius distribution centre.",
    category: "Facilities",
    status: "Active",
    created: "2026-06-14 09:20",
    deadlineInHours: 72,
    baseline: 47_250,
    currency: "EUR",
    invitedSuppliers: 5,
    owner: "Greta Jonaitis",
    bids: [
      { supplier: "StoreMax Systems", amount: 39_800, submittedAgo: "1h ago", trend: "down" },
      { supplier: "Baltic Racking", amount: 41_200, submittedAgo: "4h ago", trend: "down" },
    ],
  },

  // ---- Ready to start ----------------------------------------------------
  {
    id: "c4",
    ref: "CMP-2025",
    title: "Marketing agency retainer — Q3",
    description: "Approved and ready — invite shortlisted agencies to compete.",
    category: "Marketing",
    status: "Ready",
    created: "2026-06-13 16:10",
    deadlineInHours: null,
    baseline: 18_900,
    currency: "EUR",
    invitedSuppliers: 3,
    owner: "Aistė Navickas",
    bids: [],
  },

  // ---- Drafts ------------------------------------------------------------
  {
    id: "c5",
    ref: "CMP-2019",
    title: "Microsoft 365 annual renewal",
    description: "Annual licensing renewal across 240 seats.",
    category: "Software",
    status: "Draft",
    created: "2026-06-16 15:28",
    deadlineInHours: null,
    baseline: 64_000,
    currency: "EUR",
    invitedSuppliers: 1,
    owner: "Marius Kazlauskas",
    bids: [],
  },
  {
    id: "c6",
    ref: "CMP-2014",
    title: "Ergonomic chairs for Vilnius office",
    description: "60 ergonomic task chairs for the new floor.",
    category: "Office Supplies",
    status: "Draft",
    created: "2026-06-16 11:07",
    deadlineInHours: null,
    baseline: 21_000,
    currency: "EUR",
    invitedSuppliers: 0,
    owner: "Tomas Vasiliauskas",
    bids: [],
  },

  // ---- Finished ----------------------------------------------------------
  {
    id: "c7",
    ref: "CMP-1998",
    title: "MacBook Pro procurement — design team",
    description: "Closed competition for 14 design-team laptops.",
    category: "Hardware",
    status: "Awarded",
    created: "2026-06-01 01:52",
    deadlineInHours: null,
    baseline: 52_000,
    currency: "EUR",
    invitedSuppliers: 4,
    owner: "Tomas Vasiliauskas",
    awardedTo: "iDeal Baltics",
    awardedOn: "2026-06-08 01:53",
    bids: [
      { supplier: "iDeal Baltics", amount: 41_600, submittedAgo: "—", trend: "down" },
      { supplier: "TechPoint", amount: 44_200, submittedAgo: "—", trend: "down" },
      { supplier: "GravisShop", amount: 47_900, submittedAgo: "—", trend: "new" },
    ],
  },
  {
    id: "c8",
    ref: "CMP-1990",
    title: "Fleet of 12 delivery vehicles",
    description: "Closed multi-supplier competition for the logistics fleet.",
    category: "Logistics",
    status: "Awarded",
    created: "2026-05-20 10:00",
    deadlineInHours: null,
    baseline: 384_000,
    currency: "EUR",
    invitedSuppliers: 5,
    owner: "Greta Jonaitis",
    awardedTo: "Baltic Auto Group",
    awardedOn: "2026-05-29 14:20",
    bids: [
      { supplier: "Baltic Auto Group", amount: 318_000, submittedAgo: "—", trend: "down" },
      { supplier: "Nordic Fleet", amount: 332_500, submittedAgo: "—", trend: "down" },
    ],
  },
  {
    id: "c9",
    ref: "CMP-1981",
    title: "Annual cloud infrastructure commitment",
    description: "Closed without award — requirements changed.",
    category: "Cloud",
    status: "Closed",
    created: "2026-05-12 09:00",
    deadlineInHours: null,
    baseline: 128_400,
    currency: "EUR",
    invitedSuppliers: 3,
    owner: "Marius Kazlauskas",
    bids: [],
  },
]

// --- Derived helpers --------------------------------------------------------

/** Lowest current bid for a competition, or null if no bids yet. */
export function bestBid(c: Competition): SupplierBid | null {
  if (c.bids.length === 0) return null
  return c.bids.reduce((min, b) => (b.amount < min.amount ? b : min), c.bids[0])
}

/** Absolute savings (baseline − best bid). Zero when there are no bids. */
export function savingsAmount(c: Competition): number {
  const best = bestBid(c)
  if (!best) return 0
  return Math.max(0, c.baseline - best.amount)
}

/** Savings as a fraction of baseline (0–1). */
export function savingsPct(c: Competition): number {
  if (c.baseline <= 0) return 0
  return savingsAmount(c) / c.baseline
}

export const competitionStats = {
  active: competitions.filter((c) => c.status === "Active").length,
  ready: competitions.filter((c) => c.status === "Ready").length,
  awarded: competitions.filter((c) => c.status === "Awarded").length,
  total: competitions.length,
}

/** Total savings realised across every awarded competition. */
export const totalSavings = competitions
  .filter((c) => c.status === "Awarded")
  .reduce((sum, c) => sum + savingsAmount(c), 0)

/** Total spend currently being competed (baseline of active events). */
export const liveValue = competitions
  .filter((c) => c.status === "Active")
  .reduce((sum, c) => sum + c.baseline, 0)

/** Average savings percentage across awarded competitions. */
export const avgSavingsPct = (() => {
  const awarded = competitions.filter((c) => c.status === "Awarded")
  if (awarded.length === 0) return 0
  return awarded.reduce((sum, c) => sum + savingsPct(c), 0) / awarded.length
})()

/** Total live bids in flight across active competitions. */
export const liveBids = competitions
  .filter((c) => c.status === "Active")
  .reduce((sum, c) => sum + c.bids.length, 0)
