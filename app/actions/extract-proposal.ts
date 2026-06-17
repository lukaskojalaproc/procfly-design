"use server"

import { generateText, Output } from "ai"
import { z } from "zod"
import * as XLSX from "xlsx"

// Shape returned to the supplier submission form / buyer upload and used to
// auto-fill the proposal fields.
export interface ExtractedProposal {
  supplier: string | null
  amount: number | null
  currency: string | null
  summary: string | null
  contact: string | null
}

const proposalSchema = z.object({
  supplier: z.string().nullable().describe("The bidding supplier / company name"),
  amount: z
    .number()
    .nullable()
    .describe("The total bid / quoted price as a plain number, no currency symbol or thousands separators"),
  currency: z.string().nullable().describe("ISO currency code of the bid, e.g. EUR, USD"),
  summary: z
    .string()
    .nullable()
    .describe("A 1-2 sentence summary of what the supplier is proposing"),
  contact: z.string().nullable().describe("Primary contact email found in the document, if any"),
})

const SYSTEM_PROMPT = `You are a procurement assistant reading a supplier's proposal / quote document. 
Extract the supplier name, the total bid amount, currency, a short summary, and contact email. 
Only use information present in the document. If a field is unknown, return null. 
The amount must be the total price the supplier is bidding, as a plain number.`

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function extractProposalFromFile(
  formData: FormData,
): Promise<{ ok: true; proposal: ExtractedProposal } | { ok: false; error: string }> {
  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { ok: false, error: "No file was uploaded." }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File is too large. Please upload a file under 10 MB." }
  }

  const name = file.name.toLowerCase()
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf"
  const isSheet = /\.(xlsx|xls|csv)$/.test(name)
  const isText = /\.(txt|md|json)$/.test(name) || file.type.startsWith("text/")

  if (!isPdf && !isSheet && !isText) {
    return {
      ok: false,
      error: "Unsupported file type. Upload a PDF, Excel (.xlsx/.xls), CSV, or text file.",
    }
  }

  try {
    let userContent: Array<
      | { type: "text"; text: string }
      | { type: "file"; data: Buffer; mediaType: string }
    >

    if (isPdf) {
      userContent = [
        { type: "text", text: "Extract the proposal fields from this supplier document." },
        { type: "file", data: Buffer.from(await file.arrayBuffer()), mediaType: "application/pdf" },
      ]
    } else if (isSheet) {
      userContent = [
        {
          type: "text",
          text: `Extract the proposal fields from this spreadsheet:\n\n${sheetToText(await file.arrayBuffer())}`,
        },
      ]
    } else {
      const text = (await file.text()).slice(0, 20000)
      userContent = [{ type: "text", text: `Extract the proposal fields from this document:\n\n${text}` }]
    }

    const { experimental_output } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      experimental_output: Output.object({ schema: proposalSchema }),
    })

    return { ok: true, proposal: experimental_output }
  } catch (err) {
    console.error("[v0] extractProposalFromFile failed:", err)
    return { ok: false, error: "Could not read that document. Please try a different file or enter details manually." }
  }
}

/** Flatten every sheet in a workbook into readable CSV-like text. */
function sheetToText(buffer: ArrayBuffer): string {
  const wb = XLSX.read(buffer, { type: "array" })
  return wb.SheetNames.map((sheetName) => {
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName])
    return `# Sheet: ${sheetName}\n${csv}`
  })
    .join("\n\n")
    .slice(0, 20000)
}
