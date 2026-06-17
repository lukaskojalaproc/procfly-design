"use server"

import { generateText, Output } from "ai"
import { z } from "zod"
import * as XLSX from "xlsx"

// Shape returned to the client and merged into the competition draft.
export interface ExtractedTerms {
  title: string | null
  category: string | null
  description: string | null
  baseline: number | null
  currency: string | null
  requirements: string[]
  evaluationCriteria: string[]
  paymentTerms: string | null
}

const extractionSchema = z.object({
  title: z.string().nullable().describe("Short name of the procurement / project"),
  category: z.string().nullable().describe("Spend category, e.g. Software, Logistics, Marketing"),
  description: z.string().nullable().describe("1-3 sentence scope summary of what is being procured"),
  baseline: z.number().nullable().describe("Approved or estimated budget amount as a plain number, no currency symbol"),
  currency: z.string().nullable().describe("ISO currency code, e.g. EUR, USD"),
  requirements: z
    .array(z.string())
    .describe("Each mandatory requirement / deliverable suppliers must meet, one item per requirement"),
  evaluationCriteria: z
    .array(z.string())
    .describe("Each scoring / evaluation criterion, ideally with weight, e.g. 'Price — 60%'"),
  paymentTerms: z.string().nullable().describe("Payment terms and contract length, e.g. 'Net 30 / 12-month term'"),
})

const SYSTEM_PROMPT = `You are a procurement assistant. Extract structured competition (RFP/RFQ) setup fields from the supplied document. 
- Only use information present in the document; if a field is unknown, return null (or an empty array for lists). 
- Split requirements and evaluation criteria into individual, concise line items. 
- Never invent budgets or criteria.`

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function extractCompetitionTerms(
  formData: FormData,
): Promise<{ ok: true; terms: ExtractedTerms } | { ok: false; error: string }> {
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

  if (!isPdf && !isSheet) {
    return { ok: false, error: "Unsupported file type. Upload a PDF, Excel (.xlsx/.xls) or CSV file." }
  }

  try {
    // Build the user message: PDFs go straight to the multimodal model; spreadsheets
    // are flattened to text first so the model reads clean rows.
    const userContent = isPdf
      ? [
          { type: "text" as const, text: "Extract the competition setup fields from this document." },
          {
            type: "file" as const,
            data: Buffer.from(await file.arrayBuffer()),
            mediaType: "application/pdf",
          },
        ]
      : [{ type: "text" as const, text: `Extract the competition setup fields from this spreadsheet:\n\n${sheetToText(await file.arrayBuffer())}` }]

    const { experimental_output } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      experimental_output: Output.object({ schema: extractionSchema }),
    })

    const t = experimental_output
    return {
      ok: true,
      terms: {
        title: t.title,
        category: t.category,
        description: t.description,
        baseline: t.baseline,
        currency: t.currency,
        requirements: t.requirements ?? [],
        evaluationCriteria: t.evaluationCriteria ?? [],
        paymentTerms: t.paymentTerms,
      },
    }
  } catch (err) {
    console.error("[v0] extractCompetitionTerms failed:", err)
    return { ok: false, error: "Could not read that document. Please try a different file." }
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
