"use client"

import { useMemo, useRef, useState } from "react"
import {
  Send,
  MessageSquare,
  Check,
  X,
  RotateCcw,
  CornerUpLeft,
  AtSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/dashboard-data"
import { useRequestActivity, addComment, parseMentions, type ActivityItem, type ActivityEvent } from "@/lib/request-activity-store"
import { routeComment } from "@/lib/notification-store"

// Visual treatment for each system-event type in the feed.
const eventMeta: Record<Exclude<ActivityEvent, "comment">, { icon: typeof Check; cls: string; verb: string }> = {
  approved: { icon: Check, cls: "bg-primary/12 text-primary", verb: "approved" },
  rejected: { icon: X, cls: "bg-destructive/12 text-destructive", verb: "rejected" },
  changes_requested: { icon: CornerUpLeft, cls: "bg-chart-2/15 text-chart-2", verb: "requested changes on" },
  resubmitted: { icon: RotateCcw, cls: "bg-accent text-accent-foreground", verb: "resubmitted" },
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

/** Render comment text with @mentions highlighted. */
function CommentText({ text }: { text: string }) {
  const parts = text.split(/(@\w+)/g)
  return (
    <p className="text-pretty text-sm leading-relaxed text-foreground">
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="rounded bg-primary/10 px-1 font-medium text-primary">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  )
}

function EventLine({ item }: { item: ActivityItem }) {
  if (item.kind === "comment") return null
  const meta = eventMeta[item.kind]
  const Icon = meta.icon
  return (
    <li className="flex items-center justify-center gap-2 py-1">
      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", meta.cls)}>
        <Icon className="size-3.5" />
      </span>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{item.author}</span> {meta.verb}
        {item.step ? <span className="font-medium text-foreground"> {item.step}</span> : null}
        {item.text ? <span className="italic"> — “{item.text}”</span> : null}
        <span className="ml-1.5 text-muted-foreground/70">{timeLabel(item.at)}</span>
      </p>
    </li>
  )
}

function CommentBubble({ item, isMe }: { item: ActivityItem; isMe: boolean }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
        {initials(item.author)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{isMe ? "You" : item.author}</span>
          <span className="text-xs text-muted-foreground">{timeLabel(item.at)}</span>
        </div>
        <div className="mt-1 rounded-xl rounded-tl-sm border border-border bg-muted/40 px-3 py-2">
          <CommentText text={item.text} />
        </div>
      </div>
    </li>
  )
}

export function RequestDiscussion({
  requestId,
  currentUser,
  participants,
  requestRef,
  requestTitle,
  requester,
  approvers,
}: {
  requestId: string
  currentUser: string
  /** Names that can be @mentioned (approvers, requester). */
  participants: string[]
  requestRef: string
  requestTitle: string
  /** The request creator — comments from approvers route back to them. */
  requester: string
  /** Distinct approver names above the requester. */
  approvers: string[]
}) {
  const activity = useRequestActivity(requestId)
  const [draft, setDraft] = useState("")
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const mentionMatches = useMemo(() => {
    if (!mentionOpen) return []
    const q = mentionQuery.toLowerCase()
    return participants.filter((p) => p.toLowerCase().includes(q) && p !== currentUser).slice(0, 5)
  }, [mentionOpen, mentionQuery, participants, currentUser])

  function onDraftChange(value: string) {
    setDraft(value)
    // Open the mention menu when the caret is in an unfinished "@token".
    const match = /(?:^|\s)@(\w*)$/.exec(value)
    if (match) {
      setMentionOpen(true)
      setMentionQuery(match[1])
    } else {
      setMentionOpen(false)
    }
  }

  function insertMention(name: string) {
    const first = name.split(" ")[0]
    const next = draft.replace(/(?:^|\s)@(\w*)$/, (m) => `${m.startsWith(" ") ? " " : ""}@${first} `)
    setDraft(next)
    setMentionOpen(false)
    inputRef.current?.focus()
  }

  function submit() {
    const text = draft.trim()
    if (!text) return
    addComment(requestId, currentUser, text, participants)
    // Route a notification to the right recipient(s): up to the approvers when
    // the requester comments, back to the requester when an approver comments,
    // plus anyone explicitly @mentioned.
    routeComment({
      requestId,
      requestRef,
      requestTitle,
      author: currentUser,
      text,
      mentions: parseMentions(text, participants),
      requester,
      approvers,
    })
    setDraft("")
    setMentionOpen(false)
  }

  const hasDraft = draft.trim().length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Feed — takes all available space, scrolls when overflowing */}
      <div className="flex-1 overflow-y-auto p-4">
        {activity.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MessageSquare className="size-5 text-muted-foreground/40" />
            <p className="text-[12px] font-medium text-muted-foreground/60">No activity yet</p>
            <p className="max-w-[200px] text-[11px] text-muted-foreground/40 text-pretty leading-relaxed">
              Use @ to mention an approver and pull them in.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {activity.map((item) =>
              item.kind === "comment" ? (
                <CommentBubble key={item.id} item={item} isMe={item.author === currentUser} />
              ) : (
                <EventLine key={item.id} item={item} />
              ),
            )}
          </ul>
        )}
      </div>

      {/* Composer */}
      <div className="relative border-t border-border/50 px-3 py-3">
        {mentionOpen && mentionMatches.length > 0 && (
          <ul className="absolute bottom-full left-3 mb-1 w-52 overflow-hidden rounded-lg border border-border bg-popover shadow-md">
            {mentionMatches.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => insertMention(name)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                    {initials(name)}
                  </span>
                  <span className="text-foreground">{name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !mentionOpen && !e.nativeEvent.isComposing) {
                e.preventDefault()
                submit()
              }
            }}
            rows={hasDraft ? 2 : 1}
            placeholder="Write a comment…"
            className="flex-1 resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!hasDraft}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30",
              hasDraft ? "h-9 w-9" : "h-8 w-8",
            )}
          >
            <Send className={hasDraft ? "size-4" : "size-3.5"} />
          </button>
        </div>
        {hasDraft && (
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <AtSign className="size-2.5" />
            Enter to send · Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  )
}
