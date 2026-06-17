"use client"

import { useEffect, useRef, useState } from "react"

// ---------------------------------------------------------------------------
// Live countdown — resolves a real deadline once at mount, then ticks every
// second so the UI always feels alive. Returns null for events without a
// deadline (drafts / finished).
// ---------------------------------------------------------------------------
export function useCountdown(hoursFromNow: number | null) {
  // Resolve the absolute deadline, recomputing whenever the input changes
  // (e.g. when a competition is launched and a bidding window is set).
  const [deadline, setDeadline] = useState<number | null>(() =>
    hoursFromNow == null ? null : Date.now() + hoursFromNow * 3_600_000,
  )
  const [now, setNow] = useState(() => Date.now())
  const prevHours = useRef(hoursFromNow)

  useEffect(() => {
    if (prevHours.current !== hoursFromNow) {
      prevHours.current = hoursFromNow
      setDeadline(hoursFromNow == null ? null : Date.now() + hoursFromNow * 3_600_000)
    }
  }, [hoursFromNow])

  useEffect(() => {
    if (deadline == null) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [deadline])

  if (deadline == null) return null
  const diff = Math.max(0, deadline - now)
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)
  return { h, m, s, expired: diff === 0, urgent: diff < 12 * 3_600_000 }
}
