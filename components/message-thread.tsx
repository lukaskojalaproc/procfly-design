"use client"

import { useState } from "react"
import { Send, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useThread, sendMessage, type Sender } from "@/lib/message-store"

/**
 * A private 1:1 conversation between the buyer and one supplier. Used on both
 * sides: the buyer renders it with role="buyer" in the Q&A tab, and the
 * supplier renders it with role="supplier" on their invite-link page.
 */
export function MessageThread({
  competitionId,
  supplier,
  role,
  className,
  emptyHint,
}: {
  competitionId: string
  supplier: string
  role: Sender
  className?: string
  emptyHint?: string
}) {
  const messages = useThread(competitionId, supplier)
  const [draft, setDraft] = useState("")

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    sendMessage({ competitionId, supplier, sender: role, text })
    setDraft("")
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <MessageSquare className="size-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {emptyHint ?? "No messages yet. Start the conversation below."}
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender === role
            return (
              <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {m.text}
                </div>
                <span className="mt-1 text-[10px] text-muted-foreground">
                  {m.sender === "buyer" ? "Buyer" : supplier} ·{" "}
                  {new Date(m.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend(e)
            }
          }}
          rows={1}
          placeholder={role === "buyer" ? "Message this supplier…" : "Ask the buyer a question…"}
          className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="size-4" />
          Send
        </button>
      </form>
    </div>
  )
}
