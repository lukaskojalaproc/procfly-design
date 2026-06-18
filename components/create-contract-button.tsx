"use client"

import { useState } from "react"
import { FileSignature } from "lucide-react"
import { CreateContractDialog } from "@/components/create-contract-dialog"

export function CreateContractButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <FileSignature className="size-4" />
        New Contract
      </button>
      <CreateContractDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
