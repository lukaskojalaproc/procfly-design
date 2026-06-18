"use client"

import { useState } from "react"
import { Network } from "lucide-react"
import { NewRequestDialog } from "@/components/new-request-dialog"

export function CreateSupplierButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <Network className="size-4" />
        New Supplier
      </button>
      {/* Opens the New Request flow directly on the "Add Supplier" form. */}
      <NewRequestDialog open={open} onOpenChange={setOpen} hideTrigger initialCategory="supplier" />
    </>
  )
}
