"use client"

import { useSyncExternalStore } from "react"
import { currentUser, type UserRole } from "@/lib/dashboard-data"

// ---------------------------------------------------------------------------
// Reactive current-role store.
//
// In this demo there is no auth, so the acting role can be switched from the
// "More options" menu to preview how the app looks for different users. The
// role is persisted in localStorage and shared across all components via
// useSyncExternalStore. When a real backend is added, replace this with the
// authenticated session's role.
// ---------------------------------------------------------------------------

export const ROLES: { role: UserRole; label: string; description: string }[] = [
  { role: "Super Admin", label: "Super Admin", description: "See every request in the workspace" },
  { role: "Requester", label: "Requester", description: "See only requests you created" },
  { role: "Approver", label: "Approver", description: "See only requests you created" },
]

const STORAGE_KEY = "procfly.role.v1"

let current: UserRole = currentUser.role
const listeners = new Set<() => void>()

function load(): UserRole {
  if (typeof window === "undefined") return current
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && ROLES.some((r) => r.role === raw)) return raw as UserRole
  } catch {
    // ignore
  }
  return current
}

// Hydrate from storage once on the client.
if (typeof window !== "undefined") {
  current = load()
}

function emit() {
  for (const fn of listeners) fn()
}

export function setRole(role: UserRole) {
  current = role
  try {
    window.localStorage.setItem(STORAGE_KEY, role)
  } catch {
    // ignore
  }
  emit()
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getSnapshot(): UserRole {
  return current
}

function getServerSnapshot(): UserRole {
  return currentUser.role
}

/** Reactive current role. */
export function useCurrentRole(): UserRole {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
