"use client"

// ---------------------------------------------------------------------------
// Submitted-proposal store (client-side demo).
//
// Suppliers open an invite link and submit a proposal (bid + documents). Those
// submissions are persisted in localStorage keyed by competition id, so they
// show up in the buyer's Proposals/Evaluation tabs in the same browser — no
// backend required for this demo. Small files are kept as data URLs so the
// buyer can re-download exactly what was uploaded.
// ---------------------------------------------------------------------------

import { useCallback, useSyncExternalStore } from "react"
import type { AttachmentKind, QuestionAnswer } from "./competitions-data"

export interface StoredDocument {
  name: string
  kind: AttachmentKind
  /** Human-readable size, e.g. "1.2 MB". */
  size: string
  /** Data URL for re-download. Omitted for files too large to keep in storage. */
  dataUrl?: string
}

export interface SubmittedProposal {
  /** Stable id for the submission. */
  id: string
  competitionId: string
  supplier: string
  /** Bid amount in the competition currency. */
  amount: number
  /** Optional AI/short summary of the proposal. */
  summary?: string
  /** Contact email captured on the form. */
  contact?: string
  /** Answers to the buyer's questionnaire. */
  answers?: QuestionAnswer[]
  documents: StoredDocument[]
  /** ISO timestamp of submission. */
  submittedAt: string
}

const KEY = "procfly.proposals.v1"
const EVENT = "procfly:proposals-changed"

function readAll(): SubmittedProposal[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SubmittedProposal[]) : []
  } catch {
    return []
  }
}

function writeAll(list: SubmittedProposal[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(EVENT))
  } catch (err) {
    console.error("[v0] proposal-store write failed:", err)
  }
}

/** Append a new submission and notify subscribers. */
export function addProposal(p: Omit<SubmittedProposal, "id" | "submittedAt">): SubmittedProposal {
  const proposal: SubmittedProposal = {
    ...p,
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    submittedAt: new Date().toISOString(),
  }
  const list = readAll()
  // Replace any earlier submission from the same supplier for this competition.
  const filtered = list.filter(
    (x) => !(x.competitionId === proposal.competitionId && x.supplier.toLowerCase() === proposal.supplier.toLowerCase()),
  )
  writeAll([...filtered, proposal])
  return proposal
}

export function removeProposal(id: string) {
  writeAll(readAll().filter((p) => p.id !== id))
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

// Cache snapshots so useSyncExternalStore stays referentially stable between
// renders when nothing has changed.
let lastRaw = ""
let lastParsed: SubmittedProposal[] = []

function getSnapshot(): SubmittedProposal[] {
  if (typeof window === "undefined") return lastParsed
  const raw = window.localStorage.getItem(KEY) ?? ""
  if (raw !== lastRaw) {
    lastRaw = raw
    // Must never throw during render — self-heal on corrupt data.
    try {
      lastParsed = raw ? (JSON.parse(raw) as SubmittedProposal[]) : []
    } catch (err) {
      console.error("[v0] proposal-store: corrupt data, resetting:", err)
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

/** Subscribe to all submitted proposals for one competition (live updates). */
export function useSubmittedProposals(competitionId: string): SubmittedProposal[] {
  const all = useSyncExternalStore(subscribe, getSnapshot, () => lastParsed)
  return all.filter((p) => p.competitionId === competitionId)
}

/** Imperative helper for non-React contexts. */
export function getSubmittedProposals(competitionId: string): SubmittedProposal[] {
  return readAll().filter((p) => p.competitionId === competitionId)
}

/** Build the public invite link for a competition. */
export function inviteLink(competitionId: string): string {
  if (typeof window === "undefined") return `/submit/${competitionId}`
  return `${window.location.origin}/submit/${competitionId}`
}

/** Convenience hook returning a memoised add callback. */
export function useAddProposal() {
  return useCallback(addProposal, [])
}
