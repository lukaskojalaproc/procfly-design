"use client"

// ---------------------------------------------------------------------------
// Notification store (client-side demo).
//
// When someone comments or makes an approval decision on a request, a
// notification is *routed* to the right recipient(s):
//   • A comment from the requester  → the pending approver(s) above them.
//   • A comment from an approver     → back down to the requester.
//   • An @mention                    → the mentioned person directly.
//   • An approve/reject/changes      → the requester (their request moved).
//
// In this demo there is no auth, so the bell shows every routed notification
// and labels each with its recipient ("To: …") — that way you can SEE the
// routing working in a single browser. When a real backend + email is added
// later, the only change is swapping this store for server delivery; the
// routing rules and UI stay the same.
// ---------------------------------------------------------------------------

import { useSyncExternalStore } from "react"

export type NotificationType = "comment" | "mention" | "approved" | "rejected" | "changes_requested"

export interface Notification {
  id: string
  requestId: string
  requestRef: string
  requestTitle: string
  /** Who this notification was delivered to. */
  recipient: string
  /** Who triggered it. */
  actor: string
  type: NotificationType
  /** Short preview of the comment / decision note. */
  text: string
  at: string
  read: boolean
}

const KEY = "procfly.notifications.v1"
const EVENT = "procfly:notifications-changed"

function readAll(): Notification[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Notification[]) : []
  } catch {
    return []
  }
}

function writeAll(items: Notification[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(EVENT))
  } catch (err) {
    console.error("[v0] notification-store write failed:", err)
  }
}

function uid() {
  return `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function snippet(text: string, max = 90): string {
  const t = text.trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function push(items: Omit<Notification, "id" | "at" | "read">[]) {
  if (items.length === 0) return
  const now = new Date().toISOString()
  const existing = readAll()
  const created = items.map((n) => ({ ...n, id: uid(), at: now, read: false }))
  writeAll([...created, ...existing])
}

// --- Routing ---------------------------------------------------------------

/**
 * Route a free-form comment to the right recipients.
 * `approvers` are the distinct approver names above the requester (the people
 * "who ask for approval"). The author is never notified about their own comment.
 */
export function routeComment(ctx: {
  requestId: string
  requestRef: string
  requestTitle: string
  author: string
  text: string
  mentions: string[]
  requester: string
  approvers: string[]
}): void {
  const { requestId, requestRef, requestTitle, author, text, mentions, requester, approvers } = ctx

  // Map of recipient → notification type, so an explicit @mention wins over
  // a contextual delivery to the same person.
  const recipients = new Map<string, NotificationType>()

  // Contextual routing.
  if (author === requester) {
    // Requester is asking a question → notify the approvers above them.
    for (const a of approvers) if (a !== author) recipients.set(a, "comment")
  } else {
    // An approver commented → send it back down to the requester.
    if (requester !== author) recipients.set(requester, "comment")
  }

  // Explicit @mentions always get a (higher-signal) mention notification.
  for (const m of mentions) if (m !== author) recipients.set(m, "mention")

  push(
    [...recipients.entries()].map(([recipient, type]) => ({
      requestId,
      requestRef,
      requestTitle,
      recipient,
      actor: author,
      type,
      text: snippet(text),
    })),
  )
}

/** Route an approval decision back to the request's creator. */
export function routeDecision(ctx: {
  requestId: string
  requestRef: string
  requestTitle: string
  actor: string
  type: Exclude<NotificationType, "comment" | "mention">
  text: string
  requester: string
}): void {
  const { requestId, requestRef, requestTitle, actor, type, text, requester } = ctx
  if (!requester || requester === actor) return
  push([
    {
      requestId,
      requestRef,
      requestTitle,
      recipient: requester,
      actor,
      type,
      text: snippet(text),
    },
  ])
}

// --- Mutations -------------------------------------------------------------

export function markAllRead(): void {
  const items = readAll()
  if (items.every((n) => n.read)) return
  writeAll(items.map((n) => ({ ...n, read: true })))
}

export function markRead(id: string): void {
  const items = readAll()
  writeAll(items.map((n) => (n.id === id ? { ...n, read: true } : n)))
}

export function clearAll(): void {
  writeAll([])
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
let lastParsed: Notification[] = []

function getSnapshot(): Notification[] {
  if (typeof window === "undefined") return lastParsed
  const raw = window.localStorage.getItem(KEY) ?? ""
  if (raw !== lastRaw) {
    lastRaw = raw
    lastParsed = raw ? (JSON.parse(raw) as Notification[]) : []
  }
  return lastParsed
}

/** All notifications, newest first. */
export function useNotifications(): Notification[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => lastParsed)
}

export function useUnreadCount(): number {
  const items = useNotifications()
  return items.filter((n) => !n.read).length
}
