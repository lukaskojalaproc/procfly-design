"use client"

import { useSyncExternalStore } from "react"

// ---------------------------------------------------------------------------
// Approvals view preferences.
//
// Shared between the page-level three-dot menu (which lets the user customize
// columns, refresh, and save the current view) and the Approvals list (which
// renders according to these prefs). Persisted in localStorage and broadcast
// via useSyncExternalStore. When a real backend exists, this becomes a
// per-user saved-view setting.
// ---------------------------------------------------------------------------

/** Optional, user-toggleable columns. Request ID + title are always shown. */
export type ColumnKey =
  | "requester"
  | "department"
  | "type"
  | "category"
  | "step"
  | "due"
  | "waiting"
  | "amount"
  | "priority"
  | "highValue"
  | "taskStatus"

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  requester: "Requester",
  department: "Department",
  type: "Request type",
  category: "Category",
  step: "Approval step",
  due: "Due date",
  waiting: "Waiting time",
  amount: "Amount",
  priority: "Priority",
  highValue: "High-value status",
  taskStatus: "Approval task status",
}

export const ALL_COLUMNS: ColumnKey[] = [
  "requester",
  "department",
  "type",
  "category",
  "step",
  "due",
  "waiting",
  "amount",
  "priority",
  "highValue",
  "taskStatus",
]

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  requester: true,
  department: false,
  type: true,
  category: true,
  step: true,
  due: true,
  waiting: true,
  amount: true,
  priority: true,
  highValue: true,
  taskStatus: true,
}

interface PrefsState {
  columns: Record<ColumnKey, boolean>
  /** Bumped to force the list to re-run its load (Refresh Data). */
  refreshToken: number
}

const STORAGE_KEY = "procfly.approvals.prefs.v1"

let state: PrefsState = { columns: { ...DEFAULT_VISIBLE }, refreshToken: 0 }
const listeners = new Set<() => void>()

function load(): PrefsState {
  if (typeof window === "undefined") return state
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<ColumnKey, boolean>>
      return { columns: { ...DEFAULT_VISIBLE, ...parsed }, refreshToken: 0 }
    }
  } catch {
    // ignore
  }
  return state
}

if (typeof window !== "undefined") {
  state = load()
}

function emit() {
  for (const fn of listeners) fn()
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.columns))
  } catch {
    // ignore
  }
}

export function toggleColumn(key: ColumnKey) {
  state = { ...state, columns: { ...state.columns, [key]: !state.columns[key] } }
  persist()
  emit()
}

export function setColumns(cols: Record<ColumnKey, boolean>) {
  state = { ...state, columns: { ...cols } }
  persist()
  emit()
}

export function resetColumns() {
  state = { ...state, columns: { ...DEFAULT_VISIBLE } }
  persist()
  emit()
}

export function triggerRefresh() {
  state = { ...state, refreshToken: state.refreshToken + 1 }
  emit()
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getSnapshot(): PrefsState {
  return state
}

const SERVER_STATE: PrefsState = { columns: { ...DEFAULT_VISIBLE }, refreshToken: 0 }
function getServerSnapshot(): PrefsState {
  return SERVER_STATE
}

export function useApprovalPrefs(): PrefsState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
