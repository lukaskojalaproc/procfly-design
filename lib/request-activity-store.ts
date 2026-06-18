"use client"

// ---------------------------------------------------------------------------
// Request collaboration store (client-side demo).
//
// Internal employees all work inside the platform, so request communication
// lives in the request itself — no email/links needed. This store keeps, per
// request:
//   • an activity feed (free-form comments + system events), and
//   • per-step approval decisions (state + rationale).
// Persisted in localStorage and broadcast across tabs so the thread updates
// live in the same browser. No backend for this demo.
// ---------------------------------------------------------------------------

import { useSyncExternalStore } from "react"
import type { ApprovalState } from "./dashboard-data"

export type ActivityEvent = "comment" | "approved" | "rejected" | "changes_requested" | "resubmitted"

export interface ActivityItem {
  id: string
  requestId: string
  /** "comment" is a free-form message; everything else is a system event. */
  kind: ActivityEvent
  author: string
  text: string
  /** Names mentioned with @ in a comment. */
  mentions?: string[]
  /** Approval step role label this event relates to, if any. */
  step?: string
  /** ISO timestamp. */
  at: string
}

/** A reviewer's decision on one approval step, overriding the seed state. */
export interface StepDecision {
  state: ApprovalState
  comment: string
  by: string
  at: string
}

interface RequestState {
  activity: ActivityItem[]
  /** Keyed by approval step index. */
  decisions: Record<number, StepDecision>
}

type Store = Record<string, RequestState>

const KEY = "procfly.request-activity.v1"
const EVENT = "procfly:request-activity-changed"

function readAll(): Store {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    return {}
  }
}

function writeAll(store: Store) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store))
    window.dispatchEvent(new Event(EVENT))
  } catch (err) {
    console.error("[v0] request-activity-store write failed:", err)
  }
}

function emptyState(): RequestState {
  return { activity: [], decisions: {} }
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/** Extract @mentions from comment text, matched against known participants. */
export function parseMentions(text: string, participants: string[]): string[] {
  const found = new Set<string>()
  for (const name of participants) {
    // Match "@First" or "@First Last" (first token is enough to tag).
    const first = name.split(" ")[0]
    const re = new RegExp(`@${first}\\b`, "i")
    if (re.test(text)) found.add(name)
  }
  return [...found]
}

/** Append a free-form comment to the request thread. */
export function addComment(requestId: string, author: string, text: string, participants: string[]): void {
  const store = readAll()
  const state = store[requestId] ?? emptyState()
  const item: ActivityItem = {
    id: uid("act"),
    requestId,
    kind: "comment",
    author,
    text: text.trim(),
    mentions: parseMentions(text, participants),
    at: new Date().toISOString(),
  }
  store[requestId] = { ...state, activity: [...state.activity, item] }
  writeAll(store)
}

/**
 * Record an approval-step decision (approve / reject / request changes) and log
 * a matching system event in the activity feed.
 */
export function recordDecision(input: {
  requestId: string
  stepIndex: number
  step: string
  state: ApprovalState
  event: Exclude<ActivityEvent, "comment">
  by: string
  comment: string
}): void {
  const { requestId, stepIndex, step, state, event, by, comment } = input
  const store = readAll()
  const reqState = store[requestId] ?? emptyState()

  const decision: StepDecision = { state, comment: comment.trim(), by, at: new Date().toISOString() }
  const eventItem: ActivityItem = {
    id: uid("act"),
    requestId,
    kind: event,
    author: by,
    text: comment.trim(),
    step,
    at: new Date().toISOString(),
  }

  store[requestId] = {
    activity: [...reqState.activity, eventItem],
    decisions: { ...reqState.decisions, [stepIndex]: decision },
  }
  writeAll(store)
}

// --- React bindings --------------------------------------------------------

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {}
  const handler = () => cb()
  window.addEventListener(EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}

let lastRaw = ""
let lastParsed: Store = {}

function getSnapshot(): Store {
  if (typeof window === "undefined") return lastParsed
  const raw = window.localStorage.getItem(KEY) ?? ""
  if (raw !== lastRaw) {
    lastRaw = raw
    lastParsed = raw ? (JSON.parse(raw) as Store) : {}
  }
  return lastParsed
}

/** Live activity feed for one request, time-ordered (oldest first). */
export function useRequestActivity(requestId: string): ActivityItem[] {
  const store = useSyncExternalStore(subscribe, getSnapshot, () => lastParsed)
  const state = store[requestId]
  if (!state) return []
  return [...state.activity].sort((a, b) => a.at.localeCompare(b.at))
}

/** Live per-step decisions for one request. */
export function useStepDecisions(requestId: string): Record<number, StepDecision> {
  const store = useSyncExternalStore(subscribe, getSnapshot, () => lastParsed)
  return store[requestId]?.decisions ?? {}
}
