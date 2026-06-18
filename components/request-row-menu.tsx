"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  MoreVertical,
  Eye,
  PenLine,
  Copy,
  Download,
  History,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProcurementRequest } from "@/lib/dashboard-data"

/** Build a lightweight text "PDF" summary and download it for the request. */
function downloadSummary(request: ProcurementRequest) {
  const lines = [
    `Procurement Request — ${request.ref}`,
    "".padEnd(40, "="),
    `Title:       ${request.title}`,
    `Requester:   ${request.requester}`,
    `Department:  ${request.department}`,
    `Category:    ${request.category}`,
    `Type:        ${request.kind}`,
    `Amount:      ${request.amount.toLocaleString("en-US")} ${request.currency}`,
    `Status:      ${request.status}`,
    `Created:     ${request.date}`,
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${request.ref}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function RequestRowMenu({ request }: { request: ProcurementRequest }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [open])

  // Stop the parent <Link> from navigating when interacting with the menu.
  function guard(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  const go = (path: string) => (e: React.MouseEvent) => {
    guard(e)
    setOpen(false)
    router.push(path)
  }

  const isCancelable = request.status === "Pending"

  const actions = [
    { label: "Open", icon: Eye, onClick: go(`/requests/${request.id}`) },
    { label: "Edit", icon: PenLine, onClick: go(`/requests/${request.id}`) },
    {
      label: "Duplicate",
      icon: Copy,
      onClick: (e: React.MouseEvent) => go("/?new=" + request.id)(e),
    },
    {
      label: "Download PDF",
      icon: Download,
      onClick: (e: React.MouseEvent) => {
        guard(e)
        setOpen(false)
        downloadSummary(request)
      },
    },
    { label: "View audit history", icon: History, onClick: go(`/requests/${request.id}`) },
  ]

  return (
    <div ref={ref} className="relative shrink-0" onClick={guard}>
      <button
        type="button"
        aria-label="Request actions"
        onClick={(e) => {
          guard(e)
          setOpen((v) => !v)
        }}
        className={cn(
          "rounded-md p-1.5 text-muted-foreground transition-opacity hover:bg-muted",
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <a.icon className="size-4 text-muted-foreground" />
              {a.label}
            </button>
          ))}
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            disabled={!isCancelable}
            onClick={(e) => {
              guard(e)
              setOpen(false)
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
              isCancelable
                ? "text-destructive hover:bg-destructive/10"
                : "cursor-not-allowed text-muted-foreground/50",
            )}
          >
            <XCircle className="size-4" />
            Cancel request
          </button>
        </div>
      )}
    </div>
  )
}
