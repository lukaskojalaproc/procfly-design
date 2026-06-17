"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Upload, FileText, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PurchaseOrder } from "@/lib/orders-data"
import { downloadPurchaseOrderPdf, purchaseOrderPdfUrl, type PdfOptions } from "@/lib/order-pdf"

interface OrderPdfDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  po: PurchaseOrder
}

const ACCENTS = [
  { name: "Green", hex: "#16a34a" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Slate", hex: "#334155" },
  { name: "Amber", hex: "#d97706" },
]

export function OrderPdfDialog({ open, onOpenChange, po }: OrderPdfDialogProps) {
  const [companyName, setCompanyName] = useState("ProcFly Demo Workspace")
  const [companyAddress, setCompanyAddress] = useState("Gedimino pr. 1, Vilnius, LT-01103, Lithuania")
  const [companyEmail, setCompanyEmail] = useState("procurement@procfly.com")
  const [footerNote, setFooterNote] = useState("Thank you for your business. Please reference the PO number on all correspondence.")
  const [accent, setAccent] = useState(ACCENTS[0].hex)
  const [logo, setLogo] = useState<string | null>(null)
  const [logoName, setLogoName] = useState<string | null>(null)

  const opts: PdfOptions = useMemo(
    () => ({ companyName, companyAddress, companyEmail, logoDataUrl: logo, accent, footerNote }),
    [companyName, companyAddress, companyEmail, logo, accent, footerNote],
  )

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Regenerate the live preview whenever options change (debounced) while open.
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      const url = purchaseOrderPdfUrl(po, opts)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    }, 250)
    return () => clearTimeout(t)
  }, [open, po, opts])

  // Clean up the blob URL when the dialog closes.
  useEffect(() => {
    if (open) return
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [open])

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      setLogo(reader.result as string)
      setLogoName(file.name)
    }
    reader.readAsDataURL(file)
  }

  function handleDownload() {
    downloadPurchaseOrderPdf(po, opts)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl" showCloseButton={false}>
        <DialogHeader className="flex-row items-center justify-between border-b border-border p-5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </span>
            Export PDF — {po.number}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        <div className="grid md:grid-cols-[320px_1fr]">
          {/* Settings */}
          <div className="max-h-[64vh] space-y-5 overflow-y-auto border-b border-border p-5 md:border-b-0 md:border-r">
            {/* Logo uploader */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Company logo</label>
              <div className="flex items-center gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo || "/placeholder.svg"} alt="Logo preview" className="size-full object-contain" />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <label
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2",
                      "text-sm font-medium text-foreground transition-colors hover:bg-muted",
                    )}
                  >
                    <Upload className="size-4" />
                    {logo ? "Replace logo" : "Upload logo"}
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogo} />
                  </label>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {logoName ?? "PNG or JPEG, shown in the header"}
                  </p>
                </div>
              </div>
            </div>

            <Field label="Company name" value={companyName} onChange={setCompanyName} />
            <Field label="Company address" value={companyAddress} onChange={setCompanyAddress} />
            <Field label="Company email" value={companyEmail} onChange={setCompanyEmail} type="email" />

            {/* Accent color */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Accent color</label>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.hex}
                    type="button"
                    onClick={() => setAccent(a.hex)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      accent === a.hex ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span className="size-3.5 rounded-full" style={{ backgroundColor: a.hex }} />
                    {a.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Footer note</label>
              <textarea
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="flex flex-col bg-muted/30">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">Live preview · how the attached PDF will look</span>
            </div>
            <div className="h-[64vh] overflow-hidden p-3">
              {previewUrl ? (
                <iframe
                  title="Purchase order PDF preview"
                  src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                  className="size-full rounded-lg border border-border bg-card shadow-sm"
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
                  Generating preview…
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="size-4" />
            Download PDF
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      />
    </div>
  )
}
