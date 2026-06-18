"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { CreatePurchaseOrderDialog } from "@/components/create-purchase-order-dialog"

export function CreatePurchaseOrderButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <ShoppingCart className="size-4" />
        Create Purchase Order
      </button>
      <CreatePurchaseOrderDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
