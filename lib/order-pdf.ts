import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { orderLineTotal, orderTotal, type PurchaseOrder } from "./orders-data"

const VAT_RATE = 0.21

export interface PdfOptions {
  /** Company / buyer details shown in the header block. */
  companyName: string
  companyAddress: string
  companyEmail: string
  /** Optional logo as a data URL (PNG/JPEG). */
  logoDataUrl?: string | null
  /** Accent color in hex, e.g. "#16a34a". */
  accent: string
  footerNote: string
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "")
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m
  const int = Number.parseInt(v, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n))
}

/** Build and return a jsPDF document for the given purchase order. */
export function buildPurchaseOrderPdf(po: PurchaseOrder, opts: PdfOptions): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 48
  const [ar, ag, ab] = hexToRgb(opts.accent)

  // --- Header band ---------------------------------------------------------
  doc.setFillColor(ar, ag, ab)
  doc.rect(0, 0, pageW, 96, "F")

  let headerTextX = margin
  if (opts.logoDataUrl) {
    try {
      // White rounded plate behind the logo for contrast.
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, 26, 44, 44, 6, 6, "F")
      const fmtType = opts.logoDataUrl.includes("image/png") ? "PNG" : "JPEG"
      doc.addImage(opts.logoDataUrl, fmtType, margin + 4, 30, 36, 36, undefined, "FAST")
      headerTextX = margin + 60
    } catch {
      headerTextX = margin
    }
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(opts.companyName || "Purchase Order", headerTextX, 46)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  if (opts.companyAddress) doc.text(opts.companyAddress, headerTextX, 62)
  if (opts.companyEmail) doc.text(opts.companyEmail, headerTextX, 74)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("PURCHASE ORDER", pageW - margin, 46, { align: "right" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(po.number, pageW - margin, 64, { align: "right" })

  // --- Meta row ------------------------------------------------------------
  let y = 128
  doc.setTextColor(110, 110, 110)
  doc.setFontSize(8)
  doc.text("ISSUED", margin, y)
  doc.text("STATUS", margin + 150, y)
  doc.text("PAYMENT TERMS", margin + 300, y)
  doc.setTextColor(30, 30, 30)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(po.created, margin, y + 14)
  doc.text(po.status, margin + 150, y + 14)
  doc.text(po.paymentTerms, margin + 300, y + 14)

  // --- Supplier + ship-to cards -------------------------------------------
  y += 44
  const colW = (pageW - margin * 2 - 16) / 2
  doc.setDrawColor(225, 225, 225)
  doc.setFillColor(249, 249, 249)
  doc.roundedRect(margin, y, colW, 92, 6, 6, "FD")
  doc.roundedRect(margin + colW + 16, y, colW, 92, 6, 6, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(ar, ag, ab)
  doc.text("SUPPLIER", margin + 14, y + 18)
  doc.text("SHIP TO", margin + colW + 30, y + 18)

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.text(po.supplier.name, margin + 14, y + 34)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text(doc.splitTextToSize(po.supplier.contact, colW - 28), margin + 14, y + 48)
  doc.text(doc.splitTextToSize(po.supplier.email, colW - 28), margin + 14, y + 60)
  doc.text(doc.splitTextToSize(po.supplier.address, colW - 28), margin + 14, y + 72)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text(opts.companyName || "Receiving", margin + colW + 30, y + 34)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text(doc.splitTextToSize(po.deliveryAddress, colW - 28), margin + colW + 30, y + 48)
  doc.text(`Expected: ${po.expectedDelivery}`, margin + colW + 30, y + 72)

  // --- Line items table ----------------------------------------------------
  y += 112
  const subtotal = orderTotal(po)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Item", "Qty", "Unit price", "Amount"]],
    body: po.lines.map((l) => [
      l.description ? `${l.name}\n${l.description}` : l.name,
      `${l.qty} ${l.unit}`,
      `${fmt(l.unitPrice)} ${po.currency}`,
      `${fmt(orderLineTotal(l))} ${po.currency}`,
    ]),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 8, textColor: [40, 40, 40], lineColor: [235, 235, 235], lineWidth: 0.5 },
    headStyles: { fillColor: [ar, ag, ab], textColor: [255, 255, 255], fontStyle: "bold", halign: "left" },
    columnStyles: {
      1: { halign: "right", cellWidth: 70 },
      2: { halign: "right", cellWidth: 90 },
      3: { halign: "right", cellWidth: 90, fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  })

  // --- Totals --------------------------------------------------------------
  // @ts-expect-error autotable augments the doc instance at runtime
  let ty: number = doc.lastAutoTable.finalY + 18
  const labelX = pageW - margin - 180
  const valX = pageW - margin
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(90, 90, 90)
  doc.text("Subtotal", labelX, ty)
  doc.setTextColor(40, 40, 40)
  doc.text(`${fmt(subtotal)} ${po.currency}`, valX, ty, { align: "right" })
  ty += 16
  doc.setTextColor(90, 90, 90)
  doc.text(`VAT (${Math.round(VAT_RATE * 100)}%)`, labelX, ty)
  doc.setTextColor(40, 40, 40)
  doc.text(`${fmt(vat)} ${po.currency}`, valX, ty, { align: "right" })
  ty += 10
  doc.setDrawColor(ar, ag, ab)
  doc.setLineWidth(1)
  doc.line(labelX, ty, valX, ty)
  ty += 18
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(ar, ag, ab)
  doc.text("TOTAL", labelX, ty)
  doc.text(`${fmt(total)} ${po.currency}`, valX, ty, { align: "right" })

  // --- Notes + footer ------------------------------------------------------
  if (po.notes) {
    ty += 34
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    doc.text("Notes", margin, ty)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(110, 110, 110)
    doc.text(doc.splitTextToSize(po.notes, pageW - margin * 2), margin, ty + 14)
  }

  const footerY = doc.internal.pageSize.getHeight() - 40
  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY, pageW - margin, footerY)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.text(opts.footerNote, margin, footerY + 16)
  doc.text(`${po.number} · ${po.sourceRef ?? ""}`.trim(), pageW - margin, footerY + 16, { align: "right" })

  return doc
}

export function downloadPurchaseOrderPdf(po: PurchaseOrder, opts: PdfOptions) {
  const doc = buildPurchaseOrderPdf(po, opts)
  doc.save(`${po.number}.pdf`)
}

/** Return an object URL for the rendered PDF, for use in an <iframe> preview. */
export function purchaseOrderPdfUrl(po: PurchaseOrder, opts: PdfOptions): string {
  const doc = buildPurchaseOrderPdf(po, opts)
  return doc.output("bloburl") as unknown as string
}
