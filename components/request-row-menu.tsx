"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  MoreVertical,
  Eye,
  PenLine,
  Copy,
  Download,
  Send,
  RotateCcw,
  Undo2,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount, type ProcurementRequest, type RequestStatus } from "@/lib/dashboard-data"

type LucideIcon = typeof Eye

interface RowAction {
  label: string
  icon: LucideIcon
  href?: string
  run?: (r: ProcurementRequest) => void
  destructive?: boolean
}

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
    `Amount:      ${formatAmount(request.amount)} ${request.currency}`,
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

// Action sets per status. Approval actions (Approve / Reject / Request Changes)
// intentionally live ONLY in the Approvals module and never appear here.
const openAction = (id: string): RowAction => ({ label: "Open Request", icon: Eye, href: `/requests/${id}` })
const edit = (id: string): RowAction => ({ label: "Edit", icon: PenLine, href: `/requests/${id}` })
const duplicate: RowAction = { label: "Duplicate", icon: Copy, run: () => {} }
const downloadPdf: RowAction = { label: "Download PDF", icon: Download, run: downloadSummary }

function actionsForStatus(status: RequestStatus, id: string): RowAction[] {
  switch (status) {
    case "Draft":
      return [
        openAction(id),
        edit(id),
        duplicate,
        { label: "Submit for Approval", icon: Send, run: () => {} },
        { label: "Delete Draft", icon: Trash2, destructive: true, run: () => {} },
      ]
    case "Pending Approval":
      return [
        openAction(id),
        duplicate,
        downloadPdf,
        { label: "Withdraw Request", icon: Undo2, destructive: true, run: () => {} },
      ]
    case "Approved":
      return [openAction(id), duplicate, downloadPdf, { label: "Archive", icon: Archive, run: () => {} }]
    case "Rejected":
      return [
        openAction(id),
        edit(id),
        { label: "Resubmit", icon: RotateCcw, run: () => {} },
        duplicate,
        downloadPdf,
        { label: "Archive", icon: Archive, run: () => {} },
      ]
    case "Cancelled":
      return [openAction(id), duplicate, { label: "Archive", icon: Archive, run: () => {} }]
    case "Archived":
      return [openAction(id), { label: "Restore", icon: ArchiveRestore, run: () => {} }]
    default:
      return [openAction(id)]
  }
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

  // Stop the parent row link from navigating when interacting with the menu.
  function guard(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  const actions = actionsForStatus(request.status, request.id)
  const primary = actions.filter((a) => !a.destructive)
  const destructive = actions.filter((a) => a.destructive)

  function handle(a: RowAction) {
    return (e: React.MouseEvent) => {
      guard(e)
      setOpen(false)
      if (a.href) router.push(a.href)
      else a.run?.(request)
    }
  }

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
        <div className="absolute right-0 top-9 z-30 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
          {primary.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={handle(a)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <a.icon className="size-4 text-muted-foreground" />
              {a.label}
            </button>
          ))}
          {destructive.length > 0 && <div className="my-1 border-t border-border" />}
          {destructive.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={handle(a)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <a.icon className="size-4" />
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
