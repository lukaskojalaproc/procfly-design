"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, MessageSquare, AtSign, Check, X, CornerUpLeft, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/dashboard-data"
import {
  useNotifications,
  markAllRead,
  markRead,
  type Notification,
  type NotificationType,
} from "@/lib/notification-store"

const typeMeta: Record<NotificationType, { icon: typeof Bell; cls: string; verb: string }> = {
  comment: { icon: MessageSquare, cls: "bg-accent text-accent-foreground", verb: "commented on" },
  mention: { icon: AtSign, cls: "bg-primary/12 text-primary", verb: "mentioned you on" },
  approved: { icon: Check, cls: "bg-primary/12 text-primary", verb: "approved" },
  rejected: { icon: X, cls: "bg-destructive/12 text-destructive", verb: "rejected" },
  changes_requested: { icon: CornerUpLeft, cls: "bg-chart-2/15 text-chart-2", verb: "requested changes on" },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

function NotificationRow({ n }: { n: Notification }) {
  const meta = typeMeta[n.type]
  const Icon = meta.icon
  return (
    <Link
      href={`/requests/${n.requestId}`}
      onClick={() => markRead(n.id)}
      className={cn(
        "flex gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/50",
        !n.read && "bg-primary/[0.04]",
      )}
    >
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", meta.cls)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-foreground">
          <span className="font-semibold">{n.actor}</span> {meta.verb}{" "}
          <span className="font-medium">{n.requestTitle}</span>
        </p>
        {n.text && <p className="mt-0.5 truncate text-xs italic text-muted-foreground">“{n.text}”</p>}
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 font-medium">
            <span className="flex size-3.5 items-center justify-center rounded-full bg-secondary text-[7px] font-bold text-secondary-foreground">
              {initials(n.recipient)}
            </span>
            To: {n.recipient}
          </span>
          <span>·</span>
          <span>{n.requestRef}</span>
          <span>·</span>
          <span>{timeAgo(n.at)}</span>
        </div>
      </div>
      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
    </Link>
  )
}

export function NotificationBell() {
  const notifications = useNotifications()
  const unread = notifications.filter((n) => !n.read).length
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[22rem] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Bell className="size-5" />
                </span>
                <p className="mt-3 text-sm font-medium text-foreground">No notifications yet</p>
                <p className="mt-1 max-w-[16rem] text-pretty text-xs text-muted-foreground">
                  When you comment on a request or make an approval decision, the recipient is notified here.
                </p>
              </div>
            ) : (
              notifications.map((n) => <NotificationRow key={n.id} n={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}
