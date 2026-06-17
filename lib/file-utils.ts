import type { AttachmentKind } from "./competitions-data"

/** Map a file name/MIME type to one of the supported attachment kinds. */
export function fileKind(name: string, type = ""): AttachmentKind {
  const n = name.toLowerCase()
  if (n.endsWith(".pdf") || type === "application/pdf") return "pdf"
  if (/\.(xlsx|xls|csv)$/.test(n) || type.includes("sheet") || type === "text/csv") return "xlsx"
  if (/\.(docx|doc)$/.test(n) || type.includes("word")) return "docx"
  if (/\.(zip|rar|7z)$/.test(n) || type.includes("zip")) return "zip"
  // Default everything else (txt, images, etc.) to the document icon.
  return "docx"
}

/** Human-readable file size. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Read a File into a data URL (for small files we want to re-download later). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Only keep data URLs for files small enough to live comfortably in storage. */
export const MAX_INLINE_BYTES = 1.5 * 1024 * 1024 // 1.5 MB
