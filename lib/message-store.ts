"use client"

// ---------------------------------------------------------------------------
// Private Q&A message store (client-side demo).
//
// Each competition has one private thread per supplier. The buyer (in the Q&A
// tab) and the supplier (on their invite-link page) exchange messages that only
// the two of them can see. Persisted in localStorage and broadcast across tabs
// so both sides update live in the same browser — no backend for this demo.
// ---------------------------------------------------------------------------

import { useSyncExternalStore } from "react"

export type Sender = "buyer" | "supplier"

export interface ChatMessage {
  id: string
  competitionId: string
  /** Supplier the thread belongs to (case-insensitive key). */
  supplier: string
  sender: Sender
  text: string
  /** ISO timestamp. */
  at: string
}

const KEY = "procfly.messages.v1"
const EVENT = "procfly:messages-changed"

function readAll(): ChatMessage[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ChatMessage[]) : []
  } catch {
    return []
  }
}

function writeAll(list: ChatMessage[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(EVENT))
  } catch (err) {
    console.error("[v0] message-store write failed:", err)
  }
}

/** Append a message to a supplier's thread and notify subscribers. */
export function sendMessage(input: {
  competitionId: string
  supplier: string
  sender: Sender
  text: string
}): ChatMessage {
  const message: ChatMessage = {
    ...input,
    text: input.text.trim(),
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
  }
  writeAll([...readAll(), message])
  return message
}

// --- React binding ---------------------------------------------------------

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
let lastParsed: ChatMessage[] = []

function getSnapshot(): ChatMessage[] {
  if (typeof window === "undefined") return lastParsed
  const raw = window.localStorage.getItem(KEY) ?? ""
  if (raw !== lastRaw) {
    lastRaw = raw
    // Must never throw during render — self-heal on corrupt data.
    try {
      lastParsed = raw ? (JSON.parse(raw) as ChatMessage[]) : []
    } catch (err) {
      console.error("[v0] message-store: corrupt data, resetting:", err)
      lastParsed = []
      try {
        window.localStorage.removeItem(KEY)
      } catch {
        // ignore
      }
      lastRaw = ""
    }
  }
  return lastParsed
}

/** Live messages for one supplier's thread within a competition, time-ordered. */
export function useThread(competitionId: string, supplier: string): ChatMessage[] {
  const all = useSyncExternalStore(subscribe, getSnapshot, () => lastParsed)
  const key = supplier.toLowerCase()
  return all
    .filter((m) => m.competitionId === competitionId && m.supplier.toLowerCase() === key)
    .sort((a, b) => a.at.localeCompare(b.at))
}

/** Live messages for an entire competition (all suppliers). */
export function useCompetitionMessages(competitionId: string): ChatMessage[] {
  const all = useSyncExternalStore(subscribe, getSnapshot, () => lastParsed)
  return all.filter((m) => m.competitionId === competitionId).sort((a, b) => a.at.localeCompare(b.at))
}
