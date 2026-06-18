"use client"

import { useState } from "react"
import { Network } from "lucide-react"
import { CreateSupplierDialog } from "@/components/create-supplier-dialog"

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
      <CreateSupplierDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
