interface ProcessingResult {
  success: boolean
  processedCount: number
  errors: string[]
  startedAt: Date
  completedAt: Date
}

interface Email {
  id: string
}
interface PdfFile {
  name: string
}
interface ReceiptData {
  amount: number
  vendor: string
}

/** Orchestrates Gmail -> PDF -> OCR -> freee workflow */
async function orchestrateProcessing(): Promise<ProcessingResult> {
  const startedAt = new Date()
  const errors: string[] = []
  let processedCount = 0

  try {
    const emails = await searchGmailReceipts()
    console.log(`Found ${emails.length} receipt emails`)

    for (const email of emails) {
      try {
        const pdfFiles = await extractPdfAttachments(email)

        for (const pdf of pdfFiles) {
          const ocrText = await processOcr(pdf)
          const receiptData = await parseReceiptText(ocrText)
          await registerToFreee(receiptData)
          processedCount++
        }
      } catch (error) {
        errors.push(
          `Email processing failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
  } catch (error) {
    errors.push(`Orchestration failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  return {
    success: errors.length === 0,
    processedCount,
    errors,
    startedAt,
    completedAt: new Date(),
  }
}

// Integration placeholders for existing lib functions
async function searchGmailReceipts(): Promise<Email[]> {
  return []
}
async function extractPdfAttachments(email: Email): Promise<PdfFile[]> {
  return []
}
async function processOcr(pdf: PdfFile): Promise<string> {
  return ''
}
async function parseReceiptText(text: string): Promise<ReceiptData> {
  return { amount: 0, vendor: '' }
}
async function registerToFreee(data: ReceiptData): Promise<void> {}

export default async function handler(req: Request): Promise<Response> {
  const result = await orchestrateProcessing()
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}
