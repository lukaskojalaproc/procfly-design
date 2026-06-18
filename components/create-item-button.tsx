"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { CreateItemDialog } from "@/components/create-item-dialog"

export function CreateItemButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" />
        Add Item
      </button>
      <CreateItemDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
