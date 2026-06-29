import {
  getRequestById,
  isHighValue,
  type ProcurementRequest,
  type RequestPriority,
} from "@/lib/dashboard-data"

// ---------------------------------------------------------------------------
// Approvals data layer.
//
// The Approvals module is task-centric, not request-centric: it lists the
// approval *tasks* assigned to the logged-in approver. Each task represents one
// decision the user must make (or has made) at a specific step of a request's
// configured approval workflow.
//
// This is design/prototype data — when a real backend is added, these helpers
// become server queries scoped to the authenticated approver. The shapes below
// describe exactly what the UI needs.
// ---------------------------------------------------------------------------

/** Workspace "now". Fixed so the prototype's deadlines are deterministic. */
export const WORKSPACE_NOW = new Date("2026-06-18T09:00:00")

/** Workspace currency used for the equivalent amount column. */
export const WORKSPACE_CURRENCY = "EUR"

export type ApprovalTaskStatus =
  | "Awaiting Action"
  | "Approved by Me"
  | "Rejected by Me"
  | "Changes Requested"

export type DueStatus = "overdue" | "today" | "soon" | "later" | "none"

export interface ApprovalTask {
  id: string
  requestId: string
  /** Name of the current approval step, from the configured workflow. */
  stepRole: string
  stepNumber: number
  totalSteps: number
  taskStatus: ApprovalTaskStatus
  /** ISO date (yyyy-mm-dd) the decision is due, or null when none configured. */
  deadline: string | null
  /** When this step became active and assigned to the user (waiting start). */
  activatedAt: string
  /** When the user completed the decision (history tabs only). */
  decidedAt?: string
  priority: RequestPriority
}

// Seed tasks assigned to the current approver. Spread across statuses and due
// states so every tab and filter has representative content.
const approvalTasks: ApprovalTask[] = [
  // Awaiting Action
  { id: "t-r4", requestId: "r4", stepRole: "Manager", stepNumber: 2, totalSteps: 5, taskStatus: "Awaiting Action", deadline: "2026-06-17", activatedAt: "2026-06-15 20:09", priority: "Urgent" },
  { id: "t-r11", requestId: "r11", stepRole: "Manager", stepNumber: 2, totalSteps: 5, taskStatus: "Awaiting Action", deadline: "2026-06-18", activatedAt: "2026-06-16 09:00", priority: "Normal" },
  { id: "t-r1", requestId: "r1", stepRole: "Category Manager", stepNumber: 3, totalSteps: 5, taskStatus: "Awaiting Action", deadline: "2026-06-19", activatedAt: "2026-06-17 09:00", priority: "Normal" },
  { id: "t-r3", requestId: "r3", stepRole: "Manager", stepNumber: 2, totalSteps: 5, taskStatus: "Awaiting Action", deadline: null, activatedAt: "2026-06-17 10:00", priority: "Normal" },
  // Changes Requested (active, by me)
  { id: "t-r2", requestId: "r2", stepRole: "Manager", stepNumber: 2, totalSteps: 5, taskStatus: "Changes Requested", deadline: "2026-06-20", activatedAt: "2026-06-16 08:40", decidedAt: "2026-06-17 11:30", priority: "Normal" },
  { id: "t-r7", requestId: "r7", stepRole: "Procurement", stepNumber: 2, totalSteps: 4, taskStatus: "Changes Requested", deadline: null, activatedAt: "2026-06-11 01:52", decidedAt: "2026-06-12 09:15", priority: "High" },
  // Approved by Me
  { id: "t-r9", requestId: "r9", stepRole: "Manager", stepNumber: 2, totalSteps: 5, taskStatus: "Approved by Me", deadline: "2026-06-15", activatedAt: "2026-06-15 16:30", decidedAt: "2026-06-15 17:02", priority: "High" },
  { id: "t-r12", requestId: "r12", stepRole: "Manager", stepNumber: 2, totalSteps: 5, taskStatus: "Approved by Me", deadline: "2026-06-13", activatedAt: "2026-06-13 14:42", decidedAt: "2026-06-13 16:10", priority: "Normal" },
  { id: "t-r8", requestId: "r8", stepRole: "Category Manager", stepNumber: 3, totalSteps: 5, taskStatus: "Approved by Me", deadline: "2026-06-12", activatedAt: "2026-06-10 01:52", decidedAt: "2026-06-11 13:18", priority: "Normal" },
  { id: "t-r5", requestId: "r5", stepRole: "Manager", stepNumber: 2, totalSteps: 5, taskStatus: "Approved by Me", deadline: "2026-06-16", activatedAt: "2026-06-15 18:45", decidedAt: "2026-06-15 18:48", priority: "Normal" },
  { id: "t-r6", requestId: "r6", stepRole: "Procurement", stepNumber: 2, totalSteps: 4, taskStatus: "Approved by Me", deadline: null, activatedAt: "2026-06-15 12:17", decidedAt: "2026-06-15 14:00", priority: "Normal" },
  // Rejected by Me
  { id: "t-r10", requestId: "r10", stepRole: "Finance", stepNumber: 4, totalSteps: 5, taskStatus: "Rejected by Me", deadline: "2026-06-14", activatedAt: "2026-06-14 11:05", decidedAt: "2026-06-14 15:20", priority: "High" },
  { id: "t-r13", requestId: "r13", stepRole: "Manager", stepNumber: 2, totalSteps: 5, taskStatus: "Rejected by Me", deadline: "2026-06-12", activatedAt: "2026-06-12 10:15", decidedAt: "2026-06-12 14:00", priority: "Normal" },
]

/** A task joined with its request — the view model the list renders. */
export interface ResolvedApprovalTask extends ApprovalTask {
  request: ProcurementRequest
  dueStatus: DueStatus
  /** Days until deadline (negative = overdue). null when no deadline. */
  dueInDays: number | null
  highValue: boolean
  /** Higher = more urgent. Drives the default "Most Urgent" sort. */
  urgencyScore: number
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function computeDueStatus(deadline: string | null): { status: DueStatus; days: number | null } {
  if (!deadline) return { status: "none", days: null }
  const today = startOfDay(WORKSPACE_NOW)
  const due = startOfDay(new Date(deadline + "T00:00:00"))
  const days = Math.round((due - today) / 86_400_000)
  if (days < 0) return { status: "overdue", days }
  if (days === 0) return { status: "today", days }
  if (days <= 2) return { status: "soon", days }
  return { status: "later", days }
}

const priorityWeight: Record<RequestPriority, number> = { Urgent: 3, High: 2, Normal: 1 }
const dueWeight: Record<DueStatus, number> = { overdue: 4, today: 3, soon: 2, later: 1, none: 0 }

export function resolveTask(task: ApprovalTask): ResolvedApprovalTask | null {
  const request = getRequestById(task.requestId)
  if (!request) return null
  const { status, days } = computeDueStatus(task.deadline)
  const highValue = isHighValue(request.amount)
  const urgencyScore =
    dueWeight[status] * 100 + priorityWeight[task.priority] * 20 + (highValue ? 10 : 0)
  return { ...task, request, dueStatus: status, dueInDays: days, highValue, urgencyScore }
}

/** All approval tasks visible to the logged-in approver, resolved. */
export function getApprovalTasks(): ResolvedApprovalTask[] {
  return approvalTasks
    .map(resolveTask)
    .filter((t): t is ResolvedApprovalTask => t !== null)
}

// --- Summary (computed only from the user's own tasks) ----------------------

export interface ApprovalSummary {
  awaiting: number
  valueAtStake: number
  overdue: number
  dueSoon: number
  completedByMe: number
}

export function getApprovalSummary(tasks: ResolvedApprovalTask[]): ApprovalSummary {
  const awaitingTasks = tasks.filter((t) => t.taskStatus === "Awaiting Action")
  // Value at stake = total of unique requests currently awaiting my decision.
  const seen = new Set<string>()
  let valueAtStake = 0
  for (const t of awaitingTasks) {
    if (!seen.has(t.requestId)) {
      seen.add(t.requestId)
      valueAtStake += t.request.amount
    }
  }
  return {
    awaiting: awaitingTasks.length,
    valueAtStake,
    overdue: awaitingTasks.filter((t) => t.dueStatus === "overdue").length,
    dueSoon: awaitingTasks.filter((t) => t.dueStatus === "today" || t.dueStatus === "soon").length,
    completedByMe: tasks.filter((t) => t.taskStatus !== "Awaiting Action").length,
  }
}

// --- Formatting helpers -----------------------------------------------------

const eur = new Intl.NumberFormat("en-US")

export function formatTaskAmount(amount: number, currency: string): string {
  if (amount <= 0) return "No cost"
  return `${eur.format(amount)} ${currency}`
}

/** Compact EUR for summary tiles, e.g. €1.0M, €47k. */
export function formatCompactEur(n: number): string {
  if (n <= 0) return "—"
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1000) return `€${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`
  return `€${n}`
}

/** Waiting time since the step became active and assigned to the user. */
export function formatWaiting(activatedAt: string): string {
  const start = new Date(activatedAt.replace(" ", "T")).getTime()
  const diff = WORKSPACE_NOW.getTime() - start
  if (diff < 0) return "Just now"
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return "< 1h waiting"
  if (hours < 24) return `${hours}h waiting`
  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  return remHours > 0 ? `${days}d ${remHours}h waiting` : `${days}d waiting`
}

const pill = "inline-flex w-fit items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px]"
export const dueStatusMeta: Record<DueStatus, { label: string; badge: string; dot: string }> = {
  overdue: { label: "Overdue",    badge: `${pill} text-[#dc2626] font-semibold`, dot: "" },
  today:   { label: "Due today",  badge: `${pill} text-[#d97706] font-semibold`, dot: "" },
  soon:    { label: "Due soon",   badge: `${pill} text-[#d97706]`,               dot: "" },
  later:   { label: "Due later",  badge: `${pill} text-[#64748B]`,               dot: "" },
  none:    { label: "No due date",badge: `${pill} text-[#94A3B8]`,               dot: "" },
}

const badgePill = "inline-flex w-fit items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-semibold"
export const taskStatusMeta: Record<ApprovalTaskStatus, { label: string; badge: string }> = {
  "Awaiting Action":   { label: "Awaiting Action",   badge: `${badgePill} text-[#92400e]` },
  "Approved by Me":    { label: "Approved by Me",    badge: `${badgePill} text-[#166534]` },
  "Rejected by Me":    { label: "Rejected by Me",    badge: `${badgePill} text-[#991b1b]` },
  "Changes Requested": { label: "Changes Requested", badge: `${badgePill} text-[#991b1b]` },
}

export const priorityMeta: Record<RequestPriority, { label: string; badge: string }> = {
  Urgent: { label: "Urgent", badge: `${badgePill} text-[#dc2626]` },
  High:   { label: "High",   badge: `${badgePill} text-[#92400e]` },
  Normal: { label: "Normal", badge: `${badgePill} text-[#64748B]` },
}

// --- Tabs, filters, sorting -------------------------------------------------

export type ApprovalTab =
  | "Awaiting My Action"
  | "Approved by Me"
  | "Rejected by Me"
  | "Changes Requested"
  | "All"

export const APPROVAL_TABS: ApprovalTab[] = [
  "Awaiting My Action",
  "Approved by Me",
  "Rejected by Me",
  "Changes Requested",
  "All",
]

/** Map a tab to the task statuses it includes. */
export function tabMatchesTask(tab: ApprovalTab, t: ResolvedApprovalTask): boolean {
  switch (tab) {
    case "Awaiting My Action":
      return t.taskStatus === "Awaiting Action"
    case "Approved by Me":
      return t.taskStatus === "Approved by Me"
    case "Rejected by Me":
      return t.taskStatus === "Rejected by Me"
    case "Changes Requested":
      return t.taskStatus === "Changes Requested"
    case "All":
      return true
  }
}

export type DueFilter = "All" | "Overdue" | "Due Today" | "Due Soon" | "No Due Date"
export type AmountFilter = "Any" | "No cost" | "< 10k" | "10k – 100k" | "100k+"
export type SortKey = "Most Urgent" | "Due Date Soonest" | "Oldest Waiting" | "Highest Amount" | "Newest"

export const DUE_FILTERS: DueFilter[] = ["All", "Overdue", "Due Today", "Due Soon", "No Due Date"]
export const AMOUNT_FILTERS: AmountFilter[] = ["Any", "No cost", "< 10k", "10k – 100k", "100k+"]
export const SORT_KEYS: SortKey[] = [
  "Most Urgent",
  "Due Date Soonest",
  "Oldest Waiting",
  "Highest Amount",
  "Newest",
]

export function matchesDueFilter(f: DueFilter, t: ResolvedApprovalTask): boolean {
  switch (f) {
    case "All":
      return true
    case "Overdue":
      return t.dueStatus === "overdue"
    case "Due Today":
      return t.dueStatus === "today"
    case "Due Soon":
      return t.dueStatus === "soon" || t.dueStatus === "today"
    case "No Due Date":
      return t.dueStatus === "none"
  }
}

export function matchesAmountFilter(f: AmountFilter, amount: number): boolean {
  switch (f) {
    case "Any":
      return true
    case "No cost":
      return amount <= 0
    case "< 10k":
      return amount > 0 && amount < 10_000
    case "10k – 100k":
      return amount >= 10_000 && amount < 100_000
    case "100k+":
      return amount >= 100_000
  }
}

export function matchesSearch(q: string, t: ResolvedApprovalTask): boolean {
  const term = q.trim().toLowerCase()
  if (!term) return true
  const r = t.request
  return [r.ref, r.title, r.requester, r.supplier ?? "", r.category, r.department]
    .join(" ")
    .toLowerCase()
    .includes(term)
}

export function sortTasks(tasks: ResolvedApprovalTask[], key: SortKey): ResolvedApprovalTask[] {
  const arr = [...tasks]
  const dueRank = (t: ResolvedApprovalTask) =>
    t.dueInDays === null ? Number.POSITIVE_INFINITY : t.dueInDays
  const activated = (t: ResolvedApprovalTask) => new Date(t.activatedAt.replace(" ", "T")).getTime()
  switch (key) {
    case "Most Urgent":
      return arr.sort((a, b) => b.urgencyScore - a.urgencyScore || dueRank(a) - dueRank(b))
    case "Due Date Soonest":
      return arr.sort((a, b) => dueRank(a) - dueRank(b))
    case "Oldest Waiting":
      return arr.sort((a, b) => activated(a) - activated(b))
    case "Highest Amount":
      return arr.sort((a, b) => b.request.amount - a.request.amount)
    case "Newest":
      return arr.sort((a, b) => activated(b) - activated(a))
  }
}

/** Distinct categories / requesters across the user's tasks, for filter menus. */
export function getTaskFacets(tasks: ResolvedApprovalTask[]) {
  const categories = new Set<string>()
  const requesters = new Set<string>()
  const steps = new Set<string>()
  for (const t of tasks) {
    categories.add(t.request.category)
    requesters.add(t.request.requester)
    steps.add(t.stepRole)
  }
  return {
    categories: [...categories].sort(),
    requesters: [...requesters].sort(),
    steps: [...steps].sort(),
  }
}
